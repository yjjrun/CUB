"""Breed-informed C-BARQ estimates for shop puppy imports.

These are not individual behavioural assessments. The shops publish breed-level
temperament descriptions, and the Golden Retriever and Maltipoo profiles use the
additional references named below. Every imported dog is labelled accordingly in
its notes so a future partner-completed questionnaire can replace the estimate.

References checked 30 September 2026:
  Golden Retriever: https://www.akc.org/expert-advice/dog-breeds/golden-retriever-right-for-you/
  Maltipoo: https://www.petmd.com/dog/breeds/maltipoo
  Mini Golden Doodle: each Daily Dogs product page
  Cavapoo: https://woofloof.sg/cavapoos/
"""

from __future__ import annotations

from mercylight_cbarq import derive_factors

TOTAL_QUESTIONS = 42


def _questionnaire(scores: dict[int, int]) -> dict[str, str]:
    """Return all 42 intake answers, leaving unsupported situations as N/A."""
    answers = {f"q{number}": "na" for number in range(1, TOTAL_QUESTIONS + 1)}
    for number, value in scores.items():
        if not 1 <= number <= TOTAL_QUESTIONS:
            raise ValueError(f"Unknown C-BARQ item: {number}")
        if not 0 <= value <= 4:
            raise ValueError(f"C-BARQ item {number} must be between 0 and 4")
        answers[f"q{number}"] = str(value)
    return answers


# These profiles translate only the behaviours supported by the cited breed/source
# descriptions. Household-specific events such as toilet accidents stay N/A.
PROFILE_SCORES = {
    "golden_retriever": {
        1: 3, 2: 3,
        3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
        13: 0, 14: 1, 15: 0, 16: 1, 17: 0, 18: 1, 19: 0, 20: 1, 21: 1,
        22: 1, 23: 1, 24: 0, 25: 3, 26: 3,
        27: 3, 28: 3, 29: 1, 30: 2, 31: 2, 32: 1, 33: 2, 34: 2,
        38: 2, 39: 4, 40: 4, 41: 0, 42: 1,
    },
    "maltipoo": {
        1: 3, 2: 2,
        3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0,
        13: 0, 14: 2, 15: 0, 16: 1, 17: 0, 18: 1, 19: 1, 20: 1, 21: 1,
        22: 3, 23: 3, 24: 1, 25: 4, 26: 4,
        27: 3, 28: 3, 29: 1, 30: 1, 31: 1, 32: 1, 33: 2, 34: 1,
        38: 1, 39: 3, 40: 2, 41: 0, 42: 3,
    },
    "mini_goldendoodle": {
        1: 3, 2: 2,
        3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0,
        13: 0, 14: 1, 15: 0, 16: 1, 17: 0, 18: 1, 19: 1, 20: 1, 21: 1,
        22: 2, 23: 2, 24: 1, 25: 4, 26: 4,
        27: 3, 28: 3, 29: 1, 30: 2, 31: 2, 32: 1, 33: 2, 34: 2,
        38: 2, 39: 4, 40: 3, 41: 0, 42: 1,
    },
    "cavapoo": {
        1: 2, 2: 2,
        3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0,
        13: 0, 14: 1, 15: 0, 16: 1, 17: 0, 18: 1, 19: 1, 20: 1, 21: 1,
        22: 2, 23: 2, 24: 1, 25: 4, 26: 4,
        27: 3, 28: 3, 29: 1, 30: 1, 31: 1, 32: 1, 33: 2, 34: 1,
        38: 1, 39: 3, 40: 2, 41: 0, 42: 1,
    },
}

PROFILE_BASIS = {
    "golden_retriever": (
        "AKC describes the breed as friendly, affectionate, social, intelligent, "
        "trainable, eager to please, playful, and active."
    ),
    "maltipoo": (
        "PetMD describes Maltipoos as affectionate, friendly, playful, intelligent, "
        "trainable, strongly attached, sometimes barky, and prone to separation anxiety."
    ),
    "mini_goldendoodle": (
        "Daily Dogs describes these puppies' breed as affectionate, people-oriented, "
        "friendly, sociable, playful, energetic, intelligent, and eager to learn."
    ),
    "cavapoo": (
        "Woof Loof describes Cavapoos as affectionate, gentle, friendly, playful, "
        "curious, people-oriented, trainable, moderately active, and generally quiet."
    ),
}


def answers_for(profile: str) -> dict[str, str]:
    if profile not in PROFILE_SCORES:
        raise KeyError(f"Unknown puppy personality profile: {profile}")
    return _questionnaire(PROFILE_SCORES[profile])


def factors_for(profile: str) -> dict[str, float]:
    return derive_factors(answers_for(profile))


def answered_count(profile: str) -> int:
    return sum(value != "na" for value in answers_for(profile).values())

