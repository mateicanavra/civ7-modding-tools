## Why

The packet train is archived, but the post-closure architecture/DX review found
residual normalized-shape gaps that should not fossilize as "good enough":
projection evidence still sat under truth owners, `map-morphology` retained the
last custom persisted config alias surface, `map-*` code still mixed truth
planning with projection, placement kept product/effect work behind one broad
step, and broad config/artifact buckets needed explicit owner disposition.

This change is a follow-on standardization pass. It executes the same
architecture normalization rules against remaining in-kind violations instead
of treating each as a special case.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  truth and projection stay separate; default stage config is flat; steps own
  executable contracts; placement splits only at real product/effect contracts;
  broad buckets are not owners.
- `docs/system/libs/mapgen/policies/IMPORTS.md`: shared config surfaces must be
  thin facades or named shared invariants with concrete consumers.
- `openspec/specs/change-management/spec.md`: OpenSpec changes do not authorize
  shims, fallbacks, silent skips, dual paths, or compatibility lanes.
- Direct user guidance in this workstream: do not alias, fallback, or preserve
  ambiguous options; comments should record useful why/what intent; categorical
  violations require categorical repairs and guards where persistent.

## What Changes

- Move Hydrology engine projection evidence to a `map-hydrology` owner surface
  and remove Hydrology-owned projection artifact ids.
- Migrate `map-morphology` to the same flat persisted step-id config surface as
  other stages.
- Move morphology mountain ridge/foothill planning out of the projection stage
  and into Morphology truth artifacts/steps; keep `map-morphology` projection
  steps projection-only.
- Delete unused compensation paths such as the combined ridge/foothill op after
  split owners exist.
- Split the remaining placement monolith into explicit product/effect steps for
  resource placement, start assignment, discovery placement, advanced starts,
  and final summary, while leaving true maintenance transactions grouped under
  an explicit preparation/finalization owner.
- Disposition broad shared surfaces (`map-artifacts`, tags, Ecology/Morphology
  artifacts, Narrative config) as named invariant owners or thin facades, and
  move anything strategy/family-owned to the real owner.
- Add or tighten guardrails/tests where a category is likely to regress.
- Add useful why/what comments where ownership, projection, product contracts,
  or non-obvious policy is encoded.

## Capabilities

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds follow-on requirements for residual
  standardization after packet-train archive.

## Dependencies

- Builds on the archived packet train through
  `normalize-sdk-mapgen-runtime-entrypoint`.
- Enables future feature work to use one consistent authoring, artifact,
  projection, and placement shape instead of preserving exceptions.

## Forbidden Non-Goals

- No aliases, fallbacks, compatibility wrappers, dual artifact ids, or dual
  persisted config shapes.
- No broad `shared`, `config.ts`, `artifacts.ts`, or tag buckets unless the
  invariant and concrete consumers are named.
- No moving strategy-specific config schemas into domain-root config catalogs.
- No manual generated-output edits.
- No test-only architecture that manually wires adapters/steps as closure
  evidence for recipe-level product boundaries.

## Impact

- Affected owners: Swooper standard recipe stages, MapGen core authoring only
  if reusable validation/guard machinery is warranted, Swooper domain config
  surfaces, docs/policies, and OpenSpec records.
- Expected write set:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/**`
  - `mods/mod-swooper-maps/src/domain/**`
  - `mods/mod-swooper-maps/src/maps/configs/**`
  - `mods/mod-swooper-maps/src/presets/**`
  - `mods/mod-swooper-maps/test/**`
  - `docs/system/libs/mapgen/**`
  - `docs/system/mods/swooper-maps/**`
  - `scripts/lint/lint-normalization-guardrails.mjs`
  - `openspec/changes/normalize-architecture-dx-standardization/**`
- Stop conditions:
  - a product behavior change is needed that is not implied by the packet;
  - a proposed repair needs a compatibility path to pass;
  - generated output would need hand editing;
  - a guard would red-bar current intended source without the owning repair.
- Verification gates:
  - focused changed-area tests;
  - `bun run --cwd mods/mod-swooper-maps check`;
  - `bun run lint:normalization-guardrails -- --self-test`;
  - `bun run lint:normalization-guardrails`;
  - `bun run openspec -- validate normalize-architecture-dx-standardization --strict`;
  - `bun run openspec:validate`;
  - `bun run build`;
  - `bun run deploy:mods`;
  - `git diff --check`.
