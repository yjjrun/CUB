import sys
import unittest
from datetime import date
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

from import_partner_puppies import DOGS, PARTNERS, months_between, to_payload  # noqa: E402


class PartnerPuppyImportTests(unittest.TestCase):
    def test_curated_set_is_unique_and_current_size(self):
        identities = [(dog["partner"], dog["name"].casefold()) for dog in DOGS]
        self.assertEqual(13, len(DOGS))
        self.assertEqual(len(identities), len(set(identities)))

    def test_each_payload_contains_full_questionnaire(self):
        for dog in DOGS:
            payload = to_payload(dog, date(2026, 9, 30))
            self.assertEqual(42, len(payload["cbarqAnswers"]))
            self.assertEqual(13, len(payload["cbarqFactors"]))
            self.assertIn("BREED/SOURCE-LEVEL ESTIMATE", payload["notes"])

    def test_hdb_overrides_match_source_decisions(self):
        golden_retrievers = [dog for dog in DOGS if dog["breed"] == "Golden Retriever"]
        explicitly_approved = [
            dog for dog in DOGS if dog["partner"] in {"daily-dogs", "woof-loof"}
        ]
        self.assertTrue(all(not dog["hdbApproved"] for dog in golden_retrievers))
        self.assertTrue(all(dog["hdbApproved"] for dog in explicitly_approved))

    def test_published_dobs_produce_expected_ages(self):
        self.assertEqual(2, months_between("2026-07-15", date(2026, 9, 30)))
        self.assertEqual(8, months_between("2026-01-01", date(2026, 9, 30)))
        self.assertEqual(7, months_between("2026-02-03", date(2026, 9, 30)))

    def test_every_partner_has_a_code_environment_variable(self):
        self.assertTrue(all(partner["code_env"].startswith("CUB_") for partner in PARTNERS.values()))


if __name__ == "__main__":
    unittest.main()
