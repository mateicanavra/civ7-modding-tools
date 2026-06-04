export const SEMANTIC_CLI_ENVELOPE_VERSION = 'civ7.semantic-cli-envelope.v1' as const;

export const SEMANTIC_CLI_ENVELOPE_OWNER = {
  row: 'Semantic CLI Player-Agent View',
  sourceOwner: 'packages/cli/src/game-play/semantic-envelope.ts',
  proofOwner: 'packages/cli/test/commands/game/play/semantic-envelope.test.ts',
  schemaChoice: 'typescript-structural-owner-seed',
  acceptanceStatus: 'owner-seed-not-row-acceptance',
} as const;

export const SEMANTIC_CLI_ENVELOPE_SLOTS = [
  'version',
  'scope',
  'state',
  'blockers',
  'decisions',
  'actions',
  'result',
  'nextSteps',
  'evidence',
  'notes',
] as const;

export type SemanticCliEnvelopeSlot = typeof SEMANTIC_CLI_ENVELOPE_SLOTS[number];

export type SemanticCliEnvelope = {
  version: typeof SEMANTIC_CLI_ENVELOPE_VERSION;
  scope: Record<string, unknown> | null;
  state: Record<string, unknown> | null;
  blockers: unknown[];
  decisions: unknown[];
  actions: unknown[];
  result: Record<string, unknown> | null;
  nextSteps: string[];
  evidence: Array<Record<string, unknown>>;
  notes: string[];
};

export type SemanticCliEnvelopeInput = Omit<SemanticCliEnvelope, 'version'> & {
  version?: typeof SEMANTIC_CLI_ENVELOPE_VERSION;
};

export const NORMAL_PLAY_DEBUG_INTERNAL_MARKERS = [
  { marker: 'CMD:', fieldClass: 'raw-command-log' },
  { marker: 'LSQ:', fieldClass: 'raw-sql-log' },
  { marker: 'GameContext.', fieldClass: 'raw-runtime-global' },
  { marker: 'sendRequest', fieldClass: 'raw-app-ui-transport' },
  { marker: 'selectedState', fieldClass: 'state-selection-internal' },
  { marker: 'socket', fieldClass: 'transport-internal' },
  { marker: 'requestId', fieldClass: 'correlation-internal' },
  { marker: 'correlationId', fieldClass: 'correlation-internal' },
  { marker: 'closeoutTrace', fieldClass: 'closeout-internal' },
  { marker: 'rawProbe', fieldClass: 'probe-internal' },
] as const;

export type NormalPlayDebugInternalMarker = typeof NORMAL_PLAY_DEBUG_INTERNAL_MARKERS[number];

export type NormalPlayDebugInternalLeak = {
  marker: NormalPlayDebugInternalMarker['marker'];
  fieldClass: NormalPlayDebugInternalMarker['fieldClass'];
};

export function isSemanticCliEnvelopeSlot(value: string): value is SemanticCliEnvelopeSlot {
  return (SEMANTIC_CLI_ENVELOPE_SLOTS as readonly string[]).includes(value);
}

export function createSemanticCliEnvelope(input: SemanticCliEnvelopeInput): SemanticCliEnvelope {
  return {
    version: input.version ?? SEMANTIC_CLI_ENVELOPE_VERSION,
    scope: input.scope,
    state: input.state,
    blockers: [...input.blockers],
    decisions: [...input.decisions],
    actions: [...input.actions],
    result: input.result,
    nextSteps: [...input.nextSteps],
    evidence: [...input.evidence],
    notes: [...input.notes],
  };
}

export function normalPlayDebugInternalLeaks(payload: unknown): NormalPlayDebugInternalLeak[] {
  const text = stringifyForMarkerScan(payload);
  return NORMAL_PLAY_DEBUG_INTERNAL_MARKERS
    .filter(({ marker }) => text.includes(marker))
    .map(({ marker, fieldClass }) => ({ marker, fieldClass }));
}

function stringifyForMarkerScan(payload: unknown): string {
  try {
    return JSON.stringify(payload) ?? '';
  } catch {
    return String(payload);
  }
}
