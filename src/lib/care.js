// CUB Care prototype data + mock logic.
//
// Everything user-specific in the /care prototype lives here so it can later
// be replaced by real user data and real model endpoints:
// - SAMPLE_DOG mirrors Lily, the dog featured on the homepage hero.
// - analyzeDogImage() uses real on-device object detection (src/lib/vision.js)
//   to verify a dog is in frame and how much of it is visible, but the
//   emotional read itself is still a demo — swap it for a behaviour-model
//   endpoint when one exists.
// - askCub() is a DEMO chatbot with scored canned answers — swap for a
//   server-side AI endpoint when one exists. Never put API keys here.

// ---------------------------------------------------------------------------
// Sample dog (from the homepage hero card) + placeholder care details
// ---------------------------------------------------------------------------

export const SAMPLE_DOG = {
  name: "Lily",
  breed: "Golden Retriever Mix",
  ageYears: 2,
  sex: "Female",
  weightKg: 24,
  location: "Singapore",
  photo: "/assets/lily-profile.png",
  cluster: "Golden Hearts",
  traits: { energy: 78, sociability: 88, trainability: 72 },
  adoptedVia: "CUB",
  profileCompletion: 80,
};

export const OWNER_NAME = "Jiarun";

// ---------------------------------------------------------------------------
// Daily care recommendations (personalised to Lily's breed/age/weight/energy)
// ---------------------------------------------------------------------------

export const CARE_CATEGORIES = [
  {
    id: "nutrition",
    label: "Nutrition",
    icon: "🍚",
    headline: "2 meals · about 280g today",
    detail:
      "For a 24kg active retriever mix, split roughly 280g of complete adult food into breakfast and dinner. Keep treats under 10% of daily calories.",
    stats: [
      { label: "Breakfast", value: "140g · 7:30am" },
      { label: "Dinner", value: "140g · 6:30pm" },
      { label: "Water", value: "~1.2L through the day" },
    ],
    tip: "Golden mixes gulp food — a slow-feeder bowl makes meals last longer and aids digestion.",
  },
  {
    id: "activity",
    label: "Physical activity",
    icon: "🐾",
    headline: "75 minutes of movement",
    detail:
      "Lily's energy is high (78/100) — aim for two walks plus one play session. Avoid the midday heat in Singapore; early morning and evening are kindest.",
    stats: [
      { label: "Morning walk", value: "30 min, sniff-friendly pace" },
      { label: "Evening walk", value: "30 min" },
      { label: "Play burst", value: "15 min fetch or tug" },
    ],
    tip: "Watch for heavy panting in humid weather — pause in shade and offer water.",
  },
  {
    id: "enrichment",
    label: "Mental enrichment",
    icon: "🧩",
    headline: "1 training + 1 game",
    detail:
      "High sociability and good trainability (72/100) mean Lily thrives on short training bursts and food puzzles rather than long drills.",
    stats: [
      { label: "Training", value: "10 min — 'stay' with distractions" },
      { label: "Game", value: "Snuffle mat or frozen KONG" },
      { label: "Social", value: "Calm greeting practice on walks" },
    ],
    tip: "Rotate toys every few days — novelty keeps a clever dog interested.",
  },
  {
    id: "health",
    label: "General health",
    icon: "🩺",
    headline: "Coat brush + tick check",
    detail:
      "Retriever coats in a tropical climate need brushing every other day, plus a quick tick check after grass walks. Ears and paws deserve a weekly look.",
    stats: [
      { label: "Brush", value: "5 min after evening walk" },
      { label: "Ticks", value: "Check after park visits" },
      { label: "Next vaccine", value: "Booster due 12 Aug" },
    ],
    tip: "Note anything unusual — appetite dips, limping, scratching — in the care log below.",
  },
];

// Today's interactive checklist (state persists in localStorage).
export const DAILY_TASKS = [
  { id: "meal-am", label: "Morning meal (140g)", time: "7:30am", icon: "🍚" },
  { id: "walk-am", label: "Morning walk (30 min)", time: "8:00am", icon: "🌅" },
  { id: "training", label: "Training: 'stay' with distractions", time: "12:00pm", icon: "🎓" },
  { id: "enrichment", label: "Enrichment: snuffle mat", time: "3:00pm", icon: "🧩" },
  { id: "meal-pm", label: "Evening meal (140g)", time: "6:30pm", icon: "🍛" },
  { id: "walk-pm", label: "Evening walk (30 min)", time: "7:00pm", icon: "🌆" },
  { id: "grooming", label: "Brush coat + tick check", time: "8:00pm", icon: "🪮" },
];

// Upcoming reminders (sample data; user-added ones are stored locally).
export const SAMPLE_REMINDERS = [
  { id: "r-vaccine", label: "DHPP booster vaccination", date: "2026-08-12", type: "Vet" },
  { id: "r-groom", label: "Full grooming session", date: "2026-08-02", type: "Grooming" },
  { id: "r-heartworm", label: "Heartworm prevention dose", date: "2026-07-25", type: "Medication" },
  { id: "r-food", label: "Food restock (12kg bag)", date: "2026-07-29", type: "Supplies" },
];

export const REMINDER_TYPES = ["Vet", "Grooming", "Medication", "Supplies", "Other"];

// Weekly insights (mock analytics for the summary strip).
export const WEEKLY_INSIGHTS = {
  weekLabel: "13–19 Jul",
  carePlanCompletion: 86,
  exercise: { done: 6, target: 7, minutes: 438 },
  meals: { done: 13, target: 14 },
  enrichment: { done: 5, target: 7 },
  moods: [
    { day: "Mon", mood: "Relaxed" },
    { day: "Tue", mood: "Playful" },
    { day: "Wed", mood: "Playful" },
    { day: "Thu", mood: "Alert" },
    { day: "Fri", mood: "Relaxed" },
    { day: "Sat", mood: "Playful" },
    { day: "Sun", mood: "Relaxed" },
  ],
};

// ---------------------------------------------------------------------------
// Emotion Scan — research-grounded hybrid analyser.
//
// Body-language interpretation follows Ferres, Schloesser & Gloor (2022),
// "Predicting Dog Emotions Based on Posture Analysis Using DeepLabCut",
// Future Internet 14(4), 97. https://doi.org/10.3390/fi14040097
//
// From that work we take:
// - The four emotion classes their model classifies: Anger, Fear, Happiness,
//   Relaxation (we add a non-emotion "Discomfort" flag for welfare reasons).
// - The posture archetypes and per-body-part characteristics in their Table 3.
// - Their finding that TAIL POSITION is the single most important predictor,
//   while ear position and back-leg condition contributed least.
// - Their reported accuracy of 60-70% (neural net 67.5%, decision tree 62.5%),
//   which caps how confident any read of this kind should ever sound.
// - Their dataset constraints: full-body images of non-puppy, undocked dogs
//   that are standing or sitting; keypoint detection degrades otherwise.
//
// What is real here: on-device object detection (src/lib/vision.js) verifies a
// dog is present and how much of it is in frame. What is still a demo: which
// emotion gets picked. Replacing pickPosture() with a DeepLabCut-style keypoint
// model would complete the pipeline — see RESEARCH_NOTE below.
// ---------------------------------------------------------------------------

export const RESEARCH_CITATION = {
  short: "Ferres, Schloesser & Gloor (2022), Future Internet 14(4), 97",
  title: "Predicting Dog Emotions Based on Posture Analysis Using DeepLabCut",
  url: "https://doi.org/10.3390/fi14040097",
  accuracyNote:
    "Published posture-based models reach 60-70% accuracy on four emotion classes — better than untrained humans, but far from certain.",
};

// Body regions in the order the research derives pose metrics from them.
// `weight` reflects each region's importance to the published classifier:
// tail position dominated their decision tree; ears and back legs were dropped.
export const POSE_REGIONS = {
  tail: { label: "Tail position", weight: 3 },
  weight: { label: "Body weight distribution", weight: 2 },
  head: { label: "Head position", weight: 2 },
  mouth: { label: "Mouth condition", weight: 2 },
  frontLegs: { label: "Front leg condition", weight: 1 },
  ears: { label: "Ear position", weight: 1 },
  backLegs: { label: "Back leg condition", weight: 1 },
};

// Which regions a photo can plausibly show. A head-and-shoulders shot cannot
// evidence tail or leg metrics, so those are never cited in the result.
const FRAMING_VISIBILITY = {
  full: ["tail", "weight", "head", "mouth", "frontLegs", "ears", "backLegs"],
  partial: ["head", "mouth", "ears", "frontLegs"],
  closeup: ["head", "mouth", "ears"],
};

// Posture archetypes from Table 3 of the paper, mapped to the emotion class
// the authors assign them. Signals quote the body-part characteristics the
// paper lists for that posture.
export const POSTURE_ARCHETYPES = [
  {
    posture: "Neutral",
    mood: "Relaxed",
    signals: [
      { region: "weight", text: "Weight evenly balanced, front and back end normal" },
      { region: "head", text: "Head carried up and level" },
      { region: "ears", text: "Ears up in a resting position" },
      { region: "tail", text: "Tail hanging down and still" },
      { region: "mouth", text: "Mouth open with tongue visible" },
    ],
    explanation:
      "CUB noticed signals that may suggest {name} is relaxed and approachable — the research describes this neutral posture as a dog unconcerned about its surroundings.",
    steps: [
      "A calm moment is a good time for gentle handling practice or a cuddle.",
      "Keep the environment predictable — this is her comfortable baseline.",
    ],
    vetFlag: false,
  },
  {
    posture: "Alarmed",
    mood: "Anger",
    moodLabel: "Alert",
    signals: [
      { region: "weight", text: "Weight shifted forward, body still" },
      { region: "head", text: "Head raised and oriented at something" },
      { region: "ears", text: "Ears up and pointed forward" },
      { region: "tail", text: "Tail held horizontal" },
      { region: "mouth", text: "Mouth only slightly open" },
    ],
    explanation:
      "CUB noticed signals that may suggest {name} is alert — the research describes this as an aroused, attentive state that usually precedes investigating something.",
    steps: [
      "Follow her gaze to identify what she is tracking.",
      "Use a cheerful recall or a treat scatter to break long fixation.",
      "Note the trigger in her care log if this repeats.",
    ],
    vetFlag: false,
  },
  {
    posture: "Dominant aggressive",
    mood: "Anger",
    moodLabel: "Agitated",
    signals: [
      { region: "weight", text: "Front and back end strongly upright, weight forward" },
      { region: "head", text: "Head held high" },
      { region: "ears", text: "Ears up and forward" },
      { region: "tail", text: "Tail raised high" },
      { region: "mouth", text: "Mouth open with teeth visible" },
    ],
    explanation:
      "CUB noticed signals that may suggest {name} is standing her ground. In the research this upright, forward posture communicates that a challenge would be met rather than avoided.",
    steps: [
      "Give her space and calmly increase distance from whatever she is facing.",
      "Do not punish growling or stiffening — those warnings are useful information.",
      "Repeated episodes are worth a certified behaviourist's input.",
    ],
    vetFlag: false,
  },
  {
    posture: "Defensive aggressive",
    mood: "Fear",
    moodLabel: "Fearful",
    signals: [
      { region: "weight", text: "Front end lowered, back end strongly lowered" },
      { region: "head", text: "Head lowered" },
      { region: "ears", text: "Ears down and pulled back" },
      { region: "tail", text: "Tail down and tucked" },
      { region: "mouth", text: "Mouth closed and tense" },
    ],
    explanation:
      "CUB noticed signals that may suggest fear rather than confidence — the research classes this lowered, tucked posture as fear-motivated, and a frightened dog may still snap if cornered.",
    steps: [
      "Increase distance from the trigger; never force an approach.",
      "Offer a familiar mat or crate as a retreat and let her choose it.",
      "If this appears often, a certified behaviourist can help build confidence.",
    ],
    vetFlag: false,
  },
  {
    posture: "Active submissive",
    mood: "Fear",
    moodLabel: "Anxious",
    signals: [
      { region: "weight", text: "Front and back end lowered, weight shifted away" },
      { region: "head", text: "Head lowered" },
      { region: "ears", text: "Ears flat and back against the head" },
      { region: "tail", text: "Tail carried low" },
      { region: "mouth", text: "Mouth closed" },
    ],
    explanation:
      "CUB noticed signals that may suggest {name} is worried and offering appeasement — the research describes this as weak signals of submission from a fearful dog.",
    steps: [
      "Lower the pressure: turn side-on, soften your voice, and let her approach you.",
      "Reward any voluntary approach with calm praise rather than reaching for her.",
      "Track what preceded this in her care log — patterns matter more than moments.",
    ],
    vetFlag: false,
  },
  {
    posture: "Playful (play bow)",
    mood: "Happiness",
    moodLabel: "Playful",
    signals: [
      { region: "weight", text: "Front end strongly lowered with back end normal — a play bow" },
      { region: "head", text: "Head moving rather than fixed" },
      { region: "ears", text: "Ears up" },
      { region: "tail", text: "Tail up and moving" },
      { region: "mouth", text: "Mouth open with tongue visible" },
    ],
    explanation:
      "CUB noticed signals that may suggest an invitation to play — the play bow is the clearest good-mood signal in the research, and the posture their model most associates with happiness.",
    steps: [
      "Take her up on it: 10-15 minutes of fetch or tug.",
      "End the game while she still wants more, so play stays rewarding.",
    ],
    vetFlag: false,
  },
  {
    // Not one of the four research emotion classes — a welfare flag we surface
    // because physical discomfort can be mistaken for a mood.
    posture: "Guarded / tense",
    mood: "Discomfort",
    moodLabel: "Uncomfortable",
    researchClass: false,
    signals: [
      { region: "weight", text: "Weight shifted off one side, posture stiff" },
      { region: "head", text: "Head low and still" },
      { region: "mouth", text: "Tense mouth, repeated lip licking" },
      { region: "frontLegs", text: "Legs braced rather than loose" },
      { region: "tail", text: "Tail held tight to the body" },
    ],
    explanation:
      "CUB noticed signals that may suggest physical discomfort rather than an emotion. Stiffness, guarding and a tight posture can accompany pain, and pain is often mistaken for a mood.",
    steps: [
      "Watch for limping, reluctance on stairs, or appetite changes today.",
      "Skip strenuous exercise until she moves freely again.",
      "Note when it started — that timeline is the first thing a vet will ask for.",
    ],
    vetFlag: true,
  },
];

// Backwards-compatible export for anything still reading the old shape.
export const SCAN_RESULTS = POSTURE_ARCHETYPES;

const CONFIDENCE_ORDER = ["uncertain", "low", "moderate"];
const stepDown = (level, by = 1) =>
  CONFIDENCE_ORDER[Math.max(0, CONFIDENCE_ORDER.indexOf(level) - by)];

// Deterministic demo pick so the same photo always gives the same posture.
async function hashBlob(imageBlob) {
  const buffer = await imageBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hash = 0;
  const step = Math.max(1, Math.floor(bytes.length / 512));
  for (let i = 0; i < bytes.length; i += step) hash = (hash * 31 + bytes[i]) >>> 0;
  return hash;
}

function pickPosture(hash) {
  return POSTURE_ARCHETYPES[hash % POSTURE_ARCHETYPES.length];
}

function framingKind(framing) {
  if (!framing) return "full";
  if (framing.coverage > 0.82) return "closeup";
  return framing.partial ? "partial" : "full";
}

function buildDogResult(base, framing, dogName) {
  const kind = framingKind(framing);
  const visible = new Set(FRAMING_VISIBILITY[kind]);
  const signals = base.signals.filter((signal) => visible.has(signal.region));

  // Evidence weight actually observed, against the full-body maximum. The
  // research weights tail position highest, so a photo without the tail can
  // never reach high confidence.
  const totalWeight = base.signals.reduce((sum, s) => sum + POSE_REGIONS[s.region].weight, 0);
  const seenWeight = signals.reduce((sum, s) => sum + POSE_REGIONS[s.region].weight, 0);
  const evidence = totalWeight ? seenWeight / totalWeight : 0;

  // Ceiling starts at "moderate": the published models top out at ~67%
  // accuracy, so nothing here should ever read as high confidence.
  let confidence = "moderate";
  if (evidence < 0.75) confidence = stepDown(confidence);
  if (evidence < 0.45) confidence = stepDown(confidence);
  if (framing && framing.score < 0.6) confidence = stepDown(confidence);

  const notes = [];
  if (kind === "closeup") {
    notes.push(
      `Close-up framing: ${dogName}'s tail and stance aren't visible, and tail position is the strongest single predictor in the research — so this read rests on face signals alone.`,
    );
  } else if (kind === "partial") {
    notes.push(
      "Part of the body is outside the frame, so tail and weight-distribution signals were not assessed. A full-body photo gives a much stronger read.",
    );
  }
  if (framing && framing.score < 0.6) {
    notes.push("The dog was hard to make out — better lighting or a closer shot would help.");
  }
  notes.push(
    "Posture reads are most reliable when a dog is standing or sitting; lying-down and mid-motion shots are harder to interpret.",
  );

  return {
    kind: "dog",
    ...base,
    mood: base.moodLabel || base.mood,
    researchMood: base.researchClass === false ? null : base.mood,
    explanation: base.explanation.replace(/\{name\}/g, dogName),
    signals: signals.map((signal) => ({ ...signal, label: POSE_REGIONS[signal.region].label })),
    confidence,
    evidence,
    notes,
  };
}

export async function analyzeDogImage(imageBlob, dogName = SAMPLE_DOG.name) {
  const started = Date.now();
  // Keep the scanning animation on screen long enough to read, even when
  // detection is fast; the first scan is slower while the model downloads.
  const minDelay = async () => {
    const remaining = 2200 - (Date.now() - started);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  };

  let subjects = null;
  let assessDogFraming = null;
  try {
    const vision = await import("./vision.js");
    subjects = await vision.detectSubjects(imageBlob);
    assessDogFraming = vision.assessDogFraming;
  } catch {
    // Model failed to load (e.g. offline) — fall back to the demo read,
    // clearly labelled so it is never mistaken for a verified result.
    const hash = await hashBlob(imageBlob);
    await minDelay();
    const result = buildDogResult(pickPosture(hash), null, dogName);
    result.confidence = "uncertain";
    result.notes = ["The on-device detection model couldn't load, so nothing in this photo was verified — treat this as a demo read only."];
    return result;
  }

  await minDelay();

  if (!subjects.dog) {
    if (subjects.person) {
      return {
        kind: "person",
        message: "That looks like a person, not a dog.",
        detail:
          "CUB reads canine posture only. The research this is built on models dog body language specifically — human expressions work differently and would not be interpreted correctly. Point the camera at your dog and try again.",
      };
    }
    if (subjects.otherAnimal) {
      return {
        kind: "other-animal",
        message: `That looks like a ${subjects.otherAnimal.class}, not a dog.`,
        detail: "CUB's posture guide is dog-specific, so it can't read this friend. Try a photo of your dog instead.",
      };
    }
    return {
      kind: "none",
      message: "CUB couldn't find a dog in this photo.",
      detail:
        "Try a clearer, well-lit shot. The posture research works best on a standing or sitting dog with the whole body in frame.",
    };
  }

  const framing = assessDogFraming(subjects.dog, subjects.imageWidth, subjects.imageHeight);
  const hash = await hashBlob(imageBlob);
  const result = buildDogResult(pickPosture(hash), framing, dogName);
  if (subjects.person) {
    result.notes.push("A person is also in frame — posture signals were read from the dog only.");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Ask CUB — DEMO chatbot with branching canned answers.
// ---------------------------------------------------------------------------

export const STARTER_QUESTIONS = [
  "Why is Lily pacing at night?",
  "How much exercise does Lily need?",
  "Why is Lily refusing food?",
  "What enrichment activity should we try today?",
  "Does this behaviour need a vet?",
];

// Each topic lists strong keywords (clearly about this topic) and weak ones
// (supporting context). A reply is only used when the scored match is solid;
// otherwise the bot admits it doesn't know rather than guessing.
const CHAT_RESPONSES = [
  {
    strong: ["pacing", "pace", "paces", "restless", "settle", "cant sleep", "wont sleep", "wandering"],
    weak: ["night", "sleep", "evening", "bed", "bedtime", "awake"],
    reply:
      "Night pacing in a young dog like Lily usually comes down to one of a few things:\n\n" +
      "• Unspent energy — at 2 years old with high energy (78/100), a day light on exercise often shows up at night.\n" +
      "• Needing the toilet — especially if dinner or water moved later.\n" +
      "• Something new in the environment — sounds, smells, or furniture changes can unsettle a dog for a few nights.\n\n" +
      "What to observe: does she settle after a toilet break? Is the pacing every night or only some nights? Any circling, whining, or appetite change alongside it?\n\n" +
      "Safe things to try: add 15–20 minutes to her evening walk, finish dinner by 7pm, and give her a frozen KONG about an hour before bed to encourage settling.\n\n" +
      "⚠ See a vet if pacing comes with panting at rest, whining, disorientation, or it starts suddenly and persists — restlessness can occasionally signal pain or digestive discomfort.",
  },
  {
    strong: ["exercise", "walk", "walks", "walking", "zoomies", "hyper", "run", "running"],
    weak: ["energy", "active", "tired", "tire", "minutes", "daily", "enough"],
    reply:
      "For Lily — a 2-year-old, 24kg retriever mix with high energy — a good daily target is about 75 minutes of movement:\n\n" +
      "• 30-minute morning walk (let her sniff — it's mental work too)\n" +
      "• 30-minute evening walk\n" +
      "• 15 minutes of fetch, tug, or swimming\n\n" +
      "In Singapore's heat, keep the midday hours for rest and walk in the early morning or after sunset. Watch for heavy panting, slowing down, or seeking shade — those mean it's time for water and a break.\n\n" +
      "Her care plan already includes both walks and a play burst — ticking them off daily is exactly the right rhythm. If she still has zoomies at 10pm, add 10 minutes of training before bed; thinking tires dogs as much as running.",
  },
  {
    strong: ["refusing food", "not eating", "wont eat", "won't eat", "refuses", "appetite", "skipping meals", "picky", "feed", "feeding", "diet", "how much food", "portion"],
    weak: ["food", "eat", "eating", "meal", "meals", "hungry", "kibble", "bowl", "dinner", "breakfast", "grams"],
    reply:
      "A skipped meal now and then is common; a pattern is worth attention. For Lily, work through this order:\n\n" +
      "1. Rule out treats — if she had chews or table scraps today, mild refusal is often just calories already met.\n" +
      "2. Check the food — kibble goes stale in humid Singapore air within weeks of opening. Smell it; store it sealed.\n" +
      "3. Check the context — heat, a stressful event, or a change of feeding spot can suppress appetite for a day.\n\n" +
      "What to observe: is she drinking? Energetic otherwise? Any vomiting, soft stool, or lip licking near the bowl?\n\n" +
      "Safe things to try: offer the same food again after 15 minutes, then remove it until the next meal — grazing weakens appetite rhythm. A splash of warm water on kibble boosts aroma.\n\n" +
      "⚠ See a vet if she refuses food for more than 24 hours, or refusal comes with vomiting, lethargy, or drooling — those need professional eyes promptly.",
  },
  {
    strong: ["enrichment", "bored", "boredom", "puzzle", "mental stimulation", "activity today", "games"],
    weak: ["game", "toy", "toys", "play", "mental", "activity", "stimulation", "try", "fun"],
    reply:
      "Great instinct — enrichment is where Lily's profile really shines (sociability 88/100, trainability 72/100). Today's suggestion:\n\n" +
      "🧩 Scatter feeding upgrade: measure out part of her dinner, scatter it in the grass or a snuffle mat, and let her hunt. Ten minutes of sniffing is roughly as tiring as a 30-minute walk.\n\n" +
      "Other rotations that suit her:\n" +
      "• Frozen KONG with soaked kibble (great for hot afternoons)\n" +
      "• 'Find it' with a favourite toy hidden around the room\n" +
      "• Two-minute trick sessions — spin, touch, middle — kept short and upbeat\n" +
      "• A calm café or park visit for people-watching (she's very social)\n\n" +
      "I've noted a snuffle-mat session in today's care plan — tick it off when you're done!",
  },
  {
    strong: ["vet", "veterinarian", "emergency", "sick", "limping", "limp", "vomiting", "vomit", "diarrhoea", "diarrhea", "bleeding", "pain", "injured", "hurt"],
    weak: ["ill", "worry", "worried", "concern", "concerning", "serious", "clinic", "symptom", "symptoms", "behaviour require", "behavior require"],
    reply:
      "Good question to ask early. As a general guide for Lily:\n\n" +
      "See a vet the same day for: repeated vomiting or diarrhoea, refusing water, limping that doesn't improve with rest, laboured breathing, a swollen abdomen, or sudden behaviour change (hiding, snapping, disorientation).\n\n" +
      "Book a normal appointment for: appetite dips beyond 24 hours, recurring ear scratching or head shaking, new lumps, persistent scooting, or gradual weight change.\n\n" +
      "Monitor at home for: one skipped meal, a single soft stool with normal energy, or mild post-exercise stiffness that resolves overnight.\n\n" +
      "Trust your read of her baseline — you know Lily's normal better than anyone. If something feels off even without a clear symptom, a vet call costs little and settles the question.\n\n" +
      "⚠ CUB gives general guidance only and can't diagnose — when in doubt, always choose the vet.",
  },
  {
    strong: ["grooming", "groom", "brush", "brushing", "shedding", "bath", "bathe", "nails", "nail"],
    weak: ["coat", "shed", "fur", "hair", "smell", "clean"],
    reply:
      "Lily's retriever-mix coat in a tropical climate does best with:\n\n" +
      "• Brushing every other day (5 minutes with a slicker brush after the evening walk — it's already in her care plan)\n" +
      "• A bath every 3–4 weeks with dog shampoo — more often strips coat oils\n" +
      "• A tick check after grassy walks: run fingers against the fur around ears, armpits, and between toes\n" +
      "• Nail trim roughly monthly — if you hear clicking on the floor, they're due\n\n" +
      "Shedding will spike a couple of times a year; daily brushing during those weeks keeps your sofa (mostly) fur-free. If you see redness, flaking, or she scratches one spot persistently, that's a vet-visit item rather than a grooming one.",
  },
  {
    strong: ["barking", "barks", "bark", "howling", "howls", "whining", "whines", "noisy", "vocal"],
    weak: ["loud", "noise", "neighbours", "neighbors", "doorbell", "night", "stop"],
    reply:
      "Barking is communication — the fix depends on what Lily is saying. The common patterns:\n\n" +
      "• Alert barking (doorbell, corridor sounds): normal for a social dog in an apartment. Teach a 'thank you, done' cue — acknowledge, reward silence.\n" +
      "• Demand barking (at you, for play or food): don't reward it, even with eye contact; reward quiet instead. It gets briefly worse before it stops — hold the line.\n" +
      "• Boredom barking (alone, repetitive): more morning exercise and a food puzzle before you leave usually shrinks it.\n" +
      "• Distress barking (only when alone, with pacing or scratching at doors): this is separation-related — worth a structured alone-time training plan.\n\n" +
      "What to observe: when does it happen, what's she facing, and does she settle after? A short video helps a lot.\n\n" +
      "⚠ Sudden new vocalising with restlessness or when touched can signal pain — that's a vet visit, not training.",
  },
  {
    strong: ["chewing", "chew", "chews", "destroy", "destroyed", "destructive", "biting furniture", "bite furniture", "nipping", "mouthing"],
    weak: ["furniture", "shoes", "sofa", "table", "bite", "teeth", "puppy"],
    reply:
      "Chewing at 2 years old is usually energy or boredom rather than teething. For Lily:\n\n" +
      "• Manage first: put irresistibles (shoes, cables) out of reach while you retrain habits.\n" +
      "• Give a legal outlet: rotate 2–3 proper chews (rubber KONG, coffee-wood, bully stick) — retrievers are mouthy by design and need to chew something.\n" +
      "• Trade, don't chase: swap the forbidden item for a treat or toy calmly; chasing turns it into a brilliant game.\n" +
      "• Check the day's balance: destructive chewing that happens mostly when she's alone or under-exercised points to boredom — add a walk or puzzle feeder.\n\n" +
      "Nipping at hands during play: freeze, go boring for 10 seconds, resume with a toy between you.\n\n" +
      "⚠ If she swallows pieces of objects, watch for vomiting or lethargy and call your vet — blockages are serious.",
  },
  {
    strong: ["toilet", "potty", "pee", "peeing", "urinating", "urinates", "accidents", "poop", "pooping", "housebreaking", "house training", "marking"],
    weak: ["inside", "home", "carpet", "floor", "training"],
    reply:
      "Toilet accidents in an adult dog like Lily usually have one of three causes:\n\n" +
      "1. Routine change — new home, new schedule, or reduced walk frequency. Re-run puppy rules for a week: out first thing, after meals, after naps, big praise outside.\n" +
      "2. Incomplete house training that was masked by a previous routine — same fix, plus supervise indoors and clean accidents with an enzymatic cleaner (regular cleaner leaves a scent invitation).\n" +
      "3. Medical — urinary tract infections are common in females and often look like sudden 'forgetting'. Small frequent puddles, straining, or licking after peeing all point this way.\n\n" +
      "What to observe: frequency, amount, where it happens, and whether she signals to go out.\n\n" +
      "⚠ If accidents appeared suddenly after months of reliability, or you see straining or blood, see a vet promptly — rule out infection before training harder.",
  },
];

const CHAT_TOPIC_MENU =
  "night pacing and settling, exercise needs, food refusal, enrichment ideas, barking, chewing, toilet accidents, grooming, and when to see a vet";

const CHAT_FALLBACK =
  "I'm not confident I understood that one, and I'd rather say so than guess wrong. In this prototype I can help with: " +
  CHAT_TOPIC_MENU + ".\n\n" +
  "For anything else, a good general approach for Lily:\n" +
  "• Compare against her baseline — appetite, energy, sleep, and toilet habits are the big four.\n" +
  "• Change one thing at a time when trying a fix, so you can tell what helped.\n\n" +
  "And remember: CUB offers general guidance, not veterinary advice.";

const GREETING_RE = /^\s*(hi|hihi|hello|hey|yo|good (morning|afternoon|evening)|thanks|thank you|ty)[!. ]*$/i;

function scoreTopic(topic, text) {
  let score = 0;
  for (const phrase of topic.strong) {
    if (text.includes(phrase)) score += 3;
  }
  for (const phrase of topic.weak) {
    if (text.includes(phrase)) score += 1;
  }
  return score;
}

// Ask the server-side LLM endpoint. The API key lives only on the server
// (CUB_ANTHROPIC_API_KEY); when it isn't configured the endpoint reports
// "demo" and we fall back to the prepared answers below.
let aiAvailable = true;

export async function askCubAI(message, dog, history) {
  if (!aiAvailable) return null;
  try {
    const response = await fetch("/api/care/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message, dog, history }),
    });
    if (response.status === 503) {
      // Not configured — stop retrying for this page load.
      aiAvailable = false;
      return null;
    }
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.reply || null;
  } catch {
    return null;
  }
}

// Demo chatbot: scored keyword matching over prepared topics. A topic only
// wins with a clear signal (a strong keyword, or several weak ones); anything
// ambiguous gets an honest "not sure" instead of a wrong guess.
export async function askCub(message) {
  const text = message.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

  let reply;
  if (GREETING_RE.test(message.trim())) {
    reply =
      `Hello! Happy to help with ${SAMPLE_DOG.name}. I know her profile well — ask me about ` +
      CHAT_TOPIC_MENU + ", or tap a suggestion below.";
  } else {
    let best = null;
    let bestScore = 0;
    let secondScore = 0;
    for (const topic of CHAT_RESPONSES) {
      const score = scoreTopic(topic, text);
      if (score > bestScore) {
        secondScore = bestScore;
        best = topic;
        bestScore = score;
      } else if (score > secondScore) {
        secondScore = score;
      }
    }
    // Answer on a strong keyword hit (>=3), or on two weak hits when no other
    // topic is competing — anything more ambiguous gets the honest fallback.
    const confident = bestScore >= 3 || (bestScore >= 2 && bestScore - secondScore >= 2);
    reply = best && confident ? best.reply : CHAT_FALLBACK;
  }

  const delay = 900 + Math.min(1800, reply.length * 3);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return reply;
}

// ---------------------------------------------------------------------------
// Local persistence (prototype only — swap for real user accounts later)
// ---------------------------------------------------------------------------

const STORE_PREFIX = "cub-care:v1:";

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — prototype degrades to in-memory state.
  }
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Checklist completion is keyed by date so it naturally resets each morning.
export function loadChecklist() {
  return readStore(`checklist:${todayKey()}`, {});
}

export function saveChecklist(state) {
  writeStore(`checklist:${todayKey()}`, state);
}

export function loadReminders() {
  return readStore("reminders", []);
}

export function saveReminders(reminders) {
  writeStore("reminders", reminders);
}

export function loadScanHistory() {
  return readStore("scans", []);
}

export function saveScanHistory(history) {
  writeStore("scans", history.slice(0, 20));
}
