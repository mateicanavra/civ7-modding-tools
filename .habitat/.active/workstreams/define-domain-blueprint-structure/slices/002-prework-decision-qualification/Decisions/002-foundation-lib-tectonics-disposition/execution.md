# Foundation Lib Mechanical Cleanup Execution

Status: closed

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

## Slice Boundary

Slice 1 executes only the mechanical subset of the closed disposition table:

- dead/stale deletion;
- foundation-internal policy/rules moves;
- replacement of the local `shared.ts` `clamp01` wrapper with the existing core
  `clampFinite(value, 0, 1, 0)` semantics.

Explicitly out of scope:

- `require.ts` guard decomposition execution;
- artifact contract split for `internal-contract.ts` and `schemas.ts`;
- new `packages/mapgen-core` math/grid/mesh APIs;
- source movement for `clampByte`, `clampInt8`, `normalizeToInt8`,
  `NeighborhoodMesh`, `computeMeanEdgeLen`, `findNearestCell`, or
  `chooseDriftNeighbor`.

## Executed Rows

| Row class | Execution |
| --- | --- |
| Crust buoyancy policy | Moved `foundation/lib/crust/buoyancy.ts` to `foundation/model/policy/crust-buoyancy.ts`; updated live operation imports. |
| Reference-area policy | Moved `foundation/lib/normalize.ts` to `foundation/model/policy/reference-area.ts`; updated live operation, test, and canonical doc anchors. |
| Tectonic event types | Split `EVENT_TYPE` to `foundation/model/policy/tectonic-event-types.ts`; updated live operation-rule imports. |
| Reset threshold policy | Split reset threshold constants and `deriveResetThreshold` to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`; updated provenance rules. |
| Tracer advection constant | Split `ADVECTION_STEPS_PER_ERA` to `foundation/ops/compute-tracer-advection/rules/constants.ts`; updated tracer-advection rules. |
| Existing core replacement | Removed the local `foundation/lib/tectonics/shared.ts` `clamp01` export; updated the live hotspot-events importer to use `clampFinite(value, 0, 1, 0)` from `@swooper/mapgen-core/lib/math`. |
| Dead duplicate files | Deleted `foundation/lib/tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, and `tracing.ts`. |
| Stale constants | Deleted stale `ERA_COUNT_MIN`, `ERA_COUNT_MAX`, `OROGENY_ERA_GAIN_MIN`, and `OROGENY_ERA_GAIN_MAX` with the old `foundation/lib/tectonics/constants.ts` owner. Live era-count ownership remains `compute-era-plate-membership/rules/constants.ts`. |

## Proof

Pre-edit evidence:

- Narsil repo id `civ7-modding-tools#2fa31857` was available.
- Narsil `find_references` confirmed live consumers for
  `deriveFoundationReferenceArea`, `deriveBuoyancy`, `EVENT_TYPE`,
  `ADVECTION_STEPS_PER_ERA`, `deriveResetThreshold`, and the local `clamp01`
  wrapper.
- `knip` was available and run with
  `bunx --bun knip --no-exit-code --reporter compact`. It reported the dead
  duplicate tectonics files as unused, but its broad repo output includes many
  unrelated resources; it is supporting evidence only.
- `bun habitat classify mods/mod-swooper-maps/src/domain/foundation` selected
  `nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test`, and
  workspace lint as relevant proof surfaces.

Post-edit proof:

- `nx run mod-swooper-maps:check` passed.
- Focused Bun foundation tests passed:
  `bun test test/foundation/reference-area-policy.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/mesh-first-ops.test.ts test/foundation/m11-plate-graph-resistance.test.ts`
  - 17 tests passed.
- Focused old-path import scans returned no source/test hits for deleted or
  moved Slice 1 paths:
  - `foundation/lib/crust/buoyancy`
  - `foundation/lib/normalize`
  - `foundation/lib/tectonics/constants`
  - `foundation/lib/tectonics/index`
  - `foundation/lib/tectonics/events`
  - `foundation/lib/tectonics/fields`
  - `foundation/lib/tectonics/membership`
  - `foundation/lib/tectonics/provenance`
  - `foundation/lib/tectonics/rollups`
  - `foundation/lib/tectonics/tracing`
- Focused scan found no remaining `clamp01` reference in
  `foundation/lib/tectonics/shared.ts` or the hotspot-events rules file.
- `bun habitat classify .habitat/.active` passed classification and reported
  only workspace lint as a runnable target for `.habitat/.active`.
- `git diff --check -- .habitat/.active mods/mod-swooper-maps/src mods/mod-swooper-maps/test`
  passed.

Verification limitation:

- `nx run mod-swooper-maps:test` was run to completion and failed inside
  `mod-swooper-maps:habitat:check`.
- A clean detached worktree at pre-slice `HEAD` (`b5507a183e`) ran
  `nx run mod-swooper-maps:habitat:check` and failed with the same 53
  Habitat/Grit rule failures. This proves the full target failure is an
  existing stack gate state, not a Slice 1 regression.
- The focused tests above cover the changed foundation behavior, and
  `nx run mod-swooper-maps:check` completed successfully.

## Review

Fresh-agent review wave:

- Source/import reviewer: no findings. Reviewer confirmed no live source/test
  imports reference deleted or moved Slice 1 paths, protected Slice 2 files
  remain present, and `bunx tsc --noEmit -p mods/mod-swooper-maps/tsconfig.json`
  passed.
- Behavior reviewer: no findings. Reviewer confirmed `clamp01(value)` old
  behavior matches `clampFinite(value, 0, 1, 0)`, moved constants and
  `deriveResetThreshold` have no semantic drift, and the selected focused tests
  are sufficient for Slice 1.
- Closure/scope reviewer: findings resolved.
  - P1 project test proof: resolved by running the full target to completion and
    proving the Habitat owner-check failure also exists at clean pre-slice
    `HEAD`.
  - P2 execution record pending state: resolved by this closed execution record.
  - P2 untracked files: resolved at commit gate by staging all Slice 1 files
    with the deletions and moved destinations.

No Slice 2 work appears in this execution. `require.ts`, `internal-contract.ts`,
`schemas.ts`, and deferred `shared.ts` helpers remain for the artifact-contract
and core-extraction slices.
