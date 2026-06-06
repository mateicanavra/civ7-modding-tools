# CLI Front Summary oRPC Slice

## Status

Local package, CLI, OpenSpec, and generated-bundle proof collected.

## Purpose

Route `civ7 game play front-summary` through the native in-process
`strategy.frontSummary` service procedure and move the remaining front-planning
composition out of the CLI command. The service owns target-candidate,
battlefield, optional destination-analysis, source-status, front posture, risk,
relationship-safe wording, and semantic next-step descriptors.

The CLI remains an edge adapter: it builds endpoint context, parses command
flags, calls the server-side client, and maps semantic next-step descriptors
into CLI command suggestions for CLI output only.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/game-ui-strategy-front.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/modules/strategy/contract.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/front-summary.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/strategy-front-summary-procedure.test.ts`
- `packages/cli/src/commands/game/play/front-summary.ts`
- `packages/cli/test/commands/game.play.tactical-read.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/strategy-front-summary-service-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-front-summary-orpc-slice.md`

## Boundary

- `strategy.frontSummary` composes direct-control target-candidate,
  battlefield-scan, and destination-analysis runtime/read ports through oRPC
  context.
- The service output uses semantic next-step descriptors and relationship-safe
  planning language. It does not emit literal `game play ...` CLI command
  strings.
- The CLI may still present command suggestions, but that translation is a CLI
  presentation concern and not part of the native service contract.
- The game-UI strategy adapter exposes destination-analysis evidence through
  the same low-level ambient owner/unit/city reads so the existing controller
  `strategy.frontSummary` path remains coherent after the richer service
  composition.
- No raw host, port, state, session, command, rawCommand, direct-control
  runtime envelopes, relationship labels beyond official evidence, action
  sends, transport expansion, play-thread action, or live runtime proof is
  claimed.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/strategy-front-summary-procedure.test.ts`
- `bun run test:cli:play -- game.play.tactical-read.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run test:cli:play`
- `bun run check:cli`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; the new `strategy.frontSummary`
  input/result schemas remain contract-local, with bridge envelopes derived
  from the aggregate contract.
- Active approval/caller-permission scan over changed surfaces; hits are only
  approval-removal proof-scan/retirement language in OpenSpec.
- Service-output CLI-string scan for `strategy.frontSummary`; no literal
  `game play` command strings appear in the control-oRPC service or generated
  game-UI entrypoint.
- Generated bundle/runtime leakage scan; no Node/direct-control socket runtime,
  raw command/session payload symbols, RPC transport symbols, or retired
  approval tokens appear in the rebuilt game UI bundle.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, controller bundle behavior, live relationship authority,
target-action safety, or parent Task 5.x/6.x/7.x acceptance.
