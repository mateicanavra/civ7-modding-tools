<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="allowed" title="Allowed"/>
  <item id="disallowed" title="Disallowed"/>
  <item id="why" title="Why"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: dependency IDs and registries

## Purpose

Ensure all step dependencies (requires/provides) are:
- explicit,
- registered/validated,
- and fail-fast when wrong.

This prevents “implicit coupling” where steps rely on strings that are never validated.

## Audience

- Step authors.
- Anyone adding/changing tags, artifact contracts, or dependency kinds.

## Allowed

### 1) Requires/provides must be validated against the registry

When a step is registered, its `requires` and `provides` are validated against the TagRegistry.

### 2) Prefer a small stable vocabulary for dependency kinds

Use clear prefixes and keep them stable across docs and code:

- `artifact:*` (published artifacts; write-once, read-only)
- `field:*` (mutable engine-facing surfaces; current naming)
- `effect:*` (derived/projection surfaces; treated as recomputable)

If spec uses different naming, docs must include a short “current mapping” callout — not invent a third term.

## Disallowed

### 1) Ad-hoc dependency strings

Do not add `requires/provides` strings without registering/validating them.

### 2) “Soft” missing dependency behavior

Do not allow silent skips when requirements aren’t satisfied. Missing requirements are an error unless explicitly compiled out.

## Why

Tag registries are the “type system” for pipeline wiring:
- they’re the only practical way to keep a large pipeline coherent,
- and they make tooling (viz, debug, validation) reliable.

## Ground truth anchors

- Tag registry and validation: `packages/mapgen-core/src/engine/tags.ts`
- Step registry validation: `packages/mapgen-core/src/engine/StepRegistry.ts`
- Target posture for tag registry: `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
- Enablement/skip posture (no silent skips): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-002-enablement-is-recipe-authored-and-compiled-no-shouldrun-no-silent-skips.md`

