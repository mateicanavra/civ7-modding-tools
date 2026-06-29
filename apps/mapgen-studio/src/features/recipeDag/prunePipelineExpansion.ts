/**
 * Prune the set of expanded pipeline stage ids down to the stages that still
 * exist in the loaded recipe DAG. Switching recipes must not carry phantom
 * expanded ids across graphs.
 *
 * Identity-preserving by contract: when every current id is still known, the
 * SAME set reference is returned, so a `setPipelineExpandedStageIds(prev => …)`
 * updater is a no-op and React bails out of the re-render. Only when at least
 * one id is dropped is a new `Set` allocated. Dropping this `===`-stable return
 * would make a settled DAG re-run the prune setter on every query update — the
 * exact render-loop the original effect was written to avoid.
 */
export function prunePipelineExpandedStageIds(
  current: ReadonlySet<string>,
  knownStageIds: ReadonlySet<string>
): ReadonlySet<string> {
  const kept = [...current].filter((id) => knownStageIds.has(id));
  return kept.length === current.size ? current : new Set(kept);
}
