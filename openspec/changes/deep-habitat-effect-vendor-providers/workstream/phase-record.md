# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Vendor providers
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-vendor-providers` stacked on `agent-DRA-effect-runtime-config-errors`
- Started: 2026-06-19
- Last updated: 2026-06-20
- Status: implemented and submitted as Graphite PR #1863

## Objective

- Target movement: turn external tools into typed Effect providers.
- Non-goals: full check/baseline/hook/graph domain cutover and Grit apply
  transaction cutover.
- Done condition: providers have live/fake layers and vendor non-claims.

## Verification

- Commands run:
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test -- test/lib/verify-service.test.ts test/commands/habitat-commands.test.ts test/lib/grit-adapter.test.ts`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run --cwd tools/habitat-harness build`
  - `bun run biome:ci`
  - `bun run openspec -- validate deep-habitat-effect-vendor-providers --strict`
  - `bun run openspec:validate`
  - `node tools/habitat-harness/bin/run.js verify --help`
  - `git diff --check`
- Boundary:
  - `bun run habitat:check` still fails on existing locked source-pattern findings
    plus docs-local advisory debt.
  - The previous broad Grit timeout failure mode no longer reproduces after the
    live-source batch guard was restored.

## Implementation Notes

- Added `src/providers/{biome,git,grit,husky,nx}` plus shared command runner
  result projection.
- Added live/fake provider layers and merged them into `HabitatRuntimeLive`.
- Added the internal `src/service/**` Effect-oRPC spine and routed
  `habitat verify` through the owned verify service module.
- Kept provider internals off the root public package surface.
- Restored the bounded Grit live-source batch refusal until a later Grit
  provider scheduler cutover replaces it.

## Follow-On Owners

- `deep-habitat-effect-command-result-model`: replace optional command result
  fields with discriminated command observation variants.
- `deep-habitat-effect-verify-graph-cutover`: move remaining verify/workspace
  graph contracts into owned domains and remove `SpawnResult` handoff pressure.
- `deep-habitat-effect-check-baseline-cutover`: move check/baseline decisions
  to Effect services and provider seams.
- `deep-habitat-effect-grit-apply-cutover`: replace the bounded refusal with
  provider-owned Grit scheduling and drain adapter bridges.
