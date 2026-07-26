/** @internal Stage-config key reserved for authored stage knobs. */
export const RESERVED_STAGE_KEY = "knobs" as const;

/** @internal Type-level identity of the stage-config key reserved for authored knobs. */
export type ReservedStageKey = typeof RESERVED_STAGE_KEY;
