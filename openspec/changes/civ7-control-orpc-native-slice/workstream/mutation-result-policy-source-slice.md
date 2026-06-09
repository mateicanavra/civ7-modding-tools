# Mutation Result Policy Source Slice

## Purpose

Retire repeated mutation result projection logic inside
`packages/civ7-control-orpc` without moving domain proof classification into a
custom procedure framework or premature middleware.

The repeated service-owned behavior is narrow: after a direct-control runtime
port returns a domain-specific result, the control-oRPC service derives a
caller-facing request status and next-step guidance from:

- whether the send happened;
- whether the postcondition confidence is confirmed;
- whether the source-owned proof policy requires no-repeat-after-unverified.

## Write Set

- `packages/civ7-control-orpc/src/policy/mutation-result.ts`
- Existing native mutation procedure leaves:
  - `city.production.choice.request`
  - `notifications.dismiss.request`
  - `unit.target.action.request`
  - `city.population.place.request`
- OpenSpec task/workstream records for this bounded policy extraction.

## Behavior Boundary

The shared policy owns only status and next-step derivation. It does not call
direct-control, validate mutation inputs, classify postconditions, infer runtime
success from legacy `verified`, or weaken no-repeat guards.

Production choice and notification dismissal continue to map guarded confirmed
states to their existing public status unions without adding a new
`sent-guarded` output. Unit target action and population placement retain their
existing guarded status shape.

## Non-Goals

- no direct-control procedure-core, operation catalog, or raw operation result
  public type;
- no shared validator-first middleware or postcondition/proof middleware;
- no generic proof classifier over every mutation family;
- no transport, CLI, Studio, bridge, or runtime/live proof claim;
- no Task 5.x or 6.x parent acceptance.

## Proof

Focused mutation procedure tests preserve the public behavior across the four
native mutation leaves:

- production choice;
- notification dismissal;
- unit target action;
- population placement.

Planned closure gates:

- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts notification-dismissal-procedure.test.ts unit-target-action-procedure.test.ts city-population-placement-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The actual postcondition/no-repeat classifiers remain intentionally
domain-specific. A future shared proof middleware must consume an accepted
common proof envelope; this slice is not that envelope and does not create one.
