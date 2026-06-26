# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Diagnostic pattern governance
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-diagnostic-pattern-governance` stacked on `agent-DRA-effect-check-baseline-cutover`
- Started: 2026-06-19
- Status: implementation complete; Graphite submit pending

## Objective

- Target movement: move diagnostic catalog and pattern governance to domain
  services.
- Non-goals: new Grit language semantics.
- Done condition: domain services consume provider evidence and preserve current
  reports.

## Verification

- Commands run:
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/rules/pattern-manifest.test.ts test/rules/pattern-views.test.ts test/generators/pattern-generator.test.ts test/lib/pattern-apply.test.ts test/service/service-architecture.test.ts test/service/fix-service.test.ts test/service/transactions-service.test.ts`
  - `bun run --cwd tools/habitat-harness validate:grit-patterns`
  - `bun run biome:ci`
  - `bun run openspec -- validate deep-habitat-effect-diagnostic-pattern-governance --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `bun run build`
- Evidence boundary: implementation moved ownership and focused/root validation
  is passing. `bun run build` reported Nx flaky-task metadata for
  `@civ7/adapter:build` after successful completion.
