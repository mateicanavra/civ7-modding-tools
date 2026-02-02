<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="rules" title="Rules (allowed / disallowed)"/>
  <item id="exception" title="Exception: buffers"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: artifact mutation

## Purpose

Keep pipeline data flow safe and debuggable by enforcing a simple invariant:

- **Artifacts are write-once and read-only.**

This enables reproducibility, caching, and reliable inspection.

## Audience

- Step authors.
- Anyone designing new artifact kinds or performance buffers.

## Rules (allowed / disallowed)

### Allowed

- Producers publish an artifact once.
- Consumers read artifacts as immutable (treat the returned value as read-only).
- If a consumer needs to mutate, it must copy first (caller-owned copy).

### Disallowed

- Republishing an artifact (write-once violated).
- Mutating shared artifact values in-place.

## Exception: buffers

Today, there is a deliberate exception for performance:

- Buffer artifacts are **published once**, then **mutated in-place** through a dedicated buffers surface.
- Buffers must **not** be republished after the initial publish.

This is a temporary architecture exception; docs must treat it as such and avoid generalizing it into “mutation is fine”.

## Ground truth anchors

- Write-once enforcement and read-only reads: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Buffer exception + “do not republish” rule: `packages/mapgen-core/src/core/types.ts`
- Target direction (separating buffer-like kinds from artifacts): `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`

