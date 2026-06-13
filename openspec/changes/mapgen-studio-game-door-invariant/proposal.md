# S4.1 Game Door Invariant

## Why

The runtime simplification program has already moved Studio to one daemon-owned
transport, daemon-owned operation truth, and one event spine. The last coherence
slice turns the remaining runtime philosophy into enforceable closure:

- no unsanctioned `Civ7DirectControlSession` construction;
- no orphaned tuner-session promises;
- no stale bridge/coexistence comments that imply deleted runtime paths still
  exist;
- no legacy Zod success I/O schemas in `@civ7/studio-server` contracts.

This is a closeout slice, not a feature slice. It proves the daemon is the owner
of ephemeral runtime truth and that game-wire ownership is narrow enough to keep
watching.

## What Changes

- Add a Habitat-style game-door invariant document under
  `docs/system/direct-control/GAME-DOOR-INVARIANT.md`.
- Add a guard test that scans production `apps/` and `packages/` TypeScript for
  `new Civ7DirectControlSession(...)` and allows only:
  - `packages/studio-server/src/services/Civ7TunerSession.ts`
  - `packages/civ7-direct-control/src/session/session.ts`
- Migrate remaining `packages/studio-server/src/contract/*` success I/O schemas
  from Zod to TypeBox/Standard Schema.
- Preserve request defaults explicitly in router logic where Zod `.default(...)`
  previously supplied them.
- Close the `mapgen-studio-tuner-session` unchecked task residue:
  - run-in-game per-flow sessions remain sanctioned only through the
    direct-control package wrapper and are documented by the invariant;
  - the "Restart Civ7" recovery affordance moves to durable deferral `DEF-015`.
- Remove stale live comments that still describe deleted `/api` coexistence or a
  missing Save&Deploy status identity echo.

## Non-Goals

- No new runtime transport.
- No new UI recovery control.
- No run-in-game engine behavior change.
- No reintroduction of browser-owned operation or live-game polling.
- No branch drain before this final stack layer is ready to close.

## Verification

- `bun run openspec -- validate mapgen-studio-game-door-invariant --strict`
- `bun run openspec -- validate mapgen-studio-tuner-session --strict`
- `bun run openspec:validate`
- `bun run --cwd packages/studio-server check`
- `bun run --cwd packages/studio-server test -- test/gameDoorInvariant.test.ts test/handler.test.ts`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts`
- Negative searches for Zod in `packages/studio-server/src/contract`, legacy
  runtime poll/watchdog/source-storage symbols, and unsanctioned session
  construction.

## Watcher

Watcher lane: Rawls `019ec217-32d7-7561-9b52-768885b9fed8`.
