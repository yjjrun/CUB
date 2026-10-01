#!/usr/bin/env python3
"""Reconcile CUB's MercyLight records with the shelter's live catalogue.

This command is intended to run on the CUB server because it updates existing
records in place. It is a dry run unless --apply is supplied. Missing listings
are only deleted when --remove-missing is also supplied.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, ROOT_DIR)

import server  # noqa: E402
from import_mercylight import (  # noqa: E402
    DEFAULT_BREED,
    discover_slugs,
    scrape_profile,
    to_cub_payload,
)


UPDATE_COLUMNS = [
    "status",
    "name",
    "shelter",
    "contact_url",
    "breed",
    "age_years",
    "age_months",
    "sex",
    "size",
    "color",
    "image_url",
    "hdb_approved",
    "home_fit",
    "home_fits",
    "exercise_need",
    "exercise_needs",
    "cluster",
    "cbarq_factors",
    "cbarq_answers",
    "notes",
    "partner_id",
]


def name_key(value: str) -> str:
    return " ".join(str(value or "").split()).casefold()


def find_partner(connection: sqlite3.Connection, requested_name: str) -> dict:
    connection.row_factory = sqlite3.Row
    partners = [dict(row) for row in connection.execute("SELECT * FROM partners")]
    requested = name_key(requested_name).replace(" ", "")
    for partner in partners:
        candidate = name_key(partner["name"]).replace(" ", "")
        if candidate == requested:
            return partner
    raise RuntimeError(f"Partner {requested_name!r} was not found in {server.DB_PATH}.")


def build_plan(existing_rows: list[dict], payloads: list[dict], partner: dict) -> dict:
    existing = {name_key(row["name"]): row for row in existing_rows}
    current = {name_key(payload["name"]): payload for payload in payloads}
    additions = []
    updates = []

    now = datetime.now(timezone.utc).isoformat()
    for key, payload in current.items():
        row = existing.get(key)
        if row is None:
            additions.append(payload)
            continue
        fields = server.dog_fields_from_payload(
            payload,
            partner,
            dog_id=row["id"],
            created_at=row["created_at"],
            status="available",
        )
        changed = [column for column in UPDATE_COLUMNS if row.get(column) != fields[column]]
        if changed:
            updates.append({"name": payload["name"], "fields": fields, "changed": changed})

    removals = [
        row for key, row in existing.items()
        if key not in current and row.get("status") == "available"
    ]
    return {"additions": additions, "updates": updates, "removals": removals, "checkedAt": now}


def apply_plan(connection: sqlite3.Connection, plan: dict, partner: dict, remove_missing: bool) -> None:
    # Additions use the same validated insert path as the private intake API.
    for payload in plan["additions"]:
        server.insert_dog(payload, partner)

    assignments = ", ".join(f"{column} = :{column}" for column in UPDATE_COLUMNS)
    with connection:
        for update in plan["updates"]:
            result = connection.execute(
                f"UPDATE dogs SET {assignments} WHERE id = :id AND partner_id = :partner_id",
                update["fields"],
            )
            if result.rowcount != 1:
                raise RuntimeError(f"Could not update {update['name']} safely.")

        if remove_missing:
            for row in plan["removals"]:
                connection.execute("DELETE FROM saved_matches WHERE dog_id = ?", (row["id"],))
                result = connection.execute(
                    "DELETE FROM dogs WHERE id = ? AND partner_id = ?",
                    (row["id"], partner["id"]),
                )
                if result.rowcount != 1:
                    raise RuntimeError(f"Could not remove {row['name']} safely.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write the planned changes.")
    parser.add_argument(
        "--remove-missing",
        action="store_true",
        help="Delete records absent from the live catalogue (requires --apply).",
    )
    parser.add_argument("--partner", default="Mercylight")
    parser.add_argument("--breed", default=DEFAULT_BREED)
    args = parser.parse_args()

    if args.remove_missing and not args.apply:
        parser.error("--remove-missing requires --apply")

    slugs = discover_slugs()
    print(f"Discovered {len(slugs)} current MercyLight listings.", file=sys.stderr)
    records = []
    for index, slug in enumerate(slugs, 1):
        records.append(scrape_profile(slug))
        print(f"  [{index}/{len(slugs)}] {slug}", file=sys.stderr)
    payloads = [to_cub_payload(record, args.breed) for record in records]

    with sqlite3.connect(server.DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        partner = find_partner(connection, args.partner)
        existing_rows = [
            dict(row)
            for row in connection.execute(
                "SELECT * FROM dogs WHERE partner_id = ? ORDER BY name",
                (partner["id"],),
            )
        ]

        if len(payloads) < max(20, len(existing_rows) // 2):
            raise RuntimeError(
                "The live catalogue is unexpectedly small; refusing to sync or remove records."
            )

        plan = build_plan(existing_rows, payloads, partner)
        print(
            f"Plan: {len(plan['additions'])} add, {len(plan['updates'])} update, "
            f"{len(plan['removals'])} remove.",
            file=sys.stderr,
        )
        for update in plan["updates"]:
            print(f"  ~ {update['name']}: {', '.join(update['changed'])}", file=sys.stderr)
        for row in plan["removals"]:
            print(f"  - {row['name']}: absent from MercyLight's live catalogue", file=sys.stderr)

        if not args.apply:
            print("Dry run only; no database changes were made.", file=sys.stderr)
            return 0

        apply_plan(connection, plan, partner, args.remove_missing)
        if plan["removals"] and not args.remove_missing:
            print("Missing listings were retained because --remove-missing was not supplied.", file=sys.stderr)
        print("MercyLight sync complete.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
