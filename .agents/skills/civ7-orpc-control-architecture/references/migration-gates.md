# Migration Gates

## Incremental Path

1. **Inventory the current wrapper.** Name the direct-control function, CLI
   command, tests, docs, risk class, and live proof boundary.
2. **Extract a procedure atom without changing callers.** Add a semantic
   contract leaf and matching Effect router leaf under
   `services/civ7-control/src/service/modules/<domain>/`, then add no-network
   behavior tests around the direct-control port.
3. **Route one caller through the procedure.** Prefer one CLI command or one
   Studio endpoint. Keep output contract stable unless the product change is
   intentional and documented.
4. **Centralize repeated policy.** Only after at least two procedure atoms share
   the same guard should it become middleware.
5. **Add edge handlers last.** Mount RPC/OpenAPI only after in-process callers
   and tests prove the router shape.

## Required Gates By Slice

For any direct-control package change:

- `nx run control-direct:check`
- package tests if present or touched
- build/export verification when CLI imports changed symbols

For any CLI game/play command change:

- focused CLI tests for the changed command and adjacent scheduler/priority
  behavior
- `nx run civ7-cli:check`
- broader `game.play.test.ts` gate when shared output, notification scheduling,
  postconditions, or relationship labels are affected

For any `@civ7/control-orpc` contract/router/service change:

- `nx run control-orpc:check` (includes the contract ownership guard),
  `nx run control-orpc:build`, and `nx run control-orpc:test`
- no-network behavior tests with a fake direct-control port (see
  `services/civ7-control/test/behavior/modules/display/display-explore-procedure.test.ts`
  for the lifecycle-ordering pattern: assert the port call sequence, failure
  paths, and cleanup)
- contract meta + error-map coverage for every new procedure key
- dependency review for new `@orpc/*` / `effect` packages

For live-game claims:

- read-only smoke before mutation guidance
- mutation smoke only when explicitly authorized and scoped to the current
  player/game state
- final claim labeled as unit-tested, type-checked, built, CLI-verified,
  live-read, or live-mutated

## Stop Conditions

Stop and ask or nudge the owning thread if:

- a caller imports a new direct-control symbol that package exports/builds do
  not expose, or imports the deleted `@civ7/control-orpc/runtime` surface;
- middleware invents controller capability/proof or swallows a host admission
  refusal;
- a router exposes broad arbitrary runtime execution;
- a relationship/city-state label becomes hostile/enemy/opponent/threat without
  official proof;
- tests prove only TypeScript shape but the handoff claims live game behavior.
