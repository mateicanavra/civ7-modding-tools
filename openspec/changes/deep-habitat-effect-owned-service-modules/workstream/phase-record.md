# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Owned service modules
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-owned-service-modules` stacked on `agent-DRA-effect-vendor-providers`
- Started: 2026-06-20
- Last updated: 2026-06-20
- Status: extended for transaction service module and validated

## Objective

- Target movement: make Effect-oRPC service modules the owned Habitat
  capability surface and keep providers as resource dependencies.
- Non-goals: full drain of every `src/lib/**` domain, command result
  observation redesign, final provider bridge deletion.
- Done condition: command-facing owned capabilities route through Effect-oRPC
  service modules, transaction application is no longer an incidental
  `src/lib` runner, and guard tests pin the service/provider boundary for
  follow-on dominos.

## Authority Inputs

- Direct user direction: owned service module logic belongs in Effect-oRPC,
  while providers remain dependencies/resources.
- `civ7-open-spec-workstream`
- `civ7-orpc-control-architecture`
- `civ7-systematic-workstream`
- `domain-design`, `system-design`, `solution-design`, `typescript`
- Official `effect-orpc` README/docs checked on 2026-06-20.
- Reference service topology:
  `/Users/mateicanavra/Documents/.nosync/DEV/magic-apply/magic-migration/collect-ingest/services/collect/src/service/**`

## Verification

- Commands run:
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test -- test/service/check-service.test.ts test/service/service-architecture.test.ts test/lib/verify-service.test.ts`
  - `bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts`
  - `bun run --cwd tools/habitat-harness test -- test/service/transactions-service.test.ts test/service/fix-service.test.ts test/service/service-architecture.test.ts test/lib/pattern-apply.test.ts`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run openspec -- validate deep-habitat-effect-owned-service-modules --strict`
  - `bun run openspec:validate`
  - `bun run biome:ci`
  - `git diff --check`

## Implementation Notes

- The previous top branch name `agent-DRA-effect-command-result-model` was
  renamed before implementation because command observations are not the right
  current domino until owned service modules are explicit.
- Added the `check` service module and routed `habitat check` through the
  in-process service client.
- Added the `transactions` service module, composed it into the root
  Effect-oRPC service contract/router, routed `fix` transaction application
  through it, and deleted the old `src/lib/pattern-apply/run.ts` execution
  entrypoint.
- Added architecture guard tests for service runtime construction, root router
  composition, module procedure bindings, provider direction, and CLI service
  routing.
