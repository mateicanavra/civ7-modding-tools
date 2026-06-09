# Mutation Readiness Middleware Native Slice

## Purpose

Add a shared native control-oRPC mutation precondition: approved mutation
procedures must verify playable readiness before any direct-control mutation
runtime port is invoked.

This advances player-agent safety without moving Civ7 runtime authority into
`packages/civ7-control-orpc`. The readiness evidence still comes from the
direct-control playable-status runtime port; the service package owns the
caller-facing guard and typed error projection.

## Write Set

- `packages/civ7-control-orpc/src/middleware/mutation-readiness.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- Existing native mutation procedure leaves:
  - `city.production.choice.request`
  - `notifications.dismiss.request`
  - `unit.target.action.request`
  - `city.population.place.request`
- Focused production-choice middleware proof and adjacent mutation fixture
  updates.
- OpenSpec task/workstream records for this bounded native middleware slice.

## Behavior Boundary

The middleware:

- uses `civ7ControlOrpcImplementer.middleware(...)`;
- runs after mutation approval and before direct-control mutation ports;
- calls `context.directControl.getCiv7PlayableStatus(context.endpointDefaults)`;
- rejects non-playable readiness with `MUTATION_READINESS_REQUIRED`;
- maps readiness read failures to `MUTATION_READINESS_UNAVAILABLE` without raw
  command/session details;
- leaves successful procedure outputs unchanged.

## Non-Goals

- no runtime/live-game proof claim from local tests;
- no CLI, Studio, RPCLink, global bridge, or in-game controller adapter;
- no custom readiness bus, polling framework, or procedure-core runner;
- no validator-first middleware or postcondition/proof middleware;
- no Task 5.x or 6.x parent acceptance by implication.

## Proof

Focused proof covers:

- non-playable readiness rejects before the production-choice mutation port;
- readiness read failures become typed safe errors without raw command details;
- all four existing mutation leaves still pass behavior-preservation tests;
- published procedure error maps include the readiness errors.

Planned closure gates:

- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts notification-dismissal-procedure.test.ts unit-target-action-procedure.test.ts city-population-placement-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local package proof over fake direct-control ports. It proves middleware
ordering and public projection, not live Civ7 runtime availability. Runtime
closure still requires support-owned real-game proof in a later runtime-facing
slice.
