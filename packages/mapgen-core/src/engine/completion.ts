const COMPLETION_ID_PATTERN = /^completion:[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

/** Stable plan identity for one payload-free causal prerequisite. */
export type CompletionId = `completion:${string}`;

/** Refuses values that are not canonical completion plan-edge identities. */
export function assertCompletionId(value: unknown): asserts value is CompletionId {
  if (typeof value !== "string" || !COMPLETION_ID_PATTERN.test(value)) {
    throw new TypeError(
      `Completion dependency "${String(value)}" must match completion:<kebab-or-dotted-id>.`
    );
  }
}
