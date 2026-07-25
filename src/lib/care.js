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
// Emotion Scan — hybrid analyser.
// Real on-device object detection (src/lib/vision.js) decides WHAT is in the
// photo (dog / person / other / nothing) and how much of the dog is visible.
// The emotional read itself is still a demo: signals are drawn only from body
// parts the detector confirmed are in frame. Swap pickMood() for a real
// behaviour-model endpoint to go beyond the demo.
// ---------------------------------------------------------------------------

// Each signal is tagged with the body region it describes so partial photos
// (e.g. face-only close-ups, tail out of frame) never cite invisible parts.
export const SCAN_RESULTS = [
  {
    mood: "Relaxed",
    confidence: "moderate",
    signals: [
      { part: "face", text: "Soft, open mouth" },
      { part: "face", text: "Neutral ear position" },
      { part: "body", text: "Loose body posture" },
      { part: "tail", text: "Tail at rest" },
    ],
    explanation:
      "CUB noticed signals that may suggest Lily is at ease — a loose posture and soft face usually accompany a comfortable dog.",
    steps: [
      "A calm moment is a great time for gentle handling practice or a cuddle.",
      "Keep the environment predictable — this is her baseline to return to.",
    ],
    vetFlag: false,
  },
  {
    mood: "Playful",
    confidence: "moderate",
    signals: [
      { part: "body", text: "Play-bow posture" },
      { part: "face", text: "Wide relaxed mouth" },
      { part: "body", text: "Bouncy weight shifts" },
      { part: "tail", text: "Tail mid-height, sweeping" },
    ],
    explanation:
      "CUB noticed signals that may suggest an invitation to play — bouncy, loose movement is how dogs signal friendly intent.",
    steps: [
      "Offer a game of fetch or tug for 10–15 minutes.",
      "End the game before she tires completely to keep it positive.",
    ],
    vetFlag: false,
  },
  {
    mood: "Alert",
    confidence: "low",
    signals: [
      { part: "face", text: "Ears forward" },
      { part: "body", text: "Weight shifted ahead" },
      { part: "face", text: "Closed mouth" },
      { part: "face", text: "Fixed gaze" },
    ],
    explanation:
      "CUB noticed signals that may suggest focused attention on something in the environment. Alertness is normal, but frequent intense fixation can build stress.",
    steps: [
      "Follow her gaze — identify what she is tracking.",
      "Use a cheerful recall or treat scatter to break long fixation.",
      "Note what triggers this in the care log if it repeats.",
    ],
    vetFlag: false,
  },
  {
    mood: "Anxious",
    confidence: "low",
    signals: [
      { part: "face", text: "Ears pulled back" },
      { part: "face", text: "Lip licking" },
      { part: "tail", text: "Lowered tail" },
      { part: "body", text: "Weight shifted away" },
    ],
    explanation:
      "CUB noticed signals that may suggest unease. These body-language cues often appear when a dog wants more distance from something.",
    steps: [
      "Give her space from whatever she is avoiding — don't force an approach.",
      "Offer a familiar mat or crate as a safe retreat.",
      "If this appears often, a certified behaviourist can help build confidence.",
    ],
    vetFlag: false,
  },
  {
    mood: "Uncomfortable",
    confidence: "uncertain",
    signals: [
      { part: "face", text: "Tense facial muscles" },
      { part: "body", text: "Stiff posture" },
      { part: "body", text: "Repeated position shifts" },
      { part: "tail", text: "Tucked tail" },
    ],
    explanation:
      "CUB noticed signals that may suggest physical discomfort rather than an emotion. Stiffness and restlessness sometimes accompany pain.",
    steps: [
      "Watch for limping, guarding a body part, or appetite changes today.",
      "Avoid strenuous exercise until she moves freely again.",
    ],
    vetFlag: true,
  },
  {
    mood: "Tired",
    confidence: "moderate",
    signals: [
      { part: "face", text: "Heavy eyelids" },
      { part: "face", text: "Slow responses" },
      { part: "body", text: "Seeking rest spots" },
      { part: "body", text: "Long settled posture" },
    ],
    explanation:
      "CUB noticed signals that may suggest Lily needs rest — normal after exercise, but worth watching if it seems out of proportion to her day.",
    steps: [
      "Let her rest somewhere cool and quiet.",
      "If low energy persists into tomorrow with reduced appetite, check in with your vet.",
    ],
    vetFlag: false,
  },
];

const CONFIDENCE_DOWNGRADE = { moderate: "low", low: "uncertain", uncertain: "uncertain" };

// Deterministic demo pick so the same image gives the same mood.
async function hashBlob(imageBlob) {
  const buffer = await imageBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hash = 0;
  const step = Math.max(1, Math.floor(bytes.length / 512));
  for (let i = 0; i < bytes.length; i += step) hash = (hash * 31 + bytes[i]) >>> 0;
  return hash;
}

function buildDogResult(base, framing) {
  const partial = framing?.partial ?? false;
  const weakDetection = framing ? framing.score < 0.6 : false;
  const visibleParts = partial ? new Set(["face", "body"]) : new Set(["face", "body", "tail"]);
  const signals = base.signals
    .filter((signal) => visibleParts.has(signal.part))
    .map((signal) => signal.text);

  let confidence = base.confidence;
  if (partial || weakDetection) confidence = CONFIDENCE_DOWNGRADE[confidence];

  const notes = [];
  if (partial) {
    notes.push(
      "Only part of the body is in frame, so tail and full-posture signals were not assessed. A photo showing the whole dog gives a fuller read.",
    );
  }
  if (weakDetection) {
    notes.push("The dog was hard to make out in this photo — better lighting or a closer shot would help.");
  }

  return { kind: "dog", ...base, signals, confidence, notes };
}

export async function analyzeDogImage(imageBlob) {
  const started = Date.now();
  // Keep the scanning animation on screen long enough to read, even when
  // detection is fast; the first scan is slower while the model downloads.
  const minDelay = async () => {
    const remaining = 2200 - (Date.now() - started);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  };

  let detection = null;
  try {
    const { detectSubjects, assessDogFraming } = await import("./vision.js");
    const subjects = await detectSubjects(imageBlob);
    detection = { subjects, assessDogFraming };
  } catch {
    // Model failed to load (e.g. offline) — fall back to the pure demo pick,
    // clearly labelled for the user.
    const hash = await hashBlob(imageBlob);
    await minDelay();
    const base = SCAN_RESULTS[hash % SCAN_RESULTS.length];
    const result = buildDogResult(base, null);
    result.notes = ["The on-device detection model couldn't load, so this is an unverified demo read."];
    return result;
  }

  const { subjects, assessDogFraming } = detection;
  await minDelay();

  if (!subjects.dog) {
    if (subjects.person) {
      return {
        kind: "person",
        message: "That looks like a person, not a dog.",
        detail:
          "CUB reads canine body language only — human expressions work quite differently. Point the camera at Lily and try again.",
      };
    }
    if (subjects.otherAnimal) {
      return {
        kind: "other-animal",
        message: `That looks like a ${subjects.otherAnimal.class}, not a dog.`,
        detail: "CUB's body-language guide is dog-specific, so it can't read this friend. Try a photo of Lily instead.",
      };
    }
    return {
      kind: "none",
      message: "CUB couldn't find a dog in this photo.",
      detail:
        "Try a clearer, closer shot with good lighting — ideally with Lily's face and body visible and not too far from the camera.",
    };
  }

  const framing = assessDogFraming(subjects.dog, subjects.imageWidth, subjects.imageHeight);
  const hash = await hashBlob(imageBlob);
  const base = SCAN_RESULTS[hash % SCAN_RESULTS.length];
  const result = buildDogResult(base, framing);
  if (subjects.person) {
    result.notes.push("A person is also in frame — signals were read from the dog only.");
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
