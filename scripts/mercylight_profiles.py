"""Per-dog colour and behaviour estimates for the Mercylight import.

COLOUR is read from each dog's cover photo on mercylight.org.sg.

BEHAVIOUR is estimated by reading each dog's published background and
personality write-up and mapping what it actually says onto C-BARQ's 13
factors (0-4). This is an ESTIMATE FROM PROSE, not a completed C-BARQ
questionnaire — the shelter should still fill in the real form. It is,
however, grounded in specific statements rather than inferred from a single
metadata field: every override below traces to a quoted behaviour.

Only factors that differ from BASELINE are listed per dog, each with the
phrase from the listing that justifies it.
"""

# A Mercylight rescue with nothing unusual reported: street-rescued local dog,
# knows basic commands, good with other dogs, no aggression noted, typically a
# little wary of new people at first.
BASELINE = {
    "strangerAggression": 0.4,
    "ownerAggression": 0.3,
    "dogAggressionFear": 0.4,
    "trainability": 2.6,
    "chasing": 1.5,
    "strangerFear": 1.5,
    "nonsocialFear": 1.2,
    "dogFear": 0.6,
    "separation": 1.2,
    "touchSensitivity": 1.0,
    "excitability": 2.0,
    "attachment": 2.2,
    "energy": 2.2,
}

# slug (without "-blessing") -> (colour, {factor overrides}, rationale)
PROFILES = {
    "ace": ("Cream and white", {"energy": 2.6, "excitability": 2.4, "strangerFear": 1.2, "dogAggressionFear": 0.3},
            "initially closed up but now wags daily; enjoys walks, toys and playing with friends"),
    "amber": ("Tan", {"energy": 1.8, "trainability": 3.0, "strangerFear": 1.0},
              "smart and observant, attentive mother, food motivated; started playing at 7"),
    "amigo": ("Brown", {"strangerFear": 2.4, "touchSensitivity": 2.2, "energy": 1.8},
              "more unsure of humans; disliked strangers touching her at first bath"),
    "ardon": ("Brown and white", {"strangerFear": 1.8, "excitability": 2.4, "energy": 1.6},
              "shy but friendly, warms up; nibbles friends and volunteers when excited for walks"),
    "asherboy": ("Black", {"energy": 2.8, "excitability": 2.6, "attachment": 2.4},
                 "loves affection and food; runs in the dog run and rolls in mud"),
    "ava": ("Tan and white", {"strangerFear": 2.2, "energy": 2.2},
            "initially suspicious of people; sweet though shy"),
    "bethel": ("Black and white", {"energy": 3.0, "excitability": 3.2, "attachment": 3.4, "strangerFear": 1.5},
               "extremely affectionate once he trusts; greets with excited jumps and kisses, sits on laps"),
    "boaz": ("Tan", {"energy": 2.0, "attachment": 2.4, "trainability": 2.8},
             "softie who offers his paw for attention, especially around food"),
    "bree": ("Black and white", {"strangerFear": 1.8, "energy": 1.6},
             "shy but gentle, warms up easily"),
    "brownie": ("Golden", {"energy": 1.2, "excitability": 1.2, "strangerFear": 1.5, "dogFear": 1.0},
                "isolated 9 years so never learnt to play; gets along fine with dogs, rebuilding mobility"),
    "chase": ("Brindle", {"energy": 2.6, "trainability": 2.2, "excitability": 2.2},
              "walks fast and used to be stubborn; now calmer, waits for his friend Nugget"),
    "colby": ("Tan", {"nonsocialFear": 3.0, "energy": 1.8},
              "chill and easy to walk, but afraid of thunderstorms and hides until they pass"),
    "cosmos": ("Black", {"energy": 3.4, "excitability": 3.2, "attachment": 2.4},
               "playful and cheeky; gently chomps your legs when excited to see you"),
    "dante": ("Black and tan", {"strangerFear": 1.8, "energy": 2.4},
              "friendly with dogs and humans once warmed up; fussy with food"),
    "diamond": ("Black and white", {"strangerFear": 2.0, "energy": 2.4},
                "wary initially; now enjoys affection and deliberately drags out her walks"),
    "dino": ("Tan", {"strangerFear": 1.8, "touchSensitivity": 0.6, "energy": 1.8},
             "wagged even when scared; comfortable being touched, cheekily steals other dogs' bedding"),
    "emilia": ("Black", {"strangerFear": 1.8, "energy": 2.0, "attachment": 2.4},
               "a little shy; enjoys walks and gets along well with other dogs"),
    "esprit": ("Black", {"energy": 3.2, "excitability": 3.2, "attachment": 3.6},
               "the most affectionate goofball, a lap dog who always asks for attention and play"),
    "grateful": ("Tan", {"ownerAggression": 2.4, "energy": 1.0, "strangerFear": 0.3, "attachment": 2.4, "excitability": 1.6},
                 "very friendly to new faces, but PROTECTIVE OVER FOOD, BOWLS AND TOYS - manageable with clear rules"),
    "hailey": ("Tan", {"energy": 2.2, "excitability": 2.4, "strangerFear": 0.8},
               "settled quickly, sweet through first bath and vaccination; alert-barked to save another dog"),
    "haven": ("Tan", {"strangerFear": 3.2, "dogFear": 2.8, "dogAggressionFear": 2.4, "ownerAggression": 2.2,
                      "nonsocialFear": 2.4, "energy": 1.6},
              "GENERALLY FEARFUL of both humans and dogs; protective of food; needs a patient, experienced home"),
    "honest": ("Cream", {"energy": 3.2, "excitability": 3.2, "attachment": 2.8},
               "happy-go-lucky and full of energy; learnt to gauge his jaws, leans his full weight in for pats"),
    "izzie": ("Black and tan", {"strangerFear": 1.0, "touchSensitivity": 1.2, "energy": 2.6},
              "initially afraid of touch, then fearless and confident within a week"),
    "jay-jay": ("Black and grey", {"nonsocialFear": 3.4, "energy": 1.0, "excitability": 1.4},
                "sweet senior who loves slow walks, but VERY AFRAID of thunderstorms - needs a sheltered safe space"),
    "joy": ("Tan", {"energy": 2.0, "strangerFear": 0.6, "excitability": 2.4},
            "sweet and gentle, walks well even with new faces; very excited around food"),
    "kibo-sir": ("White and tan", {"energy": 1.8, "strangerFear": 0.5},
                 "very sweet and food motivated, gets on with the whole pack; GOOD WITH CHILDREN"),
    "koda": ("Black", {"energy": 1.6, "excitability": 1.5},
             "calm and easy going; eats well, enjoys walks, devoted to Amigo"),
    "kodi": ("Cream", {"excitability": 3.0, "attachment": 3.2, "strangerFear": 2.2, "dogFear": 1.8},
             "VERY VOCAL; takes time to warm to both people and dogs, then the sweetest teddy bear"),
    "lashon": ("Black", {"energy": 1.6, "strangerFear": 0.6, "excitability": 1.4},
               "calm, good-natured and charismatic; approachable from the first night"),
    "leo": ("Tan", {"energy": 3.4, "excitability": 3.0, "attachment": 2.4},
            "food motivated and full of playful energy; usually has a toy in his mouth inviting play"),
    "luna": ("Black", {"ownerAggression": 2.2, "dogAggressionFear": 2.2, "energy": 2.8, "excitability": 3.0,
                       "attachment": 3.0, "strangerFear": 0.4},
             "confident and very affectionate, but POSSESSIVE of toys and food; selective with dogs"),
    "macy": ("Tan", {"strangerFear": 0.4, "attachment": 3.0, "energy": 2.0},
             "very gentle and human-friendly; rolls over for belly rubs and gives kisses"),
    "malia": ("Brown", {"strangerFear": 0.4, "energy": 2.2},
              "very curious and unafraid of people; began playing with dogs within a week"),
    "mateo": ("Tan", {"strangerFear": 2.4, "energy": 2.0},
              "took a while to trust after a traumatic TNRM trap-neuter-release; now settled"),
    "mikel": ("Black", {"strangerFear": 1.8, "touchSensitivity": 0.8, "energy": 1.8},
              "shy but gentle, accepted his first bath fully; goofy once he opens up"),
    "naomi": ("Tan", {"strangerFear": 2.4, "nonsocialFear": 2.0, "energy": 1.8},
              "timid and skittish at first; opened up after two weeks and now approaches people"),
    "nori": ("Black", {"trainability": 3.4, "energy": 3.0, "excitability": 2.6},
             "calm and highly adaptable; toilet-trained herself on day two, loves toys and play"),
    "nova": ("Tan and white", {"trainability": 3.2, "strangerFear": 1.8, "energy": 2.6},
             "very smart, calm and steady with other dogs; shy with humans at first"),
    "nugget": ("Tan", {"energy": 1.4, "excitability": 1.4, "attachment": 2.2},
               "easily contented and resilient after three surgeries; needs some walking support"),
    "olive": ("Tan", {"nonsocialFear": 2.8, "energy": 2.4},
              "AFRAID OF NIGHT WALKS AND TRAFFIC; confident in quiet parks, happiest off-leash"),
    "pardon": ("Black and tan", {"excitability": 3.2, "dogAggressionFear": 2.2, "energy": 2.8, "trainability": 2.4},
               "playful but still learning manners (humping); selective with dogs"),
    "poppy": ("Dark brown", {"touchSensitivity": 0.4, "energy": 2.0},
              "enjoys being groomed and massaged; gets on well with dogs and likes toys"),
    "rainbow": ("Black", {"strangerFear": 1.6, "energy": 1.8, "excitability": 1.8},
                "barked fiercely when trapped, then trusted quickly; quiet and gentle, smaller than average"),
    "saint": ("White and black", {"ownerAggression": 2.8, "dogAggressionFear": 2.2, "energy": 2.4},
              "RESOURCE GUARDING of food and toys plus EPI - both well managed with routine and enzymes"),
    "skylar": ("Tan", {"energy": 2.8, "excitability": 2.8, "strangerFear": 0.6},
               "cheeky, assimilated into the pack immediately and always wants to play"),
    "stitch-jr": ("White", {"energy": 2.8, "excitability": 3.0, "attachment": 3.2, "strangerFear": 1.6},
                  "takes time to warm up then full of wiggles; highly food motivated, a lap dog despite his size"),
    "summer": ("Tan", {"energy": 1.4, "dogAggressionFear": 0.2, "strangerFear": 1.4},
               "fun-loving and tolerant, popular with the other dogs; a little shy but warms up"),
    "tasha": ("Brindle", {"strangerFear": 0.2, "dogAggressionFear": 2.4, "energy": 2.8, "attachment": 2.8,
                          "trainability": 2.4},
              "a great fan of humans and GOOD WITH CHILDREN, but SELECTIVE with dogs and needs a firm handler"),
    "tess": ("Black and tan", {"strangerFear": 2.2, "energy": 2.0},
             "very timid when rescued but always gentle; shy, enjoys long sniffy walks"),
    "waffle": ("White", {"ownerAggression": 3.0, "dogAggressionFear": 2.4, "strangerFear": 1.8, "energy": 2.2},
               "FOOD AGGRESSION that can be managed but not undone; NOT suitable for homes with children"),
}


def factors_for(slug: str) -> dict:
    """Full 13-factor estimate for a dog, baseline plus its overrides."""
    key = slug.replace("-blessing", "")
    factors = dict(BASELINE)
    if key in PROFILES:
        factors.update(PROFILES[key][1])
    return factors


def colour_for(slug: str) -> str:
    key = slug.replace("-blessing", "")
    return PROFILES.get(key, ("", {}, ""))[0]


def rationale_for(slug: str) -> str:
    key = slug.replace("-blessing", "")
    return PROFILES.get(key, ("", {}, ""))[2]
