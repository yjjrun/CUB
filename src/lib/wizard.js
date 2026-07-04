import { MBTI_QUESTIONS } from "./matching.js";

export const DEFAULT_PROFILE = {
  answers: Object.fromEntries(MBTI_QUESTIONS.map(([id]) => [id, 3])),
  lifestyle: {
    homeType: "HDB flat",
    exerciseMinutes: 45,
    hoursAway: 6,
    experience: "first-time",
    trainingCommitment: "weekly",
    children: "no",
    otherPets: "no",
  },
  preferences: { size: "Any", color: "", breed: "" },
};

function setAxis(profile, axis, lean) {
  const answers = { ...profile.answers };
  for (const [id, ax, positiveLetter] of MBTI_QUESTIONS) {
    if (ax !== axis) continue;
    if (lean === "balanced") {
      answers[id] = 3;
      continue;
    }
    const isFirstLetter = positiveLetter === ax[0];
    answers[id] = isFirstLetter === (lean === "first") ? 5 : 1;
  }
  return { ...profile, answers };
}

function getAxis(profile, axis) {
  let sum = 0;
  for (const [id, ax, positiveLetter] of MBTI_QUESTIONS) {
    if (ax !== axis) continue;
    const sign = positiveLetter === ax[0] ? 1 : -1;
    sum += (Number(profile.answers[id]) - 3) * sign;
  }
  return sum > 0 ? "first" : sum < 0 ? "second" : "balanced";
}

const EXERCISE_BANDS = { low: 30, moderate: 70, high: 110 };
const getExerciseBand = (p) => {
  const m = Number(p.lifestyle.exerciseMinutes);
  return m < 50 ? "low" : m < 90 ? "moderate" : "high";
};
const getAwayBand = (p) => {
  const h = Number(p.lifestyle.hoursAway);
  return h < 4 ? "rarely" : h <= 8 ? "part" : "most";
};
const setLifestyle = (p, key, value) => ({ ...p, lifestyle: { ...p.lifestyle, [key]: value } });
const setPref = (p, key, value) => ({ ...p, preferences: { ...p.preferences, [key]: value } });

export const MATCH_STEPS = [
  {
    crumb: "Personality",
    title: "How do you recharge?",
    desc: "Some dogs thrive on outings and company; others love a calm home. Let's find your rhythm.",
    get: (p) => getAxis(p, "EI"),
    apply: (p, v) => setAxis(p, "EI", v),
    options: [
      { value: "first", label: "Out and about", sub: "Social plans and activity energize me." },
      { value: "balanced", label: "A balanced mix", sub: "Some outings, some downtime." },
      { value: "second", label: "Calm at home", sub: "Quiet time is how I recharge." },
    ],
  },
  {
    crumb: "Personality",
    title: "How do you take things in?",
    desc: "This shapes whether you'll enjoy a predictable dog or one that keeps you guessing.",
    get: (p) => getAxis(p, "SN"),
    apply: (p, v) => setAxis(p, "SN", v),
    options: [
      { value: "first", label: "Practical details", sub: "I notice concrete, here-and-now facts." },
      { value: "balanced", label: "A balanced mix", sub: "A bit of both." },
      { value: "second", label: "Patterns and ideas", sub: "I love possibilities and the big picture." },
    ],
  },
  {
    crumb: "Personality",
    title: "How do you make decisions?",
    desc: "This affects how you'll handle training and setting boundaries.",
    get: (p) => getAxis(p, "TF"),
    apply: (p, v) => setAxis(p, "TF", v),
    options: [
      { value: "first", label: "Logic and rules", sub: "Consistent rules keep me on track." },
      { value: "balanced", label: "A balanced mix", sub: "Head and heart together." },
      { value: "second", label: "Empathy and feeling", sub: "I lead with how everyone feels." },
    ],
  },
  {
    crumb: "Personality",
    title: "How do you like your days?",
    desc: "Routine-loving dogs and spontaneous dogs suit different people.",
    get: (p) => getAxis(p, "JP"),
    apply: (p, v) => setAxis(p, "JP", v),
    options: [
      { value: "first", label: "Planned and structured", sub: "Schedules and routines feel good." },
      { value: "balanced", label: "A balanced mix", sub: "Flexible, with some structure." },
      { value: "second", label: "Flexible and spontaneous", sub: "I go with the flow." },
    ],
  },
  {
    crumb: "Lifestyle",
    title: "Where will your dog live?",
    desc: "Housing shapes which dogs can thrive with you — HDB rules and space matter.",
    get: (p) => p.lifestyle.homeType,
    apply: (p, v) => setLifestyle(p, "homeType", v),
    options: [
      { value: "HDB flat", label: "HDB flat", sub: "HDB-approved breeds only." },
      { value: "condominium", label: "Condominium", sub: "Check your condo's pet rules." },
      { value: "landed house", label: "Landed house", sub: "The most room to roam." },
    ],
  },
  {
    crumb: "Lifestyle",
    title: "How active are you?",
    desc: "We match a dog's exercise needs to your daily energy.",
    get: getExerciseBand,
    apply: (p, v) => setLifestyle(p, "exerciseMinutes", EXERCISE_BANDS[v]),
    options: [
      { value: "low", label: "Easygoing", sub: "Short walks, about 30 min a day." },
      { value: "moderate", label: "Moderately active", sub: "Around an hour a day." },
      { value: "high", label: "Very active", sub: "90+ minutes, happy to run." },
    ],
  },
  {
    crumb: "Lifestyle",
    title: "How long are you away on a normal day?",
    desc: "Some dogs need company; long alone-time can be hard on them.",
    get: getAwayBand,
    apply: (p, v) => setLifestyle(p, "hoursAway", { rarely: 2, part: 6, most: 10 }[v]),
    options: [
      { value: "rarely", label: "Rarely away", sub: "Someone's usually home." },
      { value: "part", label: "Part of the day", sub: "Out about 4 to 8 hours." },
      { value: "most", label: "Most of the day", sub: "Out 8+ hours." },
    ],
  },
  {
    crumb: "Experience",
    title: "How much dog experience do you have?",
    desc: "This helps us keep higher-needs dogs with handlers ready for them.",
    get: (p) => p.lifestyle.experience,
    apply: (p, v) => setLifestyle(p, "experience", v),
    options: [
      { value: "first-time", label: "First-time owner", sub: "This would be my first dog." },
      { value: "some", label: "Some experience", sub: "I've had a dog before." },
      { value: "experienced", label: "Very experienced", sub: "I'm confident with training." },
    ],
  },
  {
    crumb: "Preferences",
    title: "Any size preference?",
    desc: "We factor this in, but welfare fit always comes first.",
    get: (p) => p.preferences.size,
    apply: (p, v) => setPref(p, "size", v),
    options: [
      { value: "Any", label: "No preference", sub: "Show me all sizes." },
      { value: "Small", label: "Small", sub: "Lap-sized companions." },
      { value: "Medium", label: "Medium", sub: "A balance of both." },
      { value: "Large", label: "Large", sub: "Big, sturdy dogs." },
    ],
  },
];
