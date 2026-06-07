## Why

Exact-authored final-surface parity for request
`studio-run-in-game-mq20rbzr-1fhc` initially had `2/6996` terrain mismatches.
Both were coast/ocean edge swaps. They block parity, but they do not belong in
the feature/resource legality repair lane unless later evidence proves shared
materialization ownership.

## Activation Gate

This change is evidence-gated by the completed exact-authorship/full-grid
parity artifact:

`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`

The source proof hash is
`4973f47b8dd83e9710088d33485b2a985fcdf4dee71b140f2aa23b4bc55ac1dc`.

## Target Authority Refs

- `openspec/changes/civ7-map-policy-final-surface-parity/**`
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-verification-and-runtime-proof.md`
- `openspec/changes/morphology-terrain-authorship-control/**`
- `docs/projects/mapgen-studio/workstream/SWOOPER-RECOVERY-TAKEOVER.md`

## What Changes

- Add terrain-only diagnostic context for local/live terrain mismatches.
- Classify coast/ocean edge swap row shape and nearby terrain neighborhood.
- Add a package-owned direct-control `hydrology.lake` readback fact and a
  runtime-bound terrain-edge verifier that requires successful terrain,
  water/lake/river, and area/region/landmass facts before producing complete
  live context.
- Add local placement validation-boundary readback for terrain, water, lake,
  and area facts before/after validation and maintenance.
- Keep source authority unresolved until shelf/lake/projection-boundary and
  live water/area evidence can distinguish repo projection, hydrology mutation,
  Civ terrain validation, and evidence insufficiency.
- After row-level source authority is classified, repair only the bounded
  `@civ7/adapter` mock lake/terrain materialization gaps and rerun exact-bound
  final-surface parity. Do not treat a partial terrain repair as parity or
  product closure.

## Non-Goals

- No coast/shelf tuning.
- No Earthlike/coast/shelf terrain generation repair.
- No feature/resource repair.
- No parity, product acceptance, Earthlike quality, or mountain-quality closure
  claim.
- No generated output hand edits.

## Affected Owners

- `mods/mod-swooper-maps/src/dev/diagnostics/**`
- `packages/civ7-adapter/**`
- `packages/civ7-direct-control/**`
- `scripts/civ7-direct-control/verify-terrain-edge-live-context.ts`
- `openspec/changes/earthlike-terrain-edge-diagnostics/**`
- Parity/OpenSpec records that route terrain deltas.

## Forbidden Owners

- `mods/mod-swooper-maps/mod/**`
- Swooper Earthlike config/generated map output.
- Feature/resource legality repair, unless later evidence proves shared owner.

## Stop Conditions

- The exact-authored source proof is missing or identity-unstable.
- Terrain rows cannot be tied to a current proof artifact.
- Live readback rows are present but requested terrain/hydrology/area facts are
  missing or failed.
- Records start treating context as repair authority or parity closure.

## Verification Gates

- Focused terrain diagnostic test.
- Terrain edge context artifact for `studio-run-in-game-mq20rbzr-1fhc`.
- Runtime-bound terrain-edge live readback artifact for
  `studio-run-in-game-mq20rbzr-1fhc`.
- Local placement validation-boundary artifact for
  `studio-run-in-game-mq20rbzr-1fhc`.
- Fact-completeness regression for terrain-edge live readback.
- Focused `@civ7/adapter` mock terrain tests/check/build after any bounded
  adapter materialization repair.
- Exact-authored final-surface parity rerun after any bounded terrain repair,
  with unresolved residuals left open.
- `bun run --cwd mods/mod-swooper-maps check`.
- `bun run --cwd packages/civ7-direct-control check`.
- `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
