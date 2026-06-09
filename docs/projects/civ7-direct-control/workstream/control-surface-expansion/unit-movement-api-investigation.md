# Unit Movement API Investigation

Date: 2026-06-01
Scope: `@civ7/direct-control` movement/path planning surface

## Question

Play agents need the same movement distinction as the manual UI:

- preview reachable movement and paths before committing;
- set destinations beyond current movement range;
- warn clearly when a unit will keep moving autonomously over later turns.

No runtime implementation was changed for this note.

## Evidence

- [official-resource] Reachable one-turn movement is surfaced by
  `Units.getReachableMovement(unit.id)` after checking
  `unit.Movement.movementMovesRemaining > 0`.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:116`.
- [official-resource] Hover/desired destination path preview is surfaced by
  `Units.getPathTo(this.unitID, this.desiredDestination)`.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:216`.
- [official-resource] Existing queued/autonomous destination state is surfaced by
  `Units.getQueuedOperationDestination(this.unitID)`, then previewed with
  `Units.getPathTo(this.unitID, destination)`.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:238`.
- [official-resource] Manual move mode validates `MOVE_TO` with
  `Game.UnitOperations.canStart(this.unitID, UnitOperationTypes.MOVE_TO, args,
  false)` and uses `MOVE_IGNORE_UNEXPLORED_DESTINATION` so humans can click into
  fog.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-move-to.js:36`.
- [official-resource] Manual commit passes only `{ X, Y }` into
  `WorldInput.requestMoveOperation(...)`.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-move-to.js:115`.
- [official-resource] The actual plain movement request validates and sends
  `Game.UnitOperations.sendRequest(unit.id, UnitOperationTypes.MOVE_TO,
  parameters)`.
  Anchor:
  `.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js:511`.
- [source] `@civ7/direct-control` already exposes generic validator-backed unit
  operation wrappers:
  `canStartCiv7UnitOperation(...)` and `requestCiv7UnitOperation(...)`.
  Anchor:
  `packages/civ7-direct-control/src/index.ts:2065`.
- [source] Current generic operation requests call `canStart` first, send one
  `sendRequest`, and do not prove movement-specific postconditions.
  Anchor:
  `packages/civ7-direct-control/src/index.ts:3883`.
- [source] Current unit summaries expose id, owner, location, health, damage,
  movement, and activity, but not reachable plots, path, queued destination, or
  autonomous movement state.
  Anchor:
  `packages/civ7-direct-control/src/index.ts:434`.

## Findings

1. Reachable movement/path preview anchors are:
   `Units.getReachableMovement(unit.id)`, `Units.getReachableTargets(unit.id)`,
   `Units.getReachableZonesOfControl(unit.id, true)`, and
   `Units.getPathTo(unitId, destination)`.
2. Immediate moves and multi-turn destination moves appear to use the same
   mutating call: `Game.UnitOperations.sendRequest(unit.id,
   UnitOperationTypes.MOVE_TO, { X, Y, Modifiers })`.
3. The distinction is in destination/path state, not in a separate mutator:
   after a far destination is requested, official UI reads queued movement back
   with `Units.getQueuedOperationDestination(unitId)`.
4. `WorldInput.requestMoveOperation` is not a pure move helper. It may route the
   same click through naval attack, air attack, range attack, army overrun, swap,
   or `MOVE_TO`. A direct-control movement wrapper should not copy that entire
   UI dispatch cascade unless it is explicitly named as a click emulation API.
5. Source evidence is strong enough to design a wrapper, but not enough to claim
   live postconditions for far destinations. A live smoke pass must verify
   Tuner visibility of `Units.getPathTo`, `Units.getReachableMovement`, and
   `Units.getQueuedOperationDestination`.

## Proposed Read-Only Lens

Name:
`getCiv7UnitMovementLens(input, options)`

Args:

- `unitId: Civ7ComponentId`
- `destination?: { x: number; y: number }`
- `modifiers?: ReadonlyArray<"ATTACK" | "MOVE_IGNORE_UNEXPLORED_DESTINATION">`
- `includeReachable?: boolean` default `true`
- `includeQueued?: boolean` default `true`
- `includeTargets?: boolean` default `false`

Return:

- `unitId`, `owner`, `location`, `movement`, `activity`
- `reachableMovementPlotIndexes`
- `reachableTargetPlotIndexes?`
- `reachableZoneOfControlPlotIndexes?`
- `desiredDestination?`
- `desiredPath?: { raw: unknown; plots: ReadonlyArray<{ x: number; y: number }> }`
- `queuedDestination?`
- `queuedPath?`
- `canMoveTo?: Civ7OperationValidationResult`
- `autonomousMovement: { status: "none" | "would-queue" | "queued" | "unknown"; risk: "no-risk" | "risk" | "unknown"; reasons: string[] }`

Postconditions:

- Read-only Tuner command only.
- Bounded output; no map-wide expansion unless a caller explicitly requests it.
- Does not reveal hidden-information semantics silently: results must label
  whether the destination/path was requested with
  `MOVE_IGNORE_UNEXPLORED_DESTINATION`.

## Proposed Mutation Surface

Name:
`requestCiv7UnitMoveTo(input, options, approval)`

Args:

- `unitId: Civ7ComponentId`
- `destination: { x: number; y: number }`
- `allowAutonomousMultiTurn?: boolean` default `false`
- `allowUnexploredDestination?: boolean` default `false`
- `allowAttack?: boolean` default `false`
- `expected?: { beforeLocation?: { x: number; y: number } }`

Implementation contract:

- Build args as `{ X, Y, Modifiers }`.
- Use `UnitOperationTypes.MOVE_TO`, not a generic UI-click dispatcher.
- Validate with `Game.UnitOperations.canStart(...)` before send.
- If the preview says the destination would queue autonomous movement and
  `allowAutonomousMultiTurn` is not true, return a blocked result instead of
  sending.
- Send exactly once after approval. Do not auto-retry after reconnect or socket
  failure.

Postconditions:

- Return `beforeLens`, `command`, `afterLens`.
- Classify result as:
  `blocked`, `reached`, `moved-and-queued`, `queued-without-location-change`,
  or `unverified`.
- `reached` requires after-location equals destination and no queued destination
  for the unit.
- `moved-and-queued` requires after-location changed and queued destination
  equals requested destination.
- `queued-without-location-change` requires queued destination equals requested
  destination and location did not change.
- `unverified` is required when `sendRequest` reports success but neither
  location nor queued destination proves the effect.

## Minimal In-Motion HUD Fields

- `unitLabel`: unit name/type plus component id.
- `currentLocation`: `{ x, y }`.
- `movementRemaining`: current movement probe value.
- `destination`: queued destination or requested destination.
- `pathSummary`: visible next plot, final plot, and path length if available.
- `movementState`: `idle`, `preview`, `moving-now`, `queued`, or `unknown`.
- `autonomousRisk`: `no-risk`, `risk`, or `unknown`.
- `reasons`: expandable strings such as:
  - `Destination is within current reachable movement.`
  - `Destination is outside current reachable movement and will remain queued.`
  - `Unit already has a queued destination.`
  - `Path enters fog using MOVE_IGNORE_UNEXPLORED_DESTINATION.`
  - `Path preview unavailable; postcondition requires live verification.`

## Risks And Gaps

- [unresolved] Exact `Units.getPathTo(...)` payload shape is not typed in the
  repo. Official UI only proves `result.plots` is used.
- [unresolved] Need live proof that `Units.getQueuedOperationDestination(...)`
  is callable from the Tuner role used by `@civ7/direct-control`.
- [unresolved] Need to verify whether far `MOVE_TO` requests always set queued
  destination to the final `{ X, Y }`, or whether some game states only move to
  an intermediate tile.
- [risk] Fog movement can expose hidden-map behavior. Lens output must label
  player-visible versus developer/omniscient information.
- [risk] Copying `WorldInput.requestMoveOperation` would implicitly allow
  attack/swap/overrun behavior. Keep the first wrapper move-only unless a later
  approved surface explicitly supports UI click semantics.
- [risk] Current generic `requestCiv7UnitOperation(...)` verifies only that a
  request was sent. Movement needs stronger postconditions before agents rely on
  it.

## Live Smoke Tests Needed

1. Start a disposable/live-safe game, select a local-player unit, and confirm the
   Tuner role can call `Units.getReachableMovement`, `Units.getPathTo`, and
   `Units.getQueuedOperationDestination`.
2. Immediate reachable move: preview a reachable tile, request `MOVE_TO`, verify
   location equals destination and queued destination is empty.
3. Multi-turn destination: preview a visible tile outside current movement,
   request `MOVE_TO` with `allowAutonomousMultiTurn: true`, verify the unit
   either moved along the path and/or reports queued destination equal to the
   requested destination.
4. Turn-advance continuation: after a queued destination exists, advance one
   turn in a bounded smoke session and verify the unit continues autonomously or
   reports a blocker.
5. Fog destination: with explicit approval, test
   `MOVE_IGNORE_UNEXPLORED_DESTINATION` against a hidden destination and record
   whether validation, request, path preview, and queued destination behave like
   manual UI.
