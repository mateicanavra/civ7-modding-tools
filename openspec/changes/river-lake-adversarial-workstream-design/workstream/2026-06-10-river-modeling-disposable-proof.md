# River Modeling Disposable Proof

Date: 2026-06-10
Owner: Codex
Scope: same-run disposable-session proof for Civ's official bulk river writer

## Why This Exists

The earlier 2026-06-10 baseline established three things:

1. the runtime `TerrainBuilder.modelRivers(...)` surface exists;
2. direct terrain stamping can leave live river metadata at zero;
3. the decisive missing evidence was a mutating run inside a fresh disposable
   Civ session.

This note records that missing proof.

## Same-Run Disposable Session

Controlled setup/start command:

- `bun scripts/civ7-direct-control/verify-studio-run-in-game-live.ts --mutate --map-script '{swooper-maps}/maps/swooper-earthlike.js' --map-size MAPSIZE_STANDARD --seed 2026061001 --game-seed 2026061001 --from-running-game exit-to-shell --timeout-ms 10000 --wait-timeout-ms 240000 --poll-interval-ms 2000`

Verifier result:

- `proofId: studio-run-in-game-live-proof-mq7bkgi3-1t7t`
- same-run map script row verified for
  `{swooper-maps}/maps/swooper-earthlike.js`
- setup/start verified
- map summary:
  - width `84`
  - height `54`
  - plot count `4536`
  - random seed `2026061001`
  - turn `1`
- scripting log completion observed at `2026-06-10T00:17:56.744Z` with:
  - `[mapgen-complete]`
  - `"seed":2026061001`

## Mutating River-Modeling Probe

Probe command:

- `bun scripts/civ7-direct-control/probe-river-modeling.ts --confirm-disposable-session --read-full-grid --timeout-ms 60000 --max-plots-per-read 512`

Probe result:

- status: `writer-supported`
- official runtime sequence executed:
  - `modelRivers`
  - `validateAndFixTerrain`
  - `defineNamedRivers`
  - `storeWaterData`

Readback delta on the exact same run:

- pre:
  - `terrainNavigableRiver=47`
  - `river=0`
  - `navigableRiver=0`
  - `minorRiver=0`
  - `noRiver=4536`
- post:
  - `terrainNavigableRiver=117`
  - `river=251`
  - `navigableRiver=71`
  - `minorRiver=180`
  - `noRiver=4285`
- delta:
  - `terrainNavigableRiver=+70`
  - `river=+251`
  - `navigableRiver=+71`
  - `minorRiver=+180`

## What This Proves

This proof does **not** prove that the current Swooper Maps river pipeline is
done, deterministic, or visually acceptable.

It **does** prove the narrower but critical ownership/runtime fact:

- Civ exposes a stable same-run **bulk river metadata/materialization writer**
  through the official `TerrainBuilder.modelRivers(...)` sequence.

That means the following older claim is now false:

- "no stable public writer has been identified for Civ river metadata / minor
  rivers"

More precise replacement:

- no stable **per-tile** minor-river writer has been proven;
- a stable **bulk** runtime river writer has now been proven in a disposable
  same-run session.

## Consequence For Source And Workstream Authority

1. The categorical ban on `adapter.modelRivers(...)` is no longer evidence-based
   and must not remain as a structural guardrail.
2. Adapter and diagnostics surfaces must stop claiming that minor-river
   authoring is unsupported because no stable writer exists.
3. The remaining design question is no longer "does a Civ writer exist?" but
   "how should MapGen use or constrain the proven bulk writer so Hydrology truth
   remains upstream and same-run parity remains explicit?"
