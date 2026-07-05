// Matching model, ported unchanged from the original vanilla implementation.
// Pure functions: they take a profile/dogs and return results (no shared state).

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const APP_LOGO = "/assets/favicon-cub-transparent.png";
export const PARTNER_ACCESS_CODE = "CUBSHOP";

export const MBTI_QUESTIONS = [
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

export const CLUSTERS = {
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

export const CLUSTER_TRAITS = {
  "Gentle Wallflowers": ["Gentle", "Sensitive", "Calm"],
  "Driven Guardians": ["Confident", "Loyal", "High-drive"],
  "Golden Hearts": ["Friendly", "Trainable", "Easygoing"],
  "Joyful Sparks": ["Playful", "Social", "Energetic"],
  "Cautious Companions": ["Reserved", "Loyal", "Routine-loving"],
  "Gentle Giants": ["Gentle", "Affectionate", "Steady"],
  "Fiery Dynamos": ["Intense", "Spirited", "Demanding"],
};
export const clusterTraits = (name) => CLUSTER_TRAITS[name] || ["Loving", "Loyal", "Unique"];

export function experienceLabel(cluster) {
  if (["Fiery Dynamos", "Driven Guardians"].includes(cluster)) return "Experienced handler";
  if (cluster === "Cautious Companions") return "Some experience helps";
  return "First-time friendly";
}

export function computeMbti(profile) {
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const [id, axis, positiveLetter] of MBTI_QUESTIONS) {
    const answer = Number(profile.answers[id] || 3) - 3;
    const sign = positiveLetter === axis[0] ? 1 : -1;
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

function axisLean(scores, axis) {
  const maxScore = MBTI_QUESTIONS.filter(([, questionAxis]) => questionAxis === axis).length * 2;
  return maxScore ? clamp((scores[axis] || 0) / maxScore, -1, 1) : 0;
}

function ownerVector(scores) {
  const ei = axisLean(scores, "EI"); // -1 = I, +1 = E
  const sn = axisLean(scores, "SN"); // -1 = N, +1 = S
  const tf = axisLean(scores, "TF"); // -1 = F, +1 = T
  const jp = axisLean(scores, "JP"); // -1 = P, +1 = J

  const stimulation = clamp(5 + 3 * ei - sn, 0, 10);
  const structure = clamp(5 + 3 * jp + sn, 0, 10);
  const empathy = clamp(6 - 2 * tf, 0, 10);
  const firmness = clamp(5 + 2 * jp + 2 * tf + 0.5 * ei, 0, 10);
  return { stimulation, structure, empathy, firmness };
}

function mbtiCompatibility(mbti, clusterName) {
  const cluster = CLUSTERS[clusterName] || CLUSTERS["Golden Hearts"];
  const owner = ownerVector(mbti.scores);
  let weightedDistance = 0;
  for (const key of Object.keys(cluster.demand)) {
    weightedDistance += cluster.weights[key] * Math.abs(owner[key] - cluster.demand[key]);
  }
  return Math.round(clamp(100 - 10 * weightedDistance, 0, 100));
}

const targetMinutes = (need) => ({ low: 30, moderate: 70, moderateHigh: 85, high: 110 }[need] || 70);

function experienceScore(experience, clusterName) {
  const level = { "first-time": 45, some: 70, experienced: 92 }[experience] || 55;
  if (["Fiery Dynamos", "Driven Guardians"].includes(clusterName)) return level;
  if (clusterName === "Cautious Companions") return Math.min(95, level + 8);
  return Math.min(100, level + 18);
}

function preferenceFit(dog, preferences) {
  let score = 100;
  if (preferences.size !== "Any" && dog.size !== preferences.size) score -= 24;
  if (preferences.color && !dog.color.toLowerCase().includes(preferences.color.toLowerCase())) score -= 18;
  if (preferences.breed && !dog.breed.toLowerCase().includes(preferences.breed.toLowerCase())) score -= 28;
  return clamp(score, 0, 100);
}

export function scoreDog(dog, profile) {
  const mbti = computeMbti(profile);
  const exerciseGap = Math.abs(Number(profile.lifestyle.exerciseMinutes) - targetMinutes(dog.exerciseNeed));
  const exerciseScore = clamp(100 - exerciseGap * 1.2, 0, 100);
  const away = Number(profile.lifestyle.hoursAway);
  const separationRisk = ["Joyful Sparks", "Fiery Dynamos"].includes(dog.cluster);
  const aloneScore = separationRisk
    ? clamp(100 - Math.max(0, away - 4) * 18, 20, 100)
    : clamp(100 - Math.max(0, away - 8) * 10, 45, 100);
  const lifestyleScore = Math.round(exerciseScore * 0.62 + aloneScore * 0.38);

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
    mbti: mbti.type,
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

export function getMatches(dogs, profile) {
  return dogs
    .filter((dog) => dog.status === "available")
    .map((dog) => scoreDog(dog, profile))
    .sort((a, b) => b.score - a.score);
}
