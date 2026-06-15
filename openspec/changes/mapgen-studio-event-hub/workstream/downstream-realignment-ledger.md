# D8 Downstream Realignment Ledger - Studio Event Hub

Status: packet accepted; implementation pending
Date: 2026-06-14

## D9 - Operations Push

- Owner: `openspec/changes/mapgen-studio-operations-push`
- Dependency consumed from D8: one daemon-owned `StudioEventHub`, sealed
  `operation` event category, client event hook path, and one `/rpc`
  `studio.events.watch` subscription.
- Required D9 movement:
  - publish Run in Game transitions through `StudioEventHub`;
  - publish Save/Deploy transitions through `StudioEventHub`;
  - prove pushed event parity for active and terminal operation states;
  - delete operation status polling, hidden completion loops, and daemon
    instance watchdog authority after event parity is proven.
- D9 stop conditions:
  - adding another operation event bus;
  - redefining operation event payloads instead of reusing canonical D6/D8 DTOs;
  - leaving browser polling as an unowned retained path after pushed operation parity;
  - using event history as a durability ledger instead of
    `studio.operations.current` reconnect truth.
- D9 re-entry proof trigger:
  - negative search for deleted polling/watchdog symbols;
  - publisher path falsification test;
  - client pushed Run in Game and Save/Deploy state tests;
  - terminal toast parity test.

## D10 - Live Game Watch

- Owner: `openspec/changes/mapgen-studio-live-game-watch`
- Dependency consumed from D8: sealed `live-game` event category, one daemon
  event hub, and existing client event hook live-game apply path.
- Required D10 movement:
  - move live Civ7 status cadence from browser timers into daemon runtime;
  - publish live-game state through `StudioEventHub`;
  - prove daemon-owned cadence and client state parity;
  - delete browser live-game polling/timer authority after daemon event parity.
- D10 stop conditions:
  - adding a parallel live-game route or browser-owned live event bus;
  - redefining live-game event payloads outside the canonical live-game state
    schema;
  - retaining browser timers as a parallel authority once daemon watch is authoritative.
- D10 re-entry proof trigger:
  - daemon watcher lifecycle test;
  - pushed live-game state test;
  - negative search for deleted browser timer/polling authority;
  - runtime proof if D10 claims live Civ7 behavior.

## D12 - Game Door Invariant

- Owner: `openspec/changes/mapgen-studio-game-door-invariant`
- Dependency consumed from D8-D10: all runtime truth enters the app through the
  daemon Effect runtime, `studio.events.watch`, and typed operation/live-game
  DTOs.
- Required D12 movement:
  - close remaining runtime invariants around game-door ownership;
  - remove any residual app-hosted mutation/readback islands left after D9-D10;
  - prove no dual-path bridge remains.
- D12 stop conditions:
  - orphaning a transport bridge, polling path, browser recovery path, or
    direct-control runtime shortcut without deletion evidence.

## D7 Spike Fixture Disposition

- D8 owns promotion/deletion for delivery, hello, cleanup, one-route, client
  helper, and retry fixtures that are equivalent to production watch behavior.
- D9 may own operation-event publisher parity fixtures that are not meaningful
  until operation transitions publish through the hub.
- No spike-only fixture may remain as a hidden runtime path or unowned proof
  island.

## Proof Boundary

D8 acceptance proves packet readiness. D8 implementation proves event hub/watch
mechanics. D9/D10 prove publisher parity and polling deletion. D12 proves the
final runtime invariant. These claims must not be collapsed into one green
OpenSpec validation or one package test.
