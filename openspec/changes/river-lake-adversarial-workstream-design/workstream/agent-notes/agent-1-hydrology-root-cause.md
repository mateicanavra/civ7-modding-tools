# Agent 1: Hydrology Root-Cause Prosecutor

Date: 2026-06-09
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/river-lake-adversarial-synthesis`
Lane: Hydrology root-cause prosecution

## 1. Framed objective

Active goal:
Establish the upstream-correct ownership and execution boundary for rivers so visible-river recovery is driven by Hydrology-owned canonical drainage truth over Morphology-owned terrain precursors, not by Morphology proxy routing or downstream compensation. The closure target for this lane is a durable owner split, a falsifiable upstream workstream, and explicit rejection of any design that lets broken drainage be repaired later by projection. This lane does not close rendered in-game river visibility or minor-river writer discovery; it closes the upstream authority question and the required upstream correction path.

Frame commitments:

- In scope:
  - Morphology vs Hydrology ownership.
  - Whether canonical flow/drainage routing belongs in Hydrology.
  - What remains in Morphology as terrain/earth-matter precursor data or proxy ops.
  - Downstream leakage that would re-couple projection to upstream truth repair.
- Foregrounded:
  - Owner boundary correctness.
  - Canonical drainage graph semantics.
  - Evidence from code, tests, docs, OpenSpec, and official Civ resources.
- Exterior:
  - Final rendered Civ visibility proof.
  - Runtime minor-river tile authoring discovery.
  - Earth-threshold numeric calibration beyond what is needed to police the owner split.
- Falsifier:
  - If canonical water-routing semantics are still required by non-Hydrology Morphology consumers as canonical truth, or if Hydrology still depends on `artifact:morphology.routing`, this frame fails and must be redone.

## 2. Investigation brief

Investigation type: doc-vs-code reconciliation plus codebase deep dive.

Frame stability: committed enough to investigate, but adversarially tested.

Evidence standard: verified repo-authority plus local code/test/resource evidence.

Authority order used:

1. Root and subtree `AGENTS.md`.
2. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
3. `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.
4. `docs/system/ADR.md` with ADR-008.
5. Domain references for Hydrology and Morphology.
6. Active OpenSpec slices.
7. Live code and tests.
8. Official Civ resources and generated policy constants as evidence only.

Primary questions:

1. What should Morphology own vs Hydrology own?
2. Does canonical flow/drainage routing belong in Hydrology?
3. What exact Morphology surfaces remain valid after that split?
4. What stale semantics or downstream compensation still threaten the split?

Exclusion questions:

- This lane does not ask whether terrain rows are visually obvious in Civ.
- This lane does not ask whether minor-river metadata can already be written.

Falsification questions:

- Does any live Hydrology truth step still read `artifact:morphology.routing`?
- Do any live Morphology consumers require Hydrology-grade basin/terminal truth rather than a terrain-shaping proxy?
- Do current docs or OpenSpec records still materially assert Morphology ownership of canonical routing?

Search geometry:

- Narrow first on owner docs and ADRs.
- Trace live step wiring.
- Trace actual consumers of Morphology routing.
- Cross-check with tests and official Civ runtime/resource evidence.
- Then attack the current execution plan for hidden coupling or stale semantics.

Stop conditions:

- Stop and reframe if code contradicts ADR-008 in the live branch.
- Stop and reframe if Hydrology still consumes Morphology routing in production code.

## 3. Notes and evidence log

### A. Current authority already places canonical drainage in Hydrology

- ADR-008 is explicit: Hydrology owns depression-conditioned receivers, basin ids, contributing area, terminal typing, discharge, river class, and lake intent; Morphology owns topography, land/water mask, bathymetry, substrate, coastline metrics, landform basins/depressions, and any terrain-shaping proxy routing. See `docs/system/ADR.md:182-211`.
- The Hydrology domain reference matches that split and states Hydrology routing does not consume `artifact:morphology.routing`. See `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md:110-130`.
- The truth-vs-projection policy reinforces that truth must not depend on projection surfaces and that engine generator behavior is not authored truth. See `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md:22-45`.

### B. Live code follows the upstream owner split

- The Hydrology routing op is a first-class domain op over Morphology terrain, with canonical outputs including conditioned `flowDir`, `flowAccum`, `basinId`, `routingElevation`, `depressionDepth`, `sinkMask`, `outletMask`, and `terminalType`. See `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-drainage-routing/contract.ts:3-80`.
- The Hydrology rivers step uses `ops.drainageRouting`, then `ops.accumulateDischarge`, then `ops.projectRiverNetwork`, and publishes routing diagnostics on `artifact:hydrology.hydrography`. See `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.ts:49-103`.
- The upstream repair slice records the same intent: Hydrology-owned routing, no downstream fallback corridors, no silent cycle fallback. See `openspec/changes/upstream-drainage-routing-repair/tasks.md:1-22`.
- Focused tests prove pit spill routing, typed closed basins, and cycle failure. See `mods/mod-swooper-maps/test/hydrology/drainage-routing.test.ts:10-64`.

### C. Morphology routing is live, but only as a terrain-shaping proxy

- The Morphology op contract now explicitly says it computes a geomorphic routing proxy and that Hydrology owns canonical drainage routing, rivers, and lakes. See `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/contract.ts:10-38`.
- The Morphology routing step contract repeats that Hydrology computes canonical drainage routing separately. See `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing.contract.ts:6-25`.
- The Morphology domain reference also calls `artifact:morphology.routing` a geomorphic proxy, not canonical hydrology truth. See `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md:103-110` and `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md:192-208`.
- Actual live consumers of `artifact:morphology.routing` are Morphology-only:
  - `geomorphology.ts` reads `routing.flowDir` and `routing.flowAccum` for erosion/deposition. See `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts:60-86`.
  - `mountains.ts` reads `routing.flowAccum` for rough-land planning. See `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains.ts:128-180`.

### D. Stale semantics still exist and are dangerous

- The active morphology terrain-authorship corpus ledger still classifies "Flow routing and geomorphic cycle" as Morphology truth/influence. See `openspec/changes/morphology-terrain-authorship-control/workstream/corpus-ledger.md:56-69`. That is stale relative to ADR-008 and the live Hydrology route owner.
- The Morphology artifact/op names still overload the term "routing" even though the semantics are now deliberately weaker than Hydrology routing. This is not just cosmetic; it is exactly the ambiguity that previously let implementers confuse proxy routing with canonical drainage truth.

### E. Official Civ evidence reinforces proof boundaries, not owner transfer

- Official Civ scripts still use `TerrainBuilder.modelRivers(...)`, then `defineNamedRivers()`, then `storeWaterData()`. Example: `.civ7/outputs/resources/Base/modules/base-standard/maps/continents.js:150-165`.
- Official UI tooltip code reads `GameplayMap.getRiverType(...)` and distinguishes `RIVER_MINOR` from `RIVER_NAVIGABLE`, which confirms metadata is a separate surface from terrain rows. See `.civ7/outputs/resources/Base/modules/base-standard/ui-next/tooltips/plot-tooltip/helpers.js:70-84`.
- The policy package correctly owns those Civ constants and keeps them shared across runtime, tests, and generated types. See `packages/civ7-map-policy/src/river-constants.ts:3-19` and `packages/civ7-map-policy/src/river-type-metadata.source.ts:1-19`.

### F. Downstream selection is no longer repairing upstream truth, but the naming is still structurally suspicious

- `map-rivers` explicitly consumes Hydrology truth and says selection semantics are owned by the consumed Hydrology op envelope. See `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.contract.ts:8-37`.
- The coherence design rejects `minLength/maxLength` and keeps projection as a narrow `map-rivers` concern. See `openspec/changes/map-rivers-navigable-coherence/design.md:3-28`.
- The current selection strategy follows Hydrology major-river continuity and no longer pads missing routes with projection-only connectors. See `mods/mod-swooper-maps/src/domain/hydrology/ops/select-navigable-river-terrain/strategies/default.ts:67-199`.
- However, `hydrology/select-navigable-river-terrain` is still a projection-subset op living in the Hydrology namespace. That is not my main upstream objection, but it remains an architecture-review smell because it is projection consumer logic, not canonical water-truth generation. It should be reviewed by the architecture lane without reopening the upstream Hydrology routing conclusion.

## 4. Findings, gaps, risks, and attacks on the current direction

### Finding 1: canonical drainage routing belongs in Hydrology

This is no longer a debate. The authoritative docs, live code, and tests all converge:

- Morphology provides terrain form and terrain-shaping proxies.
- Hydrology owns canonical water movement over that terrain.

That means "compute flow/drainage routing" splits into two different concerns:

- `hydrology/compute-drainage-routing`: canonical water-routing truth.
- `morphology/compute-flow-routing`: terrain-shaping proxy for erosion/rough-land style consumers.

### Finding 2: the previous bad state came from semantic collapse, not only algorithm weakness

The old failure was not just "steepest descent is weak." The deeper issue was that two different routing concepts used the same words:

- raw terrain proxy routing,
- canonical hydrologic drainage routing.

That ambiguity made it easy to:

- over-credit Morphology,
- under-specify Hydrology,
- and justify downstream compensation.

### Finding 3: Morphology still legitimately owns precursor data and terrain-proxy behavior

Morphology should still own:

- topography,
- land/water mask,
- bathymetry,
- coastline metrics,
- substrate,
- terrain depressions/basin geometry as landform facts,
- erosion/rough-land helper routing proxies if those consumers still need them.

It should not own:

- typed hydrologic terminals,
- canonical basin ids for drainage truth,
- discharge accumulation truth,
- river class truth,
- lake intent truth.

### Attack 1: stale docs can still regress the architecture

The morphology corpus ledger still says flow routing is Morphology truth/influence. That is enough to misdirect later work. This should be treated as an architecture bug, not "just docs drift."

### Attack 2: semantic overloading remains in live names

`artifact:morphology.routing` and `morphology/compute-flow-routing` still sound canonical. ADR-008 already calls for rename/narrow-or-replace cleanup. If that cleanup is skipped, the repo stays vulnerable to the exact same confusion that caused the earlier drift.

### Attack 3: do not let official Civ resource behavior re-own authored truth

Official scripts calling `TerrainBuilder.modelRivers(...)` prove that the game has a generator/materializer. They do not transfer authored truth ownership away from Hydrology. Any design that says "Civ already models rivers, so Morphology/Hydrology boundaries matter less" is wrong.

### Attack 4: do not mistake the projection selector for upstream proof

Even though downstream fallback corridors were removed, selector success does not prove Hydrology truth is sufficient in product terms. Upstream routing repair is necessary, but not the same as rendered river acceptance.

### Gap 1: the workstream has not yet enforced the owner split against all stale artifacts

The OpenSpec upstream routing slice is mostly implemented, but the stale corpus ledger and the still-overloaded Morphology names show that the authority repair is not yet fully closed.

### Gap 2: projection-subset logic still sits in the Hydrology namespace

I am not using this to challenge the upstream routing decision, but I am flagging it: projection selection is not canonical water truth. That shape must remain under adversarial architecture review so Hydrology does not slowly re-absorb projection behavior.

## 5. Recommended workstream changes and closure criteria

### Recommended change set A: lock the owner split in durable authority artifacts

Update all live project/workstream docs that still imply Morphology owns canonical flow routing. Minimum target from this pass:

- repair `openspec/changes/morphology-terrain-authorship-control/workstream/corpus-ledger.md`,
- keep Hydrology and Morphology domain docs aligned with ADR-008,
- treat any contrary archived material as stale history, not live authority.

Closure criteria:

- No live authority doc describes Morphology as owner of canonical drainage truth.
- No live workstream corpus ledger classifies flow-routing truth as Morphology-owned.

### Recommended change set B: finish the semantic cleanup around Morphology proxy routing

Do not move canonical routing back. Instead either:

1. rename/narrow the Morphology proxy surface so its weaker semantics are explicit, or
2. replace its consumers with more precise terrain-shaping inputs and retire the proxy artifact.

My recommendation is to prefer rename/narrow first if it keeps the slice small and honest, then retire later only if Morphology no longer needs the proxy.

Closure criteria:

- The Morphology proxy can no longer be mistaken for canonical drainage truth by name or doc contract.
- All current Morphology consumers continue to work without borrowing Hydrology truth semantics accidentally.

### Recommended change set C: hard-ban Hydrology dependence on Morphology routing truth

Keep `hydrology-hydrography` dependent only on Morphology topography precursors, never on `artifact:morphology.routing`.

Closure criteria:

- No Hydrology truth step reads `artifact:morphology.routing`.
- Tests or guards fail if that dependency reappears.

### Recommended change set D: finish downstream consumer realignment without reopening owner drift

Complete the outstanding upstream task to realign `map-rivers-navigable-coherence` as a pure consumer change. Keep projection narrow. Do not let projection thresholds or fallback semantics become a backdoor way to "fix" hydrology.

Closure criteria:

- `openspec/changes/upstream-drainage-routing-repair/tasks.md` item 2.2 is closed honestly.
- No downstream selector invents route connectors disconnected from Hydrology truth.

### Recommended change set E: preserve proof-class separation in closure language

Upstream routing closure must stop at `hydrology-truth` and generated/projection prerequisites. It must not claim rendered visibility, metadata success, or product acceptance.

Closure criteria:

- Upstream slices claim only what their proof class supports.
- Product closure remains blocked on runtime/studio/rendered proof lanes.

## 6. Verdict

The upstream-correct fix is:

1. Keep canonical drainage routing in Hydrology.
2. Keep Morphology as owner of terrain matter, basin/depression precursors, and terrain-shaping proxy routing only.
3. Remove stale authority that still frames flow-routing truth as Morphology-owned.
4. Clean up the Morphology proxy naming so the ambiguity does not come back.
5. Keep downstream projection as a consumer of Hydrology truth, not a repair layer.

Most of the live implementation already points the right way. The remaining upstream risk is semantic regression: stale docs, overloaded names, and gradual leakage of projection semantics back into truth owners.

Skills used: framing-design, investigation-design, civ7-architecture-authority, civ7-product-authority, civ7-systematic-workstream, civ7-open-spec-workstream.
