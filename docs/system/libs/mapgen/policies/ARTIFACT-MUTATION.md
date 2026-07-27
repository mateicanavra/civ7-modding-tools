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
- Post-run observers query through an exact `Artifact` after execution completes. Publication has
  already admitted present evidence; observation does not rerun validation or claim to detect
  mutation.
- If a consumer needs to mutate, it must copy first (caller-owned copy).

Publication and reads are zero-copy: Core stores and returns the producer's admitted reference. It
does not recursively freeze payload memory or defend against a retained hostile JavaScript
reference. Immutability is therefore a pipeline ownership contract. Consumer signatures expose a
deep readonly TypeScript projection that removes direct mutation affordances, including typed-array
mutators and mutable backing-storage capabilities. That projection guides authors; structural
widening, an explicit cast, or a producer-retained raw alias can still violate the runtime contract.
Consumers must copy before taking mutable ownership. Callable members remain outside the artifact
data universe.

### Disallowed

- Republishing an artifact (write-once violated).
- Reaching around declared artifact dependencies through context state or internal storage helpers.
- Mutating shared artifact values in-place.

## Ground truth anchors

- Write-once enforcement and zero-copy ownership contract: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Post-run exact-identity observation: `packages/mapgen-core/src/authoring/artifact/observation.ts`
- Runtime context and artifact store: `packages/mapgen-core/src/core/map-context.ts`
