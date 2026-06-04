export const DEBUG_SERVICE_PROJECTION_VERSION = 'civ7.debug-service-projection.v0' as const;

export const DEBUG_SERVICE_PROJECTION_OWNER = {
  row: 'Debug/Internal Service Output',
  sourceOwner: 'packages/cli/src/game-debug/debug-service-projection.ts',
  proofOwner: [
    'packages/cli/test/commands/game/debug-service-projection.test.ts',
    'packages/cli/test/commands/game.control.test.ts',
  ],
  schemaChoice: 'typescript-structural-owner-seed',
  acceptanceStatus: 'owner-seed-not-row-acceptance',
} as const;

export const DEBUG_SERVICE_PROJECTION_FIELD_CLASSES = [
  'transport-session-state',
  'raw-probe',
  'route-selection',
  'closeout-postcondition-internal',
  'correlation-diagnostic',
  'resource-log-database-proof',
] as const;

export type DebugServiceProjectionFieldClass = typeof DEBUG_SERVICE_PROJECTION_FIELD_CLASSES[number];

export type DebugServiceProjectionPathSegment = string | number;

export type DebugServiceProjectionExpectation = Readonly<{
  fieldClass: DebugServiceProjectionFieldClass;
  path: readonly DebugServiceProjectionPathSegment[];
  description?: string;
}>;

export type DebugServiceProjectionFieldHit = Readonly<{
  fieldClass: DebugServiceProjectionFieldClass;
  path: readonly DebugServiceProjectionPathSegment[];
  description?: string;
}>;

export type DebugServiceProjectionMissingPath = DebugServiceProjectionFieldHit;

export function debugServiceProjectionFieldHits(
  payload: unknown,
  expectations: readonly DebugServiceProjectionExpectation[]
): DebugServiceProjectionFieldHit[] {
  return expectations
    .filter((expectation) => hasDebugServiceProjectionPath(payload, expectation.path))
    .map(({ fieldClass, path, description }) => ({ fieldClass, path, description }));
}

export function debugServiceProjectionMissingPaths(
  payload: unknown,
  expectations: readonly DebugServiceProjectionExpectation[]
): DebugServiceProjectionMissingPath[] {
  return expectations
    .filter((expectation) => !hasDebugServiceProjectionPath(payload, expectation.path))
    .map(({ fieldClass, path, description }) => ({ fieldClass, path, description }));
}

export function hasDebugServiceProjectionPath(
  payload: unknown,
  path: readonly DebugServiceProjectionPathSegment[]
): boolean {
  return readPath(payload, path) !== missingPath;
}

const missingPath = Symbol('missing debug projection path');

function readPath(payload: unknown, path: readonly DebugServiceProjectionPathSegment[]): unknown {
  let current = payload;
  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current) || segment < 0 || segment >= current.length) return missingPath;
      current = current[segment];
      continue;
    }
    if (typeof current !== 'object' || current === null || !(segment in current)) return missingPath;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
