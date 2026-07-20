<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="rules" title="Rules (allowed / disallowed)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: artifact mutation

## Purpose

Keep pipeline data flow safe and debuggable by enforcing a simple invariant:

- **Artifacts are write-once and read-only.**

This enables reproducibility, caching, and reliable inspection.

## Audience

- Step authors.
- Anyone designing new artifact kinds or multi-step data flow.

## Rules (allowed / disallowed)

### Allowed

- Producers publish an artifact once.
- Consumers read artifacts as immutable (treat the returned value as read-only).
- If a consumer needs to mutate, it must copy first (caller-owned copy).

### Disallowed

- Republishing an artifact (write-once violated).
- Mutating shared artifact values in-place.

## Ground truth anchors

- Write-once enforcement and read-only reads: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Runtime context and artifact store: `packages/mapgen-core/src/core/types.ts`
