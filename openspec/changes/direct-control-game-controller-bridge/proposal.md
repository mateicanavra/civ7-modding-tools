## Why

The live runtime probe changed the direct-control implementation target. In the
current running game, App UI game context exposes the same major gameplay roots
checked in Tuner, plus App UI-only lifecycle, UI, storage, and WorldBuilder
surfaces. That means the current raw per-wrapper JavaScript bodies and the older
"post-Begin gameplay reads target Tuner" design are implementation history, not
a hard runtime limitation.

The next architecture slice is a deployed game-scoped controller API. It should
use Civ7 native mod rails, primarily `scope="game"` `UIScripts`, and expose a
small project-owned `globalThis.Civ7IntelligenceBridge.invoke(...)` API that
`@civ7/direct-control` calls through its existing tuner socket transport.

## Target Authority Refs

- Direct user correction on 2026-06-03: solve the deployed mod-side controller
  path through Civ's native game/shell rails; do not use literal Tuner
  deployment as the success criterion.
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/actuation-path-map.md`
- `docs/system/ADR.md#adr-007-civ7-intelligence-uses-two-authority-sides-with-a-subordinate-app-ui-endpoint`
- `packages/civ7-direct-control/AGENTS.md`
- Official resource evidence:
  - `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`
  - `.civ7/outputs/resources/Base/modules/core/core.modinfo`
  - `.civ7/outputs/resources/Base/modules/core/ui/component-support.js`
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
  - `.civ7/outputs/resources/Base/modules/core/ui/input/action-handler.js`
- Completed historical OpenSpec records to realign:
  - `openspec/changes/direct-control-read-surface/`
  - `openspec/changes/direct-control-action-surface/`

## What Changes

- Add a source-owned controller mod package at
  `mods/mod-civ7-intelligence-controller` that emits a Civ7 mod with separate
  `scope="game"` and, if needed, `scope="shell"` entrypoints.
- The game entrypoint exposes `globalThis.Civ7IntelligenceBridge` with a
  versioned JSON-envelope `invoke(...)` method.
- The first controller methods are `system.ping`, `capabilities.list`,
  `game.snapshot`, `map.plot`, `players.summary`, `units.summary`,
  `cities.summary`, `visibility.summary`, `gameInfo.rows`, and
  `operations.validate`.
- A later gated method, `actions.executeApproved`, may execute one exact
  allowlisted helper request only after direct-control creates an approval
  record and passes a bounded idempotency token.
- `@civ7/direct-control` gains a typed controller invocation layer and parity
  probes. It keeps socket framing, state discovery, reconnects, approvals,
  no-replay behavior, and proof classification.
- Existing direct-control raw JS wrappers become migration sources for
  controller methods. They remain as fallback diagnostics only until the
  controller is project-owned, deployed, and parity-proven.

## Requires

- `direct-control-read-surface`
- `direct-control-action-surface`
- `direct-control-state-role-model`

## Enables Parallel Work

- Studio and CLI calls can consume a stable in-game API instead of depending on
  wrapper-local JavaScript bodies.
- Live play can collect coherent snapshots from one game-resident state machine.
- UI annotations, overlays, and acknowledgements can share controller context
  with read and validation methods.

## Affected Owners

- `mods/mod-civ7-intelligence-controller/**` or final selected controller mod
  package path.
- `packages/civ7-direct-control/**`
- `packages/cli/src/commands/game/**` where exposed.
- `docs/projects/civ7-intelligence-layer/**`
- `docs/projects/civ7-direct-control/**`
- `docs/system/ADR.md`

## Forbidden Owners

- CLI, Studio, or caller-local raw JavaScript string builders for controller
  methods.
- A literal Tuner-deployed mod script as the baseline.
- Map scripts as live play control.
- `ReplaceUIScript` as a dependency before a live proof.
- Independent controller-owned gameplay sends without direct-control approval
  and postcondition proof.
- Raw LLM JavaScript, arbitrary SQL, native AI live row mutation, account,
  network, save/delete/load, multiplayer, or broad world-edit APIs.

## Stop Conditions

- A project-owned `scope="game"` `UIScripts` controller cannot be loaded and
  called from App UI game context.
- Controller parity reads do not match existing wrappers for the same turn and
  state.
- Operation validation cannot be serialized with enough detail to preserve the
  existing approval/proof model.
- A disposable approved action cannot be made exactly-once and externally
  verified.
- Shell/game lifecycle proves the controller global is not stable enough across
  restart, reload, save/load, or turn transition.

## Consumer Impact

Callers should move toward typed direct-control controller methods, not raw
`game exec` strings. This is a product improvement because the in-game command
surface becomes versioned, allowlisted, bounded, and owned by the repo.

## Verification Gates

- OpenSpec validation and `git diff --check`.
- Controller mod build/deploy:
  `bun run --cwd mods/mod-civ7-intelligence-controller build` and deploy through
  `mod manage deploy --input "$PWD/mods/mod-civ7-intelligence-controller/mod"
  --id civ7-intelligence-controller`.
- Controller package tests for method dispatch, envelope validation, bounds, and
  error shapes.
- Direct-control mock socket tests for controller invocation, state selection,
  timeout/error normalization, and no raw caller JS exposure.
- Live read-only proof against Civ7: `ping`, `capabilities.list`,
  `game.snapshot`, map/player/unit/city/visibility/GameInfo parity against
  existing wrappers.
- Lifecycle proof: game global present after game action-group load, shell
  entrypoint separate if present, Tuner absent unless separately proven,
  reappears after UI reload/restart/load-save/turn transition.
- Disposable mutation proof for `actions.executeApproved`: approval record,
  one send, no replay, semantic postcondition reread.
