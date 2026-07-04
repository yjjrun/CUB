const FACTORS = [
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

const APP_LOGO = "/assets/cub-logo.png";
const PARTNER_ACCESS_CODE = "CUBSHOP";

const CBARQ_SECTIONS = [
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

const CBARQ_FACTOR_MAP = {
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

const MBTI_QUESTIONS = [
  ["q1", "EI", "E", "After a busy week, social plans usually give me energy."],
  ["q2", "EI", "I", "I prefer quiet recovery time before adding new commitments."],
  ["q3", "EI", "E", "I would enjoy regular park visits, classes, or meetups with my dog."],
  ["q4", "EI", "I", "A calm home routine matters more to me than frequent outings."],
  ["q5", "SN", "S", "I notice practical details before imagining alternatives."],
  ["q6", "SN", "N", "I like reading patterns and possibilities behind behavior."],
  ["q7", "SN", "S", "I prefer clear step-by-step care instructions."],
  ["q8", "SN", "N", "I enjoy creative enrichment ideas and changing things up."],
  ["q9", "TF", "T", "When training gets hard, objective rules help me stay consistent."],
  ["q10", "TF", "F", "I first ask how the dog is feeling before deciding what to do."],
  ["q11", "TF", "T", "I am comfortable enforcing boundaries even when it feels awkward."],
  ["q12", "TF", "F", "Maintaining emotional trust is central to how I care for pets."],
  ["q13", "JP", "J", "I like schedules, routines, and knowing what happens next."],
  ["q14", "JP", "P", "I prefer to keep plans flexible and adapt in the moment."],
  ["q15", "JP", "J", "I can repeat a training plan the same way every day."],
  ["q16", "JP", "P", "I am comfortable with pets that bring surprise and spontaneity."],
];

const CLUSTERS = {
  "Gentle Wallflowers": {
    demand: { stimulation: 2, structure: 7, empathy: 9, firmness: 4 },
    weights: { stimulation: 0.25, structure: 0.25, empathy: 0.35, firmness: 0.15 },
    headline: "Cautious, low-energy dogs who need patience, calm spaces, and gentle handling.",
    fit: "Best for quieter homes that can keep routines stable and reduce overstimulation.",
    top: { INFJ: 96, ISFJ: 90, ISFP: 84, INFP: 80, INTJ: 78 },
  },
  "Driven Guardians": {
    demand: { stimulation: 9, structure: 8, empathy: 6, firmness: 8 },
    weights: { stimulation: 0.3, structure: 0.25, empathy: 0.15, firmness: 0.3 },
    headline: "High-drive, confident, protective dogs who need training and firm leadership.",
    fit: "Best for experienced owners with daily exercise time and consistent boundaries.",
    top: { ENTJ: 92, ENFJ: 90, ESTJ: 86, ESFJ: 84, INTJ: 76 },
  },
  "Golden Hearts": {
    demand: { stimulation: 5, structure: 5, empathy: 7, firmness: 5 },
    weights: { stimulation: 0.2, structure: 0.25, empathy: 0.3, firmness: 0.25 },
    headline: "Stable, trainable, low-risk family companions with broad household fit.",
    fit: "Often suitable for first-time owners when lifestyle and housing match.",
    top: { ESFJ: 89, ENFJ: 89, INFJ: 89, ESTP: 79, ISFJ: 79 },
  },
  "Joyful Sparks": {
    demand: { stimulation: 9, structure: 7, empathy: 8, firmness: 4 },
    weights: { stimulation: 0.4, structure: 0.25, empathy: 0.25, firmness: 0.1 },
    headline: "Social, expressive dogs who need activity, interaction, and alone-time support.",
    fit: "Best for homes with presence during the day and regular enrichment.",
    top: { ENFJ: 92, ENTJ: 84, ESFJ: 79, ENFP: 76, ESFP: 73 },
  },
  "Cautious Companions": {
    demand: { stimulation: 3, structure: 8, empathy: 6, firmness: 7 },
    weights: { stimulation: 0.2, structure: 0.35, empathy: 0.15, firmness: 0.3 },
    headline: "Quiet, reserved dogs who need routine and respectful boundary management.",
    fit: "Best for predictable, single-dog homes with patient correction.",
    top: { INTJ: 90, INFJ: 90, ISTJ: 85, ISFJ: 85, ESFJ: 82 },
  },
  "Gentle Giants": {
    demand: { stimulation: 7, structure: 6, empathy: 8, firmness: 7 },
    weights: { stimulation: 0.25, structure: 0.2, empathy: 0.3, firmness: 0.25 },
    headline: "Large, gentle, trainable dogs who need space, exercise, and confidence-building.",
    fit: "Best for confident handlers who balance warmth with safe handling.",
    top: { ENFJ: 93, ESFJ: 89, ENTJ: 83, ESTJ: 79, INFJ: 79 },
  },
  "Fiery Dynamos": {
    demand: { stimulation: 9, structure: 9, empathy: 5, firmness: 9 },
    weights: { stimulation: 0.25, structure: 0.35, empathy: 0.05, firmness: 0.35 },
    headline: "Intense, complex dogs with high arousal who need experienced behavior support.",
    fit: "Best for advanced handlers; experience must outweigh personality preference.",
    top: { ESTJ: 91, ENTJ: 90, ESFJ: 81, ENFJ: 80, ISTJ: 73 },
  },
};

const BREED_RULES = {
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

const DEFAULT_ANSWERS = Object.fromEntries(MBTI_QUESTIONS.map(([id]) => [id, 3]));
const DEFAULT_FACTORS = Object.fromEntries(FACTORS.map(([id]) => [id, 2]));
const DEFAULT_CBARQ_ANSWERS = Object.fromEntries(
  CBARQ_SECTIONS.flatMap((section) => section.items).map(([number]) => [`q${number}`, "na"]),
);

function modeFromPath() {
  if (location.pathname === "/partner" || location.pathname === "/shelter") return "partner";
  if (location.pathname === "/match") return "match";
  return "home";
}

const state = {
  mode: modeFromPath(),
  dogs: [],
  submitted: false,
  partnerUnlocked: false,
  partnerCode: "",
  partnerLockError: "",
  savedMessage: "",
  error: "",
  profile: {
    name: "",
    answers: { ...DEFAULT_ANSWERS },
    lifestyle: {
      homeType: "HDB flat",
      exerciseMinutes: 45,
      hoursAway: 6,
      experience: "first-time",
      trainingCommitment: "weekly",
      children: "no",
      visitors: "sometimes",
      otherPets: "no",
    },
    preferences: {
      size: "Any",
      color: "",
      breed: "",
    },
  },
  partner: {
    name: "",
    shelter: "",
    contactUrl: "",
    breed: "",
    ageYears: "",
    sex: "Female",
    size: "Small",
    color: "",
    imageUrl: "",
    hdbApproved: false,
    homeFit: "HDB flat",
    exerciseNeed: "moderate",
    notes: "",
    cbarqFactors: { ...DEFAULT_FACTORS },
    cbarqAnswers: { ...DEFAULT_CBARQ_ANSWERS },
  },
};

const app = document.getElementById("app");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadDogs() {
  const response = await fetch("/api/dogs");
  const payload = await response.json();
  state.dogs = payload.dogs || [];
}

function setMode(mode) {
  state.mode = mode;
  const path = mode === "partner" ? "/shelter" : mode === "match" ? "/match" : "/";
  history.pushState({}, "", path);
  render();
}

function unlockPartner() {
  if (state.partnerCode.trim().toUpperCase() !== PARTNER_ACCESS_CODE) {
    state.partnerLockError = "That code does not match the partner access code.";
    render();
    return;
  }
  state.partnerUnlocked = true;
  state.partnerLockError = "";
  render();
}

function cbarqAnsweredCount() {
  return Object.values(state.partner.cbarqAnswers).filter((value) => value !== "na" && value !== "").length;
}

function scoreCbarqItems(entries) {
  const scores = entries
    .map((entry) => {
      const item = typeof entry === "object" ? entry.item : entry;
      const raw = state.partner.cbarqAnswers[`q${item}`];
      if (raw === undefined || raw === "na" || raw === "") return null;
      const value = Number(raw);
      if (Number.isNaN(value)) return null;
      return typeof entry === "object" && entry.reverse ? 4 - value : value;
    })
    .filter((value) => value !== null);
  if (!scores.length) return 2;
  return Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2));
}

function deriveCbarqFactors() {
  return Object.fromEntries(
    FACTORS.map(([id]) => [id, scoreCbarqItems(CBARQ_FACTOR_MAP[id] || [])]),
  );
}

function computeMbti(profile) {
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const [id, axis, positiveLetter] of MBTI_QUESTIONS) {
    const answer = Number(profile.answers[id] || 3) - 3;
    const firstLetter = axis[0];
    const sign = positiveLetter === firstLetter ? 1 : -1;
    scores[axis] += answer * sign;
  }
  const type = [
    scores.EI >= 0 ? "E" : "I",
    scores.SN >= 0 ? "S" : "N",
    scores.TF >= 0 ? "T" : "F",
    scores.JP >= 0 ? "J" : "P",
  ].join("");

  return { type, scores };
}

function ownerVector(type) {
  const has = (letter) => type.includes(letter);
  const stimulation = clamp(5 + (has("E") ? 3 : -3) + (has("N") ? 1 : -1), 0, 10);
  const structure = clamp(5 + (has("J") ? 3 : -3) + (has("S") ? 1 : -1), 0, 10);
  const empathy = has("F") ? 8 : 4;
  const firmness = clamp(
    5 + (has("J") ? 2 : -2) + (has("T") ? 2 : -2) + (has("E") ? 0.5 : -0.5),
    0,
    10,
  );
  return { stimulation, structure, empathy, firmness };
}

function mbtiCompatibility(type, clusterName) {
  const cluster = CLUSTERS[clusterName] || CLUSTERS["Golden Hearts"];
  if (cluster.top[type]) return cluster.top[type];
  const owner = ownerVector(type);
  let weightedDistance = 0;
  for (const key of Object.keys(cluster.demand)) {
    weightedDistance += cluster.weights[key] * Math.abs(owner[key] - cluster.demand[key]);
  }
  return Math.round(clamp(100 - 10 * weightedDistance, 0, 100));
}

function targetMinutes(exerciseNeed) {
  return {
    low: 30,
    moderate: 70,
    moderateHigh: 85,
    high: 110,
  }[exerciseNeed] || 70;
}

function experienceScore(experience, clusterName) {
  const level = { "first-time": 45, some: 70, experienced: 92 }[experience] || 55;
  if (["Fiery Dynamos", "Driven Guardians"].includes(clusterName)) return level;
  if (clusterName === "Cautious Companions") return Math.min(95, level + 8);
  return Math.min(100, level + 18);
}

function scoreDog(dog, profile) {
  const mbti = computeMbti(profile).type;
  const exerciseGap = Math.abs(Number(profile.lifestyle.exerciseMinutes) - targetMinutes(dog.exerciseNeed));
  const exerciseScore = clamp(100 - exerciseGap * 1.2, 0, 100);
  const away = Number(profile.lifestyle.hoursAway);
  const separationRisk = ["Joyful Sparks", "Fiery Dynamos"].includes(dog.cluster);
  const aloneScore = separationRisk ? clamp(100 - Math.max(0, away - 4) * 18, 20, 100) : clamp(100 - Math.max(0, away - 8) * 10, 45, 100);
  const lifestyleScore = Math.round((exerciseScore * 0.62) + (aloneScore * 0.38));

  let housingScore = 86;
  if (profile.lifestyle.homeType === "HDB flat" && !dog.hdbApproved) housingScore = 35;
  if (profile.lifestyle.homeType === "landed house") housingScore = 96;
  if (dog.size === "Large" && profile.lifestyle.homeType === "HDB flat") housingScore -= 20;
  housingScore = clamp(housingScore, 0, 100);

  const expScore = experienceScore(profile.lifestyle.experience, dog.cluster);
  const personalityScore = mbtiCompatibility(mbti, dog.cluster);
  const preferenceScore = preferenceFit(dog, profile.preferences);

  const base = 0.3 * lifestyleScore + 0.25 * housingScore + 0.15 * expScore + 0.3 * personalityScore;
  let finalScore = Math.round(base);
  const flags = [];

  if (dog.cluster === "Fiery Dynamos" && profile.lifestyle.experience !== "experienced") {
    finalScore = Math.min(finalScore, 60);
    flags.push("Advanced handling recommended before adoption.");
  }
  if (dog.cluster === "Joyful Sparks" && away > 7) {
    finalScore = Math.min(finalScore, 70);
    flags.push("High alone-time risk for a social dog.");
  }
  if (profile.lifestyle.homeType === "HDB flat" && !dog.hdbApproved) {
    finalScore = Math.min(finalScore, 55);
    flags.push("Housing check needed for HDB suitability.");
  }

  return {
    dog,
    score: finalScore,
    mbti,
    subscores: {
      lifestyle: Math.round(lifestyleScore),
      housing: Math.round(housingScore),
      experience: Math.round(expScore),
      personality: Math.round(personalityScore),
      preference: Math.round(preferenceScore),
    },
    flags,
  };
}

function preferenceFit(dog, preferences) {
  let score = 100;
  if (preferences.size !== "Any" && dog.size !== preferences.size) score -= 24;
  if (preferences.color && !dog.color.toLowerCase().includes(preferences.color.toLowerCase())) score -= 18;
  if (preferences.breed && !dog.breed.toLowerCase().includes(preferences.breed.toLowerCase())) score -= 28;
  return clamp(score, 0, 100);
}

function getMatches() {
  return state.dogs
    .filter((dog) => dog.status === "available")
    .map((dog) => scoreDog(dog, state.profile))
    .sort((a, b) => b.score - a.score);
}

function applyBreedRule() {
  const rule = BREED_RULES[state.partner.breed];
  if (!rule) return;
  state.partner.hdbApproved = rule.hdb;
  state.partner.exerciseNeed = rule.exercise;
}

async function submitPartner() {
  state.error = "";
  state.savedMessage = "";
  state.partner.cbarqFactors = deriveCbarqFactors();
  const response = await fetch("/api/dogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...state.partner,
      ageYears: state.partner.ageYears ? Number(state.partner.ageYears) : null,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    state.error = payload.error || "Could not save this dog.";
    render();
    return;
  }
  state.savedMessage = `${state.partner.name} was saved as ${payload.cluster}.`;
  state.partner = {
    name: "",
    shelter: "",
    contactUrl: "",
    breed: "",
    ageYears: "",
    sex: "Female",
    size: "Small",
    color: "",
    imageUrl: "",
    hdbApproved: false,
    homeFit: "HDB flat",
    exerciseNeed: "moderate",
    notes: "",
    cbarqFactors: { ...DEFAULT_FACTORS },
    cbarqAnswers: { ...DEFAULT_CBARQ_ANSWERS },
  };
  await loadDogs();
  render();
}

function submitConsumer() {
  state.submitted = true;
  render();
}

function renderHeader() {
  return `
    <header class="topbar">
      <a class="brand" href="/" data-nav="home" aria-label="CUB home">
        <img src="${APP_LOGO}" alt="" />
        <span>CUB: Canine Understanding Buddy</span>
      </a>
      <nav class="nav-pills" aria-label="Site areas">
        <button class="${state.mode === "home" ? "active" : ""}" data-nav="home">Home</button>
        <button class="${state.mode === "match" ? "active" : ""}" data-nav="match">Match now!</button>
        <button class="${state.mode === "partner" ? "active" : ""}" data-nav="partner">Shelter intake</button>
      </nav>
    </header>
  `;
}

function renderHome() {
  return `
    ${renderHeader()}
    <main class="screen home-screen">
      <section class="home-hero panel">
        <div class="hero-copy">
          <p class="eyebrow">Canine Understanding Buddy</p>
          <h1>Understand your lifestyle. Meet dogs who fit it.</h1>
          <p>CUB helps adopters compare personality, daily routine, home setup, and future pet preferences against dogs added by trusted shelters and pet shops.</p>
          <div class="hero-actions">
            <button class="primary-action hero-action" data-nav="match">Match now!</button>
            <button class="secondary-action hero-action" data-nav="partner">Shelter questions</button>
          </div>
        </div>
        <div class="hero-logo-card">
          <img src="${APP_LOGO}" alt="CUB dog logo" />
        </div>
      </section>

      <section class="collab-section">
        <div class="section-title">
          <p class="eyebrow">Pet resources</p>
          <h2>Handy links for new dog parents.</h2>
        </div>
        <div class="collab-grid">
          ${renderCollaboratorSlot({
            label: "Pet news",
            description: "Heart-warming animal stories and the latest dog news.",
            url: "https://www.thedodo.com",
            host: "thedodo.com",
            image: "/assets/link-news.jpg",
          })}
          ${renderCollaboratorSlot({
            label: "Treats & snacks",
            description: "Shop healthy treats and food for every life stage.",
            url: "https://www.chewy.com",
            host: "chewy.com",
            image: "/assets/link-snacks.jpg",
          })}
          ${renderCollaboratorSlot({
            label: "Toys & play",
            description: "Enrichment toys and monthly play boxes for happy pups.",
            url: "https://www.barkbox.com",
            host: "barkbox.com",
            image: "/assets/link-toys.jpg",
          })}
          ${renderCollaboratorSlot({
            label: "Adoption & shelters",
            description: "Find adoptable dogs and trusted rescues near you.",
            url: "https://www.petfinder.com",
            host: "petfinder.com",
            image: "/assets/link-shelters.jpg",
          })}
        </div>
      </section>
    </main>
  `;
}

function renderCollaboratorSlot({ label, description, url, host, image }) {
  return `
    <a class="collab-card" href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener">
      <img class="collab-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(label)}" loading="lazy" />
      <div>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(description)}</p>
        <span>${escapeHtml(host)} &rarr;</span>
      </div>
    </a>
  `;
}

function renderPublic() {
  const mbti = computeMbti(state.profile);
  const matches = state.submitted ? getMatches() : [];
  return `
    ${renderHeader()}
    <main class="screen public-screen">
      <section class="intro-strip">
        <div>
          <p class="eyebrow">Match quiz</p>
          <h1>Find a dog whose needs fit your life.</h1>
        </div>
        <div class="stat-block">
          <strong>${state.dogs.length}</strong>
          <span>dogs in database</span>
        </div>
      </section>

      <div class="app-grid">
        <form class="panel questionnaire" data-form="consumer">
          <div class="panel-head">
            <p class="eyebrow">Step 1</p>
            <h2>Personality</h2>
          </div>
          <label class="field">
            <span>Your name</span>
            <input name="consumer.name" value="${escapeHtml(state.profile.name)}" placeholder="Optional" />
          </label>
          <div class="question-list">
            ${MBTI_QUESTIONS.map(([id, axis, , label], index) => `
              <label class="range-row">
                <span><b>${index + 1}.</b> ${escapeHtml(label)}</span>
                <input type="range" min="1" max="5" name="answers.${id}" value="${state.profile.answers[id]}" />
                <small>${axis} scale</small>
              </label>
            `).join("")}
          </div>

          <div class="form-split">
            <div>
              <div class="panel-head compact">
                <p class="eyebrow">Step 2</p>
                <h2>Lifestyle</h2>
              </div>
              ${selectField("Home type", "lifestyle.homeType", state.profile.lifestyle.homeType, ["HDB flat", "condominium", "landed house"])}
              ${numberField("Daily exercise minutes", "lifestyle.exerciseMinutes", state.profile.lifestyle.exerciseMinutes, 0, 180)}
              ${numberField("Hours away on a normal day", "lifestyle.hoursAway", state.profile.lifestyle.hoursAway, 0, 14)}
              ${selectField("Dog experience", "lifestyle.experience", state.profile.lifestyle.experience, ["first-time", "some", "experienced"])}
              ${selectField("Training commitment", "lifestyle.trainingCommitment", state.profile.lifestyle.trainingCommitment, ["weekly", "several times a week", "daily"])}
            </div>
            <div>
              <div class="panel-head compact">
                <p class="eyebrow">Step 3</p>
                <h2>Preferences</h2>
              </div>
              ${selectField("Preferred size", "preferences.size", state.profile.preferences.size, ["Any", "Small", "Medium", "Large"])}
              <label class="field">
                <span>Preferred color</span>
                <input name="preferences.color" value="${escapeHtml(state.profile.preferences.color)}" placeholder="e.g. brown" />
              </label>
              <label class="field">
                <span>Preferred breed</span>
                <input name="preferences.breed" value="${escapeHtml(state.profile.preferences.breed)}" placeholder="Optional" />
              </label>
              ${selectField("Children at home", "lifestyle.children", state.profile.lifestyle.children, ["no", "yes"])}
              ${selectField("Other pets", "lifestyle.otherPets", state.profile.lifestyle.otherPets, ["no", "yes"])}
            </div>
          </div>
          <button class="primary-action" type="submit">Find My Match</button>
        </form>

        <aside class="panel match-panel">
          <div class="panel-head">
            <p class="eyebrow">Match results</p>
            <h2>${state.submitted ? `Likely ${mbti.type}` : "Ready when you are"}</h2>
          </div>
          ${state.submitted ? renderMatches(matches, mbti.type) : renderWaitingState(mbti.type)}
        </aside>
      </div>
    </main>
  `;
}

function renderWaitingState(type) {
  const hasSignal = Object.values(state.profile.answers).some((value) => Number(value) !== 3);
  return `
    <div class="result-empty">
      <img src="${APP_LOGO}" alt="" />
      <h3>${hasSignal ? `Your current questionnaire points to ${type}.` : "Your MBTI-style profile will appear here."}</h3>
      <p>Submit the form to compare your lifestyle and preferences against the dogs saved by shelters.</p>
    </div>
    <div class="logic-band">
      <span>Scoring</span>
      <b>30% lifestyle</b>
      <b>25% housing</b>
      <b>15% experience</b>
      <b>30% personality</b>
    </div>
  `;
}

function renderMatches(matches, type) {
  if (!state.dogs.length) {
    return `
      <div class="result-empty">
        <img src="${APP_LOGO}" alt="" />
        <h3>No dogs are stored yet.</h3>
        <p>The database is intentionally empty. Once approved partners add dogs, matches will appear here.</p>
      </div>
    `;
  }
  return `
    <div class="type-card">
      <span>Your MBTI-style profile</span>
      <strong>${type}</strong>
      <p>Personality now carries 30% of the score, balanced with lifestyle, housing, and experience.</p>
    </div>
    <div class="match-list">
      ${matches.map(renderMatchCard).join("")}
    </div>
  `;
}

function renderMatchCard(match) {
  const { dog, subscores } = match;
  const cluster = CLUSTERS[dog.cluster] || CLUSTERS["Golden Hearts"];
  return `
    <article class="match-card">
      <div class="dog-media">
        <img src="${escapeHtml(dog.imageUrl || APP_LOGO)}" alt="" />
        <span>${match.score}%</span>
      </div>
      <div class="dog-copy">
        <div class="dog-title">
          <div>
            <h3>${escapeHtml(dog.name)}</h3>
            <p>${escapeHtml(dog.breed)} · ${escapeHtml(dog.size || "Size not set")} · ${escapeHtml(dog.color || "Color not set")}</p>
          </div>
          <a href="${escapeHtml(dog.contactUrl)}" target="_blank" rel="noreferrer">Meet</a>
        </div>
        <div class="cluster-pill">${escapeHtml(dog.cluster)}</div>
        <p>${escapeHtml(cluster.headline)}</p>
        <dl class="score-grid">
          <div><dt>Lifestyle</dt><dd>${subscores.lifestyle}</dd></div>
          <div><dt>Housing</dt><dd>${subscores.housing}</dd></div>
          <div><dt>Experience</dt><dd>${subscores.experience}</dd></div>
          <div><dt>Personality</dt><dd>${subscores.personality}</dd></div>
        </dl>
        <div class="why-box">
          <b>Why this match</b>
          <span>${escapeHtml(cluster.fit)}</span>
          <span>Preference fit: ${subscores.preference}/100.</span>
          ${match.flags.length ? `<span class="risk">${escapeHtml(match.flags.join(" "))}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderPartner() {
  if (!state.partnerUnlocked) return renderPartnerAccess();
  return `
    ${renderHeader()}
    <main class="screen partner-screen">
      <section class="intro-strip partner">
        <div>
          <p class="eyebrow">Private shelter and pet shop portal</p>
          <h1>Answer shelter questions for each dog.</h1>
        </div>
        <div class="stat-block">
          <strong>${state.dogs.length}</strong>
          <span>stored records</span>
        </div>
      </section>

      <div class="portal-grid">
        <form class="panel intake-panel" data-form="partner">
          <div class="panel-head">
            <p class="eyebrow">Dog profile</p>
            <h2>Intake record</h2>
          </div>
          ${state.error ? `<p class="notice error">${escapeHtml(state.error)}</p>` : ""}
          ${state.savedMessage ? `<p class="notice success">${escapeHtml(state.savedMessage)}</p>` : ""}
          <div class="form-split">
            <div>
              ${textField("Dog name", "partner.name", state.partner.name, "Required")}
              ${textField("Shelter or pet shop", "partner.shelter", state.partner.shelter, "Required")}
              ${textField("Website to meet this pet", "partner.contactUrl", state.partner.contactUrl, "https://...")}
              ${breedField()}
              ${numberField("Age in years", "partner.ageYears", state.partner.ageYears, 0, 25)}
              ${selectField("Sex", "partner.sex", state.partner.sex, ["Female", "Male", "Unknown"])}
            </div>
            <div>
              ${selectField("Size", "partner.size", state.partner.size, ["Small", "Medium", "Large"])}
              ${textField("Color", "partner.color", state.partner.color, "e.g. brown and white")}
              ${textField("Photo URL", "partner.imageUrl", state.partner.imageUrl, "Optional")}
              ${selectField("Best home fit", "partner.homeFit", state.partner.homeFit, ["HDB flat", "condominium", "landed house", "single-dog home"])}
              ${selectField("Exercise need", "partner.exerciseNeed", state.partner.exerciseNeed, ["low", "moderate", "moderateHigh", "high"])}
              <label class="check-row">
                <input type="checkbox" name="partner.hdbApproved" ${state.partner.hdbApproved ? "checked" : ""} />
                <span>HDB approved</span>
              </label>
            </div>
          </div>

          <div class="panel-head compact">
            <p class="eyebrow">C-BARQ questionnaire</p>
            <h2>Behavior questions</h2>
            <p class="helper-copy">${cbarqAnsweredCount()} of 101 questions answered. N/A is accepted when the situation has not been observed.</p>
          </div>
          <div class="cbarq-sections">
            ${CBARQ_SECTIONS.map(renderCbarqSection).join("")}
          </div>
          <div class="factor-summary">
            <h3>Calculated behavior factors</h3>
            <div class="factor-grid compact">
              ${FACTORS.map(([id, label]) => `
                <div class="factor-chip">
                  <span>${escapeHtml(label)}</span>
                  <b>${deriveCbarqFactors()[id]}</b>
                </div>
              `).join("")}
            </div>
          </div>
          <label class="field">
            <span>Behavior notes</span>
            <textarea name="partner.notes" rows="4" placeholder="Triggers, handling advice, medical context, or adoption notes">${escapeHtml(state.partner.notes)}</textarea>
          </label>
          <button class="primary-action" type="submit">Save Dog To Database</button>
        </form>

        <aside class="panel database-panel">
          <div class="panel-head">
            <p class="eyebrow">Database</p>
            <h2>Future dog records</h2>
          </div>
          ${renderDatabaseList()}
        </aside>
      </div>
    </main>
  `;
}

function renderPartnerAccess() {
  return `
    ${renderHeader()}
    <main class="screen partner-screen">
      <section class="access-card panel">
        <div>
          <p class="eyebrow">Private shelter and pet shop portal</p>
          <h1>Partner access required.</h1>
          <p>Only approved shelters and pet shops should enter dog records into CUB.</p>
        </div>
        <form data-form="partner-access" class="access-form">
          ${state.partnerLockError ? `<p class="notice error">${escapeHtml(state.partnerLockError)}</p>` : ""}
          <label class="field">
            <span>Partner access code</span>
            <input name="partnerCode" type="password" value="${escapeHtml(state.partnerCode)}" placeholder="Enter code" />
          </label>
          <button class="primary-action" type="submit">Unlock Intake</button>
        </form>
      </section>
    </main>
  `;
}

function renderCbarqSection(section) {
  return `
    <section class="cbarq-section">
      <div class="cbarq-section-head">
        <h3>${escapeHtml(section.title)}</h3>
        <span>${escapeHtml(section.scale)}</span>
      </div>
      <div class="cbarq-question-grid">
        ${section.items.map(([number, label]) => `
          <label class="cbarq-question">
            <span><b>${number}.</b> ${escapeHtml(label)}</span>
            <select name="cbarq.q${number}">
              ${cbarqOptions(state.partner.cbarqAnswers[`q${number}`]).join("")}
            </select>
          </label>
        `).join("")}
      </div>
    </section>
  `;
}

function cbarqOptions(value) {
  return [
    ["na", "N/A"],
    ["0", "0"],
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
  ].map(([optionValue, label]) => `<option value="${optionValue}" ${String(value) === optionValue ? "selected" : ""}>${label}</option>`);
}

function renderDatabaseList() {
  if (!state.dogs.length) {
    return `
      <div class="result-empty compact-empty">
        <img src="${APP_LOGO}" alt="" />
        <h3>The database is empty.</h3>
        <p>Partner submissions will be stored in SQLite and used by the public matching flow.</p>
      </div>
    `;
  }
  return `
    <div class="db-list">
      ${state.dogs.map((dog) => `
        <article>
          <b>${escapeHtml(dog.name)}</b>
          <span>${escapeHtml(dog.breed)} · ${escapeHtml(dog.cluster)}</span>
          <small>${escapeHtml(dog.shelter)}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function selectField(label, name, value, options) {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}">
        ${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function textField(label, name, value, placeholder = "") {
  return `
    <label class="field">
      <span>${label}</span>
      <input name="${name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" />
    </label>
  `;
}

function numberField(label, name, value, min, max) {
  return `
    <label class="field">
      <span>${label}</span>
      <input type="number" min="${min}" max="${max}" name="${name}" value="${escapeHtml(value)}" />
    </label>
  `;
}

function breedField() {
  return `
    <label class="field">
      <span>Breed</span>
      <input name="partner.breed" list="breed-options" value="${escapeHtml(state.partner.breed)}" placeholder="Required" />
      <datalist id="breed-options">
        ${Object.keys(BREED_RULES).map((breed) => `<option value="${escapeHtml(breed)}"></option>`).join("")}
      </datalist>
    </label>
  `;
}

function writePath(name, value) {
  if (name === "partnerCode") {
    state.partnerCode = value;
    return;
  }
  if (name.startsWith("answers.")) {
    state.profile.answers[name.split(".")[1]] = Number(value);
    return;
  }
  if (name.startsWith("cbarq.")) {
    state.partner.cbarqAnswers[name.split(".")[1]] = value;
    state.partner.cbarqFactors = deriveCbarqFactors();
    return;
  }
  if (name.startsWith("factors.")) {
    state.partner.cbarqFactors[name.split(".")[1]] = Number(value);
    return;
  }
  const [root, key] = name.split(".");
  if (root === "consumer") state.profile[key] = value;
  if (root === "lifestyle") state.profile.lifestyle[key] = value;
  if (root === "preferences") state.profile.preferences[key] = value;
  if (root === "partner") state.partner[key] = value;
}

function attachEvents() {
  app.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setMode(button.dataset.nav);
    });
  });

  app.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      const value = input.type === "checkbox" ? input.checked : input.value;
      writePath(input.name, value);
      if (input.name === "partner.breed") applyBreedRule();
      if (input.type === "range") {
        const label = input.closest(".range-row");
        const output = label && label.querySelector("small");
        if (output) output.textContent = input.value;
      }
    });
  });

  app.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (form.dataset.form === "consumer") submitConsumer();
      if (form.dataset.form === "partner") await submitPartner();
      if (form.dataset.form === "partner-access") unlockPartner();
    });
  });
}

function render() {
  app.innerHTML = state.mode === "partner" ? renderPartner() : state.mode === "match" ? renderPublic() : renderHome();
  attachEvents();
}

window.addEventListener("popstate", () => {
  state.mode = modeFromPath();
  render();
});

loadDogs()
  .catch(() => {
    state.error = "Could not load the dog database.";
  })
  .finally(render);
