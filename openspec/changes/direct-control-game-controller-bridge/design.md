## Design

The controller is a native App UI companion loaded through Civ7 modinfo action
groups. It is not a new external transport. Direct-control still reaches Civ7
through the tuner socket protocol, selects the App UI game state, and calls the
controller global with a bounded serialized envelope.

## Native Rails

Use one mod package with two independent entrypoints:

- `scope="game"` `UIScripts`: primary gameplay controller. This owns reads,
  capability discovery, event subscriptions, operation validation, overlays,
  acknowledgements, and exact approved helper execution.
- `scope="shell"` `UIScripts`: optional setup/config controller. This owns
  shell-visible configuration and setup lifecycle only.

Shell and game contexts do not share `globalThis`. If both contexts are needed,
each must expose its own handshake and capability list. Tuner is a runtime state
visible through direct-control, not a modinfo deployment target.

Use `ImportFiles` for addressable assets, HTML/CSS, map-generation files, and
shared chunks if needed. Do not use map scripts for live play control. Do not use
`ReplaceUIScript` until a separate live proof makes it a dependency.

## Source Shape

The first implementation slice should use these source paths:

- `mods/mod-civ7-intelligence-controller/package.json`
- `mods/mod-civ7-intelligence-controller/AGENTS.md`
- `mods/mod-civ7-intelligence-controller/scripts/build.ts`
- `mods/mod-civ7-intelligence-controller/src/game/civ7-intelligence-bridge.ts`
- `mods/mod-civ7-intelligence-controller/src/shell/civ7-intelligence-bridge.ts`
- `mods/mod-civ7-intelligence-controller/src/shared/envelope.ts`
- `mods/mod-civ7-intelligence-controller/test/modinfo.test.ts`
- `mods/mod-civ7-intelligence-controller/test/game-controller.test.ts`

Use a custom build script for the first slice because the current SDK action
enum does not expose `UIScripts`. The build script should generate
`mod/civ7-intelligence-controller.modinfo` with:

- `scope="game"` and
  `<UIScripts><Item module="false">ui/game/civ7-intelligence-bridge.js</Item></UIScripts>`;
- `scope="shell"` and a minimal shell ping/capabilities script if shell support
  is included.

Generated `mod/` output remains evidence and deploy input, not hand-edited
source.

## Controller API

The game controller exposes:

```js
globalThis.Civ7IntelligenceBridge = Object.freeze({
  version: "0.1.0",
  invoke(encodedEnvelope) {
    // returns encoded response
  },
});
```

The first envelope fields are:

- `protocolVersion`
- `requestId`
- `method`
- `params`
- `createdAtTurn`
- `expiresAtTurn`
- `idempotencyKey`, required for effectful calls
- `approval`, required for effectful calls

The first response fields are:

- `ok`
- `requestId`
- `method`
- `result`
- `error.code`
- `observedAt`

The first method families are:

- `system.ping`
- `capabilities.list`
- `game.snapshot`
- `map.plot`
- `map.summary`
- `players.summary`
- `units.summary`
- `cities.summary`
- `visibility.summary`
- `gameInfo.rows`
- `operations.validate`
- `actions.executeApproved`, disabled until disposable proof
- `intent.ack`

## Direct-Control Integration

`@civ7/direct-control` adds a controller client over its existing command
execution primitive. The client:

- targets App UI game state by default;
- verifies the controller version and capability list before method calls;
- encodes and bounds the request envelope;
- normalizes controller errors into package errors;
- records controller proof boundaries separately from raw wrapper proof;
- never exposes arbitrary caller-provided JavaScript.

Existing raw wrappers stay available as diagnostic and parity sources during
migration. New product procedures should call controller methods after the
project-owned lifecycle and parity gates pass.

Initial direct-control source paths:

- `packages/civ7-direct-control/src/controller-bridge.ts`
- `packages/civ7-direct-control/test/controller-bridge.test.ts`
- `packages/civ7-direct-control/test/controller-parity.test.ts`
- exports from `packages/civ7-direct-control/src/index.ts`
- optional CLI proof command under `packages/cli/src/commands/game/controller.ts`

## Read Migration

The controller absorbs read logic that currently appears as raw JS command
builders:

- map summary, plot snapshot, and grid reads;
- player, unit, city, and visibility summaries;
- bounded `GameInfo` rows;
- operation-family root/capability inspection.

Parity is required on the same turn before a wrapper is promoted. A passing
parity probe proves only the compared fields, not every future field or all game
states.

## Action Migration

The first action method is validation-only. `operations.validate` wraps the same
operation families already used by direct-control:

- unit operation;
- unit command;
- city operation;
- city command;
- player operation.

`actions.executeApproved` remains disabled until a disposable proof establishes
token shape, idempotency, exactly-once send behavior, no replay after uncertain
failure, and semantic postcondition reread. The controller can execute the
approved send; direct-control owns approval creation and proof promotion.

## Review Lanes Required

- Product authority: verify the controller is a direct-control implementation
  target, not an independent third control plane.
- Architecture authority: verify controller source, generated mod output,
  direct-control client, CLI, and docs stay in their owners.
- Operational proof: verify source-backed, deployed, live-read, lifecycle, and
  disposable-mutation proof labels are separate.
- Safety/adversarial: verify no raw LLM JS, arbitrary operation relay, or
  accidental broad world-edit surface enters the controller.
- Downstream realignment: verify old Tuner-first read/action specs and docs no
  longer drive future implementation.
