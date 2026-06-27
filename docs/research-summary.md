# CUB: Canine Understanding Buddy Matching Logic

Production domain target: https://cub-buddy.com

This prototype references the documents supplied with the project:

- `PAW PROJECT CHATGPT MBTI.pdf`: MBTI-style preferences are translated into stimulation, structure, empathy, and firmness. The prototype now weights personality at 30% of the overall score by product request.
- `The Paw Project Personality Clustering.pdf`: Dog behavior is classified into seven clusters: Gentle Wallflowers, Driven Guardians, Golden Hearts, Joyful Sparks, Cautious Companions, Gentle Giants, and Fiery Dynamos.
- `PAW PROJ mbti to doggy.pdf`: The top MBTI-to-cluster matches are used for explanation and score overrides when a type appears in the supplied ranking.
- `dog breeds & lifestyle.pdf`: Breed rules are used for HDB suitability and exercise bands.
- `dog-aggression-questionnaire.pdf`: Partner intake presents all 101 attached C-BARQ items and converts those answers into the 13 behavior factors: aggression, trainability, chasing, fear, separation, touch sensitivity, excitability, attachment, and energy.

External research checked on 2026-06-14:

- Myers & Briggs Foundation: the framework uses four preference pairs, E-I, S-N, T-F, and J-P, and combines them into 16 type codes. Source: https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/
- University of Pennsylvania C-BARQ: C-BARQ is positioned as a standardized canine temperament and behavior evaluation used by owners and professionals. Source: https://vetapps.vet.upenn.edu/cbarq/

Implementation choices:

- Dog database starts empty. Partner submissions are stored in `data/cub.sqlite`.
- Consumer matching only reads saved dog records. There are no seeded sample pets.
- Final score now uses 30% lifestyle, 25% housing, 15% experience/training capacity, and 30% MBTI-style caregiving fit. Stated breed, size, and color preferences are shown as a separate preference fit so they do not override welfare fit.
- High-risk clusters use caps: Fiery Dynamos require experienced handling, Joyful Sparks are penalized for long daily alone-time, and non-HDB-suitable dogs are capped for HDB homes.
