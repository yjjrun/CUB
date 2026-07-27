#!/usr/bin/env python3
"""Remove duplicate dog records, keeping one row per name per shelter.

A partial import that is re-run can leave the same dog stored twice. This
keeps the NEWEST row for each (shelter, name) pair and deletes the older
ones, on the assumption that the later import ran against newer code.

Runs directly against the SQLite file, so it needs to be run on the server:

    # review what would go — writes nothing:
    sudo -u cub CUB_DATA_DIR=/var/lib/cub python3 /opt/cub/scripts/dedupe_dogs.py

    # actually delete:
    sudo -u cub CUB_DATA_DIR=/var/lib/cub python3 /opt/cub/scripts/dedupe_dogs.py --apply

A timestamped backup of the database is written next to it before any
deletion, so a mistake is recoverable.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(os.environ.get("CUB_DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
DB_PATH = DATA_DIR / "cub.sqlite"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true",
                        help="Actually delete. Without this, only reports.")
    parser.add_argument("--shelter", default=None,
                        help="Limit to one shelter's records.")
    args = parser.parse_args()

    if not DB_PATH.exists():
        sys.exit(f"No database at {DB_PATH} (set CUB_DATA_DIR).")

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    where = "WHERE shelter = ?" if args.shelter else ""
    params = (args.shelter,) if args.shelter else ()
    rows = con.execute(
        f"SELECT id, shelter, name, created_at FROM dogs {where} ORDER BY shelter, name, created_at",
        params,
    ).fetchall()

    groups: dict[tuple[str, str], list[sqlite3.Row]] = {}
    for row in rows:
        groups.setdefault((row["shelter"], row["name"]), []).append(row)

    doomed = []
    for (shelter, name), items in sorted(groups.items()):
        if len(items) < 2:
            continue
        # created_at is ISO-8601, so lexical sort is chronological.
        items.sort(key=lambda r: r["created_at"])
        keep, drop = items[-1], items[:-1]
        doomed.extend(drop)
        print(f"{shelter} / {name}: {len(items)} copies — "
              f"keeping {keep['created_at'][:19]}, dropping {len(drop)}")

    print(f"\n{len(rows)} rows, {len(groups)} distinct dogs, {len(doomed)} duplicates to remove.")
    if not doomed:
        print("Nothing to do.")
        return
    if not args.apply:
        print("\n(dry run — nothing deleted; re-run with --apply)")
        return

    backup = DB_PATH.with_name(f"cub.{datetime.now():%Y%m%d-%H%M%S}.pre-dedupe.bak")
    shutil.copy2(DB_PATH, backup)
    print(f"\nBackup written to {backup}")

    con.executemany("DELETE FROM dogs WHERE id = ?", [(r["id"],) for r in doomed])
    con.commit()
    remaining = con.execute(f"SELECT COUNT(*) FROM dogs {where}", params).fetchone()[0]
    print(f"Deleted {len(doomed)} rows. {remaining} remain.")


if __name__ == "__main__":
    main()
