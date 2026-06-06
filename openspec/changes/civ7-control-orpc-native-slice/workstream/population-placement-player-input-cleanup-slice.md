# Population Placement Player Input Cleanup Slice

## Status

Implemented local package, CLI, controller, OpenSpec, and generated-bundle
proof slice.

## Purpose

Remove caller `playerId` from the public `city.population.place.request`
assign-worker send surface. Assign-worker send mode now accepts only
`{ mode: "assign-worker", location }`; the service reads live local-player
notification evidence and passes that value to the low-level direct-control
assign-worker runtime/proof port. Dry-run validation remains direct-control
and player-scoped.

## Write Set

- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/population-place-request.ts`
- `packages/civ7-control-orpc/test/city-population-placement-procedure.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/cli/src/commands/game/play/assign-worker.ts`
- `packages/cli/test/commands/game.play.population-placement.test.ts`
- `packages/cli/test/commands/game/play/ready-city.test.ts`
- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/src/play/ready/city.ts`
- `packages/civ7-direct-control/test/ready-city-procedure.test.ts`
- `packages/civ7-direct-control/test/ready-city-view.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-population-placement-orpc-send-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-population-placement-ingress-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/population-placement-native-procedure-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/population-placement-player-input-cleanup-slice.md`

## Boundary

- The caller-facing assign-worker input omits `playerId`.
- The procedure reads local-player evidence from `getCiv7PlayNotificationView`
  and uses that value only as runtime-port input.
- Ready-city and notification hints no longer recommend `--player-id` for
  assign-worker send mode.
- The controller bridge rejects caller `playerId` in assign-worker request
  envelopes before dispatch.
- No approval/reason mechanic, generic operation tunnel, custom oRPC plumbing,
  transport expansion, play-thread action, runtime/live proof claim, or parent
  Task 5.x/6.x/7.x acceptance is introduced.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/city-population-placement-procedure.test.ts test/game-ui-controller.test.ts`
- `bun run test:cli:play -- game.play.population-placement.test.ts game/play/ready-city.test.ts`
- `bun run --cwd packages/civ7-direct-control test test/ready-city-view.test.ts test/ready-city-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- `bun run build:cli`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; city procedure schemas remain
  contract-local and are not exported as package API.
- Stale assign-worker send-mode `--player-id` scan; remaining hits are dry-run
  validation guidance, invalid-input tests, negative OpenSpec wording, or the
  internal runtime input type supplied by the service.
- Active approval/caller-permission scan; hits are negative exclusion,
  approval-removal retirement language, or invalid-input tests.
- Generated bundle/runtime scan; no direct-control socket/runtime, Node
  built-in imports, RPC transport symbols, raw command/session payload strings,
  or retired approval tokens appear in the rebuilt game UI bundle.
- `git diff --check`

## Residual Risk

This is local package, CLI, controller-bundle, and OpenSpec proof only. It does
not prove deployed Civ7 runtime behavior or close parent controller/runtime
acceptance rows.
