# Direct-Control Game Controller Bridge Report

## Agent And Lane

- Agent: Codex workstream lead with peer-agent synthesis
- Lane: native game/shell controller realignment
- Objective: determine whether Civ7 can support one deployed mod-side
  controller API that covers the direct-control read/action surface, including
  whether App UI scripts can access equivalent Tuner data and whether one mod can
  deploy scripts into multiple runtime contexts.

## Sources Inspected

- `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`
- `.civ7/outputs/resources/Base/modules/core/core.modinfo`
- `.civ7/outputs/resources/Base/modules/core/ui/component-support.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
- `.civ7/outputs/resources/Base/modules/core/ui/input/action-handler.js`
- `packages/civ7-direct-control/src/index.ts`
- Installed local Civ7 UI mods under
  `~/Library/Application Support/Civilization VII/Mods/`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`

## Probes Run

- `bun run --cwd packages/cli dev game status --json`
- `bun run --cwd packages/cli dev game health --tuner --json`
- Read-only App UI/Tuner `game exec` probes for global roots, method existence,
  and representative values.
- Static `rg` scans over official resources, repo mods, and deployed Mods for
  `ActionGroup`, `UIScripts`, `ImportFiles`, `ReplaceUIScript`, `scope="game"`,
  `scope="shell"`, `globalThis`, and operation routers.

## Findings

| Finding | Label | Classification | Product Implication |
| --- | --- | --- | --- |
| Civ7 native modinfo rails are `scope="game"` and `scope="shell"` action groups with `UIScripts` and `ImportFiles`; no useful `scope="tuner"` rail was found | source-backed | production candidate | Build the controller on game/shell App UI rails, not literal Tuner deployment |
| Official `tuner-input.js` is loaded as a game-scoped UI script and reacts to game UI/browser events before calling game helpers | source-backed | production candidate | Civ already ships the game-side controller pattern we should imitate |
| App UI game context exposes the same major gameplay roots checked in Tuner plus App UI-only roots | verified-local | production candidate after project-owned lifecycle proof | A deployed game-scoped controller can plausibly absorb most direct-control raw wrapper JS |
| App UI and Tuner returned matching representative read values in the current live game | verified-local | production candidate after parity proof | The old "Tuner owns gameplay reads" assumption is a design default, not a hard runtime limit |
| Installed mods expose `globalThis` APIs from game-scoped `UIScripts` | source-backed/local-mod | production candidate after project-owned proof | `globalThis.Civ7IntelligenceBridge.invoke(...)` is the right ingress shape |
| Shell and game contexts do not share `globalThis` | verified-local/source-backed | implementation constraint | One mod can contain both entrypoints, but they need separate handshakes |
| Independent controller sends would bypass direct-control approval and proof | source-backed | eliminated path | Controller action execution must be exact, approved, allowlisted, and externally verified |

## Safety And Live-Game Risk

- Read-only App UI/Tuner parity probes were safe and already run.
- Deploy/restart/load-save lifecycle proof requires a project-owned controller
  mod and should be performed as a bounded operational proof.
- `actions.executeApproved` requires a disposable session or explicit user
  approval because it mutates live game state.

## Remaining Unknowns

- Project-owned controller mod deploy/load/reload lifecycle.
- Controller read parity across save/load, restart, turn transition, age
  transition, and hotseat local-player switching.
- Exact approval-token and idempotency contract for approved helper execution.
- Whether any shell setup methods belong in the first slice or should wait until
  game-context controller proof passes.
