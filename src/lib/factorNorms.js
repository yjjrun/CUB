// Population reference values for the 13 C-BARQ factors.
//
// Derived from the University of Pennsylvania C-BARQ dataset used in the CUB
// clustering study — 80,611 owner-completed questionnaires, of which 76k-80k
// carry a usable score for any given factor. Each factor runs 0-4.
//
// These let matching ask "is this dog high on separation anxiety *compared to
// real dogs*" rather than against an invented mid-point. It matters: owner-
// directed aggression has a real median of 0.00 and a 90th percentile of 0.50,
// so a dog scoring 2 is genuinely unusual — while a 2 on chasing is below
// average. A single hard-coded threshold would misread both.
//
// Regenerate with scripts/analyse_cbarq.py against the source spreadsheet.
export const FACTOR_NORMS = {
  strangerAggression: { mean: 0.62, sd: 0.72, p50: 0.40, p75: 0.90, p90: 1.60 },
  ownerAggression:    { mean: 0.17, sd: 0.41, p50: 0.00, p75: 0.13, p90: 0.50 },
  dogAggressionFear:  { mean: 1.01, sd: 1.06, p50: 0.75, p75: 1.50, p90: 2.67 },
  trainability:       { mean: 2.59, sd: 0.64, p50: 2.63, p75: 3.00, p90: 3.38 },
  chasing:            { mean: 2.07, sd: 1.11, p50: 2.25, p75: 3.00, p90: 3.50 },
  strangerFear:       { mean: 0.69, sd: 0.95, p50: 0.25, p75: 1.00, p90: 2.00 },
  nonsocialFear:      { mean: 0.85, sd: 0.77, p50: 0.67, p75: 1.33, p90: 2.00 },
  dogFear:            { mean: 0.82, sd: 0.92, p50: 0.50, p75: 1.25, p90: 2.25 },
  separation:         { mean: 0.67, sd: 0.68, p50: 0.50, p75: 1.00, p90: 1.63 },
  touchSensitivity:   { mean: 0.83, sd: 0.81, p50: 0.67, p75: 1.25, p90: 2.00 },
  excitability:       { mean: 2.08, sd: 0.84, p50: 2.00, p75: 2.67, p90: 3.17 },
  attachment:         { mean: 2.10, sd: 0.81, p50: 2.00, p75: 2.67, p90: 3.17 },
  energy:             { mean: 2.10, sd: 1.07, p50: 2.00, p75: 3.00, p90: 3.50 },
};

// Population spread of the four composite demands (see dogDemandVector).
//
// Averaging several 0-1 factor positions pulls almost every dog toward the
// middle: measured over the same 80,611 dogs, the composites only occupy
// ~0.46-0.62 of the 0-1 range and centre near 0.45-0.50. Scaled naively that
// makes every dog demand "about 5 out of 10" on everything, so no owner
// profile can prefer one dog over another.
//
// Rescaling each composite from its own 5th-95th percentile onto 0-10 restores
// the full range and makes dog demands comparable to the published cluster
// demands, which span 2-9.
export const DEMAND_NORMS = {
  stimulation: { p5: 0.185, p95: 0.805 },
  structure:   { p5: 0.273, p95: 0.769 },
  empathy:     { p5: 0.284, p95: 0.819 },
  firmness:    { p5: 0.312, p95: 0.770 },
};

/** Map a raw 0-1 composite onto 0-10 using its population spread. */
export function scaleDemand(key, raw) {
  const n = DEMAND_NORMS[key];
  if (!n) return 10 * Math.max(0, Math.min(1, raw));
  const span = n.p95 - n.p5 || 1;
  return 10 * Math.max(0, Math.min(1, (raw - n.p5) / span));
}

export const FACTOR_SOURCE = {
  dataset: "UPenn C-BARQ, 80,611 questionnaires",
  note: "Percentiles computed per factor over non-missing responses.",
};

/**
 * How unusual a dog's score is for that factor, in population SDs.
 * Positive means higher than typical.
 */
export function zScore(factor, value) {
  const norm = FACTOR_NORMS[factor];
  if (!norm || !Number.isFinite(value)) return 0;
  return (value - norm.mean) / (norm.sd || 1);
}

/**
 * Where this dog sits in the population on a 0-1 scale: 0.5 is the average
 * dog, 0 is roughly two SDs below, 1 is roughly two SDs above.
 *
 * Unlike elevation(), this covers the full range, so it can express "unusually
 * calm" as well as "unusually excitable" — needed when deriving how much
 * stimulation or firmness a dog actually asks for.
 */
export function positionOf(factor, value) {
  const norm = FACTOR_NORMS[factor];
  if (!norm || !Number.isFinite(value)) return 0.5;
  const z = (value - norm.mean) / (norm.sd || 1);
  return Math.max(0, Math.min(1, 0.5 + z / 4));
}

/**
 * 0 when the dog sits at or below the population median for this factor,
 * rising to 1 around the 90th percentile. Used to weight how strongly a
 * trait should count against a household that cannot accommodate it.
 */
export function elevation(factor, value) {
  const norm = FACTOR_NORMS[factor];
  if (!norm || !Number.isFinite(value)) return 0;
  if (value <= norm.p50) return 0;
  const span = norm.p90 - norm.p50;
  if (span <= 0) return value > norm.p50 ? 1 : 0;
  return Math.max(0, Math.min(1, (value - norm.p50) / span));
}
