# Authoring Surface Taxonomy And Slice Plan

## Issue Buckets

| bucket | definition | solution type |
| --- | --- | --- |
| missing or poor TypeBox documentation | Author-facing object/leaf lacks what/why/impact/default/range context. | Document in schema; add guard coverage for public fields. |
| internal parameter leakage | Public schema exposes raw step ids, op ids, `{ strategy, config }`, derived fields, or runtime plumbing. | Convert to semantic public schema plus compile, or move internal. |
| accepted internal-as-public low-level surface | A stage intentionally has no public+compile transform and uses the default flat `{ knobs?, [stepId]?: stepConfig }` authoring shape. This is acceptable only when the step config is gameplay/execution meaningful, documented, bounded, and not merely private strategy/runtime plumbing. | Keep as step-key config with docs and tests, collapse selected controls into semantic knobs/profiles, or move private details internal. |
| coupled low-level fields | Several numeric implementation fields must be tuned together to make one gameplay decision. | Collapse into semantic knob/profile; compile to low-level config. |
| dead or disconnected config | Field validates but does not affect compiled config or runtime output. | Remove with migration or add runtime guard if intentionally reserved. |
| stale legacy strategy surface | Old strategy selector or config remains author-facing after strategy consolidation. | Remove or move internal; add unknown-key failure tests. |
| misplaced owner layer | Field belongs to run settings, stage knobs, projection, Studio-only metadata, or runtime internals rather than stage public config. | Move to the owning layer; document boundary. |
| bad naming, ranges, or defaults | Field name, enum, default, min/max, or units do not match product meaning. | Rename/document/range-bound with migration and compile proof. |
| generated or Studio-only schema leakage | Generated artifacts or UI focus paths expose fields absent from intended public schema. | Regenerate artifacts and add Studio schema/default guard. |
| behavior-changing public config without proof | Field changes generated output but lacks stats, golden diff, or runtime evidence. | Add focused stats/golden/direct-control proof, or defer only with accepted owner, authority reference, trigger, and an explicit statement that the slice does not claim behavior proof. |

## Current Classification

| domain | finding | bucket | action |
| --- | --- | --- | --- |
| foundation | `semantic-public-config` exposes public step keys and raw op envelopes (`mesh.computeMesh`, tectonics ops, etc.). | internal parameter leakage | Convert to semantic public controls plus compile; keep projection internal. |
| morphology-coasts | Semantic surface exists but many public numeric leaves have weak docs and some lack bounds. | missing or poor documentation; bad ranges/defaults | Document/range review; keep current public+compile shape unless coupled fields should become profiles. |
| morphology-routing | Public empty knobs surface is weakly described. | missing or poor documentation | Document why routing has no public controls or hide empty surface if not useful. |
| morphology-erosion | Public `geomorphicCycle` exposes fluvial/diffusion/deposition implementation terms. | coupled low-level fields | Decide whether to retain expert public surface or collapse to erosion-age/profile controls. |
| morphology-features | Semantic groups exist, but many low-level density/chance fields are profile candidates. | coupled low-level fields; documentation | Keep public groups but audit profile and range semantics. |
| hydrology | Climate and hydrography expose many strategy configs through internal-as-public step schemas. | accepted internal-as-public low-level surface candidate; stale strategy surface | Decide public climate/water knobs before keeping or hiding selected internals. |
| ecology | Pedology/biome/feature planning exposes strategy/scoring internals, empty execution envelopes, and plot-effect selector ids. | coupled low-level fields; stale strategy surface | Expose semantic Ecology truth-stage groups, collapse strategy selection into profiles, keep behavior-equivalent expert scoring/planning controls where shipped maps depend on exact values, and hide raw envelopes, empty ops, and selector ids. |
| projection `map-*` | Projection surfaces are small but owner-layer intent is uneven. | misplaced owner layer; generated or Studio-only leakage | Keep map-materialization fields only when they directly affect Civ7 projection. |
| placement | Planner and placement inputs expose raw op envelopes and candidate lists. | internal parameter leakage; coupled low-level fields | Create semantic placement controls, compile to internal planner config, and migrate configs. |
| shared SDK/Studio | Studio renders whatever generated schema exposes. | generated or Studio-only schema leakage | Add guard tests over generated schema/default/uiMeta artifacts. |

## Slice Gates

Each cleanup slice must prove:

- The public schema for touched stages does not expose raw `{ strategy, config }`
  unless an OpenSpec/design record explicitly accepts that field as public.
- Touched default step-key surfaces are accepted only if each exposed step/op
  field is documented, range-bounded where numeric, gameplay/execution
  meaningful, and not private runtime/projection plumbing.
- Every public field has author-facing documentation covering what it controls,
  why it exists, gameplay/map impact, default, and range/enum semantics.
- First-party shipped configs and presets are migrated and validate in the same
  behavior slice that changes their schema.
- Compile output is deterministic.
- Removed fields fail with clear unknown-key errors.
- Unchanged slices are behavior-equivalent by compiled-config snapshot.
- Changed slices have focused stats/golden/runtime evidence appropriate to the
  behavior changed.
- Generated schema/default/uiMeta artifacts and Studio consumers expose only
  intended fields in the same behavior slice that changes those fields.

## Review Lanes

- Architecture authority: flat stage shape, truth/projection split, and owner
  layer boundaries.
- Product authority: gameplay meaning, defaults, ranges, and whether a control
  belongs to authors.
- Operational debugging: only use direct control or live Studio proof for
  behavior-changing slices.
- Narsil/code intelligence: reference and runtime-read-site checks, avoiding
  hybrid search when it destabilizes the MCP server.
- TypeScript/TypeBox: schema, default, enum, bound, and compile inference
  inspection.
- Graphite/OpenSpec: one logical cleanup slice per branch/change record.
- Framed peer-agent review: taxonomy, spec, implementation, generated artifacts,
  migration notes, and proof records before dependent slices.
