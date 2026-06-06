# Game UI Strategy Front Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add game-resident tactical read dependencies behind the service-owned
`strategy.frontSummary` procedure.

This advances the controller read path for support/player agents without
adding raw target-candidate or battlefield-scan bridge leaves. The strategy
procedure remains the caller-facing owner of planning projection, relationship
policy, notes, and next steps; the adapter supplies low-level game-UI owner,
unit, city, and map read evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-strategy-front.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`,
  `workstream/strategy-front-summary-service-slice.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `strategy.frontSummary` as a supported
  read only when controller proof exists and ambient `Players`,
  `Players.Units`, `Players.Cities`, `Units`, `Cities`, `GameInfo.Units`, and
  `GameplayMap` dependencies needed by the game-UI tactical reads exist.
- Bridge ingress allowlists the semantic `strategy.frontSummary` procedure
  only. It does not expose raw `targetCandidates`, `battlefieldScan`, or
  generic tactical catalog leaves.
- The game-UI adapter returns internal target-candidate and battlefield-scan
  runtime-port result shapes required by the existing strategy procedure; the
  procedure still owns normal caller-facing projection.
- Missing required owner/unit/city APIs fail closed instead of silently
  producing partial strategy output.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names,
  direct-control socket details, and raw tactical read-port envelopes.
- Other-owner contact, proximity, ranking, and action legality remain
  `relationship-unproven`; no hostile, enemy, opponent, threat, war, ally, or
  suzerain labels are inferred.

## Non-Goals

- no `strategy.targetCandidates` or `strategy.battlefieldScan` public leaves;
- no broad strategy, tactical, target, or operation catalog;
- no unit movement/attack/send authority;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `strategy-front-summary`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected tactical read APIs,
and observes useful front evidence without leaking relationship labels or raw
runtime details.
