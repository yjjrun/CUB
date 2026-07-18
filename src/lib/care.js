// CUB Care prototype data + mock logic.
//
// Everything user-specific in the /care prototype lives here so it can later
// be replaced by real user data and real model endpoints:
// - SAMPLE_DOG mirrors Lily, the dog featured on the homepage hero.
// - analyzeDogImage() is a DEMO analyser (no real computer vision) — swap its
//   body for a fetch() to a model endpoint when one exists.
// - askCub() is a DEMO chatbot with branching canned answers — swap for a
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
// Emotion Scan — DEMO analyser only (no real computer vision).
// Replace analyzeDogImage() with a real model endpoint to go beyond the demo.
// ---------------------------------------------------------------------------

export const SCAN_RESULTS = [
  {
    mood: "Relaxed",
    confidence: "moderate",
    signals: ["Soft, open mouth", "Neutral ear position", "Loose body posture", "Tail at rest"],
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
    signals: ["Play-bow posture", "Wide relaxed mouth", "Bouncy weight shifts", "Tail mid-height, sweeping"],
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
    signals: ["Ears forward", "Weight shifted ahead", "Closed mouth", "Fixed gaze"],
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
    signals: ["Ears pulled back", "Lip licking", "Lowered tail", "Weight shifted away"],
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
    signals: ["Tense facial muscles", "Stiff posture", "Repeated position shifts", "Tucked tail"],
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
    signals: ["Heavy eyelids", "Slow responses", "Seeking rest spots", "Long settled posture"],
    explanation:
      "CUB noticed signals that may suggest Lily needs rest — normal after exercise, but worth watching if it seems out of proportion to her day.",
    steps: [
      "Let her rest somewhere cool and quiet.",
      "If low energy persists into tomorrow with reduced appetite, check in with your vet.",
    ],
    vetFlag: false,
  },
];

// Deterministic pick so the same image gives the same demo result.
export async function analyzeDogImage(imageBlob) {
  const buffer = await imageBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hash = 0;
  const step = Math.max(1, Math.floor(bytes.length / 512));
  for (let i = 0; i < bytes.length; i += step) hash = (hash * 31 + bytes[i]) >>> 0;
  // Simulated processing delay so the scanning animation reads naturally.
  await new Promise((resolve) => setTimeout(resolve, 2600));
  return SCAN_RESULTS[hash % SCAN_RESULTS.length];
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

const CHAT_RESPONSES = [
  {
    match: /pac(e|ing)|restless|night|sleep|settle/i,
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
    match: /exercise|walk|energy|active|tire/i,
    reply:
      "For Lily — a 2-year-old, 24kg retriever mix with high energy — a good daily target is about 75 minutes of movement:\n\n" +
      "• 30-minute morning walk (let her sniff — it's mental work too)\n" +
      "• 30-minute evening walk\n" +
      "• 15 minutes of fetch, tug, or swimming\n\n" +
      "In Singapore's heat, keep the midday hours for rest and walk in the early morning or after sunset. Watch for heavy panting, slowing down, or seeking shade — those mean it's time for water and a break.\n\n" +
      "Her care plan already includes both walks and a play burst — ticking them off daily is exactly the right rhythm. If she still has zoomies at 10pm, add 10 minutes of training before bed; thinking tires dogs as much as running.",
  },
  {
    match: /food|eat|refus|appetite|meal|hungry/i,
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
    match: /enrich|game|bored|toy|puzzle|mental|activit/i,
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
    match: /vet|sick|ill|worry|concern|emergency|hurt|limp|pain/i,
    reply:
      "Good question to ask early. As a general guide for Lily:\n\n" +
      "See a vet the same day for: repeated vomiting or diarrhoea, refusing water, limping that doesn't improve with rest, laboured breathing, a swollen abdomen, or sudden behaviour change (hiding, snapping, disorientation).\n\n" +
      "Book a normal appointment for: appetite dips beyond 24 hours, recurring ear scratching or head shaking, new lumps, persistent scooting, or gradual weight change.\n\n" +
      "Monitor at home for: one skipped meal, a single soft stool with normal energy, or mild post-exercise stiffness that resolves overnight.\n\n" +
      "Trust your read of her baseline — you know Lily's normal better than anyone. If something feels off even without a clear symptom, a vet call costs little and settles the question.\n\n" +
      "⚠ CUB gives general guidance only and can't diagnose — when in doubt, always choose the vet.",
  },
  {
    match: /groom|brush|coat|shed|bath|fur/i,
    reply:
      "Lily's retriever-mix coat in a tropical climate does best with:\n\n" +
      "• Brushing every other day (5 minutes with a slicker brush after the evening walk — it's already in her care plan)\n" +
      "• A bath every 3–4 weeks with dog shampoo — more often strips coat oils\n" +
      "• A tick check after grassy walks: run fingers against the fur around ears, armpits, and between toes\n" +
      "• Nail trim roughly monthly — if you hear clicking on the floor, they're due\n\n" +
      "Shedding will spike a couple of times a year; daily brushing during those weeks keeps your sofa (mostly) fur-free. If you see redness, flaking, or she scratches one spot persistently, that's a vet-visit item rather than a grooming one.",
  },
];

const CHAT_FALLBACK =
  "I don't have a specific answer prepared for that in this prototype, but here's how I'd think about it for Lily:\n\n" +
  "• Compare against her baseline — appetite, energy, sleep, and toilet habits are the big four.\n" +
  "• Change one thing at a time when trying a fix, so you can tell what helped.\n" +
  "• Note observations in her care log — patterns over days beat single moments.\n\n" +
  "Try one of the suggested questions below for a fuller answer, and remember: CUB offers general guidance, not veterinary advice.";

// Demo chatbot: keyword-matched canned replies with a natural typing delay.
export async function askCub(message) {
  const found = CHAT_RESPONSES.find((entry) => entry.match.test(message));
  const reply = found ? found.reply : CHAT_FALLBACK;
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
