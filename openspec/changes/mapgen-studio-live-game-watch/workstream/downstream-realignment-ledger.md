# D10 Downstream Realignment Ledger - Studio Live Game Watch

Status: implementation evidence recorded before Graphite commit; live Civ7 proof remains a D12/next-packet handoff.
Date: 2026-06-15

## D11 - Nx Dev Runner

- Owner: `openspec/changes/mapgen-studio-nx-dev-runner`
- Dependency consumed from D10: live-game freshness is no longer a browser
  scheduler, so dev process orchestration can be simplified without preserving
  app-local runtime supervision as a hidden live-state owner.
- Required D11 movement:
  - assume accepted Nx/Habitat baseline;
  - replace app-local nested dev supervision with Nx continuous task
    orchestration;
  - model backend/frontend/generation dependencies through Nx targets and watch
    ownership;
  - prove no Bun watcher is launched from inside the daemon process.
- D11 stop conditions:
  - retaining app-local process supervision because live-game watcher ownership
    is unclear;
  - using a pre-Nx fallback instead of blocking on the accepted baseline;
  - preserving a daemon-internal watcher process for dev convenience.

## D12 - Game Door Invariant

- Owner: `openspec/changes/mapgen-studio-game-door-invariant`
- Dependency consumed from D10: operation freshness and live-game freshness have
  named daemon/event owners after D9 and D10.
- Required D12 movement:
  - prove no remaining runtime truth flows through browser-owned state machines;
  - classify or delete retained public/manual status endpoints;
  - close schema residue after TypeBox event surfaces;
  - run final negative searches across runtime mutation/live/status ownership;
  - record no orphaned bridges, fallbacks, shims, or compatibility paths.
- D12 stop conditions:
  - treating public/manual status endpoints as background freshness authority;
  - leaving Run in Game, Save/Deploy, Autoplay, live-game, or direct-control
    ownership unclassified;
  - leaving a transport bridge or schema technology residue without a deletion
    target and owner.

## Protected Downstream Boundaries

- D10 does not own dev runner/process simplification; it only ensures live-game
  watcher ownership is compatible with D11.
- D10 does not delete public/manual diagnostic status endpoints; D12 classifies
  or deletes them after all push/runtime owners are visible.
- D10 does not migrate snapshot/setup reads onto the event stream; it protects
  them as request/response follow-ups.

## Proof Boundary

D10 implementation proves live-game event cadence, browser live-status cadence
deletion, and a not-green live-proof handoff. D11 proves Nx dev runner/process
ownership. D12 proves final game-door invariant closure, including live Civ7
proof if it remains unrun when D12 starts.
