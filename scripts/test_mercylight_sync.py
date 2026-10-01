import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
sys.path.insert(0, ROOT)
sys.path.insert(0, SCRIPTS)

import server  # noqa: E402
from import_mercylight import discover_slugs  # noqa: E402
from sync_mercylight import build_plan  # noqa: E402


def payload(name: str, age_months: int = 24) -> dict:
    slug = name.casefold().replace(" ", "-")
    return {
        "name": name,
        "breed": "Singapore Special (Local Mixed Breed)",
        "contactUrl": f"https://www.mercylight.org.sg/adopt-a-blessing/{slug}-blessing",
        "sex": "Female",
        "ageMonths": age_months,
        "imageUrl": f"https://meetmycub.com/assets/dogs/{slug}.jpg",
        "notes": "Current source notes",
        "size": "Large",
        "color": "Brown",
        "hdbApproved": True,
        "cbarqAnswers": {f"q{i}": "na" for i in range(1, 43)},
        "cbarqFactors": {},
    }


class MercyLightDiscoveryTests(unittest.TestCase):
    def test_discovers_all_serialized_profiles_and_deduplicates(self):
        slugs = [f"dog-{index}-blessing" for index in range(25)]
        html = "".join(f'\\"slug\\":\\"{slug}\\"' for slug in slugs + slugs[:3])
        self.assertEqual(discover_slugs(html), slugs)

    def test_rejects_an_incomplete_catalogue(self):
        html = "".join(
            f'<a href="/adopt-a-blessing/dog-{index}-blessing">Dog</a>'
            for index in range(10)
        )
        with self.assertRaises(RuntimeError):
            discover_slugs(html)


class MercyLightSyncPlanTests(unittest.TestCase):
    def test_plans_add_update_and_removal_without_mutating_rows(self):
        partner = {"id": "partner-1", "name": "Mercylight"}
        ace_payload = payload("Ace", 24)
        ace_row = server.dog_fields_from_payload(
            ace_payload,
            partner,
            dog_id="dog-ace",
            created_at="2026-01-01T00:00:00+00:00",
        )
        ace_row["age_months"] = 23
        poppy_row = server.dog_fields_from_payload(
            payload("Poppy"),
            partner,
            dog_id="dog-poppy",
            created_at="2026-01-01T00:00:00+00:00",
        )

        plan = build_plan([ace_row, poppy_row], [ace_payload, payload("New Dog")], partner)

        self.assertEqual([item["name"] for item in plan["additions"]], ["New Dog"])
        self.assertEqual([item["name"] for item in plan["updates"]], ["Ace"])
        self.assertEqual(plan["updates"][0]["changed"], ["age_months"])
        self.assertEqual([item["name"] for item in plan["removals"]], ["Poppy"])
        self.assertEqual(ace_row["age_months"], 23)


if __name__ == "__main__":
    unittest.main()
