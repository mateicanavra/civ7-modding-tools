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

Ensure all step dependencies (`requires`/`provides`) are explicit, preserve
their owning authority through compilation, and fail fast when wrong.

This prevents implicit coupling and raw strings that discard artifact or
completion ownership.

## Audience

- Step authors.
- Anyone adding/changing tags, artifact contracts, or dependency kinds.

## Allowed

### 1) Author dependencies through their exact authority

Select canonical `Artifact` objects and typed completion constants together in
the step's `requires` and `provides` lists. Recipe compilation verifies exact
artifact provider/consumer identity, projects the selections to runtime ids,
and registers that closed runtime ledger before steps are registered.

### 2) Prefer a small stable vocabulary for dependency kinds

Use clear prefixes and keep them stable across docs and code:

- `artifact:*` (generated from selected artifact authorities; write-once, read-only)
- `effect:*` (declared execution or materialization guarantees)

Cross-step data is always a validated artifact vintage. Producer-local scratch state is neither
context state nor a dependency ID; do not add another dependency kind for it.

## Disallowed

### 1) Ad-hoc dependency strings

Do not author raw dependency strings. Use the exact artifact authority or an
owned typed completion constant.

### 2) “Soft” missing dependency behavior

Do not allow silent skips when requirements aren’t satisfied. Missing requirements are an error unless explicitly compiled out.

## Why

Exact artifact authorities are the type system for data edges. The runtime
registry validates the closed id projection used by execution, while artifact
admission and storage remain owned by the artifact runtime. Together they keep
pipeline wiring and tooling coherent without a second authored edge model.

## Ground truth anchors

- Tag registry and validation: `packages/mapgen-core/src/engine/tags.ts`
- Step registry validation: `packages/mapgen-core/src/engine/StepRegistry.ts`
- Target posture for tag registry: `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
- Enablement/skip posture (no silent skips): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-002-enablement-is-recipe-authored-and-compiled-no-shouldrun-no-silent-skips.md`
