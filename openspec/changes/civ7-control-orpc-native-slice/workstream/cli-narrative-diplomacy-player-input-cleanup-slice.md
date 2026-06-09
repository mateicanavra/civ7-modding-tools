# CLI Narrative/Diplomacy Player Input Cleanup Slice

## Scope

Remove caller `playerId` from the native send inputs for
`narrative.choice.request`, `diplomacy.response.request`, and
`diplomacy.firstMeet.response.request`.

The service procedures remain under their existing domain routers. The
contract-owned schemas stay private to their contract modules, and bridge
ingress continues to derive concrete request/response schemas from the
aggregated `Civ7ControlOrpcContract`.

## Write Set

- `packages/civ7-control-orpc/src/modules/narrative/contract.ts`
- `packages/civ7-control-orpc/src/modules/narrative/procedures/choice-request.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/contract.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/procedures/response-request.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/procedures/first-meet-response-request.ts`
- `packages/civ7-control-orpc/test/narrative-choice-procedure.test.ts`
- `packages/civ7-control-orpc/test/diplomacy-response-procedure.test.ts`
- `packages/civ7-control-orpc/test/first-meet-response-procedure.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/src/commands/game/play/respond-diplomacy.ts`
- `packages/cli/src/commands/game/play/respond-first-meet.ts`
- `packages/cli/test/commands/game.play.narrative.test.ts`
- `packages/cli/test/commands/game.play.diplomacy-response.test.ts`
- `packages/cli/test/commands/game.play.first-meet.test.ts`
- `packages/cli/test/commands/game/play/notification/hud.test.ts`
- `docs/projects/civ7-live-play-support/topics/first-meet-diplomacy.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-diplomacy-response-orpc-send-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-narrative-choice-orpc-send-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-diplomacy-response-ingress-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/game-ui-diplomacy-response-runtime-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/game-ui-first-meet-runtime-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/game-ui-narrative-choice-runtime-slice.md`
- this workstream note

## Boundary

- Send-mode public inputs omit caller `playerId`.
- The service reads live notification/local-player evidence before invoking the
  direct-control runtime port.
- Dry-run validation commands may remain direct-control/player-scoped and keep
  `--player-id`.
- Normal procedure/CLI/bridge output still projects source-owned acted-player
  evidence and omits raw command/session/state/Tuner payloads, runtime
  envelopes, UI closeout internals, and legacy `verified`.
- No exported per-procedure schema constants or duplicate standard-schema bags.
- No approval/reason mechanic, transport expansion, play-thread action,
  runtime proof claim, generic decisions root, or parent Task 5.x/6.x/7.x
  acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/narrative-choice-procedure.test.ts test/diplomacy-response-procedure.test.ts test/first-meet-response-procedure.test.ts test/controller-bridge-ingress.test.ts test/game-ui-controller.test.ts`
- `bun run test:cli:play -- game.play.narrative.test.ts game.play.diplomacy-response.test.ts game.play.first-meet.test.ts game/play/notification/hud.test.ts`
- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- `bun run build:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- private procedure-schema export scan; contract standard-schema constants remain
  contract-local/private
- stale send-mode `--player-id` scan; no hits
- active approval/caller-permission scan; hits are limited to negative
  exclusion, proof-scan, retirement, or bad-input rejection language
- `git diff --check`

These are local package/CLI proofs only and do not claim deployed Civ7 runtime
proof.
