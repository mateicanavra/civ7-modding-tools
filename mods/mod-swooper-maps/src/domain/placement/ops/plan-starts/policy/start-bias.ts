/**
 * Official StartBias scoring hook (placement-realignment S4).
 *
 * Civ7 start biases live in CIV7_POLICY_TABLES_V1.startBias as per-civ/leader
 * rows. The river/lake/adjacentToCoast families map directly onto pipeline
 * artifacts (riverClass, lakeMask, coastalLand), so they are scorable offline
 * when the caller resolves a seat's civ/leader into a `SeatBias` row. The
 * biome/terrain/featureClass/resource/naturalWonder families need live
 * player→civ data plus engine id projection and are deferred to Milestone A
 * (decision-logged). Absent bias rows mean a neutral default of 0.
 *
 * Official scores are integers on a ~5..200 scale (rivers/lakes 5..15,
 * adjacentToCoasts 25..200); they are normalized by /100 and clamped to
 * [0, 2] so a 200-score coast bias contributes at most 0.2·startBiasWeight
 * to a seat's ranking score.
 */

export type SeatBias = {
  seatIndex: number;
  river: number;
  lake: number;
  adjacentToCoast: number;
};

export type SeatBiasContext = {
  riverAdjacent: boolean;
  lakeAdjacent: boolean;
  coastalLand: boolean;
};

const BIAS_SCORE_NORMALIZER = 100;
const BIAS_TERM_SCALE = 0.1;

function normalizeBiasScore(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.min(2, score / BIAS_SCORE_NORMALIZER);
}

/**
 * Per-seat additive ranking term for one candidate. Returns 0 (neutral) when
 * the seat has no bias rows.
 */
export function seatBiasTerm(bias: SeatBias | undefined, context: SeatBiasContext): number {
  if (!bias) return 0;
  let term = 0;
  if (context.riverAdjacent) term += normalizeBiasScore(bias.river);
  if (context.lakeAdjacent) term += normalizeBiasScore(bias.lake);
  if (context.coastalLand) term += normalizeBiasScore(bias.adjacentToCoast);
  return term * BIAS_TERM_SCALE;
}

/**
 * Indexes optional official start-bias rows by seat for constant-time candidate scoring.
 * Missing input yields an empty map; duplicate seat rows resolve deterministically to the last
 * supplied row.
 */
export function indexSeatBiases(
  rows: readonly SeatBias[] | undefined
): ReadonlyMap<number, SeatBias> {
  const map = new Map<number, SeatBias>();
  for (const row of rows ?? []) map.set(row.seatIndex, row);
  return map;
}
