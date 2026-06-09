# CLI Formation Snapshot oRPC Slice

## Status

Local package, CLI, OpenSpec, and boundary-scan proof collected.

## Purpose

Route `civ7 game play formation-snapshot` through the native in-process
`strategy.formationSnapshot` server-side client. The control-oRPC service owns
formation posture composition over current notification, ready-unit, and
battlefield evidence. The CLI remains an edge adapter that builds endpoint
context and maps semantic next-step descriptors into command suggestions for
CLI presentation only.

## Write Set

- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/strategy/contract.ts`
- `packages/civ7-control-orpc/src/modules/strategy/router.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/formation-snapshot.ts`
- `packages/civ7-control-orpc/test/strategy-formation-snapshot-procedure.test.ts`
- `packages/cli/src/commands/game/play/formation-snapshot.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-formation-snapshot-orpc-slice.md`

## Boundary

- `strategy.formationSnapshot` owns formation posture, source status, safe
  unit/contact projections, relationship-safe reasons, and semantic next-step
  descriptors.
- Direct-control remains the low-level runtime/read port provider for
  notification, ready-unit, and battlefield evidence.
- Procedure input/output schemas stay contract-local; callers use the aggregate
  contract/router/server client rather than per-procedure schema exports.
- Service output does not contain literal `game play ...` CLI command strings.
- The CLI may still present command suggestions, but that translation is a CLI
  presentation concern and not part of the native service contract.
- Controller bridge allowlisting and game-resident formation support remain
  pending.
- Battlefield evidence is planning context only. Owner mismatch, proximity,
  contact, ranking, and action legality remain relationship-unproven without
  official relationship, team, or equivalent diplomatic evidence.
- No raw host, port, state, session, command, rawCommand, Tuner payload,
  notification details, ready-unit operation payloads, raw unit evidence,
  direct-control runtime envelope, approval/reason mechanic, transport
  expansion, play-thread action, movement, founding, action-send authority, or
  live runtime proof is claimed.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/strategy-formation-snapshot-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game.play.tactical-read.test.ts`
- `bun run test:cli:play`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; the new `strategy.formationSnapshot`
  input/result schemas remain contract-local, with only tagged error data
  following the existing public error pattern.
- Active approval/caller-permission scan over changed surfaces; hits are only
  input exclusion text and approval-removal proof-scan/retirement language in
  OpenSpec.
- Service-output CLI-string scan; no literal `game play` command strings appear
  in the control-oRPC service source.
- Relationship-label safety scan; changed service, CLI, and focused test source
  do not contain hostile/enemy/opponent/threat/war/ally/suzerain labels.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, play-thread state, controller bridge behavior, transport
behavior, relationship authority, movement/action sends, or parent Task
5.x/6.x/7.x acceptance.
