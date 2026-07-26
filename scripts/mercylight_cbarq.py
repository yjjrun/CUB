"""Estimate C-BARQ item answers for the Mercylight dogs.

CUB's short form has 42 items. Shelters normally answer them by hand; these
are ESTIMATES read from each dog's published background and personality
write-up plus the structured fields Mercylight lists (good with other dogs,
good with children, understands basic commands).

Two rules keep this honest:

1. A question is only answered when something actually supports an answer -
   either the dog's own write-up, a structured field, or a trait the write-up
   clearly implies. Everything else is left "na", which is a real option on
   the form and makes the gap visible instead of inventing a number.

2. Questions about life in a home - house soiling, chewing the furniture,
   being left alone - are left "na" for every dog. These dogs live in a
   shelter, so nobody has observed those behaviours yet.

Answers are scored into the 13 factors by the same arithmetic the form uses
(scoreCbarqItems in src/lib/cbarq.js), so an imported dog and a hand-entered
one are computed identically.
"""

from __future__ import annotations

from mercylight_profiles import PROFILES, factors_for

# Which factor each item feeds — inverted from CBARQ_FACTOR_MAP in
# src/lib/cbarq.js. Item 29 is reverse-scored within trainability.
QUESTION_FACTOR = {
    3: "strangerAggression", 6: "strangerAggression", 9: "strangerAggression",
    4: "ownerAggression", 5: "ownerAggression", 7: "ownerAggression",
    8: "dogAggressionFear", 10: "dogAggressionFear", 11: "dogAggressionFear",
    12: "dogAggressionFear",
    27: "trainability", 28: "trainability", 29: "trainability",
    30: "chasing", 31: "chasing",
    13: "strangerFear", 15: "strangerFear",
    14: "nonsocialFear", 16: "nonsocialFear", 18: "nonsocialFear",
    17: "dogFear", 19: "dogFear",
    22: "separation", 23: "separation", 24: "separation",
    36: "separation", 37: "separation",
    20: "touchSensitivity", 21: "touchSensitivity",
    1: "excitability", 2: "excitability", 38: "excitability",
    39: "excitability", 42: "excitability",
    25: "attachment", 26: "attachment",
    34: "energy", 40: "energy",
}
REVERSE_ITEMS = {29}

# Left "na" for every dog: these ask about behaviour inside a home that a
# shelter has had no opportunity to observe.
HOME_ONLY_ITEMS = {22, 23, 24, 32, 33, 35, 36, 37}

# Also "na" by default — nothing in any listing speaks to prey drive or
# tail-chasing. (30/31 feed the chasing factor, which then falls back to the
# form's neutral 2; 41 feeds nothing.)
UNOBSERVED_ITEMS = {30, 31, 41}

# Per-dog, per-item answers taken straight from a statement in the write-up.
# These override the factor-derived value. Key is the profile slug.
DIRECT = {
    "colby":    {14: 4},                      # "afraid of thunderstorms - hides in the dog house"
    "jay-jay":  {14: 4, 40: 1, 34: 0},        # "very afraid of thunderstorms"; slow senior walks
    "olive":    {16: 3, 18: 3},               # "afraid of walks at night and areas with traffic"
    "grateful": {4: 3, 5: 3, 7: 3, 40: 1, 13: 0, 15: 0},
                                              # "protective over her food, water bowls and toys";
                                              # "very friendly even to new faces"; slow relaxed pace
    "haven":    {4: 3, 7: 3, 13: 4, 15: 4, 17: 3, 19: 3, 14: 3,
                 27: 2, 28: 2, 38: 1, 40: 1, 34: 0, 20: 3, 21: 3},
                                              # "generally fearful of both humans and dogs";
                                              # "can be protective of her food". Mercylight's
                                              # blanket "understands basic commands: Yes" is
                                              # applied to all 50 dogs and overstates a dog who
                                              # "had no social interaction" until rescue, so sit
                                              # and stay are marked less reliable here.
    "luna":     {4: 3, 7: 3, 13: 0, 15: 0, 25: 4, 26: 3},
                                              # "possessive of her toys and food"; confident, affectionate
    "saint":    {4: 4, 7: 4},                 # "resource guarding behaviour around both food and toys"
    "waffle":   {4: 4, 7: 4, 3: 1},           # "food aggression... can only be managed"
    "tasha":    {34: 3, 13: 0, 15: 0, 26: 3}, # "will need a firm handler on walks"; "great fan of humans"
    "chase":    {34: 3, 29: 3},               # "walks fast", "used to be a little stubborn"
    "kodi":     {42: 4, 26: 4},               # "very vocal and affectionate"; loves cuddles
    "hailey":   {42: 3},                      # alert-barked to summon volunteers
    "rainbow":  {42: 3},                      # "barking fiercely at us" when first trapped
    "bethel":   {25: 4, 26: 4, 39: 4},        # "excited jumps and kisses, sitting on your lap"
    "esprit":   {25: 4, 26: 4, 39: 4},        # "a lap dog who always asks for attention"
    "stitch-jr": {26: 4, 39: 3},              # "happily plonk himself onto volunteers' laps"
    "macy":     {26: 4, 13: 0, 15: 0},        # "rolling onto her back" for belly rubs; human-friendly
    "honest":   {39: 4, 38: 3},               # "playful and full of energy"; over-enthusiastic greetings
    "leo":      {39: 4},                      # "full of playful energy", always with a toy
    "cosmos":   {39: 4},                      # "playful and cheeky"
    "nori":     {39: 3, 27: 3, 28: 3},        # toilet-trained herself in two days; "intelligence"
    "nova":     {27: 3, 28: 3},               # "very smart", learnt the common toilet unaided
    "brownie":  {39: 0, 40: 1, 34: 0},        # "has not learnt how to play since he was in isolation"
    "nugget":   {40: 1, 34: 0, 39: 1},        # "may still require some additional support during walks"
    "amigo":    {20: 3, 21: 3, 15: 3},        # "did not like strangers to touch her" at her first bath
    "dino":     {21: 0, 20: 1},               # "did well during his first bath and was comfortable"
    "mikel":    {21: 0},                      # "allowed us to scrub and shampoo him thoroughly"
    "tess":     {21: 0, 13: 3, 15: 3},        # bathed early and "did very well"; "very timid"
    "izzie":    {21: 1, 15: 1},               # initially afraid of touch, then "fearless"
    "ace":      {21: 1},
    "koda":     {40: 1, 38: 0},               # "calm and easy going"
    "lashon":   {40: 1, 38: 0, 13: 0},        # "calm and good-natured", approachable from night one
    "summer":   {40: 1},                      # senior, "fun-loving and tolerant"
    "pardon":   {39: 4, 38: 3},               # "playful but still learning manners"
    "ardon":    {39: 3},                      # nibbles friends when excited for walks
    "kibo-sir": {13: 0, 15: 0},               # good with children, sweet with everyone
    "malia":    {13: 0, 15: 0},               # "didn't seem to regard humans as dangerous"
    "joy":      {13: 0, 15: 0},               # "walks well even with new faces"
    "skylar":   {39: 3},                      # "cheeky", wanted to play immediately
}


def _clamp_int(value: float) -> int:
    return max(0, min(4, int(round(value))))


def answers_for(slug: str) -> dict[str, str]:
    """42 item answers for one dog, as the form would store them."""
    key = slug.replace("-blessing", "")
    factors = factors_for(key)
    direct = DIRECT.get(key, {})
    answers: dict[str, str] = {}

    for item in range(1, 43):
        if item in direct:
            answers[f"q{item}"] = str(_clamp_int(direct[item]))
            continue
        if item in HOME_ONLY_ITEMS or item in UNOBSERVED_ITEMS:
            answers[f"q{item}"] = "na"
            continue
        factor = QUESTION_FACTOR.get(item)
        if factor is None:
            answers[f"q{item}"] = "na"
            continue
        value = factors[factor]
        # Item 29 asks how *distractible* the dog is; trainability treats it as
        # reverse-scored, so invert before storing the raw answer.
        if item in REVERSE_ITEMS:
            value = 4 - value
        answers[f"q{item}"] = str(_clamp_int(value))

    return answers


def derive_factors(answers: dict[str, str]) -> dict[str, float]:
    """Score answers into the 13 factors exactly as src/lib/cbarq.js does."""
    factor_map = {
        "strangerAggression": [3, 6, 9],
        "ownerAggression": [4, 5, 7],
        "dogAggressionFear": [8, 10, 11, 12],
        "trainability": [27, 28, {"item": 29, "reverse": True}],
        "chasing": [30, 31],
        "strangerFear": [13, 15],
        "nonsocialFear": [14, 16, 18],
        "dogFear": [17, 19],
        "separation": [22, 23, 24, 36, 37],
        "touchSensitivity": [20, 21],
        "excitability": [1, 2, 38, 39, 42],
        "attachment": [25, 26],
        "energy": [34, 38, 39, 40],
    }
    out = {}
    for factor, entries in factor_map.items():
        scores = []
        for entry in entries:
            item = entry["item"] if isinstance(entry, dict) else entry
            raw = answers.get(f"q{item}")
            if raw in (None, "na", ""):
                continue
            value = float(raw)
            if isinstance(entry, dict) and entry.get("reverse"):
                value = 4 - value
            scores.append(value)
        # Matches the form: an entirely unanswered factor falls back to neutral.
        out[factor] = round(sum(scores) / len(scores), 2) if scores else 2
    return out


def answered_count(answers: dict[str, str]) -> int:
    return sum(1 for v in answers.values() if v not in ("na", "", None))


if __name__ == "__main__":  # quick self-check
    for slug in list(PROFILES)[:3]:
        a = answers_for(slug)
        print(slug, "answered", answered_count(a), "of 42", "->", derive_factors(a)["energy"])
