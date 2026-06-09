# Strategy Front Summary Service Slice

Status: implemented local source slice.
Date: 2026-06-05.

## Purpose

Seed the first native `strategy` service procedure after the workstream
rebaseline stopped adding same-shaped read wrappers. `strategy.frontSummary`
is a planning view for support/player agents that composes target-candidate,
battlefield-scan, and optional destination-analysis evidence into one neutral
front summary.

The slice advances semantic capability hierarchy and service-owned behavior
without adding a strategy catalog, transport edge, direct-control procedure
core, action authority, or in-game/runtime proof.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/modules/strategy/contract.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/front-summary.ts`
- `packages/civ7-control-orpc/src/modules/strategy/router.ts`
- `packages/civ7-control-orpc/src/contract.ts`
- `packages/civ7-control-orpc/src/router.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/strategy-front-summary-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- this workstream note

## Behavior Boundary

`strategy.frontSummary`:

- calls `getCiv7TargetCandidates`, `getCiv7BattlefieldScan`, and, when a
  target is supplied or inferred, `getCiv7DestinationAnalysis` as
  direct-control runtime/read ports through oRPC context;
- owns the normal service projection in `packages/civ7-control-orpc`;
- emits source status, target-candidate summaries, points of interest,
  destination pressure, observed owner summaries, policy notes, and semantic
  next-step descriptors for inspection, visibility reads, and
  validator-backed action checks;
- keeps concrete CLI command strings out of the service contract; CLI callers
  may map semantic next-step descriptors into command suggestions locally;
- excludes direct-control `host`, `port`, `state`, raw session, raw command,
  and transport/debug details from normal output;
- preserves `relationship-unproven` for other owners unless official
  relationship, team, war, or suzerain evidence proves stronger labels.

The procedure is read-only planning evidence. It does not move units, attack,
declare war, send actions, validate a target action, or close a blocker.

## Non-Goals

- no same-shaped `strategy.target.candidates` or `strategy.battlefield.scan`
  read wrapper;
- no broad strategy/tactical catalog, world summary revival, or public
  direct-control summary surface;
- no mutation behavior, mutation policy change, validator/postcondition
  middleware, telemetry persistence, or raw proof/debug projection;
- no Studio, RPCLink, OpenAPI, transport, or `Civ7IntelligenceBridge`
  implementation in this service seed; later CLI and controller slices may
  call the same semantic procedure without moving CLI syntax into the service;
- no runtime/live-game proof claim, play-thread action, or Task 5.x/6.x parent
  acceptance by implication.

## Proof

Focused package proof covers:

- in-process router calls compose target-candidate, battlefield-scan, and
  destination-analysis runtime/read ports with endpoint defaults supplied
  through context;
- normal output omits host, port, state, raw command, and command-source
  details;
- normal service output uses semantic next-step descriptors, not `game play`
  command strings;
- other-owner target candidates and observed owners stay
  `relationship-unproven`;
- endpoint/session/state/raw command fields are rejected as procedure input;
- facade failures map through native effect-oRPC tagged errors without raw
  command details;
- the contract metadata publishes `family: "strategy"` and
  `procedureKey: "strategy.frontSummary"`.

Closure gates:

- `bun run --cwd packages/civ7-control-orpc test test/strategy-front-summary-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local package proof only. It proves native service composition and
projection shape, not live Civ7 target-candidate, battlefield, or destination
evidence, not runtime relationship authority, not a complete strategy family,
and not parent Task 5.x/6.x completion. Later caller/controller work may call
the same semantic `strategy.frontSummary` procedure without reviving raw
target-candidate, battlefield-scan, or destination-analysis bridge leaves.
