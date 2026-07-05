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
const setAnswer = (p, id, value) => ({ ...p, answers: { ...p.answers, [id]: Number(value) } });

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly disagree", sub: "This does not sound like me." },
  { value: 2, label: "Disagree", sub: "Only slightly true for me." },
  { value: 3, label: "Neutral", sub: "Somewhere in the middle." },
  { value: 4, label: "Agree", sub: "This mostly sounds like me." },
  { value: 5, label: "Strongly agree", sub: "This describes me very well." },
];

const PERSONALITY_STEPS = MBTI_QUESTIONS.map(([id, axis, , label], index) => ({
  crumb: "Personality",
  title: label,
  desc: `Personality question ${index + 1} of ${MBTI_QUESTIONS.length}. Choose the response that fits you best.`,
  get: (p) => Number(p.answers[id] ?? 3),
  apply: (p, v) => setAnswer(p, id, v),
  options: LIKERT_OPTIONS,
  axis,
}));

export const MATCH_STEPS = [
  ...PERSONALITY_STEPS,
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
    crumb: "Experience",
    title: "How often can you work on training?",
    desc: "Dogs with higher support needs do best when training can be consistent.",
    get: (p) => p.lifestyle.trainingCommitment,
    apply: (p, v) => setLifestyle(p, "trainingCommitment", v),
    options: [
      { value: "weekly", label: "Weekly", sub: "I can set aside time most weeks." },
      { value: "several times a week", label: "Several times a week", sub: "I can practise regularly." },
      { value: "daily", label: "Daily", sub: "I can build training into everyday life." },
    ],
  },
  {
    crumb: "Household",
    title: "Are there children at home?",
    desc: "Some dogs need calmer, more predictable households.",
    get: (p) => p.lifestyle.children,
    apply: (p, v) => setLifestyle(p, "children", v),
    options: [
      { value: "no", label: "No children at home", sub: "The home is adult-only or usually quiet." },
      { value: "yes", label: "Yes, children at home", sub: "The dog should be comfortable with children." },
    ],
  },
  {
    crumb: "Household",
    title: "Do you already have other pets?",
    desc: "This helps us avoid matches that may need a single-pet home.",
    get: (p) => p.lifestyle.otherPets,
    apply: (p, v) => setLifestyle(p, "otherPets", v),
    options: [
      { value: "no", label: "No other pets", sub: "This dog would be the only pet." },
      { value: "yes", label: "Yes, other pets", sub: "The dog should be able to share a home." },
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
  {
    crumb: "Preferences",
    title: "Any coat colour preference?",
    desc: "This is optional. Compatibility still comes before appearance.",
    get: (p) => p.preferences.color,
    apply: (p, v) => setPref(p, "color", v),
    options: [
      { value: "", label: "No preference", sub: "Show me every coat colour." },
      { value: "brown", label: "Brown", sub: "Warm brown or chocolate coats." },
      { value: "black", label: "Black", sub: "Black or mostly black coats." },
      { value: "white", label: "White", sub: "White or cream coats." },
      { value: "golden", label: "Golden", sub: "Golden, yellow, or tan coats." },
    ],
  },
  {
    crumb: "Preferences",
    title: "Any breed preference?",
    desc: "Breed can guide preferences, but individual behaviour still matters most.",
    get: (p) => p.preferences.breed,
    apply: (p, v) => setPref(p, "breed", v),
    options: [
      { value: "", label: "No preference", sub: "Keep all breeds in the match pool." },
      { value: "Retriever", label: "Retriever types", sub: "Golden, Labrador, and similar breeds." },
      { value: "Poodle", label: "Poodle types", sub: "Poodles and poodle mixes." },
      { value: "Terrier", label: "Terrier types", sub: "Small-to-medium terrier breeds." },
      { value: "Spaniel", label: "Spaniel types", sub: "Spaniels and similar companion breeds." },
      { value: "Mixed", label: "Mixed breeds", sub: "Mixed-breed dogs only if available." },
    ],
  },
];
