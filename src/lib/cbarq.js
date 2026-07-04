// C-BARQ short-form data + factor derivation.

export const FACTORS = [
  ["strangerAggression", "Stranger-directed aggression"],
  ["ownerAggression", "Owner-directed aggression"],
  ["dogAggressionFear", "Dog-directed aggression/fear"],
  ["trainability", "Trainability"],
  ["chasing", "Chasing"],
  ["strangerFear", "Stranger-directed fear"],
  ["nonsocialFear", "Nonsocial fear"],
  ["dogFear", "Dog-directed fear"],
  ["separation", "Separation-related behavior"],
  ["touchSensitivity", "Touch sensitivity"],
  ["excitability", "Excitability"],
  ["attachment", "Attachment or attention-seeking"],
  ["energy", "Energy"],
];

export const CBARQ_SECTIONS = [
  {
    title: "Excitability",
    scale: "0 = calm, 4 = extremely excitable, N/A = not observed",
    items: [
      [1, "Just before being taken for a walk."],
      [2, "Just before being taken on a car trip."],
    ],
  },
  {
    title: "Aggression",
    scale: "0 = no aggression, 4 = serious aggression, N/A = not observed",
    items: [
      [3, "When approached directly by an unfamiliar person while being walked/exercised on a leash."],
      [4, "When toys, bones, or other objects are taken away by a household member."],
      [5, "When approached directly by a household member while the dog is eating."],
      [6, "When mailmen or other delivery workers approach your home."],
      [7, "When the dog's food is taken away by a household member."],
      [8, "When approached directly by an unfamiliar dog while being walked/exercised on a leash."],
      [9, "When strangers walk past your home when your dog is outside or in the yard."],
      [10, "When barked, growled, or lunged at by another unfamiliar dog."],
      [11, "When approached while eating by another familiar household dog."],
      [12, "When approached while playing with or chewing a favorite toy, bone, or object by another familiar household dog."],
    ],
  },
  {
    title: "Fear and anxiety",
    scale: "0 = no fear, 4 = extreme fear, N/A = not observed",
    items: [
      [13, "When approached directly by an unfamiliar person while away from your home."],
      [14, "In response to sudden or loud noises such as thunder, vacuum cleaner, car backfire, road drills, or objects being dropped."],
      [15, "When an unfamiliar person tries to touch or pet the dog."],
      [16, "In response to strange or unfamiliar objects on or near the sidewalk."],
      [17, "When approached directly by an unfamiliar dog."],
      [18, "When first exposed to unfamiliar situations such as a first car trip, elevator, or veterinarian visit."],
      [19, "When barked, growled, or lunged at by an unfamiliar dog."],
      [20, "When having nails clipped by a household member."],
      [21, "When groomed or bathed by a household member."],
    ],
  },
  {
    title: "Separation-related behavior",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [22, "Restlessness, agitation, or pacing."],
      [23, "Barking or whining."],
      [24, "Chewing or scratching at doors, floor, windows, curtains, etc."],
    ],
  },
  {
    title: "Attachment and attention-seeking",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [25, "Tends to follow you or other members of the household around the house, from room to room."],
      [26, "Tends to sit close to, or in contact with, you or others when you are sitting down."],
    ],
  },
  {
    title: "Training and obedience",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [27, "Obeys a sit command immediately."],
      [28, "Obeys a stay command immediately."],
      [29, "Easily distracted by interesting sights, sounds, or smells."],
    ],
  },
  {
    title: "Miscellaneous behavior",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [30, "Chases or would chase birds, given the chance."],
      [31, "Chases or would chase squirrels, rabbits, etc., given the chance."],
      [32, "Escapes or would escape from home or yard, given the chance."],
      [33, "Chews inappropriate objects."],
      [34, "Pulls excessively hard when on the leash."],
      [35, "Urinates against objects or furnishings in your home."],
      [36, "Urinates when left alone at night or during the daytime."],
      [37, "Defecates when left alone at night or during the daytime."],
      [38, "Hyperactive, restless, has trouble settling down."],
      [39, "Playful, puppyish, boisterous."],
      [40, "Active, energetic, always on the go."],
      [41, "Chases own tail/hind end."],
      [42, "Barks persistently when alarmed or excited."],
    ],
  },
];

export const CBARQ_FACTOR_MAP = {
  strangerAggression: [3, 6, 9],
  ownerAggression: [4, 5, 7],
  dogAggressionFear: [8, 10, 11, 12],
  trainability: [27, 28, { item: 29, reverse: true }],
  chasing: [30, 31],
  strangerFear: [13, 15],
  nonsocialFear: [14, 16, 18],
  dogFear: [17, 19],
  separation: [22, 23, 24, 36, 37],
  touchSensitivity: [20, 21],
  excitability: [1, 2, 38, 39, 42],
  attachment: [25, 26],
  energy: [34, 38, 39, 40],
};

export const CBARQ_TOTAL_QUESTIONS = CBARQ_SECTIONS.reduce(
  (total, section) => total + section.items.length,
  0,
);

export const BREED_RULES = {
  "Maltese": { hdb: true, exercise: "low" },
  "Shih Tzu": { hdb: true, exercise: "low" },
  "Pomeranian": { hdb: true, exercise: "low" },
  "Toy Poodle": { hdb: true, exercise: "low" },
  "Chihuahua": { hdb: true, exercise: "low" },
  "Miniature Schnauzer": { hdb: true, exercise: "low" },
  "Papillon": { hdb: true, exercise: "low" },
  "Japanese Spitz": { hdb: true, exercise: "moderate" },
  "Cavalier King Charles Spaniel": { hdb: true, exercise: "moderate" },
  "Boston Terrier": { hdb: true, exercise: "moderate" },
  "Shetland Sheepdog": { hdb: true, exercise: "moderate" },
  "Cocker Spaniel": { hdb: false, exercise: "moderate" },
  "Beagle": { hdb: false, exercise: "moderate" },
  "French Bulldog": { hdb: false, exercise: "moderate" },
  "Shiba Inu": { hdb: false, exercise: "moderate" },
  "Pembroke Welsh Corgi": { hdb: false, exercise: "moderate" },
  "Golden Retriever": { hdb: false, exercise: "moderate" },
  "Labrador Retriever": { hdb: false, exercise: "moderate" },
  "Standard Poodle": { hdb: false, exercise: "moderate" },
  "Border Collie": { hdb: false, exercise: "high" },
  "Australian Shepherd": { hdb: false, exercise: "high" },
  "Siberian Husky": { hdb: false, exercise: "high" },
  "Samoyed": { hdb: false, exercise: "moderateHigh" },
  "Alaskan Malamute": { hdb: false, exercise: "moderateHigh" },
  "German Shepherd": { hdb: false, exercise: "high" },
  "Doberman": { hdb: false, exercise: "high" },
  "Rottweiler": { hdb: false, exercise: "high" },
  "Belgian Malinois": { hdb: false, exercise: "high" },
};

export const DEFAULT_CBARQ_ANSWERS = Object.fromEntries(
  CBARQ_SECTIONS.flatMap((section) => section.items).map(([number]) => [`q${number}`, "na"]),
);

export const CBARQ_OPTIONS = [
  ["na", "N/A"], ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"],
];

function scoreCbarqItems(items, answers) {
  const scores = items
    .map((entry) => {
      const item = typeof entry === "object" ? entry.item : entry;
      const raw = answers[`q${item}`];
      if (raw === undefined || raw === "na" || raw === "") return null;
      const value = Number(raw);
      if (Number.isNaN(value)) return null;
      return typeof entry === "object" && entry.reverse ? 4 - value : value;
    })
    .filter((value) => value !== null);
  if (!scores.length) return 2;
  return Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2));
}

export function deriveCbarqFactors(answers) {
  return Object.fromEntries(
    FACTORS.map(([id]) => [id, scoreCbarqItems(CBARQ_FACTOR_MAP[id] || [], answers)]),
  );
}

export function cbarqAnsweredCount(answers) {
  return Object.values(answers).filter((v) => v !== "na" && v !== "" && v !== undefined).length;
}
