# MapGen Studio Operations Push

## Why

D9 makes operation freshness daemon-pushed instead of browser-polled. D8
created the daemon-owned `StudioEventHub`, `studio.events.watch`, and client
event hook. D9 uses that spine for the first authoritative state category:
Run in Game and Save/Deploy operation transitions.

This packet is also the deletion packet for browser operation polling and
client daemon-identity watchdog authority. After D9, operation freshness reaches
the browser through `operation` events, and reconnect truth comes from D8's
`hello` plus D6 `studio.operations.current` adoption. There is no remaining
background operation status polling path, hidden Save/Deploy completion loop, or
client `serverInfo` identity watchdog.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-event-hub/`
- `openspec/changes/mapgen-studio-operations-current/`
- Current evidence:
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `apps/mapgen-studio/src/server/runInGame/operationState.ts`
  - `apps/mapgen-studio/src/server/mapConfigs/operationState.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
  - `apps/mapgen-studio/src/app/operationAdoption.ts`
  - `apps/mapgen-studio/src/app/StudioShell.tsx`
  - `apps/mapgen-studio/src/features/mapConfigSave/api.ts`
  - `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`

## What Changes

- Repair the existing `mapgen-studio-operations-push` change from historical
  implementation-closure notes into the D9 normative packet.
- Require one audited operation publisher path from daemon operation stores to
  the D8 `StudioEventHub`.
- Require production daemon composition to supply `StudioEventHub`; optional
  publisher seams are allowed only for tests or explicitly non-daemon
  construction.
- Publish Run in Game `operation` events on create/update/complete/fail
  transitions using the canonical Run in Game operation DTO.
- Publish Save/Deploy `operation` events on create/update/complete/fail
  transitions using the canonical Save/Deploy operation DTO.
- Require publisher failures to surface as diagnostics without blocking or
  rewriting the operation transition and without spawning a polling retained
  path.
- Require the Studio event hook to apply pushed `operation` events for both
  operation families.
- Preserve terminal toast parity: boot/reconnect adoption marks old terminal
  Run in Game operations handled, but live pushed terminal events still reach
  the existing toast effect.
- Delete operation freshness and identity polling authority:
  - `useOperationStatusPolls`
  - polling-only status refresh callbacks in `StudioShell`
  - synthetic polling-only 404 status-miss handling
  - hidden Save/Deploy sleep/status completion loop
  - `useDaemonInstanceWatchdog`
  - client `studio.serverInfo` identity polling path

## Non-Goals

- No live-game event publisher or browser live-game polling/timer deletion. D10
  owns that.
- No alternate event transport, operation-specific stream, second RPC mount, or
  browser storage recovery path.
- No deletion of public/manual `runInGame.status` or `mapConfigs.status`
  procedures unless a future packet proves they are no longer a public/manual
  contract. D9 deletes background freshness authority, not necessarily every
  request-response diagnostic status endpoint.
- No Zod expansion or app-local operation DTO mirror.

## Future Implementation Write Set

- `apps/mapgen-studio/src/server/studio/engines.ts`
- `apps/mapgen-studio/src/server/runInGame/operationState.ts`
- `apps/mapgen-studio/src/server/mapConfigs/operationState.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/operationAdoption.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/features/mapConfigSave/api.ts`
- deletion of operation polling/watchdog hook files and tests that only pin
  deleted polling behavior
- focused server/app operation push tests

Protected paths:

- D10 live-game browser polling/timer owners.
- D8 event hub transport, retry, and subscription semantics except required
  operation-event consumption.
- Public/manual status procedures unless the implementation proves all
  remaining users are deleted or deliberately migrated.
- Generated outputs and built bundles.

## Verification Gates

### Packet Acceptance Gates

- `bun run openspec -- validate mapgen-studio-operations-push --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- Prework, testing/vendor-alignment, hardening/black-ice, and downstream
  realignment reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates are repo-local Nx/Habitat-selected targets for touched
  projects. Direct package scripts may be focused additional evidence, but they
  are not substitutes for graph-owned dependency ordering:
  - `bun run nx run mapgen-studio:test --outputStyle=static`
  - focused server operation publisher tests covering both stores
  - `bun run nx run mapgen-studio:check --outputStyle=static`
- Publisher path falsification test fails if the EventHub publisher bridge is
  removed from either operation family.
- Production-composition proof fails if daemon `createStudioEngines` is invoked
  without the D8 `StudioEventHub`.
- Client pushed Run in Game state test.
- Client pushed Save/Deploy state test.
- Terminal toast parity test for adopted terminal vs live pushed terminal Run in
  Game operations.
- Negative searches for deleted polling/watchdog symbols:
  - `useOperationStatusPolls`
  - `useDaemonInstanceWatchdog`
  - `fetchMapConfigSaveDeployStatus`
  - `operation-status-missing`
  - `status-poll`
  - client `studio.serverInfo` identity polling
- Negative searches confirm no alternate operation event route, operation bus,
  or browser storage recovery path.
