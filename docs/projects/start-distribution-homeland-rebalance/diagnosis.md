# Start Distribution — Diagnosis

> **Symptom (user-reported).** On generated maps, start positions are badly
> distributed: roughly **half of all civilizations are always crowded into a
> single small land area**, instead of being spread across the map's landmasses.
> The failure is severe and near-deterministic for a given map shape.

This document records the verified root cause. Evidence was gathered by a
four-lane systematic investigation (planner algorithm, input derivation, policy
adapter + engine boundary, gameplay/base-game reference) and then confirmed by
direct reads of live source. Every claim cites `file:line` on the
`start-dist-homeland-rebalance` branch (built on the natural-wonders + odd-R
stack).

## Where starts are actually decided

The mod **fully owns** final start assignment. The engine positioner
(`assignStartPositions` / `chooseStartSectors`, `packages/civ7-adapter/src/types.ts:805-882`)
is wrapped but **never called** — it is dead code (the official sector grid was
intentionally retired, ADR-008). Seats are stamped one-by-one via
`adapter.setStartPosition(...)` (`assign-starts/materialize.ts:170`). So the
clustering is ours to fix, entirely inside the recipe.

Placement stage order (`contract-manifest.ts:119-131`):

```
derive-placement-inputs → plot-landmass-regions → place-natural-wonders
  → prepare-placement-surface → plan-resources → assign-starts (plan-starts op)
  → adjust/place-resources → place-discoveries → assign-advanced-starts → placement
```

## Root cause — the REGION MODEL, not the scorer

The viability scorer (fertility / freshwater / climate / roughness / start-bias)
is fine. Clustering is produced by four compounding defects in how the map is
partitioned into start regions and how players are allocated to them.

### RC1 — Geometric midline partition ignores land area
`plot-landmass-regions/index.ts:42-45`

```ts
const slotByLandmass = new Uint8Array(landmasses.length);
for (const mass of landmasses) {
  const centerX = computeWrappedIntervalCenter(mass.bbox.west, mass.bbox.east, width);
  slotByLandmass[mass.id] = centerX < width / 2 ? 1 : 2;   // 1=west, 2=east
}
```

Every landmass is bucketed **West (1)** or **East (2)** purely by whether its
bounding-box center sits left or right of `width/2`. There is **no balancing of
settleable land area** between the two halves. When real geography is
asymmetric — one dominant continent, or most land on one side of the seam — one
region holds the overwhelming majority of settleable land and the other holds a
sliver (or only sub-threshold islands).

### RC2 — Capacity-blind, fixed player split
`runtime.ts:31-32` → `derive-placement-inputs/inputs.ts:152-155` → `seat-identity.ts:27-35`

```ts
// runtime.ts
const playersLandmass1 = mapInfo.PlayersLandmass1 ?? 4;   // default 4
const playersLandmass2 = mapInfo.PlayersLandmass2 ?? 4;   // default 4
// seat-identity.ts (positional bind)
regionSlot: seatIndex < args.playersWest ? 1 : 2,
```

Player counts are taken verbatim from static `MapInfo` (default **4/4**) and
mapped **positionally** onto the two slots — the first 4 seats are West, the
rest East — **regardless of where the land actually is**. So a region that RC1
made tiny is still handed a fixed batch of 4 seats. Those 4 seats (half of 8)
are forced into a small area: this is the precise mechanism of "half the civs in
one small land area."

### RC3 — Reconciliation only triggers at *zero* candidates
`plan-starts/strategies/default.ts:702-719`

```ts
const candidatesBySlot = { 1: 0, 2: 0 };
for (const candidate of candidates) candidatesBySlot[candidate.regionSlot] += 1;
for (const seat of seatIdentities) {
  const own = candidatesBySlot[seat.regionSlot];
  const other = (seat.regionSlot === 1 ? 2 : 1) as 1 | 2;
  if (own === 0 && candidatesBySlot[other] > 0) { /* reassign to other */ }
}
```

The only safety valve fires **only when a region has exactly zero candidates**.
The common bad case — a region with *few-but-nonzero* candidates but assigned far
more seats than it can space — is never rebalanced. The starved region's seats
stay put and pack to the spacing floor. (And when it *does* fire, all of that
region's seats collapse onto the other continent, producing the
"all-on-one-continent" variant.)

### RC4 — No intra-region dispersion objective
`plan-starts/strategies/default.ts:685` (`candidates.sort(compareSelectableTiles)`),
`selection-ladder.ts` (greedy pick within region pool)

Selection is a **quality-sorted greedy** pass. The only force separating seats
is a **pairwise** min-distance that is *relaxed per-seat down to the floor*
(spacing weight is just `1 - rankingBlend = 0.14`). High-quality tiles are
spatially correlated (same fertile basin), so seats pile into the best
neighborhood as long as they clear the floor. There is no objective spreading
seats **across distinct landmasses or across the region's extent**.

## Why this hid for so long

The existing spacing metric (E1.5, `placement-metrics.ts:632-659`) measures only
the **pairwise minimum** distance. Eight starts can all clear a 6-tile floor
while sitting inside one small landmass — so E1.5 passes while the map is visibly
crowded. **There is no metric for region balance or spatial spread of starts**
(`placement-metrics.ts` E2.8 "regional equity" is about *resource* density, not
starts). The bug is invisible to the current gate set.

## What is sound (do not change)

- The candidate **screening** (impassable / wonder / lake exclusions) and the
  **viability scorer** (fertility/freshwater/climate/roughness/start-bias) — keep.
- The **2-region homeland model** itself (WEST/EAST `LandmassRegionId`) is the
  *correct* Civ7 model (Homelands vs Distant-Lands; see `design.md`). The bug is
  not "2 regions"; it is "regions defined geometrically + allocated blindly."
- The **degrade-as-data** discipline (four-rung ladder, per-seat flags, fairness
  report) — keep and extend.

## Reference index

| Concern | File:line |
|---|---|
| Midline partition (RC1) | `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/index.ts:42-45` |
| Fixed player counts (RC2) | `mods/mod-swooper-maps/src/recipes/standard/runtime.ts:31-32` |
| Positional seat→slot bind (RC2) | `mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/policy/seat-identity.ts:27-35` |
| Input assembly | `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts:152-155` |
| Zero-only reconciliation (RC3) | `mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/strategies/default.ts:702-719` |
| Greedy selection / no spread (RC4) | `mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/strategies/default.ts:685`, `.../policy/selection-ladder.ts` |
| Published 2-region contract | `mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/contract.ts:5-19,301-315,352` |
| Spacing metric (blind to clustering) | `mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts:632-705` |
| Engine positioner (dead) | `packages/civ7-adapter/src/types.ts:805-882` |
| Policy adapter package (no start primitives) | `packages/civ7-map-policy/src/index.ts:1-55` |
