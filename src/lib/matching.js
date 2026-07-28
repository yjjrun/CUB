// Matching model, ported unchanged from the original vanilla implementation.
// Pure functions: they take a profile/dogs and return results (no shared state).

import { breedPersonalityCluster } from "./breeds.js";
import { elevation, positionOf, scaleDemand } from "./factorNorms.js";

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const APP_LOGO = "/assets/favicon-cub-transparent.png";

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

/**
 * What this individual dog asks of an owner, on the same 0-10 scale as
 * CLUSTERS[].demand — but read from its own C-BARQ answers rather than looked
 * up from its cluster.
 *
 * Each factor is placed against the 80k-dog population (positionOf), so
 * "demanding" means demanding relative to real dogs. A dog with no
 * questionnaire falls back to its cluster's published demand.
 */
export function dogDemandVector(dog) {
  const f = dog.cbarqFactors;
  const cluster = CLUSTERS[dog.cluster] || CLUSTERS["Golden Hearts"];
  if (!f) return cluster.demand;

  const p = (key) => positionOf(key, f[key]);
  const calm = (key) => 1 - p(key);

  // Raw 0-1 composites, then rescaled against the population so the spread
  // survives the averaging (see DEMAND_NORMS).
  return {
    // How much activity and engagement the dog needs filled.
    stimulation: scaleDemand("stimulation",
      0.50 * p("energy") + 0.30 * p("excitability") + 0.20 * p("chasing")),
    // How much routine and predictability it needs to stay settled.
    structure: scaleDemand("structure",
      0.35 * p("separation") + 0.25 * p("excitability")
      + 0.25 * calm("trainability") + 0.15 * p("ownerAggression")),
    // How much patience and emotional care a nervous dog asks for.
    empathy: scaleDemand("empathy",
      0.30 * p("strangerFear") + 0.25 * p("nonsocialFear")
      + 0.25 * p("dogFear") + 0.20 * p("touchSensitivity")),
    // How much confident boundary-setting it needs.
    firmness: scaleDemand("firmness",
      0.30 * p("strangerAggression") + 0.30 * p("ownerAggression")
      + 0.25 * p("dogAggressionFear") + 0.15 * calm("trainability")),
  };
}

// Ceiling for an MBTI type that a cluster's published top-5 does not list.
// The published scores run 73-96, so unlisted types stay below that band:
// the research says they are not among this cluster's better fits, and the
// distance formula alone cannot express that.
const UNLISTED_AFFINITY_CAP = 70;

/**
 * Cluster-level affinity, taken from the published MBTI→cluster tables
 * (CLUSTERS[].top) rather than recomputed from distance.
 *
 * This matters more than it looks. Pure distance matching has a geometric
 * bias: Golden Hearts sits closest to the centre of the demand space (mean
 * distance 2.56 from every reachable owner vector, against 3.53 for Fiery
 * Dynamos), so it scored highest for almost every MBTI type — not because
 * anyone preferred it, but because "middling on everything" is never far from
 * anything. The published tables encode real preference and break that tie.
 */
function clusterAffinity(mbti, clusterName) {
  // Rank this cluster against the other six *for this owner*, rather than
  // taking the raw distance. Raw distance is dominated by how central a
  // cluster sits: Golden Hearts averages 2.56 from every reachable owner
  // vector against 3.53 for Fiery Dynamos, so it won for nearly every type.
  // Normalising per owner asks the useful question — of the seven profiles,
  // which suits *this* person best — and spreads the answer across the range.
  const names = Object.keys(CLUSTERS);
  const raw = names.map((name) => mbtiCompatibility(mbti, name));
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const own = mbtiCompatibility(mbti, clusterName);
  const ratio = max > min ? (own - min) / (max - min) : 0.5;
  // Floor at 45 so a poor personality fit still reads as a real score rather
  // than zero — MBTI is a preference signal, not a disqualifier.
  const relative = 45 + 55 * ratio;

  // The published top-5 tables are the study's own finding, so where they
  // cover this pairing they carry the majority of the cluster signal. They are
  // per-cluster lists though (ENTP, ISTP and INTP appear in none of them), so
  // they inform the score rather than replace it.
  const published = CLUSTERS[clusterName]?.top?.[mbti.type];
  if (Number.isFinite(published)) return 0.6 * published + 0.4 * relative;
  return Math.min(relative, UNLISTED_AFFINITY_CAP + 15);
}

/**
 * Personality fit with THIS dog. Two signals:
 *
 *  - the published affinity between the adopter's MBTI type and the dog's
 *    behavioural cluster (the study's own finding), and
 *  - how this individual dog's C-BARQ profile compares to what the adopter
 *    can offer, which separates dogs inside the same cluster.
 *
 * The cluster supplies the dimension weights either way, since those encode
 * what matters most for that behavioural type.
 */
function dogCompatibility(mbti, dog) {
  const cluster = CLUSTERS[dog.cluster] || CLUSTERS["Golden Hearts"];
  const demand = dogDemandVector(dog);
  const owner = ownerVector(mbti.scores);
  let weightedDistance = 0;
  for (const key of Object.keys(demand)) {
    weightedDistance += cluster.weights[key] * Math.abs(owner[key] - demand[key]);
  }
  const individual = clamp(100 - 10 * weightedDistance, 0, 100);
  return Math.round(0.55 * clusterAffinity(mbti, dog.cluster) + 0.45 * individual);
}

const EXERCISE_TIERS = ["low", "moderate", "moderateHigh", "high"];
const targetMinutes = (need) => ({ low: 30, moderate: 70, moderateHigh: 85, high: 110 }[need] || 70);
const ownerExerciseTier = (minutes) => {
  const value = Number(minutes);
  if (value >= 105) return "high";
  if (value >= 80) return "moderateHigh";
  if (value >= 45) return "moderate";
  return "low";
};

function normaliseHomeFits(dog) {
  if (Array.isArray(dog.homeFits) && dog.homeFits.length) return dog.homeFits;
  if (dog.homeFit === "HDB flat") return ["HDB flat", "condominium", "landed house"];
  if (dog.homeFit === "condominium") return ["condominium", "landed house"];
  if (dog.homeFit === "landed house") return ["landed house"];
  return dog.hdbApproved ? ["HDB flat", "condominium", "landed house"] : ["condominium", "landed house"];
}

function normaliseExerciseFits(dog) {
  if (Array.isArray(dog.exerciseNeeds) && dog.exerciseNeeds.length) return dog.exerciseNeeds;
  const start = Math.max(0, EXERCISE_TIERS.indexOf(dog.exerciseNeed || "moderate"));
  return EXERCISE_TIERS.slice(start);
}

function experienceScore(experience, clusterName) {
  const level = { "first-time": 45, some: 70, experienced: 92 }[experience] || 55;
  if (["Fiery Dynamos", "Driven Guardians"].includes(clusterName)) return level;
  if (clusterName === "Cautious Companions") return Math.min(95, level + 8);
  return Math.min(100, level + 18);
}

// Each coat preference covers the range of words shelters actually write, and
// matches what the wizard promises the option means — picking "Golden" offers
// "Golden, yellow, or tan coats", so a dog listed as "Tan" has to count.
// Without this a literal substring match rejected every tan dog.
const COLOUR_GROUPS = {
  brown: ["brown", "chocolate", "liver", "brindle"],
  black: ["black"],
  white: ["white", "cream"],
  golden: ["golden", "gold", "yellow", "tan", "fawn", "sandy"],
};

/** Does this dog's coat satisfy the adopter's colour preference? */
export function colourMatches(dogColour, preference) {
  if (!preference) return true;
  const coat = String(dogColour || "").toLowerCase();
  if (!coat) return false;
  const words = COLOUR_GROUPS[preference.toLowerCase()] || [preference.toLowerCase()];
  return words.some((word) => coat.includes(word));
}

function preferenceFit(dog, preferences) {
  let score = 100;
  if (preferences.size !== "Any" && dog.size !== preferences.size) score -= 24;
  if (preferences.color && !colourMatches(dog.color, preferences.color)) score -= 34;
  if (preferences.breed && !dog.breed.toLowerCase().includes(preferences.breed.toLowerCase())) score -= 28;
  return clamp(score, 0, 100);
}

function careFitScore(dog, lifestyle) {
  const demanding = ["Fiery Dynamos", "Driven Guardians", "Cautious Companions"].includes(dog.cluster);
  const social = ["Joyful Sparks", "Golden Hearts", "Gentle Giants"].includes(dog.cluster);
  const commitmentScore = {
    weekly: demanding ? 58 : 82,
    "several times a week": demanding ? 78 : 92,
    daily: 98,
  }[lifestyle.trainingCommitment] || 82;

  let householdScore = 100;
  if (lifestyle.children === "yes") {
    if (["Fiery Dynamos", "Cautious Companions", "Gentle Wallflowers"].includes(dog.cluster)) householdScore -= 24;
    if (dog.size === "Large" && dog.cluster !== "Gentle Giants") householdScore -= 8;
  }
  if (lifestyle.otherPets === "yes") {
    if (["Fiery Dynamos", "Driven Guardians", "Cautious Companions"].includes(dog.cluster)) householdScore -= 22;
    if (social) householdScore += 6;
  }

  return Math.round(clamp(commitmentScore * 0.55 + householdScore * 0.45, 0, 100));
}

// How well this dog's own C-BARQ profile fits this household.
//
// The cluster label alone cannot separate two dogs that landed in the same
// group, so this reads the 13 factors directly. Each rule fires only when the
// dog is genuinely elevated on a factor *relative to the 80k-dog population*
// (see factorNorms.js) AND the household has the matching pressure. A dog at
// the population median costs nothing; one near the 90th percentile costs the
// full weight.
//
// Returns a 0-100 score plus the specific reasons, so results can explain
// themselves instead of just showing a number.
export function behaviourFit(dog, lifestyle) {
  const f = dog.cbarqFactors;
  if (!f) return { score: 100, reasons: [] };

  const away = Number(lifestyle.hoursAway) || 0;
  const minutes = Number(lifestyle.exerciseMinutes) || 0;
  const kids = lifestyle.children === "yes";
  const pets = lifestyle.otherPets === "yes";
  const busy = lifestyle.visitors === "often";
  const novice = lifestyle.experience === "first-time";
  const flat = lifestyle.homeType === "HDB flat";

  // [factor, household pressure 0-1, max penalty, reason]
  const rules = [
    ["separation", away >= 10 ? 1 : away >= 8 ? 0.7 : away >= 6 ? 0.35 : 0, 26,
      "struggles when left alone, and this household is out for long stretches"],
    ["energy", minutes < 30 ? 1 : minutes < 60 ? 0.6 : minutes < 90 ? 0.25 : 0, 24,
      "needs more daily exercise than this routine offers"],
    ["ownerAggression", kids ? 1 : novice ? 0.6 : 0.25, 30,
      "guards food or possessions, which needs careful management"],
    ["strangerFear", busy ? 1 : 0.3, 20,
      "finds unfamiliar people stressful, and this home sees frequent visitors"],
    ["strangerAggression", busy ? 0.9 : kids ? 0.7 : 0.3, 26,
      "reacts to unfamiliar people"],
    ["nonsocialFear", flat ? 0.8 : 0.4, 18,
      "is noise-sensitive, which is harder in a flat with lifts and corridors"],
    ["dogAggressionFear", pets ? 1 : 0.2, 28,
      "is reactive to other dogs, and there are already pets at home"],
    ["dogFear", pets ? 0.8 : 0.15, 18,
      "is fearful of other dogs, and there are already pets at home"],
    ["touchSensitivity", kids ? 0.9 : 0.25, 20,
      "dislikes being handled, which is a risk around children"],
    ["excitability", kids ? 0.6 : novice ? 0.4 : 0.15, 14,
      "is easily wound up"],
    ["chasing", pets ? 0.7 : 0.1, 14,
      "has a strong chase drive, worth noting with other pets around"],
  ];

  let penalty = 0;
  const reasons = [];
  for (const [factor, pressure, weight, reason] of rules) {
    if (!pressure) continue;
    const hit = elevation(factor, f[factor]) * pressure * weight;
    if (hit <= 0) continue;
    penalty += hit;
    // Only surface the ones a person would actually act on.
    if (hit >= weight * 0.35) reasons.push(reason);
  }

  // Low trainability is the one factor where *below* average is the problem.
  if (novice && Number.isFinite(f.trainability) && f.trainability < 2.2) {
    const hit = Math.min(1, (2.2 - f.trainability) / 1.2) * 16;
    penalty += hit;
    if (hit >= 6) reasons.push("takes more training patience than a first-time owner may expect");
  }

  return { score: Math.round(clamp(100 - penalty, 0, 100)), reasons };
}

export function scoreDog(dog, profile) {
  const mbti = computeMbti(profile);
  const exerciseFits = normaliseExerciseFits(dog);
  const ownerTier = ownerExerciseTier(profile.lifestyle.exerciseMinutes);
  const exerciseGap = Math.abs(Number(profile.lifestyle.exerciseMinutes) - targetMinutes(dog.exerciseNeed));
  const exerciseScore = exerciseFits.includes(ownerTier)
    ? 100
    : clamp(100 - exerciseGap * 1.2, 0, 100);
  const away = Number(profile.lifestyle.hoursAway);
  const separationRisk = ["Joyful Sparks", "Fiery Dynamos"].includes(dog.cluster);
  const aloneScore = separationRisk
    ? clamp(100 - Math.max(0, away - 4) * 18, 20, 100)
    : clamp(100 - Math.max(0, away - 8) * 10, 45, 100);
  const lifestyleScore = Math.round(exerciseScore * 0.62 + aloneScore * 0.38);

  const homeFits = normaliseHomeFits(dog);
  let housingScore = homeFits.includes(profile.lifestyle.homeType) ? 92 : 55;
  if (profile.lifestyle.homeType === "HDB flat" && !homeFits.includes("HDB flat")) housingScore = 35;
  if (profile.lifestyle.homeType === "landed house") housingScore = 96;
  if (dog.size === "Large" && profile.lifestyle.homeType === "HDB flat") housingScore -= 20;
  housingScore = clamp(housingScore, 0, 100);

  const expScore = experienceScore(profile.lifestyle.experience, dog.cluster);
  // Fit with this individual dog's own profile, not its cluster average.
  const behaviorPersonalityScore = dogCompatibility(mbti, dog);
  const breedCluster = breedPersonalityCluster(dog.breed);
  const breedPersonalityScore = breedCluster
    ? mbtiCompatibility(mbti, breedCluster)
    : behaviorPersonalityScore;
  const personalityScore = (0.85 * behaviorPersonalityScore) + (0.15 * breedPersonalityScore);
  const preferenceScore = preferenceFit(dog, profile.preferences);
  const careScore = careFitScore(dog, profile.lifestyle);
  const behaviour = behaviourFit(dog, profile.lifestyle);

  // Personality weight is split between the cluster-level MBTI fit and this
  // dog's own questionnaire. Without the second term, every dog sharing a
  // cluster, breed and size scores identically no matter how differently they
  // actually behave.
  // Stated preferences (size, coat colour, breed) carry more weight than they
  // did: at 0.06 a colour mismatch moved the total by about one point, so
  // choosing a colour had no visible effect on the ranking. Welfare terms
  // still dominate — a cosmetic preference should shuffle comparable dogs,
  // not outrank housing or behaviour fit.
  const base = (
    0.23 * lifestyleScore
    + 0.19 * housingScore
    + 0.11 * expScore
    + 0.19 * personalityScore
    + 0.16 * behaviour.score
    + 0.10 * preferenceScore
    + 0.02 * careScore
  );
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
  if (profile.lifestyle.homeType === "HDB flat" && !homeFits.includes("HDB flat")) {
    finalScore = Math.min(finalScore, 55);
    flags.push("Housing check needed for HDB suitability.");
  }
  if (profile.lifestyle.children === "yes" && ["Fiery Dynamos", "Cautious Companions"].includes(dog.cluster)) {
    finalScore = Math.min(finalScore, 72);
    flags.push("A calmer or adult-only home may be safer for this profile.");
  }
  if (profile.lifestyle.otherPets === "yes" && ["Fiery Dynamos", "Driven Guardians"].includes(dog.cluster)) {
    finalScore = Math.min(finalScore, 74);
    flags.push("Slow introductions or a single-pet home may be needed.");
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
      behaviour: behaviour.score,
      preference: Math.round(preferenceScore),
      care: Math.round(careScore),
    },
    behaviourReasons: behaviour.reasons,
    flags,
  };
}

export function getMatches(dogs, profile) {
  return dogs
    .filter((dog) => dog.status === "available")
    .map((dog) => scoreDog(dog, profile))
    .sort((a, b) => b.score - a.score);
}
