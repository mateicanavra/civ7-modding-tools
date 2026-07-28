/** Version stamped onto the stable player-facing contract emitted by semantic game-play commands. */
export const SEMANTIC_CLI_ENVELOPE_VERSION = "civ7.semantic-cli-envelope.v1" as const;

/** Canonical field order used by commands and contract tests when presenting semantic game state. */
export const SEMANTIC_CLI_ENVELOPE_SLOTS = [
  "version",
  "scope",
  "state",
  "blockers",
  "decisions",
  "actions",
  "result",
  "nextSteps",
  "evidence",
  "notes",
] as const;

/**
 * Player-facing game state and action summary owned by the CLI layer.
 * Transport traces and raw control probes are deliberately excluded from this boundary.
 */
export type SemanticCliEnvelope = {
  version: typeof SEMANTIC_CLI_ENVELOPE_VERSION;
  scope: Record<string, unknown> | null;
  state: Record<string, unknown> | null;
  blockers: unknown[];
  decisions: unknown[];
  actions: unknown[];
  result: Record<string, unknown> | null;
  nextSteps: unknown[];
  evidence: Array<Record<string, unknown>>;
  notes: string[];
};

type SemanticCliEnvelopeInput = Omit<SemanticCliEnvelope, "version"> & {
  version?: typeof SEMANTIC_CLI_ENVELOPE_VERSION;
};

/**
 * Builds a semantic envelope with an explicit version and owned top-level list values.
 * Object-valued slots remain references; this is a boundary snapshot, not a deep clone.
 *
 * @returns The normalized player-facing envelope consumed by command renderers and contract tests.
 */
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
