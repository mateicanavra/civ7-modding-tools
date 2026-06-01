# Design: Studio/SDK Authoring Surface Guards

## Problem

The behavior slices converted the standard recipe stages to intentional public
surfaces and proved each touched domain locally. The shared consumers still need
hardening because they sit above every stage:

- Studio renders generated schema/default/uiMeta artifacts.
- The browser runtime imports generated schema/default artifacts separately from
  the Studio catalog.
- Generated map entrypoints pass canonical shipped-map config envelopes into
  SDK `createMap`.
- Some older tests still inspected public shipped configs as though they were
  compiled step/op envelopes.

Those consumers can accidentally hide or reintroduce authoring-surface collapse
even when individual stage tests remain green.

## Decision

Keep this slice test/proof-only. The final intended state is already in source:
all standard stages now have semantic public schemas and deterministic compile
lowering. The guard-hardening slice should make that current state durable.

The guards use three layers:

1. **Source authoring model guards.** Inspect `STANDARD_STAGES` and
   `deriveStageAuthoringModel(...)` so every standard stage is
   `semantic-public-config`, schema props are strict, and focus paths resolve to
   public schema paths or remain empty.
2. **Generated Studio artifact guards.** Compare generated standard
   schema/default/uiMeta artifacts against source-derived schema/defaults, then
   validate built-in Studio map presets against the generated schema.
3. **Generated map/SDK boundary guards.** Assert generated map entrypoints keep
   importing canonical source map config and pass
   `canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)` into `createMap`.
   SDK-facing map definitions therefore consume public authoring config, not
   compiled step/op internals.

The stale shipped-map identity test becomes a two-surface assertion:

- Public shipped configs must remain semantic and contain no raw op envelopes.
- Compiled shipped configs must still lower to the intended feature-family
  planner strategies and threshold values.

## Behavior Boundary

No recipe runtime code changes. No generated map behavior changes. No direct
Civ7 runtime proof is required because this slice changes tests and proof
records only; it does not change map generation algorithms or authored config
values.

## Risk Controls

- Guard tests must fail if any standard stage falls back to
  `internal-step-config`.
- Guard tests must fail if generated Studio schema/default artifacts are stale
  relative to source stage authoring models.
- Guard tests must fail if Studio focus paths point to removed raw step/op
  paths, `strategy`, or `config`.
- Guard tests must fail if generated map entrypoints inline config or stop using
  canonical public config envelopes.
- Peer-agent review covers taxonomy/spec/proof plus implementation/test
  quality before closure.
