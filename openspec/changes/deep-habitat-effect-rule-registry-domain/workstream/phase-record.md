# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: rule registry domain
- Owner: rule-registry lane
- Branch/Graphite stack: `agent-DRA-effect-rule-registry-domain` stacked on `agent-DRA-effect-diagnostic-pattern-governance`
- Started: 2026-06-19
- Status: implementation complete

## Objective

Move rule registry and selection authority into named domains.

## Verification

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts test/lib/rule-selection.test.ts test/lib/classify.test.ts test/service/check-service.test.ts test/service/service-architecture.test.ts`
- `bun run biome:ci`
- `bun run build` passed; Nx reported the existing `@civ7/adapter:build` flaky-task notice.
- `bun run openspec -- validate deep-habitat-effect-rule-registry-domain --strict`
- `bun run openspec:validate`
- `git diff --check`
- `bun run habitat:check -- --owner @internal/habitat-harness --json` reached existing current-tree Grit pattern failures after format cleanup. The original packet command `--tool habitat` is stale and rejected by the Habitat selector.
