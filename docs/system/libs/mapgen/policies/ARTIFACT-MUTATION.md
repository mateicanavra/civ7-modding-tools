<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="rules" title="Rules (allowed / disallowed)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: artifact mutation

## Purpose

Keep pipeline data flow safe and debuggable by enforcing a simple ownership invariant:

- **Artifacts are published once and treated as immutable after publication.**

This enables reproducibility, caching, and reliable inspection.

## Audience

- Step authors.
- Anyone designing new artifact kinds or multi-step data flow.

## Rules (allowed / disallowed)

### Allowed

- Producers publish an artifact once.
- Consumers read artifacts as immutable (treat the returned value as read-only).
- Authored steps use only artifact readers and publishers derived from their declared contract.
- Post-run observers query through an exact `Artifact`, which reapplies its complete validator
  before exposing evidence.
- If a consumer needs to mutate, it must copy first (caller-owned copy).

Publication and reads are zero-copy: Core stores and returns the producer's admitted reference. It
does not recursively freeze payload memory or defend against a retained hostile JavaScript
reference. Immutability is therefore a pipeline ownership contract. Consumer signatures express
readonly intent for ordinary structures, but do not yet make every typed-array mutation
unrepresentable.

### Disallowed

- Republishing an artifact (write-once violated).
- Reaching around declared artifact dependencies through context state or internal storage helpers.
- Mutating shared artifact values in-place.

## Ground truth anchors

- Write-once enforcement and zero-copy ownership contract: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Runtime context and artifact store: `packages/mapgen-core/src/core/map-context.ts`
