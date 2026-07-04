// C-BARQ data + factor derivation, extracted verbatim from the original source.

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
    title: "Training and obedience",
    scale: "0 = never/low, 4 = always/high, N/A = not observed",
    items: [
      [1, "When off the leash, returns immediately when called."],
      [2, "Obeys the sit command immediately."],
      [3, "Obeys the stay command immediately."],
      [4, "Seems to attend/listen closely to everything you say or do."],
      [5, "Slow to respond to correction or punishment; thick-skinned."],
      [6, "Slow to learn new tricks or tasks."],
      [7, "Easily distracted by interesting sights, sounds, or smells."],
      [8, "Will fetch or attempt to fetch sticks, balls, or objects."],
    ],
  },
  {
    title: "Aggression",
    scale: "0 = no aggression, 4 = serious aggression, N/A = not observed",
    items: [
      [9, "When verbally corrected or punished by you or a household member."],
      [10, "When approached directly by an unfamiliar adult while being walked/exercised on a leash."],
      [11, "When approached directly by an unfamiliar child while being walked/exercised on a leash."],
      [12, "Toward unfamiliar persons approaching the dog while s/he is in your car."],
      [13, "When toys, bones, or other objects are taken away by a household member."],
      [14, "When bathed or groomed by a household member."],
      [15, "When an unfamiliar person approaches you or another member of your family at home."],
      [16, "When unfamiliar persons approach you or another member of your family away from your home."],
      [17, "When approached directly by a household member while s/he is eating."],
      [18, "When mailmen or other delivery workers approach your home."],
      [19, "When his/her food is taken away by a household member."],
      [20, "When strangers walk past your home while your dog is outside or in the yard."],
      [21, "When an unfamiliar person tries to touch or pet the dog."],
      [22, "When joggers, cyclists, rollerbladers, or skateboarders pass your home while your dog is outside or in the yard."],
      [23, "When approached directly by an unfamiliar male dog while being walked/exercised on a leash."],
      [24, "When approached directly by an unfamiliar female dog while being walked/exercised on a leash."],
      [25, "When stared at directly by a member of the household."],
      [26, "Toward unfamiliar dogs visiting your home."],
      [27, "Toward cats, squirrels, or other animals entering your yard."],
      [28, "Toward unfamiliar persons visiting your home."],
      [29, "When barked, growled, or lunged at by another unfamiliar dog."],
      [30, "When stepped over by a member of the household."],
      [31, "When you or a household member retrieves food or objects stolen by the dog."],
      [32, "Toward another familiar dog in your household."],
      [33, "When approached at a favorite resting/sleeping place by another familiar household dog."],
      [34, "When approached while eating by another familiar household dog."],
      [35, "When approached while playing with or chewing a favorite toy, bone, or object by another familiar household dog."],
    ],
  },
  {
    title: "Fear and anxiety",
    scale: "0 = no fear, 4 = extreme fear, N/A = not observed",
    items: [
      [36, "When approached directly by an unfamiliar adult while away from your home."],
      [37, "When approached directly by an unfamiliar child while away from your home."],
      [38, "In response to sudden or loud noises such as vacuum cleaners, car backfire, road drills, or dropped objects."],
      [39, "When unfamiliar persons visit your home."],
      [40, "When an unfamiliar person tries to touch or pet the dog."],
      [41, "In heavy traffic."],
      [42, "In response to strange or unfamiliar objects on or near the sidewalk."],
      [43, "When examined or treated by a veterinarian."],
      [44, "During thunderstorms, firework displays, or similar events."],
      [45, "When approached directly by an unfamiliar dog of the same or larger size."],
      [46, "When approached directly by an unfamiliar dog of smaller size."],
      [47, "When first exposed to unfamiliar situations such as a first car trip, elevator, or veterinarian visit."],
      [48, "In response to wind or wind-blown objects."],
      [49, "When having nails clipped by a household member."],
      [50, "When groomed or bathed by a household member."],
      [51, "When stepped over by a member of the household."],
      [52, "When having his/her feet toweled by a member of the household."],
      [53, "When unfamiliar dogs visit your home."],
      [54, "When barked, growled, or lunged at by an unfamiliar dog."],
    ],
  },
  {
    title: "Separation-related behavior",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [55, "Shaking, shivering, or trembling when left or about to be left alone."],
      [56, "Excessive salivation when left or about to be left alone."],
      [57, "Restlessness, agitation, or pacing when left or about to be left alone."],
      [58, "Whining when left or about to be left alone."],
      [59, "Barking when left or about to be left alone."],
      [60, "Howling when left or about to be left alone."],
      [61, "Chewing or scratching at doors, floor, windows, curtains, etc. when left alone."],
      [62, "Loss of appetite when left alone."],
    ],
  },
  {
    title: "Excitability",
    scale: "0 = calm, 4 = extremely excitable, N/A = not observed",
    items: [
      [63, "When you or other members of the household come home after a brief absence."],
      [64, "When playing with you or other members of your household."],
      [65, "When the doorbell rings."],
      [66, "Just before being taken for a walk."],
      [67, "Just before being taken on a car trip."],
      [68, "When visitors arrive at your home."],
    ],
  },
  {
    title: "Attachment and attention-seeking",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [69, "Displays a strong attachment for one particular member of the household."],
      [70, "Tends to follow you or other members of the household from room to room."],
      [71, "Tends to sit close to, or in contact with, you or others when you are sitting down."],
      [72, "Tends to nudge, nuzzle, or paw you or others for attention when you are sitting down."],
      [73, "Becomes agitated when you or others show affection for another person."],
      [74, "Becomes agitated when you or others show affection for another dog or animal."],
    ],
  },
  {
    title: "Miscellaneous behavior",
    scale: "0 = never, 4 = always, N/A = not observed",
    items: [
      [75, "Chases or would chase cats given the opportunity."],
      [76, "Chases or would chase birds given the opportunity."],
      [77, "Chases or would chase squirrels, rabbits, and other small animals given the opportunity."],
      [78, "Escapes or would escape from home or yard given the chance."],
      [79, "Rolls in animal droppings or other smelly substances."],
      [80, "Eats own or other animals' droppings or feces."],
      [81, "Chews inappropriate objects."],
      [82, "Mounts objects, furniture, or people."],
      [83, "Begs persistently for food when people are eating."],
      [84, "Steals food."],
      [85, "Nervous or frightened on stairs."],
      [86, "Pulls excessively hard when on the leash."],
      [87, "Urinates against objects/furnishings in your home."],
      [88, "Urinates when approached, petted, handled, or picked up."],
      [89, "Urinates when left alone at night or during the daytime."],
      [90, "Defecates when left alone at night or during the daytime."],
      [91, "Hyperactive, restless, has trouble settling down."],
      [92, "Playful, puppyish, boisterous."],
      [93, "Active, energetic, always on the go."],
      [94, "Stares intently at nothing visible."],
      [95, "Snaps at invisible flies."],
      [96, "Chases own tail/hind end."],
      [97, "Chases/follows shadows, light spots, etc."],
      [98, "Barks persistently when alarmed or excited."],
      [99, "Licks him/herself excessively."],
      [100, "Licks people or objects excessively."],
      [101, "Displays other bizarre, strange, or repetitive behavior(s)."],
    ],
  },
];

export const CBARQ_FACTOR_MAP = {
  strangerAggression: [10, 11, 12, 15, 16, 18, 20, 21, 22, 28],
  ownerAggression: [9, 13, 14, 17, 19, 25, 30, 31],
  dogAggressionFear: [23, 24, 26, 29, 32, 33, 34, 35],
  trainability: [1, 2, 3, 4, { item: 5, reverse: true }, { item: 6, reverse: true }, { item: 7, reverse: true }, 8],
  chasing: [27, 75, 76, 77],
  strangerFear: [36, 37, 39, 40],
  nonsocialFear: [38, 41, 42, 44, 47, 48, 85],
  dogFear: [45, 46, 53, 54],
  separation: [55, 56, 57, 58, 59, 60, 61, 62, 89, 90],
  touchSensitivity: [43, 49, 50, 51, 52, 88],
  excitability: [63, 64, 65, 66, 67, 68, 91, 92, 98],
  attachment: [69, 70, 71, 72, 73, 74, 83],
  energy: [86, 91, 92, 93],
};

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
