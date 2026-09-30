#!/usr/bin/env python3
"""Import currently available puppies from CUB's selected Singapore partners.

The curated records were checked against the live source pages on 30 September
2026. The importer skips an existing shelter/name pair, so it is safe to rerun.

Required environment variables when writing to the API:
  CUB_GOLDEN_PAWS_CODE
  CUB_DAILY_DOGS_CODE
  CUB_WOOF_LOOF_CODE

Use --dry-run to review every payload without logging in or changing data.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from partner_puppy_cbarq import (  # noqa: E402
    PROFILE_BASIS,
    answered_count,
    answers_for,
    factors_for,
)

DEFAULT_BASE = "https://meetmycub.com"
CHECKED_ON = "30 September 2026"
UA = "CUB-partner-importer/1.0 (+https://meetmycub.com)"

PARTNERS = {
    "golden-paws": {
        "name": "Golden Paws",
        "code_env": "CUB_GOLDEN_PAWS_CODE",
    },
    "daily-dogs": {
        "name": "Daily Dogs",
        "code_env": "CUB_DAILY_DOGS_CODE",
    },
    "woof-loof": {
        "name": "Woof Loof",
        "code_env": "CUB_WOOF_LOOF_CODE",
    },
}

DOGS = [
    {
        "partner": "golden-paws", "name": "Bennett", "breed": "Golden Retriever",
        "dob": "2026-07-15", "sex": "Male", "size": "Large", "color": "Golden",
        "hdbApproved": False, "personality": "golden_retriever",
        "contactUrl": "https://goldenpaws.sg/products/bennett-2-month-old",
        "imageUrl": "https://meetmycub.com/assets/dogs/golden-paws-bennett.jpg",
        "hdbBasis": "Golden Retriever is not on HDB's approved small-breed list.",
    },
    {
        "partner": "golden-paws", "name": "Layla", "breed": "Golden Retriever",
        "dob": "2026-01-01", "sex": "Female", "size": "Large", "color": "Cream",
        "hdbApproved": False, "personality": "golden_retriever",
        "contactUrl": "https://goldenpaws.sg/products/layla-4-month-old",
        "imageUrl": "https://meetmycub.com/assets/dogs/golden-paws-layla.jpg",
        "hdbBasis": "Golden Retriever is not on HDB's approved small-breed list.",
    },
    {
        "partner": "golden-paws", "name": "Kayla", "breed": "Golden Retriever",
        "dob": "2026-02-03", "sex": "Female", "size": "Large", "color": "Cream",
        "hdbApproved": False, "personality": "golden_retriever",
        "contactUrl": "https://goldenpaws.sg/products/kayla-3-month-old",
        "imageUrl": "https://meetmycub.com/assets/dogs/golden-paws-kayla.jpg",
        "hdbBasis": "Golden Retriever is not on HDB's approved small-breed list.",
    },
    {
        "partner": "golden-paws", "name": "Mila", "breed": "Maltipoo",
        "dob": "2026-07-06", "sex": "Female", "size": "Small", "color": "Cream",
        "hdbApproved": True, "personality": "maltipoo",
        "contactUrl": "https://goldenpaws.sg/products/mila-maltipoo-2-month-old",
        "imageUrl": "https://meetmycub.com/assets/dogs/golden-paws-mila.jpg",
        "hdbBasis": "Golden Paws lists its Maltipoos as HDB approved; Maltese and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "golden-paws", "name": "Milo", "breed": "Maltipoo",
        "dob": "2026-07-06", "sex": "Male", "size": "Small", "color": "Cream",
        "hdbApproved": True, "personality": "maltipoo",
        "contactUrl": "https://goldenpaws.sg/products/milo-2-month-old",
        "imageUrl": "https://meetmycub.com/assets/dogs/golden-paws-milo.jpg",
        "hdbBasis": "Golden Paws lists its Maltipoos as HDB approved; Maltese and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "daily-dogs", "name": "Waffle", "breed": "F1BB Mini Golden Doodle",
        "dob": "2026-07-07", "sex": "Male", "size": "Medium", "color": "Cream and brown",
        "hdbApproved": True, "personality": "mini_goldendoodle",
        "contactUrl": "https://dailydogs.sg/products/waffle-cream-brown-f1bb-golden-doodle-boy",
        "imageUrl": "https://meetmycub.com/assets/dogs/daily-dogs-waffle.jpg",
        "hdbBasis": "Daily Dogs explicitly marks this individual puppy HDB-approved; that partner assessment is used as the override.",
        "sizeBasis": "Daily Dogs does not publish an expected adult weight; CUB records Medium conservatively for this Mini Golden Doodle.",
    },
    {
        "partner": "daily-dogs", "name": "Churro", "breed": "F1BB Mini Golden Doodle",
        "dob": "2026-07-07", "sex": "Male", "size": "Medium", "color": "Cream and brown",
        "hdbApproved": True, "personality": "mini_goldendoodle",
        "contactUrl": "https://dailydogs.sg/products/churro-cream-brown-f1bb-mini-golden-doodle-boy",
        "imageUrl": "https://meetmycub.com/assets/dogs/daily-dogs-churro.jpg",
        "hdbBasis": "Daily Dogs explicitly marks this individual puppy HDB-approved; that partner assessment is used as the override.",
        "sizeBasis": "Daily Dogs does not publish an expected adult weight; CUB records Medium conservatively for this Mini Golden Doodle.",
    },
    {
        "partner": "daily-dogs", "name": "Muffin", "breed": "F1BB Mini Golden Doodle",
        "dob": "2026-07-07", "sex": "Female", "size": "Medium", "color": "Cream and brown",
        "hdbApproved": True, "personality": "mini_goldendoodle",
        "contactUrl": "https://dailydogs.sg/products/muffin-cream-brown-f1bb-mini-golden-doodle-girl",
        "imageUrl": "https://meetmycub.com/assets/dogs/daily-dogs-muffin.jpg",
        "hdbBasis": "Daily Dogs explicitly marks this individual puppy HDB-approved; that partner assessment is used as the override.",
        "sizeBasis": "Daily Dogs does not publish an expected adult weight; CUB records Medium conservatively for this Mini Golden Doodle.",
    },
    {
        "partner": "woof-loof", "name": "Toffee", "breed": "Cavapoo",
        "dob": "2026-06-01", "sex": "Male", "size": "Small", "color": "Ruby red and white",
        "hdbApproved": True, "personality": "cavapoo",
        "contactUrl": "https://woofloof.sg/cavapoos/",
        "imageUrl": "https://meetmycub.com/assets/dogs/woof-loof-toffee.jpg",
        "hdbBasis": "Woof Loof explicitly marks this puppy HDB-approved; Cavalier King Charles Spaniel and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "woof-loof", "name": "Mocha", "breed": "Cavapoo",
        "dob": "2026-06-01", "sex": "Male", "size": "Small", "color": "Ruby red and white",
        "hdbApproved": True, "personality": "cavapoo",
        "contactUrl": "https://woofloof.sg/cavapoos/",
        "imageUrl": "https://meetmycub.com/assets/dogs/woof-loof-mocha.jpg",
        "hdbBasis": "Woof Loof explicitly marks this puppy HDB-approved; Cavalier King Charles Spaniel and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "woof-loof", "name": "Raphy", "breed": "Cavapoo",
        "dob": "2026-06-20", "sex": "Male", "size": "Small", "color": "Ruby red",
        "hdbApproved": True, "personality": "cavapoo",
        "contactUrl": "https://woofloof.sg/cavapoos/",
        "imageUrl": "https://meetmycub.com/assets/dogs/woof-loof-raphy.jpg",
        "hdbBasis": "Woof Loof explicitly marks this puppy HDB-approved; Cavalier King Charles Spaniel and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "woof-loof", "name": "Milo", "breed": "Cavapoo",
        "dob": "2026-06-20", "sex": "Male", "size": "Small", "color": "Ruby red",
        "hdbApproved": True, "personality": "cavapoo",
        "contactUrl": "https://woofloof.sg/cavapoos/",
        "imageUrl": "https://meetmycub.com/assets/dogs/woof-loof-milo.jpg",
        "hdbBasis": "Woof Loof explicitly marks this puppy HDB-approved; Cavalier King Charles Spaniel and Toy/Miniature Poodle are both approved breeds.",
    },
    {
        "partner": "woof-loof", "name": "Biscuit", "breed": "Cavapoo",
        "dob": "2026-06-20", "sex": "Female", "size": "Small", "color": "Ruby red",
        "hdbApproved": True, "personality": "cavapoo",
        "contactUrl": "https://woofloof.sg/cavapoos/",
        "imageUrl": "https://meetmycub.com/assets/dogs/woof-loof-biscuit.jpg",
        "hdbBasis": "Woof Loof explicitly marks this puppy HDB-approved; Cavalier King Charles Spaniel and Toy/Miniature Poodle are both approved breeds.",
    },
]


def months_between(dob: str, today: date | None = None) -> int:
    born = date.fromisoformat(dob)
    current = today or date.today()
    months = (current.year - born.year) * 12 + current.month - born.month
    if current.day < born.day:
        months -= 1
    return max(0, months)


def to_payload(record: dict, today: date | None = None) -> dict:
    profile = record["personality"]
    notes = [
        f"Availability and details checked against the source on {CHECKED_ON}.",
        f"HDB assessment: {record['hdbBasis']}",
        (
            f"C-BARQ answers are a BREED/SOURCE-LEVEL ESTIMATE, not an individual "
            f"questionnaire completed by the shop. {answered_count(profile)} of 42 "
            f"items are estimated and unsupported situations remain N/A. "
            f"Basis: {PROFILE_BASIS[profile]} Replace these answers when the partner "
            f"provides an individual assessment."
        ),
        "Source: " + record["contactUrl"],
    ]
    if record.get("sizeBasis"):
        notes.insert(2, "Size assessment: " + record["sizeBasis"])
    return {
        "name": record["name"],
        "breed": record["breed"],
        "contactUrl": record["contactUrl"],
        "sex": record["sex"],
        "ageMonths": months_between(record["dob"], today),
        "imageUrl": record["imageUrl"],
        "notes": "\n\n".join(notes),
        "size": record["size"],
        "color": record["color"],
        "hdbApproved": record["hdbApproved"],
        "cbarqAnswers": answers_for(profile),
        "cbarqFactors": factors_for(profile),
    }


def get_json(url: str, token: str | None = None) -> tuple[int, dict]:
    headers = {"User-Agent": UA}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, _error_body(exc)


def post_json(url: str, payload: dict, token: str | None = None) -> tuple[int, dict]:
    headers = {"Content-Type": "application/json", "User-Agent": UA}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, _error_body(exc)


def _error_body(exc: urllib.error.HTTPError) -> dict:
    try:
        return json.loads(exc.read().decode("utf-8"))
    except Exception:
        return {"error": str(exc.reason)}


def selected_records(partner: str | None) -> list[dict]:
    return [record for record in DOGS if partner is None or record["partner"] == partner]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default=DEFAULT_BASE)
    parser.add_argument("--partner", choices=sorted(PARTNERS))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", metavar="PATH")
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    records = selected_records(args.partner)
    payloads = [
        {"partner": record["partner"], "shelter": PARTNERS[record["partner"]]["name"], **to_payload(record)}
        for record in records
    ]

    if args.json:
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(payloads, handle, indent=2)

    if args.dry_run:
        print(json.dumps(payloads, indent=2))
        print(f"\nDry run: {len(payloads)} records; nothing was sent.", file=sys.stderr)
        return 0

    status, body = get_json(args.base.rstrip("/") + "/api/dogs")
    if status != 200:
        print(f"Could not load existing dogs ({status}): {body}", file=sys.stderr)
        return 1
    existing = {
        (str(dog.get("shelter", "")).casefold(), str(dog.get("name", "")).casefold())
        for dog in body.get("dogs", [])
    }

    grouped = {key: [] for key in PARTNERS}
    for payload in payloads:
        grouped[payload.pop("partner")].append(payload)

    failures = []
    imported = skipped = 0
    for partner_key, partner_payloads in grouped.items():
        if not partner_payloads:
            continue
        partner = PARTNERS[partner_key]
        code = os.environ.get(partner["code_env"], "").strip()
        if not code:
            failures.append(f"{partner['name']}: missing {partner['code_env']}")
            continue
        login_status, login = post_json(
            args.base.rstrip("/") + "/api/partner/login", {"code": code}
        )
        if login_status != 200 or "token" not in login:
            failures.append(f"{partner['name']}: login failed ({login_status})")
            continue

        for payload in partner_payloads:
            identity = (partner["name"].casefold(), payload["name"].casefold())
            if identity in existing:
                print(f"SKIP {partner['name']} / {payload['name']} (already exists)")
                skipped += 1
                continue
            post_status, result = post_json(
                args.base.rstrip("/") + "/api/dogs", payload, login["token"]
            )
            if post_status != 201:
                failures.append(
                    f"{partner['name']} / {payload['name']}: {post_status} {result.get('error', result)}"
                )
                continue
            print(f"ADDED {partner['name']} / {payload['name']} -> {result.get('cluster')}")
            existing.add(identity)
            imported += 1
            time.sleep(max(0, args.delay))

    print(f"Imported {imported}; skipped {skipped}; failed {len(failures)}.")
    for failure in failures:
        print("ERROR " + failure, file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
