export type NaturalWonderFootprintOffset = Readonly<{ dx: number; dy: number }>;

export type NaturalWonderFootprintOffsetsByParity = Readonly<{
  even: readonly NaturalWonderFootprintOffset[];
  odd: readonly NaturalWonderFootprintOffset[];
}>;

export type NaturalWonderPlacementPolicy = Readonly<{
  placementClass?: string;
  naturalWonderTiles?: number;
  naturalWonderDirection?: number;
}>;
type OptionalNaturalWonderPlacementPolicy = NaturalWonderPlacementPolicy | undefined;

const ANCHOR: NaturalWonderFootprintOffset = { dx: 0, dy: 0 };

/**
 * Natural-wonder footprint direction-offset tables — odd-R hex, keyed by the
 * anchor row's parity (`y & 1`). The engine resolves multi-tile footprints from
 * `Direction` + `placementClass` at the anchor, and its adjacency is odd-R
 * (pointy-top, ROW-offset: odd rows shifted east). A single parity-agnostic
 * table therefore stamps the wrong cells for one of the two row parities.
 *
 * AUTHORITY: live `getAdjacentPlotLocation` calibration on both parities
 * (`openspec/changes/natural-wonders-full-set-parity-suitability/workstream/live-proof-ledger.md`
 * §A1), cross-validated against five base-game-placed wonder clusters read back
 * via `getFeatureType`. `ODD` is the historical `CIV7_DIRECTION_OFFSETS`; `EVEN`
 * swaps only the parity-dependent diagonals (indices 0, 2, 3, 5 — indices 1 and 4
 * are parity-invariant). The footprint direction-index convention is preserved
 * (the placement-class switch keys `primary = dir`, `clockwise = dir + 1`).
 *
 * These are defined in-package by value (NOT imported from `@swooper/mapgen-core`,
 * which `kind:foundation` may not depend on); an in-package consistency test pins
 * the neighbor *set* against `policy-grid.ts` per parity so the odd-R copies
 * cannot silently drift.
 */
const ODD_DIRECTION_OFFSETS: readonly NaturalWonderFootprintOffset[] = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
];

const EVEN_DIRECTION_OFFSETS: readonly NaturalWonderFootprintOffset[] = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
];

const SUPPORTED_POLICY_TAGS = new Set([
  "ADJACENTCLIFF",
  "ADJACENTMOUNTAIN",
  "ADJACENTTOCOAST",
  "ADJACENTTOLAND",
  "ADJACENTTOSAMEBIOME",
  "ADJACENTTOSAMETERRAIN",
  "FEATURE_FOREST",
  "FEATURE_REEF",
  "NOLANDOPPOSITECLIFF",
  "NOTADJACENTMOUNTAIN",
  "NOTADJACENTTOICE",
  "NOTADJACENTTOLAND",
  "NOTADJACENTTORIVER",
  "NOTNEARCOAST",
  "SHALLOWWATER",
  "VOLCANO",
  "WATERFALL",
]);

function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

export function hasUnsupportedNaturalWonderPolicyTags(
  tags: readonly string[] | undefined
): boolean {
  if (!Array.isArray(tags)) return false;
  return tags.some((tag) => !SUPPORTED_POLICY_TAGS.has(tag));
}

export function resolveNaturalWonderPlacementDirection(
  policy: OptionalNaturalWonderPlacementPolicy
): number {
  const direction = policy?.naturalWonderDirection;
  if (Number.isFinite(direction)) return Math.trunc(direction as number);
  return -1;
}

export function resolveNaturalWonderMaterializationDirection(
  policy: OptionalNaturalWonderPlacementPolicy,
  direction = resolveNaturalWonderPlacementDirection(policy)
): number {
  return normalizeFootprintDirection(direction);
}

function normalizeFootprintDirection(direction: number | undefined): number {
  if (!Number.isFinite(direction) || (direction as number) < 0) return 0;
  return Math.trunc(direction as number) % 6;
}

function parityOffsets(parity: number): readonly NaturalWonderFootprintOffset[] {
  return (parity & 1) === 1 ? ODD_DIRECTION_OFFSETS : EVEN_DIRECTION_OFFSETS;
}

function offsetAt(parity: number, direction: number): NaturalWonderFootprintOffset {
  return parityOffsets(parity)[((direction % 6) + 6) % 6]!;
}

function addOffset(
  a: NaturalWonderFootprintOffset,
  b: NaturalWonderFootprintOffset
): NaturalWonderFootprintOffset {
  return { dx: a.dx + b.dx, dy: a.dy + b.dy };
}

/**
 * Chain one more step in `direction` from the cell at offset `base` from the
 * anchor, resolving the step against that *intermediate* cell's row parity
 * (`anchorParity XOR (base.dy & 1)`). Used to reach the far vertex of multi-tile
 * footprints (e.g. the parallelogram corner), which depends on the parity of the
 * cell it extends from, not the anchor's.
 */
function chainOffset(
  anchorParity: number,
  base: NaturalWonderFootprintOffset,
  direction: number
): NaturalWonderFootprintOffset {
  const cellParity = (anchorParity ^ (base.dy & 1)) & 1;
  return addOffset(base, offsetAt(cellParity, direction));
}

/**
 * Footprint offsets for one anchor parity. The placement-class geometry is the
 * triangle model extended to the 4-tile classes:
 *  - FOURPARALLELAGRM = triangle{anchor, dir, dir+1} + the parallelogram corner
 *    (CONFIRMED against the live engine — Thera, odd-row dir 4 — ledger §A2).
 *  - FOURADJACENT / FOURL geometry is C++-owned and pinned by gen-time engine
 *    readback (ledger §A2); the shapes below are the best-known dir-0 hypotheses
 *    (Barrier Reef self-oriented as a `(1,0)` row-line) and are corrected to the
 *    observed stamp during the live closure run.
 */
function footprintOffsetsForParity(
  policy: OptionalNaturalWonderPlacementPolicy,
  direction: number,
  anchorParity: number
): readonly NaturalWonderFootprintOffset[] | null {
  const placementClass = policy?.placementClass ?? "ONE";
  const tiles = Math.max(1, policy?.naturalWonderTiles ?? 1);
  if (tiles <= 1 || placementClass === "ONE") return [ANCHOR];

  const d = normalizeFootprintDirection(direction);
  const primary = offsetAt(anchorParity, d);
  const clockwise = offsetAt(anchorParity, d + 1);
  switch (placementClass) {
    case "TWO":
    case "TWOADJACENT":
      return [ANCHOR, primary];
    case "THREETRIANGLE":
    case "THREETRIANGLEDEEPOCEAN":
      return [ANCHOR, primary, clockwise];
    case "FOURPARALLELAGRM":
      return [ANCHOR, primary, clockwise, chainOffset(anchorParity, primary, d + 1)];
    case "FOURADJACENT":
      // gen-time-pinned (ledger §A2): Barrier Reef row-line hypothesis.
      return [ANCHOR, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 3, dy: 0 }];
    case "FOURL":
      // gen-time-pinned (ledger §A2): L-tetromino hypothesis (3 along dir + 1 turn).
      return [
        ANCHOR,
        primary,
        chainOffset(anchorParity, primary, d),
        clockwise,
      ];
    default:
      return null;
  }
}

/**
 * Anchor-independent footprint shape for a wonder. Parity-AGNOSTIC: it reports
 * the placement-class shape (and `null` for unsupported classes) using a
 * representative (odd-row) parity — the historical `CIV7_DIRECTION_OFFSETS`
 * orientation — for catalog support/null checks, tile-count, and diagnostic shape
 * display only. It is NOT correct for placement at a concrete anchor — use
 * {@link getNaturalWonderFootprintIndices} (parity-aware by `y & 1`) or
 * {@link getNaturalWonderFootprintOffsetsByParity} for stamping/spacing.
 */
export function getNaturalWonderFootprintOffsets(
  policy: OptionalNaturalWonderPlacementPolicy,
  direction = resolveNaturalWonderPlacementDirection(policy)
): readonly NaturalWonderFootprintOffset[] | null {
  return footprintOffsetsForParity(policy, direction, 1);
}

/**
 * Parity-keyed footprint offsets for a wonder: the even-row and odd-row offset
 * lists for the same placement class/direction. Consumers that apply offsets at a
 * concrete anchor select `(anchorY & 1) ? odd : even`. Returns `null` for
 * unsupported classes.
 */
export function getNaturalWonderFootprintOffsetsByParity(
  policy: OptionalNaturalWonderPlacementPolicy,
  direction = resolveNaturalWonderPlacementDirection(policy)
): NaturalWonderFootprintOffsetsByParity | null {
  const even = footprintOffsetsForParity(policy, direction, 0);
  const odd = footprintOffsetsForParity(policy, direction, 1);
  if (!even || !odd) return null;
  return { even, odd };
}

export function getNaturalWonderFootprintIndices(args: {
  x: number;
  y: number;
  width: number;
  height: number;
  policy?: NaturalWonderPlacementPolicy;
  direction?: number;
}): number[] | null {
  const direction = args.direction ?? resolveNaturalWonderPlacementDirection(args.policy);
  const offsets = footprintOffsetsForParity(args.policy, direction, args.y & 1);
  if (!offsets) return null;
  const indices: number[] = [];
  const seen = new Set<number>();
  for (const offset of offsets) {
    const y = args.y + offset.dy;
    if (y < 0 || y >= args.height) return null;
    const x = wrapX(args.x + offset.dx, args.width);
    const index = y * args.width + x;
    if (seen.has(index)) continue;
    seen.add(index);
    indices.push(index);
  }
  return indices.length > 0 ? indices : null;
}
