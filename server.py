from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
# CUB_DATA_DIR lets the host mount a persistent disk (e.g. Render) so the
# SQLite database survives restarts and redeploys. Defaults to the repo's data/.
DATA_DIR = Path(os.environ.get("CUB_DATA_DIR", ROOT / "data"))
DB_PATH = DATA_DIR / "cub.sqlite"
PUBLIC_DOMAIN = "https://meetmycub.com"
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
HDB_SUITABLE_BREEDS = {
    "Affenpinscher", "Australian Terrier", "Bichon Frise", "Bolognese", "Boston Terrier",
    "Brussels Griffon", "Cairn Terrier", "Cavalier King Charles Spaniel", "Chihuahua",
    "Chinese Crested", "Coton de Tulear", "Dachshund", "Dandie Dinmont Terrier",
    "English Toy Spaniel", "French Bulldog", "Havanese", "Italian Greyhound",
    "Japanese Chin", "Japanese Spitz", "Lhasa Apso", "Lowchen", "Maltese",
    "Manchester Terrier (Toy)", "Miniature Pinscher", "Miniature Schnauzer",
    "Norfolk Terrier", "Norwich Terrier", "Papillon", "Pekingese", "Pomeranian",
    "Poodle (Miniature)", "Poodle (Toy)", "Pug", "Russian Toy", "Schipperke",
    "Scottish Terrier", "Sealyham Terrier", "Shih Tzu", "Silky Terrier", "Skye Terrier",
    "Tibetan Spaniel", "Toy Fox Terrier", "West Highland White Terrier", "Yorkshire Terrier",
}
HIGH_EXERCISE_TERMS = [
    "Cattle Dog", "Collie", "Husky", "Kelpie", "Malinois", "Pointer", "Retriever",
    "Setter", "Shepherd", "Spaniel", "Tervuren", "Vizsla", "Weimaraner", "Working",
]
MODERATE_HIGH_EXERCISE_TERMS = [
    "Beagle", "Coonhound", "Dalmatian", "Elkhound", "Foxhound", "Hound", "Malamute",
    "Mountain", "Ridgeback", "Samoyed", "Schnauzer", "Terrier", "Water Dog",
]
LOW_EXERCISE_TERMS = [
    "Basset", "Bichon", "Bulldog", "Cavalier", "Chihuahua", "Chin", "Coton",
    "French Bulldog", "Lhasa", "Maltese", "Mastiff", "Pekingese", "Pomeranian",
    "Pug", "Shih Tzu", "Toy", "Yorkshire",
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
        columns = {row[1] for row in con.execute("PRAGMA table_info(dogs)").fetchall()}
        if "age_months" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN age_months INTEGER")
        if "cbarq_answers" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN cbarq_answers TEXT NOT NULL DEFAULT '{}'")
        if "home_fits" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN home_fits TEXT NOT NULL DEFAULT '[]'")
        if "exercise_needs" not in columns:
            con.execute("ALTER TABLE dogs ADD COLUMN exercise_needs TEXT NOT NULL DEFAULT '[]'")
        con.commit()


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


def derive_dog_care_profile(breed: str, size: str) -> dict:
    label = str(breed or "").strip()
    size_label = str(size or "").strip().lower()
    hdb_approved = label in HDB_SUITABLE_BREEDS or (
        size_label == "small" and not includes_any(label, HIGH_EXERCISE_TERMS)
    )

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
    return dog


def list_dogs() -> list[dict]:
    with sqlite3.connect(DB_PATH) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute("SELECT * FROM dogs ORDER BY created_at DESC").fetchall()
    return [row_to_dog(row) for row in rows]


def insert_dog(payload: dict) -> dict:
    factors = normalise_factors(payload.get("cbarqFactors") or {})
    cluster = classify_cluster(factors)
    breed = str(payload.get("breed") or "").strip()
    size = str(payload.get("size") or "").strip()
    care_profile = derive_dog_care_profile(breed, size)
    dog_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    fields = {
        "id": dog_id,
        "created_at": now,
        "status": "available",
        "name": str(payload.get("name") or "").strip(),
        "shelter": str(payload.get("shelter") or "").strip(),
        "contact_url": str(payload.get("contactUrl") or "").strip(),
        "breed": breed,
        "age_years": payload.get("ageYears") or None,
        "age_months": payload.get("ageMonths") or None,
        "sex": str(payload.get("sex") or "").strip(),
        "size": size,
        "color": str(payload.get("color") or "").strip(),
        "image_url": str(payload.get("imageUrl") or "").strip(),
        "hdb_approved": 1 if care_profile["hdb_approved"] else 0,
        "home_fit": care_profile["home_fit"],
        "home_fits": json.dumps(care_profile["home_fits"]),
        "exercise_need": care_profile["exercise_need"],
        "exercise_needs": json.dumps(care_profile["exercise_needs"]),
        "cluster": cluster,
        "cbarq_factors": json.dumps(factors, sort_keys=True),
        "cbarq_answers": json.dumps(payload.get("cbarqAnswers") or {}, sort_keys=True),
        "notes": str(payload.get("notes") or "").strip(),
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
                cbarq_answers, notes
            )
            VALUES (
                :id, :created_at, :status, :name, :shelter, :contact_url, :breed,
                :age_years, :age_months, :sex, :size, :color, :image_url,
                :hdb_approved, :home_fit, :home_fits, :exercise_need, :exercise_needs,
                :cluster, :cbarq_factors, :cbarq_answers, :notes
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
        if parsed.path == "/api/dogs":
            self.send_json({"dogs": list_dogs()})
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/dogs":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        try:
            length = int(self.headers.get("content-length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            self.send_json(insert_dog(payload), HTTPStatus.CREATED)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body must be JSON."}, HTTPStatus.BAD_REQUEST)

    def serve_static(self, raw_path: str) -> None:
        if raw_path in {"/", "/match", "/partner", "/shelter"}:
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

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the CUB: Canine Understanding Buddy prototype server.")
    # Hosts like Render inject HOST/PORT via the environment; fall back to local dev defaults.
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", default=int(os.environ.get("PORT", "4173")), type=int)
    args = parser.parse_args()
    init_db()
    httpd = ThreadingHTTPServer((args.host, args.port), CUBHandler)
    print(f"CUB: Canine Understanding Buddy running at http://{args.host}:{args.port}")
    print(f"Configured production domain: {PUBLIC_DOMAIN}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
