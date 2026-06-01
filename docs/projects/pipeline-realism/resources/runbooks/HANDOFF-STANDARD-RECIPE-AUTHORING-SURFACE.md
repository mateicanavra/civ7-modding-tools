# Standard Recipe Authoring Surface Handoff

Date: 2026-05-31

Audience: next ERA/DRA taking on systematic standard-recipe authoring-surface
cleanup across stage schemas, knobs, public config, compile functions, Studio
recipe artifacts, shipped configs, and validation gates.

Status: scout packet and objective companion. This is a starting reference, not
a complete corpus audit, implementation spec, runtime proof, or OpenSpec closure
record. Re-verify the branch state, source files, generated artifacts, and
current stack before changing code.

## How To Use This Packet

Use this beside the framed objective. It preserves the useful findings from the
scout pass so the implementation team does not need to rediscover the basic
shape of the problem, but it must not replace the systematic workstream's own
corpus ledger and review.

The next workstream should invoke:

- `framing-design` for the objective, phase frames, and peer-agent prompts.
- `civ7-systematic-workstream` for the full extract/classify/design/prove loop.
- `civ7-open-spec-workstream` for every behavior- or contract-changing slice.
- `civ7-architecture-authority` and product authority before changing public
  controls or persistent config semantics.
- `civ7-operational-debugging` and `@civ7/direct-control` only where live
  Studio/game inspection or behavior proof is actually needed.
- Narsil, TypeScript/TypeBox schema inspection, generated schema/default
  artifacts, and commit history/hotspots as evidence sources.
- Fresh peer agents with framed context. Treat reviewers as collaborators, not
  lint passes.

## Frame

This is not a documentation-only cleanup. The visible problem is that public
authoring surfaces are inconsistent and sometimes under-explained, but the
deeper risk is a collapsed layer boundary: internal step/op/strategy machinery
can become indistinguishable from intentional product-facing controls.

### Hard Core

The correct solution keeps one deterministic configuration model:

- stage config is the author-facing unit;
- `knobs` are stage-scoped semantic controls;
- explicit `public + compile` stages translate semantic public fields into
  internal step/op config;
- no persisted `advanced` wrappers or dual shapes;
- internal step schemas, op envelopes, and strategy parameters are public only
  when deliberately accepted and properly documented;
- generated artifacts and Studio surfaces reflect source authority rather than
  patching over source schema defects.

### Selected In Scope

- Every standard recipe stage and step in the current recipe order.
- Stage `knobsSchema`, optional `public` schema, and `compile` function.
- Step schemas, op declarations, op envelopes, strategy schemas, and defaults.
- Generated `standard.schema.json`, `standard.defaults.json`, recipe metadata,
  Studio focus paths, shipped map configs, presets, and tests.
- TypeBox descriptions/ranges/defaults that make a public control usable.
- Dead or disconnected public config that validates but does not affect the
  selected strategy or runtime behavior.

### Explicitly Exterior

- A broad rewrite of the authoring SDK unless the corpus proves the SDK cannot
  express the required surface.
- Studio-only schema filtering that hides bad source contracts.
- Generated-output hand edits.
- Compatibility shims, silent dual shapes, or "accept old and new" migrations
  without explicit OpenSpec authority.
- Treating all low-level fields as wrong. Some internal-as-public surfaces may
  be valid, but they need evidence and documentation.

### Reframe Triggers

Reframe the workstream if any of these are proven:

- The standard recipe no longer owns the affected surface in the branch tip.
- The SDK `public + compile` model is superseded by a later accepted authority.
- Generated Studio recipe artifacts are no longer derived from source stages.
- A field looks dead locally but is read by a runtime path outside the indexed
  source or through generated Civ7 script integration.

## Scout Findings

### The SDK Already Has The Right Boundary

The live authoring SDK supports the desired separation:

- `packages/mapgen-core/src/authoring/stage.ts`
  - `createStage({ id, knobsSchema, public?, compile?, steps })`
  - stages with `public` must define `compile`;
  - surface schema is `knobs` plus either public fields or internal step keys;
  - `toInternal` extracts knobs and compiles public fields to step-id configs.
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
  - validates stage surface config;
  - invokes `stage.toInternal`;
  - rejects unknown compiled step ids;
  - applies step defaults, step normalize, op default prefill, and op normalize;
  - reports explicit compile errors.
- `packages/mapgen-core/src/authoring/step/contract.ts`
  - step `ops` declarations merge op config schemas into step config;
  - this is internal plumbing unless a stage intentionally exposes it.

Implication: the next workstream should start by applying and guarding the
existing model, not inventing a new config architecture.

### Current Standard Recipe Surface

The standard recipe currently composes these stages:

1. `foundation`
2. `morphology-coasts`
3. `morphology-routing`
4. `morphology-erosion`
5. `morphology-features`
6. `hydrology-climate-baseline`
7. `hydrology-hydrography`
8. `hydrology-climate-refine`
9. `ecology-pedology`
10. `ecology-biomes`
11. `ecology-features`
12. `map-morphology`
13. `map-hydrology`
14. `map-elevation`
15. `map-rivers`
16. `map-ecology`
17. `placement`

Scout observation from the current stack:

- Foundation and several Morphology stages already use explicit
  `public + compile` surfaces.
- Hydrology stages expose meaningful `knobsSchema` descriptions but appear to
  rely on internal-as-public step surfaces for non-knob config.
- Ecology truth stages and Placement are currently mostly internal-as-public
  with empty knobs. That may be correct for some stages, but it is an audit
  target because ecology/feature/resource/brushing work is likely to add public
  controls.
- Projection stages (`map-*`) should remain projection/materialization/readback
  surfaces. Public config there needs special scrutiny because projection knobs
  can masquerade as truth controls.

### Existing Authority Already Names The Problem

Key authority and evidence starters:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
  - D1: flat default stage config `{ knobs?, [stepId]?: stepConfig }`;
  - Problem Layer 2: Authoring Surface Drift;
  - Target Shape: stage owns authoring/config surface, compilation owns
    validation and normalization.
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/01-config-model.md`
  - one configuration model;
  - optional per-stage `public`;
  - knobs are always a stage config field;
  - compile is shape-changing, normalize is shape-preserving.
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/02-compilation.md`
  - canonical compiler phase ordering and error shapes.
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/03-authoring-patterns.md`
  - canonical domain, step, stage, and recipe patterns.
- `openspec/changes/mapgen-public-config-boundary/*`
  - SDK/compiler proof that explicit public surfaces hide raw op envelopes.
- `openspec/changes/morphology-public-config-surface/*`
  - prior stage-specific application of public config cleanup.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
  - current reference, but treat it as potentially transitional during the
    normalization train and reconcile with source.

## Issue Taxonomy To Seed The Corpus

The next team should classify every finding before designing a slice. Suggested
issue buckets:

| Bucket | What It Means | Likely Fix Type |
| --- | --- | --- |
| Poor public documentation | Field is public but lacks what/why/impact/range/default explanation. | Add or repair TypeBox descriptions, docs, and tests. |
| Internal leakage | Author sees raw step/op/strategy machinery without product intent. | Add stage `public + compile`, move field internal, or justify as accepted advanced surface. |
| Coupled low-level fields | Multiple fields only make sense when tuned together. | Collapse into semantic knobs/profile fields that compile to internals. |
| Dead or disconnected config | Field validates but does not affect compiled config, selected strategy, or runtime output. | Remove with migration/unknown-key tests, or reconnect if product-authorized. |
| Stale legacy strategy | Old strategy/config remains available but no longer represents the selected approach. | Remove, archive, or make strategy selection explicit with evidence. |
| Wrong owner layer | Field belongs in run settings, stage knobs, public config, step internals, op strategy, or projection, but lives elsewhere. | Move to the owning layer through a sliced migration. |
| Bad naming/range/default | Field works but is misleading, unbounded, or hard to reason about. | Rename, bound, retune, document, and migrate shipped configs. |
| Generated/Studio leakage | UI/schema artifacts expose internals because source schema is too wide. | Fix source schema and regenerate; do not patch generated artifacts by hand. |
| Behavior change without proof | A public config edit affects generated maps but lacks stats/runtime evidence. | Add stats/golden/runtime gates appropriate to blast radius. |

## Corpus Ledger Shape

The first real workstream artifact should be a complete ledger, not a prose
impression. At minimum, record one row per author-facing field:

| Field | Meaning |
| --- | --- |
| `path` | Full config path, including stage and field/step/op path. |
| `owner` | stage, step, op, domain, projection, Studio, shipped config, or run setting. |
| `layer` | knob, public field, internal-as-public step field, op envelope, strategy config, generated artifact. |
| `schema` | TypeBox source file and schema symbol if available. |
| `default` | Default value and where it comes from. |
| `bounds` | min/max/enum or explicit unbounded reason. |
| `description_quality` | absent, weak, adequate, strong. |
| `why_public` | Product/authoring reason this is user-facing. |
| `impact` | Expected map/gameplay/runtime effect of changing it. |
| `couplings` | Other fields that must move with it. |
| `compile_target` | Internal stage/step/op path after compile. |
| `reachability` | Does it affect compiled config and selected runtime path? |
| `consumers` | shipped configs, presets, Studio, tests, docs, runtime reads. |
| `finding` | keep, document, make semantic, internalize, remove, defer. |

## Verification Starters

Use focused verification first, then broaden only where behavior changes.

Useful local gates:

- `bun test packages/mapgen-core/test/authoring/authoring.test.ts packages/mapgen-core/test/compiler/recipe-compile.test.ts`
- `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/presets-schema-valid.test.ts mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts`
- `bun test mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate <change-id> --strict`
- `git diff --check`

Useful proof patterns:

- derived public schema does not contain raw `{ strategy, config }` unless a
  stage explicitly accepts that as advanced public config;
- every public field has a TypeBox description that names what the field is,
  why it exists, what changing it does, and its meaningful range/default;
- compile snapshots show semantic public fields mapping deterministically to
  internal step/op config;
- removed fields produce clear unknown-key compile errors;
- unchanged slices are behavior-equivalent by compiled-config/golden snapshots;
- changed slices carry stats or runtime evidence proportional to blast radius;
- generated Studio recipe artifacts are regenerated from source and inspected
  for intended field exposure.

Runtime/live proof is not always required. Use `@civ7/direct-control` and
Studio runtime paths when the slice changes generated map behavior, requires
live authoring inspection, or needs game database/runtime confirmation. Record
the exact package/CLI/API path when runtime proof is used.

## Suggested OpenSpec Slice Order

Do not treat this order as mandatory if current evidence points elsewhere, but
it is a reasonable starting decomposition:

1. `authoring-surface-corpus-and-taxonomy`
   - complete the ledger and issue taxonomy before source edits.
2. `authoring-surface-doc-quality-guard`
   - add reusable schema/metadata checks for public field documentation.
3. `foundation-authoring-surface-audit`
   - verify existing public surface and remove/rename/migrate any stale fields.
4. `morphology-authoring-surface-alignment`
   - reconcile with previous Morphology public config work and terrain work.
5. `hydrology-authoring-surface-alignment`
   - classify whether current knobs are sufficient or public fields should
     compile into internal climate/hydrography step configs.
6. `ecology-authoring-surface-alignment`
   - critical for upcoming features/biomes/brushing work; avoid exposing raw
     feature-family scoring internals as the long-term public API.
7. `projection-authoring-surface-audit`
   - keep `map-*` controls projection-owned and documented as such.
8. `placement-authoring-surface-alignment`
   - resources/discoveries/starts/wonders controls must be gameplay-product
     controls, not generator internals.
9. `studio-schema-and-config-migration`
   - prove generated schema/default/preset consumers reflect the intended
     public surface.

## Objective To Pass Forward

Use this as the starting framed objective, then let the next ERA refine only
after checking current stack state and this reference. Keep the worktree and
reference-document pointer outside the objective text when handing it off, so
the objective remains focused on the work rather than on file navigation:

```text
Create a systematic Civ7 standard-recipe authoring-surface cleanup workstream using civ7-systematic-workstream, framing-design, investigation-design, civ7-architecture-authority, civ7-open-spec-workstream, product authority, operational debugging, Narsil, TypeScript/TypeBox schema inspection, Graphite, and framed peer-agent review. The future state is a clean, intentional authoring surface across all authored stage schemas: public fields are semantic, documented, range-bounded, gameplay/execution meaningful, and compiled deterministically into internal stage/step/op configs; private strategy parameters, dead legacy options, and projection/runtime internals are not exposed as user-facing controls.

First isolate repo/worktree/Graphite state on a new branch at the top of the current stack. Diagnose before editing. Treat the seed hypothesis as authoring-surface collapse: some stages intentionally use internal-as-public, but others likely leak step/op envelopes, stale strategy knobs, coupled low-level properties, or weakly documented controls. Use current authority docs, OpenSpec history, commit hotspots, Narsil references, generated schema/default artifacts, shipped configs/presets, Studio consumers, and direct compile traces to separate real public-surface defects from valid low-level surfaces.

Build a complete corpus ledger for the standard recipe. Enumerate every stage, step, knobs schema, public schema, compile function, step schema, op envelope, strategy schema, generated recipe schema/default, shipped map/preset usage, Studio focus path, and runtime read site. For every author-facing field record: path, owner, layer (knob/public/internal-as-public), default, min/max/enum, description quality, why exposed, gameplay/map impact, coupled fields, compile target, selected strategy reachability, tests/docs, and whether changing it changes compiled config or runtime output.

Classify issues into explicit buckets: missing/poor TypeBox documentation; internal parameter leakage; coupled fields that should become semantic knobs/profiles; dead/disconnected config; stale legacy strategy surfaces; misplaced owner layer (run settings vs stage knobs vs step/op vs projection); bad naming/ranges/defaults; generated or Studio-only schema leakage; and behavior-changing public config without stats/proof. Design one solution type per bucket before implementation: document/rename, convert to public+compile, collapse into knobs/profile, move internal, remove with migration, add guard, or defer with reason.

Implement as layered OpenSpec/Graphite slices by domain/stage group, not as one broad sweep: foundation, morphology alignment, hydrology, ecology/biomes/features, projection map-* stages, placement, shared SDK/Studio guards, and shipped config migration. Preserve the flat stage shape `{ knobs?, [publicKey]?: publicConfig }`; no persisted advanced wrappers, dual shapes, generated-output hand edits, compatibility shims, or broad "public everything" exports.

Verify each slice with schema and compile tests: public schema does not leak raw `{ strategy, config }` unless explicitly accepted; every public field has what/why/impact/range/default documentation; shipped configs and presets validate; compile output is deterministic; removed fields fail with clear unknown-key errors; unchanged slices are behavior-equivalent by compiled-config snapshots; changed slices have focused stats/golden evidence. Use Studio schema/default artifacts to prove UI consumers see only intended fields. Use `@civ7/direct-control` or Studio runtime proof only for slices that change generated map behavior or require live authoring inspection, recording exact package/CLI/API path.

Close with agent review of taxonomy, specs, implementation, generated artifacts, migration notes, and proof records. Repair accepted P1/P2 findings before dependent slices. Record exact branch/commit/PR boundaries, what was not runtime-proved, and leave each worktree clean.
```

## Handoff Notes

- This doc is intentionally a seed packet. It should accelerate the next DRA's
  discovery pass, not narrow the required corpus.
- Re-check Graphite stack state before starting. This packet was created above
  `codex/morphology-rough-land-owner`, which was the local stack tip at the
  time of writing.
- If the next DRA starts from this branch, they should create their own work
  branch above it rather than editing this reference slice directly unless the
  task is to repair the packet.
