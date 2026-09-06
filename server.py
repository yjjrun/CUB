from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import threading
import time
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import error as urlerror
from urllib import request as urlrequest
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
# CUB_DATA_DIR lets the host mount a persistent disk (e.g. Render) so the
# SQLite database survives restarts and redeploys. Defaults to the repo's data/.
DATA_DIR = Path(os.environ.get("CUB_DATA_DIR", ROOT / "data"))
DB_PATH = DATA_DIR / "cub.sqlite"
PUBLIC_DOMAIN = "https://meetmycub.com"

# Pepper for hashing partner access codes. Set a real random value via the
# CUB_CODE_PEPPER environment variable in production (see deploy/cub.service);
# the fallback here is only for local development.
CODE_PEPPER = os.environ.get("CUB_CODE_PEPPER", "dev-only-pepper-change-me").encode("utf-8")
ADMIN_CODE = os.environ.get("CUB_ADMIN_CODE", "")
SUPABASE_URL = (os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = (
    os.environ.get("SUPABASE_PUBLISHABLE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY")
    or os.environ.get("VITE_SUPABASE_ANON_KEY")
    or ""
)
SESSION_TTL_SECONDS = 12 * 60 * 60
RATE_LIMIT_WINDOW_SECONDS = 300
LOGIN_RATE_LIMIT = 8
POST_RATE_LIMIT = 30
USER_CACHE_TTL_SECONDS = 60

URL_SCHEME_RE = re.compile(r"^https?://", re.IGNORECASE)
IMAGE_DATA_URI_RE = re.compile(r"^data:image/(png|jpe?g|gif|webp);base64,", re.IGNORECASE)

_sessions: dict[str, dict] = {}
_sessions_lock = threading.Lock()
_user_cache: dict[str, tuple[float, dict]] = {}
_user_cache_lock = threading.Lock()
_rate_buckets: dict[tuple[str, str], list[float]] = {}
_rate_lock = threading.Lock()
FACTOR_FIELDS = [
    "strangerAggression",
    "ownerAggression",
    "dogAggressionFear",
    "trainability",
    "chasing",
    "strangerFear",
    "nonsocialFear",
    "dogFear",
    "separation",
    "touchSensitivity",
    "excitability",
    "attachment",
    "energy",
]

CLUSTER_CENTROIDS = {
    "Gentle Wallflowers": {
        "strangerAggression": 0.6,
        "ownerAggression": 0.3,
        "dogAggressionFear": 1.0,
        "trainability": 2.3,
        "chasing": 1.1,
        "strangerFear": 3.2,
        "nonsocialFear": 3.1,
        "dogFear": 2.5,
        "separation": 2.0,
        "touchSensitivity": 3.0,
        "excitability": 1.0,
        "attachment": 2.0,
        "energy": 1.1,
    },
    "Driven Guardians": {
        "strangerAggression": 2.2,
        "ownerAggression": 1.1,
        "dogAggressionFear": 1.8,
        "trainability": 3.5,
        "chasing": 2.5,
        "strangerFear": 0.8,
        "nonsocialFear": 0.8,
        "dogFear": 1.0,
        "separation": 2.0,
        "touchSensitivity": 1.3,
        "excitability": 3.3,
        "attachment": 2.4,
        "energy": 3.6,
    },
    "Golden Hearts": {
        "strangerAggression": 0.4,
        "ownerAggression": 0.2,
        "dogAggressionFear": 0.5,
        "trainability": 3.5,
        "chasing": 1.2,
        "strangerFear": 0.6,
        "nonsocialFear": 0.6,
        "dogFear": 0.6,
        "separation": 0.8,
        "touchSensitivity": 0.8,
        "excitability": 1.8,
        "attachment": 2.0,
        "energy": 2.0,
    },
    "Joyful Sparks": {
        "strangerAggression": 0.5,
        "ownerAggression": 0.3,
        "dogAggressionFear": 0.7,
        "trainability": 2.8,
        "chasing": 2.0,
        "strangerFear": 0.7,
        "nonsocialFear": 0.7,
        "dogFear": 0.8,
        "separation": 3.0,
        "touchSensitivity": 1.0,
        "excitability": 3.4,
        "attachment": 3.6,
        "energy": 3.4,
    },
    "Cautious Companions": {
        "strangerAggression": 1.1,
        "ownerAggression": 0.6,
        "dogAggressionFear": 2.4,
        "trainability": 2.2,
        "chasing": 1.1,
        "strangerFear": 1.4,
        "nonsocialFear": 1.2,
        "dogFear": 1.6,
        "separation": 1.2,
        "touchSensitivity": 1.4,
        "excitability": 1.2,
        "attachment": 1.5,
        "energy": 1.3,
    },
    "Gentle Giants": {
        "strangerAggression": 0.5,
        "ownerAggression": 0.3,
        "dogAggressionFear": 0.7,
        "trainability": 3.5,
        "chasing": 1.8,
        "strangerFear": 2.7,
        "nonsocialFear": 2.3,
        "dogFear": 2.1,
        "separation": 1.2,
        "touchSensitivity": 1.6,
        "excitability": 2.8,
        "attachment": 2.4,
        "energy": 3.2,
    },
    "Fiery Dynamos": {
        "strangerAggression": 3.4,
        "ownerAggression": 2.2,
        "dogAggressionFear": 3.4,
        "trainability": 1.7,
        "chasing": 3.2,
        "strangerFear": 2.3,
        "nonsocialFear": 2.0,
        "dogFear": 2.4,
        "separation": 3.0,
        "touchSensitivity": 2.2,
        "excitability": 3.7,
        "attachment": 3.2,
        "energy": 3.8,
    },
}

HOME_FIT_OPTIONS = ["HDB flat", "condominium", "landed house"]
EXERCISE_FIT_OPTIONS = ["low", "moderate", "moderateHigh", "high"]
# Official HDB-approved breed list (AVS/HDB, 62 breeds) mapped to the AKC
# names used by the frontend. HDB approval is this fixed list — never a size
# judgement. Local mixed-breeds up to 55cm may qualify via Project ADORE.
HDB_APPROVED_BREEDS = {
    # Crosses of two approved breeds are also HDB-approved (official rule),
    # covering Singapore's popular small hybrids:
    "Cavachon", "Cavoodle (Cavapoo)", "Maltipoo", "Morkie", "Pomapoo",
    "Poochon (Bichpoo)", "Schnoodle (Miniature)", "Shihpoo", "Yorkipoo",
    "Affenpinscher", "Australian Terrier", "Bichon Frise", "Bolognese",
    "Border Terrier", "Boston Terrier", "Brussels Griffon", "Cairn Terrier",
    "Cavalier King Charles Spaniel", "Cesky Terrier", "Chihuahua", "Chinese Crested",
    "Coton de Tulear", "Dachshund", "Dandie Dinmont Terrier", "English Toy Spaniel",
    "German Spitz", "Havanese", "Italian Greyhound", "Jagdterrier", "Japanese Chin",
    "Japanese Spitz", "Lakeland Terrier", "Lhasa Apso", "Lowchen", "Maltese",
    "Manchester Terrier", "Manchester Terrier (Toy)", "Miniature Pinscher",
    "Miniature Schnauzer", "Norfolk Terrier", "Norwegian Lundehund", "Norwich Terrier",
    "Papillon", "Pekingese", "Pomeranian", "Poodle (Miniature)", "Poodle (Toy)",
    "Pug", "Russell Terrier", "Schipperke", "Scottish Terrier", "Sealyham Terrier",
    "Shetland Sheepdog", "Shih Tzu", "Silky Terrier", "Smooth Fox Terrier",
    "Tibetan Spaniel", "Toy Fox Terrier", "Volpino Italiano", "Welsh Terrier",
    "West Highland White Terrier", "Wire Fox Terrier", "Yorkshire Terrier",
}

# AVS Part 1 Specified Dogs: banned in Singapore (no import, no new licences).
# Substring terms so crosses described in free text are also caught.
BANNED_BREED_TERMS = [
    "Pit Bull", "Pitbull", "American Bulldog", "American Staffordshire",
    "Staffordshire Bull Terrier", "Akita", "Neapolitan Mastiff", "Tosa",
    "Dogo Argentino", "Fila Brasileiro", "Boerboel", "Presa Canario",
]

# AVS Part 2 Specified Dogs: legal but never HDB-approved; leashed + muzzled
# in public, and licensing requires sterilisation and insurance.
SPECIFIED_PART2_BREEDS = {
    "Bull Terrier", "Miniature Bull Terrier", "Doberman Pinscher", "Rottweiler",
    "German Shepherd Dog", "Belgian Laekenois", "Belgian Malinois",
    "Belgian Sheepdog", "Belgian Tervuren", "Bullmastiff", "Cane Corso",
    "Dogue de Bordeaux",
}
HIGH_EXERCISE_TERMS = [
    "Cattle Dog", "Collie", "Goldendoodle", "Husky", "Kelpie", "Labradoodle",
    "Malinois", "Pointer", "Pomsky", "Retriever", "Setter", "Shepherd", "Spaniel",
    "Tervuren", "Vizsla", "Weimaraner", "Working",
]
MODERATE_HIGH_EXERCISE_TERMS = [
    "Beagle", "Cockapoo", "Coonhound", "Dalmatian", "Elkhound", "Foxhound", "Hound",
    "Malamute", "Mountain", "Ridgeback", "Samoyed", "Schnauzer", "Schnoodle",
    "Terrier", "Water Dog",
]
LOW_EXERCISE_TERMS = [
    "Basset", "Bichon", "Bulldog", "Cavachon", "Cavalier", "Chihuahua", "Chin",
    "Coton", "French Bulldog", "Lhasa", "Maltese", "Maltipoo", "Mastiff", "Morkie",
    "Pekingese", "Pomapoo", "Pomeranian", "Poochon", "Pug", "Shih Tzu", "Shihpoo",
    "Toy", "Yorkshire",
]


def init_db() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS dogs (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'available',
                name TEXT NOT NULL,
                shelter TEXT NOT NULL,
                contact_url TEXT NOT NULL,
                breed TEXT NOT NULL,
                age_years REAL,
                age_months INTEGER,
                sex TEXT,
                size TEXT,
                color TEXT,
                image_url TEXT,
                hdb_approved INTEGER NOT NULL DEFAULT 0,
                home_fit TEXT,
                home_fits TEXT NOT NULL DEFAULT '[]',
                exercise_need TEXT,
                exercise_needs TEXT NOT NULL DEFAULT '[]',
                cluster TEXT NOT NULL,
                cbarq_factors TEXT NOT NULL,
                cbarq_answers TEXT NOT NULL DEFAULT '{}',
                notes TEXT
            )
            """
        )
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS partners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code_hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL
            )
            """
        )
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                user_id TEXT PRIMARY KEY,
                email TEXT,
                name TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS saved_matches (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                dog_id TEXT NOT NULL,
                compatibility_score INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, dog_id)
            )
            """
        )
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS care_data (
                user_id TEXT PRIMARY KEY,
                dog_profile TEXT NOT NULL DEFAULT '{}',
                reminders TEXT NOT NULL DEFAULT '[]',
                checklists TEXT NOT NULL DEFAULT '{}',
                scan_history TEXT NOT NULL DEFAULT '[]',
                raw_state TEXT NOT NULL DEFAULT '{}',
                updated_at TEXT NOT NULL
            )
            """
        )
        columns = {row[1] for row in con.execute("PRAGMA table_info(dogs)").fetchall()}
        if "age_months" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN age_months INTEGER")
        if "cbarq_answers" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN cbarq_answers TEXT NOT NULL DEFAULT '{}'")
        if "home_fits" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN home_fits TEXT NOT NULL DEFAULT '[]'")
        if "exercise_needs" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN exercise_needs TEXT NOT NULL DEFAULT '[]'")
        if "partner_id" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN partner_id TEXT")
        care_columns = {row[1] for row in con.execute("PRAGMA table_info(care_data)").fetchall()}
        if "raw_state" not in care_columns:
            con.execute("ALTER TABLE care_data ADD COLUMN raw_state TEXT NOT NULL DEFAULT '{}'")
        con.commit()


class SupabaseConfigError(RuntimeError):
    pass


class SupabaseAuthError(RuntimeError):
    pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def verify_supabase_user(token: str) -> dict:
    if not token:
        raise SupabaseAuthError("Adopter login required.")
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise SupabaseConfigError("Supabase Auth is not configured on this server.")

    now = time.monotonic()
    with _user_cache_lock:
        cached = _user_cache.get(token)
        if cached and cached[0] > now:
            return cached[1]

    req = urlrequest.Request(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urlrequest.urlopen(req, timeout=8) as res:
            payload = json.loads(res.read().decode("utf-8"))
    except urlerror.HTTPError as exc:
        if exc.code in {401, 403}:
            raise SupabaseAuthError("Adopter login required.") from exc
        raise RuntimeError("Could not verify Supabase session.") from exc
    except (urlerror.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("Could not verify Supabase session.") from exc

    user_id = str(payload.get("id") or "").strip()
    if not user_id:
        raise SupabaseAuthError("Adopter login required.")
    metadata = payload.get("user_metadata") if isinstance(payload.get("user_metadata"), dict) else {}
    user = {
        "id": user_id,
        "email": str(payload.get("email") or ""),
        "name": str(metadata.get("name") or metadata.get("full_name") or ""),
    }
    with _user_cache_lock:
        _user_cache[token] = (now + USER_CACHE_TTL_SECONDS, user)
    return user


def ensure_profile(user: dict) -> None:
    now = now_iso()
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
            INSERT INTO profiles (user_id, email, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                email = excluded.email,
                updated_at = excluded.updated_at
            """,
            (user["id"], user.get("email"), user.get("name"), now, now),
        )
        con.commit()


def save_profile(user: dict, payload: dict) -> dict:
    name = str(payload.get("name") or user.get("name") or "").strip()
    now = now_iso()
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
            INSERT INTO profiles (user_id, email, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                email = excluded.email,
                name = excluded.name,
                updated_at = excluded.updated_at
            """,
            (user["id"], user.get("email"), name, now, now),
        )
        con.commit()
    return {"profile": {"userId": user["id"], "email": user.get("email"), "name": name, "updatedAt": now}}


def get_profile(user: dict) -> dict:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        row = con.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],)).fetchone()
    if not row:
        return {"profile": {"userId": user["id"], "email": user.get("email"), "name": user.get("name"), "updatedAt": None}}
    return {
        "profile": {
            "userId": row["user_id"],
            "email": row["email"],
            "name": row["name"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        },
    }


def list_saved_matches(user_id: str) -> list[dict]:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute(
            """
            SELECT saved_matches.dog_id, saved_matches.compatibility_score,
                   saved_matches.created_at, dogs.name, dogs.breed,
                   dogs.image_url, dogs.contact_url, dogs.shelter
            FROM saved_matches
            LEFT JOIN dogs ON dogs.id = saved_matches.dog_id
            WHERE saved_matches.user_id = ?
            ORDER BY saved_matches.created_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [
        {
            "dogId": row["dog_id"],
            "compatibilityScore": row["compatibility_score"],
            "createdAt": row["created_at"],
            "dogName": row["name"],
            "breed": row["breed"],
            "imageUrl": row["image_url"],
            "contactUrl": row["contact_url"],
            "shelter": row["shelter"],
        }
        for row in rows
    ]


def save_user_match(user_id: str, payload: dict) -> dict:
    dog_id = str(payload.get("dogId") or "").strip()
    if not dog_id:
        raise ValueError("Dog id is required.")
    try:
        score = int(payload.get("compatibilityScore"))
    except (TypeError, ValueError):
        score = 0
    score = int(clamp(score, 0, 100))
    now = now_iso()
    with sqlite3.connect(DB_PATH) as con:
        exists = con.execute("SELECT 1 FROM dogs WHERE id = ?", (dog_id,)).fetchone()
        if not exists:
            raise ValueError("Dog record not found.")
        con.execute(
            """
            INSERT INTO saved_matches (id, user_id, dog_id, compatibility_score, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, dog_id) DO UPDATE SET
                compatibility_score = excluded.compatibility_score,
                created_at = excluded.created_at
            """,
            (str(uuid.uuid4()), user_id, dog_id, score, now),
        )
        con.commit()
    return {"ok": True, "match": {"dogId": dog_id, "compatibilityScore": score, "createdAt": now}}


def delete_user_match(user_id: str, dog_id: str) -> bool:
    with sqlite3.connect(DB_PATH) as con:
        cur = con.execute("DELETE FROM saved_matches WHERE user_id = ? AND dog_id = ?", (user_id, dog_id))
        con.commit()
    return cur.rowcount > 0


def list_checklists(care_data: dict) -> dict:
    return {key: value for key, value in care_data.items() if key.startswith("checklist:")}


def get_user_care_data(user_id: str) -> dict:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        row = con.execute("SELECT raw_state, updated_at FROM care_data WHERE user_id = ?", (user_id,)).fetchone()
    if not row:
        return {"careData": {}, "updatedAt": None}
    return {"careData": json.loads(row["raw_state"] or "{}"), "updatedAt": row["updated_at"]}


def save_user_care_data(user_id: str, payload: dict) -> dict:
    care_data = payload.get("careData")
    if not isinstance(care_data, dict):
        raise ValueError("CUB Care data must be an object.")
    now = now_iso()
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
            INSERT INTO care_data (
                user_id, dog_profile, reminders, checklists, scan_history, raw_state, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                dog_profile = excluded.dog_profile,
                reminders = excluded.reminders,
                checklists = excluded.checklists,
                scan_history = excluded.scan_history,
                raw_state = excluded.raw_state,
                updated_at = excluded.updated_at
            """,
            (
                user_id,
                json.dumps(care_data.get("dog_profile") or {}, sort_keys=True),
                json.dumps(care_data.get("reminders") or [], sort_keys=True),
                json.dumps(list_checklists(care_data), sort_keys=True),
                json.dumps(care_data.get("scans") or [], sort_keys=True),
                json.dumps(care_data, sort_keys=True),
                now,
            ),
        )
        con.commit()
    return {"ok": True, "updatedAt": now}


def hash_code(code: str) -> str:
    return hmac.new(CODE_PEPPER, code.strip().encode("utf-8"), hashlib.sha256).hexdigest()


def find_partner_by_code(code: str) -> dict | None:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        row = con.execute(
            "SELECT * FROM partners WHERE code_hash = ?", (hash_code(code),)
        ).fetchone()
    return dict(row) if row else None


def create_partner(name: str, code: str | None = None) -> tuple[dict, str]:
    name = name.strip()
    if not name:
        raise ValueError("Partner name is required.")
    code = (code or secrets.token_urlsafe(9)).strip()
    partner_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            "INSERT INTO partners (id, name, code_hash, created_at) VALUES (?, ?, ?, ?)",
            (partner_id, name, hash_code(code), now),
        )
        con.commit()
    return {"id": partner_id, "name": name, "created_at": now}, code


def check_rate_limit(bucket: str, key: str, limit: int) -> bool:
    now = time.monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    with _rate_lock:
        hits = [t for t in _rate_buckets.get((bucket, key), []) if t > cutoff]
        if len(hits) >= limit:
            _rate_buckets[(bucket, key)] = hits
            return False
        hits.append(now)
        _rate_buckets[(bucket, key)] = hits
        return True


def create_session(partner_id: str, partner_name: str, role: str = "partner") -> str:
    token = secrets.token_urlsafe(32)
    with _sessions_lock:
        _sessions[token] = {
            "partner_id": partner_id,
            "partner_name": partner_name,
            "role": role,
            "expires_at": time.monotonic() + SESSION_TTL_SECONDS,
        }
    return token


def get_session(token: str) -> dict | None:
    if not token:
        return None
    with _sessions_lock:
        session = _sessions.get(token)
        if not session:
            return None
        if session["expires_at"] < time.monotonic():
            del _sessions[token]
            return None
        return session


def validate_contact_url(value: str) -> None:
    if not URL_SCHEME_RE.match(value):
        raise ValueError("Contact URL must be a valid http:// or https:// link.")


def validate_image_url(value: str) -> None:
    if not value:
        return
    if URL_SCHEME_RE.match(value) or IMAGE_DATA_URI_RE.match(value):
        return
    raise ValueError("Photo URL must be an http(s) link or an uploaded image.")


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def normalise_factors(raw: dict) -> dict[str, float]:
    factors = {}
    for field in FACTOR_FIELDS:
        try:
            factors[field] = clamp(float(raw.get(field, 0)), 0, 4)
        except (TypeError, ValueError):
            factors[field] = 0
    return factors


def classify_cluster(factors: dict[str, float]) -> str:
    best_name = "Golden Hearts"
    best_distance = float("inf")
    for name, centroid in CLUSTER_CENTROIDS.items():
        distance = sum((factors[field] - centroid[field]) ** 2 for field in FACTOR_FIELDS)
        if distance < best_distance:
            best_name = name
            best_distance = distance
    return best_name


def includes_any(label: str, terms: list[str]) -> bool:
    lowered = label.lower()
    return any(term.lower() in lowered for term in terms)


def expand_home_fits(base_fit: str) -> list[str]:
    if base_fit == "HDB flat":
        return ["HDB flat", "condominium", "landed house"]
    if base_fit == "condominium":
        return ["condominium", "landed house"]
    return ["landed house"]


def exercise_fit_options(minimum_need: str) -> list[str]:
    try:
        start = EXERCISE_FIT_OPTIONS.index(minimum_need)
    except ValueError:
        start = 1
    return EXERCISE_FIT_OPTIONS[start:]


def is_banned_breed(breed: str) -> bool:
    return includes_any(str(breed or ""), BANNED_BREED_TERMS)


def derive_dog_care_profile(breed: str, size: str, hdb_override: bool | None = None) -> dict:
    label = str(breed or "").strip()
    size_label = str(size or "").strip().lower()
    # HDB approval follows the official AVS/HDB breed list only — size is not
    # a criterion. Unlisted or mixed breeds default to not approved.
    #
    # A partner may override this. The breed list is not the only route into an
    # HDB flat: local mixed-breeds up to 55cm qualify through Project ADORE,
    # and only the shelter knows whether a given dog has been assessed for it.
    # A shelter's first-hand judgement beats a breed-name lookup.
    hdb_approved = label in HDB_APPROVED_BREEDS
    if hdb_override is not None:
        hdb_approved = hdb_override

    home_fit = "landed house"
    if hdb_approved:
        home_fit = "HDB flat"
    elif size_label != "large" and not includes_any(label, ["Mastiff", "Great Dane", "Saint Bernard", "Newfoundland"]):
        home_fit = "condominium"

    exercise_need = "moderate"
    if includes_any(label, HIGH_EXERCISE_TERMS):
        exercise_need = "high"
    elif includes_any(label, MODERATE_HIGH_EXERCISE_TERMS):
        exercise_need = "moderateHigh"
    elif includes_any(label, LOW_EXERCISE_TERMS) or size_label == "small":
        exercise_need = "low"

    return {
        "hdb_approved": hdb_approved,
        "specified": label in SPECIFIED_PART2_BREEDS,
        "home_fit": home_fit,
        "home_fits": expand_home_fits(home_fit),
        "exercise_need": exercise_need,
        "exercise_needs": exercise_fit_options(exercise_need),
    }


def row_to_dog(row: sqlite3.Row) -> dict:
    dog = dict(row)
    dog["hdbApproved"] = bool(dog.pop("hdb_approved"))
    dog["contactUrl"] = dog.pop("contact_url")
    age_years = dog.pop("age_years", None)
    age_months = dog.pop("age_months", None)
    dog["ageMonths"] = age_months if age_months is not None else (round(age_years * 12) if age_years else None)
    dog["ageYears"] = age_years
    dog["imageUrl"] = dog.pop("image_url")
    dog["homeFit"] = dog.pop("home_fit")
    dog["homeFits"] = json.loads(dog.pop("home_fits") or "[]") or expand_home_fits(dog["homeFit"])
    dog["exerciseNeed"] = dog.pop("exercise_need")
    dog["exerciseNeeds"] = json.loads(dog.pop("exercise_needs") or "[]") or exercise_fit_options(dog["exerciseNeed"])
    dog["createdAt"] = dog.pop("created_at")
    dog["cbarqFactors"] = json.loads(dog.pop("cbarq_factors"))
    dog["cbarqAnswers"] = json.loads(dog.pop("cbarq_answers") or "{}")
    dog["partnerId"] = dog.pop("partner_id", None)
    return dog


def public_dog_view(dog: dict) -> dict:
    return {key: value for key, value in dog.items() if key not in {"notes", "cbarqAnswers", "partnerId"}}


def admin_summary() -> dict:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        partners = [dict(row) for row in con.execute("SELECT id, name, created_at FROM partners ORDER BY name")]
        dogs = list_dogs()
    counts = {}
    for dog in dogs:
        partner_id = dog.get("partnerId") or ""
        counts[partner_id] = counts.get(partner_id, 0) + 1
    partner_rows = [
        {
            "id": partner["id"],
            "name": partner["name"],
            "createdAt": partner["created_at"],
            "dogCount": counts.get(partner["id"], 0),
        }
        for partner in partners
    ]
    return {
        "partners": partner_rows,
        "dogs": dogs,
        "totals": {
            "partners": len(partner_rows),
            "dogs": len(dogs),
        },
    }


def csv_cell(value) -> str:
    text = "" if value is None else str(value)
    return '"' + text.replace('"', '""') + '"'


def admin_csv() -> str:
    rows = [[
        "dog_id", "dog_name", "partner_id", "partner_name", "status", "breed",
        "age_months", "sex", "size", "color", "cluster", "hdb_approved",
        "home_fits", "exercise_needs", "contact_url", "created_at",
    ]]
    for dog in list_dogs():
        rows.append([
            dog.get("id"), dog.get("name"), dog.get("partnerId"), dog.get("shelter"),
            dog.get("status"), dog.get("breed"), dog.get("ageMonths"), dog.get("sex"),
            dog.get("size"), dog.get("color"), dog.get("cluster"), dog.get("hdbApproved"),
            ", ".join(dog.get("homeFits") or []), ", ".join(dog.get("exerciseNeeds") or []),
            dog.get("contactUrl"), dog.get("createdAt"),
        ])
    return "\n".join(",".join(csv_cell(cell) for cell in row) for row in rows) + "\n"


def delete_dog(dog_id: str) -> bool:
    with sqlite3.connect(DB_PATH) as con:
        cur = con.execute("DELETE FROM dogs WHERE id = ?", (dog_id,))
        if cur.rowcount:
            con.execute("DELETE FROM saved_matches WHERE dog_id = ?", (dog_id,))
        con.commit()
    return cur.rowcount > 0


def delete_partner(partner_id: str) -> tuple[bool, int]:
    with sqlite3.connect(DB_PATH) as con:
        dog_ids = [
            row[0]
            for row in con.execute("SELECT id FROM dogs WHERE partner_id = ?", (partner_id,)).fetchall()
        ]
        dog_count = con.execute("SELECT COUNT(*) FROM dogs WHERE partner_id = ?", (partner_id,)).fetchone()[0]
        cur = con.execute("DELETE FROM partners WHERE id = ?", (partner_id,))
        if cur.rowcount:
            con.execute("DELETE FROM dogs WHERE partner_id = ?", (partner_id,))
            if dog_ids:
                con.executemany("DELETE FROM saved_matches WHERE dog_id = ?", [(dog_id,) for dog_id in dog_ids])
        con.commit()
    return cur.rowcount > 0, dog_count


def list_dogs(partner_id: str | None = None) -> list[dict]:
    query = "SELECT * FROM dogs"
    params: tuple = ()
    if partner_id is not None:
        query += " WHERE partner_id = ?"
        params = (partner_id,)
    query += " ORDER BY created_at DESC"
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute(query, params).fetchall()
    return [row_to_dog(row) for row in rows]


def insert_dog(payload: dict, partner: dict) -> dict:
    factors = normalise_factors(payload.get("cbarqFactors") or {})
    cluster = classify_cluster(factors)
    breed = str(payload.get("breed") or "").strip()
    size = str(payload.get("size") or "").strip()
    if is_banned_breed(breed):
        raise ValueError(
            "This breed is on the AVS Part 1 specified (banned) list and cannot "
            "be imported or newly licensed in Singapore."
        )
    # Partners may assert HDB approval themselves (e.g. a local mixed-breed
    # cleared through Project ADORE). Omitting the field keeps the derived
    # value, so existing callers are unaffected.
    hdb_override = payload.get("hdbApproved")
    hdb_override = bool(hdb_override) if isinstance(hdb_override, bool) else None
    care_profile = derive_dog_care_profile(breed, size, hdb_override)
    dog_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    contact_url = str(payload.get("contactUrl") or "").strip()
    image_url = str(payload.get("imageUrl") or "").strip()
    validate_contact_url(contact_url)
    validate_image_url(image_url)

    fields = {
        "id": dog_id,
        "created_at": now,
        "status": "available",
        "name": str(payload.get("name") or "").strip(),
        # shelter is always the logged-in partner's own name, never client input,
        # so a valid code can only ever create records under its own identity.
        "shelter": partner["name"],
        "contact_url": contact_url,
        "breed": breed,
        "age_years": payload.get("ageYears") or None,
        "age_months": payload.get("ageMonths") or None,
        "sex": str(payload.get("sex") or "").strip(),
        "size": size,
        "color": str(payload.get("color") or "").strip(),
        "image_url": image_url,
        "hdb_approved": 1 if care_profile["hdb_approved"] else 0,
        "home_fit": care_profile["home_fit"],
        "home_fits": json.dumps(care_profile["home_fits"]),
        "exercise_need": care_profile["exercise_need"],
        "exercise_needs": json.dumps(care_profile["exercise_needs"]),
        "cluster": cluster,
        "cbarq_factors": json.dumps(factors, sort_keys=True),
        "cbarq_answers": json.dumps(payload.get("cbarqAnswers") or {}, sort_keys=True),
        "notes": str(payload.get("notes") or "").strip(),
        "partner_id": partner["id"],
    }
    required = ["shelter", "contact_url", "breed"]
    missing = [field for field in required if not fields[field]]
    if missing:
        raise ValueError("Missing required fields: " + ", ".join(missing))

    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
            INSERT INTO dogs (
                id, created_at, status, name, shelter, contact_url, breed, age_years,
                age_months, sex, size, color, image_url, hdb_approved, home_fit,
                home_fits, exercise_need, exercise_needs, cluster, cbarq_factors,
                cbarq_answers, notes, partner_id
            )
            VALUES (
                :id, :created_at, :status, :name, :shelter, :contact_url, :breed,
                :age_years, :age_months, :sex, :size, :color, :image_url,
                :hdb_approved, :home_fit, :home_fits, :exercise_need, :exercise_needs,
                :cluster, :cbarq_factors, :cbarq_answers, :notes, :partner_id
            )
            """,
            fields,
        )
        con.commit()
    return {"id": dog_id, "cluster": cluster, "dog": next(dog for dog in list_dogs() if dog["id"] == dog_id)}


class CUBHandler(BaseHTTPRequestHandler):
    server_version = "CUBPrototype/1.0"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/config":
            configured = bool(SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY)
            self.send_json({
                "supabaseConfigured": configured,
                "supabaseUrl": SUPABASE_URL if configured else "",
                "supabasePublishableKey": SUPABASE_PUBLISHABLE_KEY if configured else "",
            })
            return
        if parsed.path == "/api/dogs":
            self.send_json({"dogs": [public_dog_view(dog) for dog in list_dogs()]})
            return
        if parsed.path == "/api/account/profile":
            user = self.require_user()
            if user is None:
                return
            self.send_json(get_profile(user))
            return
        if parsed.path == "/api/account/saved-matches":
            user = self.require_user()
            if user is None:
                return
            self.send_json({"matches": list_saved_matches(user["id"])})
            return
        if parsed.path == "/api/account/care-data":
            user = self.require_user()
            if user is None:
                return
            self.send_json(get_user_care_data(user["id"]))
            return
        if parsed.path == "/api/partner/dogs":
            session = self.require_session()
            if session is None:
                return
            self.send_json({"dogs": list_dogs(partner_id=session["partner_id"])})
            return
        if parsed.path == "/api/admin/summary":
            if self.require_admin_session() is None:
                return
            self.send_json(admin_summary())
            return
        if parsed.path == "/api/admin/export.csv":
            if self.require_admin_session() is None:
                return
            self.send_csv(admin_csv(), "cub-admin-export.csv")
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/partner/login":
            self.handle_partner_login()
            return
        if parsed.path == "/api/admin/login":
            self.handle_admin_login()
            return
        if parsed.path == "/api/admin/partners":
            self.handle_admin_create_partner()
            return
        if parsed.path == "/api/account/profile":
            self.handle_account_profile()
            return
        if parsed.path == "/api/account/saved-matches":
            self.handle_account_save_match()
            return
        if parsed.path == "/api/account/care-data":
            self.handle_account_care_data()
            return
        if parsed.path != "/api/dogs":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        if not check_rate_limit("post_dog", self.client_address[0], POST_RATE_LIMIT):
            self.send_json(
                {"error": "Too many requests. Try again later.",
                 "retryAfter": RATE_LIMIT_WINDOW_SECONDS},
                HTTPStatus.TOO_MANY_REQUESTS,
                extra_headers={"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
            )
            return

        session = self.require_session()
        if session is None:
            return

        try:
            payload = self.read_json_body()
            partner = {"id": session["partner_id"], "name": session["partner_name"]}
            self.send_json(insert_dog(payload, partner), HTTPStatus.CREATED)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/account/saved-matches/"):
            user = self.require_user()
            if user is None:
                return
            dog_id = unquote(parsed.path.rsplit("/", 1)[-1])
            if not dog_id:
                self.send_json({"error": "Dog id is required."}, HTTPStatus.BAD_REQUEST)
                return
            if not delete_user_match(user["id"], dog_id):
                self.send_json({"error": "Saved match not found."}, HTTPStatus.NOT_FOUND)
                return
            self.send_json({"ok": True})
            return
        if self.require_admin_session() is None:
            return
        if parsed.path.startswith("/api/admin/dogs/"):
            dog_id = unquote(parsed.path.rsplit("/", 1)[-1])
            if not dog_id:
                self.send_json({"error": "Dog id is required."}, HTTPStatus.BAD_REQUEST)
                return
            if not delete_dog(dog_id):
                self.send_json({"error": "Dog record not found."}, HTTPStatus.NOT_FOUND)
                return
            self.send_json({"ok": True})
            return
        if parsed.path.startswith("/api/admin/partners/"):
            partner_id = unquote(parsed.path.rsplit("/", 1)[-1])
            if not partner_id:
                self.send_json({"error": "Partner id is required."}, HTTPStatus.BAD_REQUEST)
                return
            deleted, dog_count = delete_partner(partner_id)
            if not deleted:
                self.send_json({"error": "Partner not found."}, HTTPStatus.NOT_FOUND)
                return
            self.send_json({"ok": True, "deletedDogs": dog_count})
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def handle_partner_login(self) -> None:
        if not check_rate_limit("login", self.client_address[0], LOGIN_RATE_LIMIT):
            self.send_json({"error": "Too many attempts. Try again later."}, HTTPStatus.TOO_MANY_REQUESTS)
            return
        try:
            payload = self.read_json_body()
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)
            return
        code = str(payload.get("code") or "").strip()
        partner = find_partner_by_code(code) if code else None
        if not partner:
            self.send_json({"error": "Invalid partner code."}, HTTPStatus.UNAUTHORIZED)
            return
        token = create_session(partner["id"], partner["name"])
        self.send_json({"token": token, "partnerName": partner["name"]})

    def handle_admin_login(self) -> None:
        if not check_rate_limit("admin_login", self.client_address[0], LOGIN_RATE_LIMIT):
            self.send_json({"error": "Too many attempts. Try again later."}, HTTPStatus.TOO_MANY_REQUESTS)
            return
        if not ADMIN_CODE:
            self.send_json({"error": "Admin access is not configured on this server."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        try:
            payload = self.read_json_body()
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)
            return
        code = str(payload.get("code") or "").strip()
        if not hmac.compare_digest(code, ADMIN_CODE):
            self.send_json({"error": "Invalid admin code."}, HTTPStatus.UNAUTHORIZED)
            return
        token = create_session("admin", "Admin", role="admin")
        self.send_json({"token": token})

    def handle_admin_create_partner(self) -> None:
        if self.require_admin_session() is None:
            return
        try:
            payload = self.read_json_body()
            partner, code = create_partner(str(payload.get("name") or ""), payload.get("code") or None)
            self.send_json({"partner": partner, "code": code}, HTTPStatus.CREATED)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except sqlite3.IntegrityError:
            self.send_json({"error": "That partner code already exists. Try another code."}, HTTPStatus.CONFLICT)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def handle_account_profile(self) -> None:
        user = self.require_user()
        if user is None:
            return
        try:
            payload = self.read_json_body()
            self.send_json(save_profile(user, payload))
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def handle_account_save_match(self) -> None:
        user = self.require_user()
        if user is None:
            return
        try:
            payload = self.read_json_body()
            self.send_json(save_user_match(user["id"], payload), HTTPStatus.CREATED)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def handle_account_care_data(self) -> None:
        user = self.require_user()
        if user is None:
            return
        try:
            payload = self.read_json_body()
            self.send_json(save_user_care_data(user["id"], payload))
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def require_session(self) -> dict | None:
        header = self.headers.get("Authorization", "")
        token = header[len("Bearer "):] if header.startswith("Bearer ") else ""
        session = get_session(token)
        if session is None or session.get("role") != "partner":
            self.send_json({"error": "Partner login required."}, HTTPStatus.UNAUTHORIZED)
            return None
        return session

    def require_admin_session(self) -> dict | None:
        header = self.headers.get("Authorization", "")
        token = header[len("Bearer "):] if header.startswith("Bearer ") else ""
        session = get_session(token)
        if session is None or session.get("role") != "admin":
            self.send_json({"error": "Admin login required."}, HTTPStatus.UNAUTHORIZED)
            return None
        return session

    def require_user(self) -> dict | None:
        header = self.headers.get("Authorization", "")
        token = header[len("Bearer "):] if header.startswith("Bearer ") else ""
        try:
            user = verify_supabase_user(token)
            ensure_profile(user)
            return user
        except SupabaseConfigError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.SERVICE_UNAVAILABLE)
        except SupabaseAuthError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.UNAUTHORIZED)
        except RuntimeError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_GATEWAY)
        return None

    def read_json_body(self) -> dict:
        length = int(self.headers.get("content-length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else ""
        return json.loads(raw or "{}")

    def serve_static(self, raw_path: str) -> None:
        if raw_path in {
            "/", "/care", "/match", "/partner", "/shelter", "/faq", "/faqs",
            "/about/faq", "/about/team", "/login", "/signup", "/forgot-password", "/profile",
        }:
            target = ROOT / "index.html"
        else:
            safe_path = unquote(raw_path).lstrip("/")
            target = (ROOT / safe_path).resolve()
            if not str(target).startswith(str(ROOT)) or not target.is_file():
                target = ROOT / "index.html"

        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(target.read_bytes())

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK,
                  extra_headers: dict | None = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for name, value in (extra_headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def send_csv(self, csv_text: str, filename: str) -> None:
        body = csv_text.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the CUB: Canine Understanding Buddy prototype server.")
    # Hosts like Render inject HOST/PORT via the environment; fall back to local dev defaults.
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", default=int(os.environ.get("PORT", "4173")), type=int)

    subparsers = parser.add_subparsers(dest="command")
    add_partner = subparsers.add_parser(
        "add-partner", help="Create a partner account and print its one-time access code."
    )
    add_partner.add_argument("--name", required=True, help="Shelter or pet shop name.")
    add_partner.add_argument("--code", default=None, help="Custom access code (random if omitted).")
    subparsers.add_parser(
        "recompute-care",
        help="Re-derive HDB approval, home fit, and exercise need for stored dogs.",
    )
    subparsers.add_parser(
        "list-partners",
        help="List every partner account and the dogs each has added.",
    )

    args = parser.parse_args()
    init_db()

    if args.command == "add-partner":
        if CODE_PEPPER == b"dev-only-pepper-change-me":
            print(
                "WARNING: CUB_CODE_PEPPER is not set — hashing with the dev fallback.\n"
                "If the running service uses a different pepper (e.g. from\n"
                "/var/lib/cub/cub.env), this code will NOT work for login. Run:\n"
                "  sudo -u cub bash -c 'set -a; . /var/lib/cub/cub.env; "
                "CUB_DATA_DIR=/var/lib/cub python3 /opt/cub/server.py add-partner --name \"...\"'"
            )
        partner, code = create_partner(args.name, args.code)
        print(f"Created partner '{partner['name']}' (id={partner['id']}).")
        print(f"Access code (shown once, store it securely): {code}")
        return

    if args.command == "list-partners":
        with sqlite3.connect(DB_PATH) as con:
            con.row_factory = sqlite3.Row
            partners = con.execute("SELECT * FROM partners ORDER BY name").fetchall()
            dogs = con.execute(
                "SELECT partner_id, shelter, name, breed, cluster, status, created_at "
                "FROM dogs ORDER BY created_at DESC"
            ).fetchall()
        by_partner: dict[str, list] = {}
        unowned = []
        for dog in dogs:
            if dog["partner_id"]:
                by_partner.setdefault(dog["partner_id"], []).append(dog)
            else:
                unowned.append(dog)
        if not partners:
            print("No partner accounts yet. Create one with: server.py add-partner --name \"...\"")
        for p in partners:
            owned = by_partner.get(p["id"], [])
            print(f"\n{p['name']}  (created {p['created_at'][:10]}, {len(owned)} dog(s))")
            for dog in owned:
                print(f"  - {dog['name'] or 'Unnamed'} · {dog['breed']} · {dog['cluster']} · {dog['status']} · added {dog['created_at'][:10]}")
        if unowned:
            print("\nDogs with no partner account (added before per-partner logins existed):")
            for dog in unowned:
                print(f"  - {dog['name'] or 'Unnamed'} · {dog['breed']} · listed under shelter '{dog['shelter']}' · added {dog['created_at'][:10]}")
        return

    if args.command == "recompute-care":
        with sqlite3.connect(DB_PATH) as con:
            con.row_factory = sqlite3.Row
            rows = con.execute("SELECT id, breed, size FROM dogs").fetchall()
            for row in rows:
                profile = derive_dog_care_profile(row["breed"], row["size"])
                con.execute(
                    """
                    UPDATE dogs SET hdb_approved = ?, home_fit = ?, home_fits = ?,
                        exercise_need = ?, exercise_needs = ? WHERE id = ?
                    """,
                    (
                        1 if profile["hdb_approved"] else 0,
                        profile["home_fit"],
                        json.dumps(profile["home_fits"]),
                        profile["exercise_need"],
                        json.dumps(profile["exercise_needs"]),
                        row["id"],
                    ),
                )
            con.commit()
        print(f"Recomputed care profiles for {len(rows)} dog(s).")
        return

    httpd = ThreadingHTTPServer((args.host, args.port), CUBHandler)
    print(f"CUB: Canine Understanding Buddy running at http://{args.host}:{args.port}")
    print(f"Configured production domain: {PUBLIC_DOMAIN}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
