# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: orientation workspace graph
- Owner: workspace graph lane
- Branch/Graphite stack: `agent-DRA-effect-orientation-workspace-graph` stacked on `agent-DRA-effect-rule-registry-domain`
- Started: 2026-06-19
- Status: implementation complete

## Objective

Separate Nx provider facts from Habitat classify/orientation decisions.

## Verification

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts test/lib/workspace-graph.test.ts test/service/classify-service.test.ts test/service/service-architecture.test.ts test/service/check-service.test.ts test/lib/verify-receipt.test.ts test/lib/verify-service.test.ts test/rules/registry/facts.test.ts`
- `bun run habitat classify tools/habitat-harness/src`
- `bun run biome:ci`
- `bun run build` passed; Nx reported the existing `@civ7/adapter:build` flaky-task notice.
- `bun run openspec -- validate deep-habitat-effect-orientation-workspace-graph --strict`
- `bun run openspec:validate`
- `git diff --check`
