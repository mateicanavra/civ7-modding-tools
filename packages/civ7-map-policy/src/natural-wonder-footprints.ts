export type NaturalWonderFootprintOffset = Readonly<{ dx: number; dy: number }>;

export type NaturalWonderPlacementPolicy = Readonly<{
  placementClass?: string;
  naturalWonderTiles?: number;
  naturalWonderDirection?: number;
}>;
type OptionalNaturalWonderPlacementPolicy = NaturalWonderPlacementPolicy | undefined;

const ANCHOR: readonly NaturalWonderFootprintOffset[] = [{ dx: 0, dy: 0 }];

const CIV7_DIRECTION_OFFSETS: readonly NaturalWonderFootprintOffset[] = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
];

const SUPPORTED_POLICY_TAGS = new Set([
  "ADJACENTMOUNTAIN",
  "ADJACENTTOLAND",
  "ADJACENTTOSAMEBIOME",
  "FEATURE_FOREST",
  "FEATURE_REEF",
  "NOTADJACENTMOUNTAIN",
  "NOTADJACENTTOICE",
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

function directionOffset(direction: number): NaturalWonderFootprintOffset {
  return CIV7_DIRECTION_OFFSETS[normalizeFootprintDirection(direction)]!;
}

export function getNaturalWonderFootprintOffsets(
  policy: OptionalNaturalWonderPlacementPolicy,
  direction = resolveNaturalWonderPlacementDirection(policy)
): readonly NaturalWonderFootprintOffset[] | null {
  const placementClass = policy?.placementClass ?? "ONE";
  const tiles = Math.max(1, policy?.naturalWonderTiles ?? 1);
  if (tiles <= 1 || placementClass === "ONE") return ANCHOR;

  const normalizedDirection = resolveNaturalWonderMaterializationDirection(policy, direction);
  const primary = directionOffset(normalizedDirection);
  const clockwise = directionOffset(normalizedDirection + 1);
  switch (placementClass) {
    case "TWO":
    case "TWOADJACENT":
      return [ANCHOR[0]!, primary];
    case "THREETRIANGLE":
    case "THREETRIANGLEDEEPOCEAN":
      return [ANCHOR[0]!, primary, clockwise];
    default:
      return null;
  }
}

export function getNaturalWonderFootprintIndices(args: {
  x: number;
  y: number;
  width: number;
  height: number;
  policy?: NaturalWonderPlacementPolicy;
  direction?: number;
}): number[] | null {
  const offsets = getNaturalWonderFootprintOffsets(args.policy, args.direction);
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
