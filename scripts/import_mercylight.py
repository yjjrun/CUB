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

Fields the listings do not publish, and where they come from instead
(see scripts/mercylight_profiles.py):
    breed   - not published; all recorded as Singapore Special (Local Mixed Breed)
    size    - not published; all recorded as Large, per the shelter
    colour  - not published; read from each dog's cover photo
    C-BARQ  - not published; the 42 item answers are ESTIMATED from each dog's
              background and personality write-up (scripts/mercylight_cbarq.py)
              and scored into factors by the form's own arithmetic. 31 of 42
              items are answered; the rest stay N/A because a shelter cannot
              observe them. Still not a completed questionnaire - the shelter
              should replace it, and every dog's notes say so.
    photos  - mirrored into public/assets/dogs/ and served from meetmycub.com
              rather than hotlinked from the shelter's CDN.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime
from html.parser import HTMLParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mercylight_profiles import colour_for, rationale_for  # noqa: E402
from mercylight_cbarq import answers_for, answered_count, derive_factors  # noqa: E402

LISTING = "https://www.mercylight.org.sg/adopt-a-blessing"
PROFILE = "https://www.mercylight.org.sg/adopt-a-blessing/{slug}"
UA = "CUB-importer/1.0 (+https://meetmycub.com; shelter data sync)"
# Photos are downloaded, resized and committed to public/assets/dogs/, so CUB
# serves them itself instead of hotlinking the shelter's CDN.
HOSTED_IMAGE = "https://meetmycub.com/assets/dogs/{slug}.jpg"
# Singapore Specials are a medium-to-large landrace; the shelter confirms large.
DEFAULT_SIZE = "Large"

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

ESTIMATE_NOTE = (
    "C-BARQ answers are ESTIMATES read from Mercylight's published background "
    "and personality write-up, not a completed questionnaire. Please review "
    "and correct them in the shelter portal."
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


def to_cub_payload(record: dict, breed: str) -> dict:
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
    notes_parts.append(
        f"HDB approved: {record.get('shelterSaysHdb') or 'unstated'} (per Mercylight; "
        "Singapore Specials qualify for HDB flats via Project ADORE rather than "
        "the AVS breed list)."
    )
    slug_key = record["slug"].replace("-blessing", "")
    why = rationale_for(slug_key)
    answered = answered_count(answers_for(slug_key))
    notes_parts.append(
        f"{ESTIMATE_NOTE} {answered} of 42 C-BARQ items estimated; the rest are "
        "marked N/A because a shelter cannot observe them."
        + (f" Basis: {why}." if why else "")
    )
    notes_parts.append("Source: " + record["sourceUrl"])

    slug = record["slug"].replace("-blessing", "")
    payload = {
        "name": record["name"],
        "breed": breed,
        "contactUrl": record["sourceUrl"],
        "sex": (record.get("sex") or "").capitalize() or "Unknown",
        "ageMonths": months_between(record.get("dob")),
        "imageUrl": HOSTED_IMAGE.format(slug=slug),
        "notes": "\n\n".join(notes_parts),
        "size": DEFAULT_SIZE,
        "color": colour_for(slug),
        # Mercylight's own HDB call is authoritative: they know which dogs have
        # been assessed for Project ADORE, which the breed list cannot express.
        "hdbApproved": (record.get("shelterSaysHdb") or "").strip().lower().startswith("yes"),
    }
    # Send the item answers as well as the factors, and derive the factors from
    # those answers with the form's own arithmetic, so an imported dog and a
    # hand-entered one are scored identically.
    answers = answers_for(slug)
    payload["cbarqAnswers"] = answers
    payload["cbarqFactors"] = derive_factors(answers)
    return payload


# ---------------------------------------------------------------------------
# CUB API
# ---------------------------------------------------------------------------

def get_json(url: str, token: str | None = None) -> tuple[int, dict]:
    headers = {"User-Agent": UA}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            return exc.code, json.loads(exc.read().decode("utf-8"))
        except Exception:
            return exc.code, {"error": exc.reason}


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
    parser.add_argument("--delay", type=float, default=11.0,
                        help="Seconds between posts. The API allows 30 per 5 minutes, "
                             "so the default paces just under that (default: %(default)s)")
    parser.add_argument("--retries", type=int, default=3,
                        help="Retries after a rate-limit response (default: %(default)s)")
    parser.add_argument("--breed", default=DEFAULT_BREED,
                        help="Breed to record when the listing states none (default: %(default)s)")
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

    payloads = [to_cub_payload(record, args.breed) for record in records]

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

    # Skip anything already stored for this partner, so a re-run after a
    # failure tops up rather than duplicating. Dogs are matched on name.
    status, body = get_json(f"{args.base}/api/partner/dogs", token)
    existing = {d.get("name") for d in body.get("dogs", [])} if status == 200 else set()
    if existing:
        print(f"{len(existing)} dog(s) already stored; those will be skipped.", file=sys.stderr)

    todo = [p for p in payloads if p["name"] not in existing]
    skipped = len(payloads) - len(todo)

    created, errors = 0, []
    for index, payload in enumerate(todo):
        # The API allows 30 posts per 5 minutes per IP. Pace below that instead
        # of sprinting into a 429 partway through the run.
        if index:
            time.sleep(args.delay)
        for attempt in range(args.retries + 1):
            status, body = post_json(f"{args.base}/api/dogs", payload, token)
            if status != 429:
                break
            wait = int(body.get("retryAfter") or 60)
            if attempt == args.retries:
                break
            print(f"  … rate limited, waiting {wait}s before retrying {payload['name']}",
                  file=sys.stderr)
            time.sleep(wait)
        if status == 201:
            created += 1
            print(f"  + {payload['name']} → {body.get('cluster')}", file=sys.stderr)
        else:
            errors.append((payload["name"], status, body.get("error", body)))
            print(f"  ! {payload['name']} ({status}): {body.get('error', body)}", file=sys.stderr)

    if skipped:
        print(f"\nSkipped {skipped} already-stored dog(s).", file=sys.stderr)
    print(f"\nImported {created}/{len(todo)} remaining dogs.", file=sys.stderr)
    if errors:
        print("Errors:", file=sys.stderr)
        for name, status, err in errors:
            print(f"  {name}: [{status}] {err}", file=sys.stderr)
    return 0 if not errors else 1


# ---------------------------------------------------------------------------
# DATA_GAPS — what Mercylight's site does not publish, and how it is filled
# ---------------------------------------------------------------------------
# 1. BREED    — absent for all 50. Recorded as Singapore Special (inference:
#               the write-ups describe NParks/TNRM island and street rescues).
# 2. SIZE     — absent for all 50. Recorded as Large, per the shelter.
# 3. COLOUR   — absent for all 50. Read from each cover photo.
# 4. WEIGHT   — absent for all 50; CUB has no field for it today.
# 5. C-BARQ   — absent for all 50. ESTIMATED per dog from the published
#               background/personality text (scripts/mercylight_profiles.py).
#               Grounded in specific statements, but not a real questionnaire.
# 6. KIDS     — published, but "Unknown" for 47 of 50 dogs.
# 7. HDB FLAG — published (44 yes / 6 no) and now sent through as the
#               authoritative value, overriding CUB's breed-list derivation.
#               Singapore Specials reach HDB flats via Project ADORE, which a
#               breed lookup cannot express; the shelter knows which dogs
#               qualify.

if __name__ == "__main__":
    raise SystemExit(main())
