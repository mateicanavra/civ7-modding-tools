# D9 Downstream Realignment Ledger - Studio Operations Push

Status: packet accepted; implementation pending
Date: 2026-06-14

## D10 - Live Game Watch

- Owner: `openspec/changes/mapgen-studio-live-game-watch`
- Dependency consumed from D9: operation push has removed operation freshness
  polling, leaving live-game browser cadence as the next state-polling island.
- Required D10 movement:
  - publish live-game state through D8 `StudioEventHub`;
  - move live-game cadence into daemon runtime lifecycle;
  - delete browser live-game polling/timer authority;
  - prove daemon cadence and client state parity.
- D10 stop conditions:
  - deleting live-game browser cadence in D9 without D10 proof;
  - introducing a second live-game event route or bus;
  - using operation events as a proxy for live-game status;
  - retaining browser timers after daemon live-game watch is authoritative.
- D10 re-entry proof trigger:
  - watcher publishes first state;
  - watcher publishes changed key;
  - watcher stays quiet on unchanged state;
  - negative search for deleted browser cadence symbols;
  - live proof when Civ7 is available.

## D12 - Game Door Invariant

- Owner: `openspec/changes/mapgen-studio-game-door-invariant`
- Dependency consumed from D9: operation mutation state no longer relies on
  browser polling or client identity watchdogs.
- Required D12 movement:
  - close remaining game-door ownership invariants after D10/D11;
  - prove no operation/live-game runtime truth flows through a retained
    browser-owned state machine;
  - close any public/manual status endpoint deferrals with proof or deletion.
- D12 stop conditions:
  - leaving direct-control mutation, operation status, or live-game runtime
    ownership split between app/browser/daemon without a named owner.

## Public Status Endpoint Closeout

D9 protects public/manual `runInGame.status` and `mapConfigs.status` procedures
unless implementation proves all remaining public/manual users have migrated or
intentionally been deleted. If those endpoints remain after D9, D12 must classify
them as diagnostic request-response reads or delete them with source evidence.

## Proof Boundary

D9 acceptance proves packet readiness. D9 implementation proves operation event
publication and operation polling deletion. D10 proves live-game event cadence
and browser live-game timer deletion. D12 proves the final runtime invariant.
