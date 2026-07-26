#!/usr/bin/env python3
"""Import Mercylight's adoptable dogs into CUB.

Scrapes https://www.mercylight.org.sg/adopt-a-blessing, maps each listing onto
CUB's dog schema, and posts it through the partner API.

The partner access code is read from the CUB_PARTNER_CODE environment variable
so it never has to be typed on the command line (where it would land in shell
history).

Usage:
    # 1. Review what would be sent — writes nothing:
    CUB_PARTNER_CODE=... python3 scripts/import_mercylight.py --dry-run

    # 2. Actually import:
    CUB_PARTNER_CODE=... python3 scripts/import_mercylight.py

Options:
    --base URL        CUB site to import into (default https://meetmycub.com)
    --limit N         Only process the first N dogs (useful for a trial run)
    --dry-run         Print the payloads, don't log in or post anything
    --json PATH       Also write the scraped records to PATH for review
    --breed NAME      Breed to record (the listings state none)
    --derive-factors  Opt in to inferred C-BARQ factors (off by default)

IMPORTANT — what this importer cannot supply:
    Mercylight's listings carry no breed, size, colour, weight, or C-BARQ
    behavioural assessment. See DATA_GAPS at the bottom of this file.

    No behavioural factors are sent by default. That is deliberate: the only
    real behavioural signal in the listings is "good with other dogs", and
    inferring a full C-BARQ profile from it yields a confident-looking
    personality cluster that is an artifact of the inference rather than a fact
    about the dog. Every imported dog carries a note saying its assessment is
    pending, so the shelter can complete the real C-BARQ form in the portal.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime
from html.parser import HTMLParser

LISTING = "https://www.mercylight.org.sg/adopt-a-blessing"
PROFILE = "https://www.mercylight.org.sg/adopt-a-blessing/{slug}"
UA = "CUB-importer/1.0 (+https://meetmycub.com; shelter data sync)"

# Slugs as published on the listing page (50 dogs, "Show more" paginated).
SLUGS = [
    "ace-blessing", "amber-blessing", "amigo-blessing", "ardon-blessing",
    "asherboy-blessing", "ava-blessing", "bethel-blessing", "boaz-blessing",
    "bree-blessing", "brownie-blessing", "chase-blessing", "colby-blessing",
    "cosmos-blessing", "dante-blessing", "diamond-blessing", "dino-blessing",
    "emilia-blessing", "esprit-blessing", "grateful-blessing", "hailey-blessing",
    "haven-blessing", "honest-blessing", "izzie-blessing", "jay-jay-blessing",
    "joy-blessing", "kibo-sir-blessing", "koda-blessing", "kodi-blessing",
    "lashon-blessing", "leo-blessing", "luna-blessing", "macy-blessing",
    "malia-blessing", "mateo-blessing", "mikel-blessing", "naomi-blessing",
    "nori-blessing", "nova-blessing", "nugget-blessing", "olive-blessing",
    "pardon-blessing", "poppy-blessing", "rainbow-blessing", "saint-blessing",
    "skylar-blessing", "stitch-jr-blessing", "summer-blessing", "tasha-blessing",
    "tess-blessing", "waffle-blessing",
]


# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

class TextExtractor(HTMLParser):
    """Collect visible text with block-level newlines preserved."""

    BLOCKS = {"p", "div", "tr", "li", "h1", "h2", "h3", "h4", "td", "section", "br"}
    SKIP = {"script", "style", "noscript"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self._skip = 0
        self.images: list[str] = []
        self.title: str | None = None
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self._skip += 1
        if tag in self.BLOCKS:
            self.parts.append("\n")
        if tag == "title":
            self._in_title = True
        if tag == "img":
            src = dict(attrs).get("src")
            # Photos live on the shelter's R2 CDN; skip logos and inline assets.
            if src and "/media/" in src and src.startswith("http"):
                self.images.append(src)

    def handle_endtag(self, tag):
        if tag in self.SKIP and self._skip:
            self._skip -= 1
        if tag in self.BLOCKS:
            self.parts.append("\n")
        if tag == "title":
            self._in_title = False

    def cover_image(self) -> str | None:
        """Prefer the explicitly-named cover shot, else the first photo."""
        for src in self.images:
            if "_cover" in src.lower():
                return src
        return self.images[0] if self.images else None

    def handle_data(self, data):
        if self._in_title:
            self.title = (self.title or "") + data
        if not self._skip:
            self.parts.append(data)

    def text(self) -> str:
        raw = "".join(self.parts).replace("\xa0", " ")
        lines = [re.sub(r"\s+", " ", ln).strip() for ln in raw.split("\n")]
        return "\n".join(ln for ln in lines if ln)


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def scrape_profile(slug: str) -> dict:
    parser = TextExtractor()
    parser.feed(fetch(PROFILE.format(slug=slug)))
    text = parser.text()

    def field(label: str) -> str | None:
        match = re.search(rf"{label}\s*:\s*([^\n]*)", text, re.I)
        return match.group(1).strip() if match else None

    def section(start: str, end: str) -> str | None:
        match = re.search(rf"{start}\s*\n([\s\S]*?)\n(?={end})", text, re.I)
        return re.sub(r"\s+", " ", match.group(1)).strip() if match else None

    # The <title> is "<Name> | Mercylight"; fall back to the slug.
    title_name = (parser.title or "").split("|")[0].strip()
    name = title_name or slug.replace("-blessing", "").replace("-", " ").title()

    return {
        "slug": slug,
        "name": name,
        "sex": field("Gender"),
        "ageText": field("Age"),
        "dob": field("Date of Birth"),
        "vaccinated": field("Vaccinated"),
        "sterilized": field("Sterilized"),
        "health": field("Health"),
        "goodWithDogs": field("Good with other dogs"),
        "goodWithChildren": field("Good with children"),
        "habits": field("Pee and poo habits"),
        "commands": field("Understand basic commands"),
        "shelterSaysHdb": field("HDB approved"),
        "background": section("BACKGROUND", "PERSONALITY"),
        "personality": section("PERSONALITY", "ADOPTION REQUIREMENTS"),
        "imageUrl": parser.cover_image(),
        "sourceUrl": PROFILE.format(slug=slug),
    }


# ---------------------------------------------------------------------------
# Mapping onto CUB's schema
# ---------------------------------------------------------------------------

# Mercylight rescues are overwhelmingly local street dogs (the write-ups
# describe NParks/TNRM island rescues), so this is the honest default — but it
# is an inference, not published data. See DATA_GAPS.
DEFAULT_BREED = "Singapore Special (Local Mixed Breed)"

PENDING_NOTE = (
    "BEHAVIOURAL ASSESSMENT PENDING — Mercylight's listing publishes no C-BARQ "
    "questionnaire, so this dog has no real behavioural profile yet. Complete "
    "the C-BARQ form in the shelter portal to make matching meaningful; until "
    "then this dog's personality cluster is a placeholder, not an assessment."
)

DERIVED_NOTE = (
    "Behavioural factors are PROVISIONAL — inferred from the few signals in "
    "Mercylight's listing (good-with-dogs, good-with-children, basic-commands, "
    "age), NOT from a completed C-BARQ questionnaire. Treat the personality "
    "cluster as a rough placeholder and replace it via the shelter portal."
)


def months_between(dob: str | None) -> int | None:
    if not dob:
        return None
    for fmt in ("%d %B %Y", "%d %b %Y"):
        try:
            born = datetime.strptime(dob.strip(), fmt).date()
            break
        except ValueError:
            continue
    else:
        return None
    today = date.today()
    return max(0, (today.year - born.year) * 12 + today.month - born.month)


def derive_factors(record: dict) -> dict:
    """Map the few real behavioural signals onto C-BARQ factors (0-4 scale).

    Deliberately conservative: signals the listing does not cover are left at
    the neutral midpoint (2) rather than invented, so the cluster reflects the
    little that is actually known.
    """
    neutral = 2.0
    factors = {
        "strangerAggression": neutral, "ownerAggression": neutral,
        "dogAggressionFear": neutral, "trainability": neutral,
        "chasing": neutral, "strangerFear": neutral, "nonsocialFear": neutral,
        "dogFear": neutral, "separation": neutral, "touchSensitivity": neutral,
        "excitability": neutral, "attachment": neutral, "energy": neutral,
    }

    dogs = (record.get("goodWithDogs") or "").lower()
    if dogs.startswith("yes"):
        factors["dogAggressionFear"] = 0.5
        factors["dogFear"] = 0.5
    elif dogs.startswith("selective"):
        factors["dogAggressionFear"] = 2.5
        factors["dogFear"] = 2.0

    kids = (record.get("goodWithChildren") or "").lower()
    if kids.startswith("yes"):
        factors["strangerFear"] = 0.5
    elif kids.startswith("no"):
        factors["strangerFear"] = 3.0
        factors["strangerAggression"] = 2.5

    if (record.get("commands") or "").lower().startswith("yes"):
        factors["trainability"] = 3.0

    months = months_between(record.get("dob"))
    if months is not None:
        years = months / 12
        if years <= 2:
            factors["energy"] = 3.2
            factors["excitability"] = 3.0
        elif years >= 9:
            factors["energy"] = 1.2
            factors["excitability"] = 1.5
        else:
            factors["energy"] = 2.4
            factors["excitability"] = 2.2

    return factors


def to_cub_payload(record: dict, breed: str, derive: bool = False) -> dict:
    notes_parts = []
    if record.get("background"):
        notes_parts.append("Background: " + record["background"])
    if record.get("personality"):
        notes_parts.append("Personality: " + record["personality"])
    status = []
    for label, key in (("Vaccinated", "vaccinated"), ("Sterilised", "sterilized"),
                       ("Health", "health"), ("Good with dogs", "goodWithDogs"),
                       ("Good with children", "goodWithChildren"),
                       ("Toilet habits", "habits"), ("Basic commands", "commands")):
        if record.get(key):
            status.append(f"{label}: {record[key]}")
    if status:
        notes_parts.append(" | ".join(status))
    notes_parts.append(f"Mercylight lists HDB approved: {record.get('shelterSaysHdb') or 'unstated'}.")
    notes_parts.append(DERIVED_NOTE if derive else PENDING_NOTE)
    notes_parts.append("Source: " + record["sourceUrl"])

    payload = {
        "name": record["name"],
        "breed": breed,
        "contactUrl": record["sourceUrl"],
        "sex": (record.get("sex") or "").capitalize() or "Unknown",
        "ageMonths": months_between(record.get("dob")),
        "imageUrl": record.get("imageUrl") or "",
        "notes": "\n\n".join(notes_parts),
        # size and color are genuinely absent from the source — left blank
        # rather than guessed, so they show as "not set" in the UI.
        "size": "",
        "color": "",
    }
    # By default send NO behavioural factors. Inventing them produces a
    # confident-looking cluster built on one bit of real information, which is
    # worse than an obviously-empty one. --derive-factors opts in.
    if derive:
        payload["cbarqFactors"] = derive_factors(record)
    return payload


# ---------------------------------------------------------------------------
# CUB API
# ---------------------------------------------------------------------------

def post_json(url: str, payload: dict, token: str | None = None) -> tuple[int, dict]:
    headers = {"Content-Type": "application/json", "User-Agent": UA}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            return exc.code, json.loads(exc.read().decode("utf-8"))
        except Exception:
            return exc.code, {"error": exc.reason}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base", default="https://meetmycub.com")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", metavar="PATH")
    parser.add_argument("--breed", default=DEFAULT_BREED,
                        help="Breed to record when the listing states none (default: %(default)s)")
    parser.add_argument("--derive-factors", action="store_true",
                        help="Infer provisional C-BARQ factors from listing signals. "
                             "Off by default: the inference rests on one real signal "
                             "(good-with-dogs) and produces a misleadingly confident cluster.")
    args = parser.parse_args()

    slugs = SLUGS[: args.limit] if args.limit else SLUGS
    print(f"Scraping {len(slugs)} Mercylight profiles…", file=sys.stderr)

    records, failures = [], []
    for index, slug in enumerate(slugs, 1):
        try:
            records.append(scrape_profile(slug))
            print(f"  [{index}/{len(slugs)}] {slug}", file=sys.stderr)
        except Exception as exc:
            failures.append((slug, str(exc)))
            print(f"  [{index}/{len(slugs)}] {slug} — FAILED: {exc}", file=sys.stderr)

    payloads = [to_cub_payload(record, args.breed, args.derive_factors) for record in records]

    if args.json:
        with open(args.json, "w") as handle:
            json.dump({"records": records, "payloads": payloads}, handle, indent=2)
        print(f"Wrote {args.json}", file=sys.stderr)

    missing_image = [p["name"] for p in payloads if not p["imageUrl"]]
    missing_age = [p["name"] for p in payloads if p["ageMonths"] is None]
    print(f"\nScraped {len(records)} dogs. "
          f"Missing photo: {len(missing_image)}. Missing DOB/age: {len(missing_age)}.", file=sys.stderr)
    if failures:
        print(f"Failed to scrape: {failures}", file=sys.stderr)

    if args.dry_run:
        print(json.dumps(payloads, indent=2))
        print("\n(dry run — nothing was sent)", file=sys.stderr)
        return 0

    code = os.environ.get("CUB_PARTNER_CODE", "").strip()
    if not code:
        print("CUB_PARTNER_CODE is not set. Re-run as:\n"
              "  CUB_PARTNER_CODE=your-code python3 scripts/import_mercylight.py", file=sys.stderr)
        return 2

    status, body = post_json(f"{args.base}/api/partner/login", {"code": code})
    if status != 200 or "token" not in body:
        print(f"Login failed ({status}): {body.get('error', body)}", file=sys.stderr)
        return 2
    token = body["token"]
    print(f"Logged in as {body.get('partnerName')}.", file=sys.stderr)

    created, errors = 0, []
    for payload in payloads:
        status, body = post_json(f"{args.base}/api/dogs", payload, token)
        if status == 201:
            created += 1
            print(f"  + {payload['name']} → {body.get('cluster')}", file=sys.stderr)
        else:
            errors.append((payload["name"], status, body.get("error", body)))
            print(f"  ! {payload['name']} ({status}): {body.get('error', body)}", file=sys.stderr)

    print(f"\nImported {created}/{len(payloads)} dogs.", file=sys.stderr)
    if errors:
        print("Errors:", file=sys.stderr)
        for name, status, err in errors:
            print(f"  {name}: [{status}] {err}", file=sys.stderr)
    return 0 if not errors else 1


# ---------------------------------------------------------------------------
# DATA_GAPS — what Mercylight's site does not publish
# ---------------------------------------------------------------------------
# 1. BREED       — absent for all 50. Defaulted to Singapore Special.
# 2. SIZE        — absent for all 50. Left blank; affects HDB/housing scoring.
# 3. COLOUR      — absent for all 50. Left blank; affects preference matching.
# 4. WEIGHT      — absent for all 50. CUB has no field for it today.
# 5. C-BARQ      — absent for all 50. This is the big one: without it CUB's
#                  behavioural matching (30% of the match score) is inert. The
#                  factors this script derives are a stopgap, not an assessment.
# 6. HDB FLAG    — Mercylight publishes one (44 yes / 6 no) but CUB derives its
#                  own from breed, so the shelter's flag is recorded in notes
#                  only. For Singapore Specials CUB will say "not approved"
#                  (correct — they qualify via Project ADORE, not the breed list).

if __name__ == "__main__":
    raise SystemExit(main())
