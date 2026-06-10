## 1. Framed objective

Identify the concrete failure chain behind "rivers stopped being stamped or visible" in Civ7 MapGen, with specific attention to:

- where river ownership moved from engine/runtime behavior to repo-owned projection behavior,
- where minor-vs-major semantics drifted,
- where mocks/tests encoded the wrong runtime contract,
- and where prior work overclaimed closure or patched the wrong owner.

This note is intentionally adversarial to the recovery narrative. It treats "visible rivers repaired" as unproved unless code, tests, and runtime contract all agree on the same river surface.

## 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

### Questions

1. When did river handling stop being primarily `adapter.modelRivers(...)` / Civ runtime behavior and become direct MapGen terrain stamping?
2. Did that change preserve Civ's actual river contract, or only create a repo-local surrogate?
3. Where did the minor-vs-major split become `0/1/2` tile intent instead of Civ's `NO_RIVER=-1`, `RIVER_MINOR=0`, `RIVER_NAVIGABLE=1` metadata?
4. Which tests or mocks made the direct-stamping path look correct when runtime semantics still disagreed?
5. Did lake normalization become a correct adapter projection boundary while rivers drifted into a wrong-owner patch?

### Exclusions

- No tuning recommendations.
- No generated-output analysis.
- No claim that any branch-local June 9 repair branch is "the" repo truth unless its code is in the current tree.
- No assumption that `TERRAIN_NAVIGABLE_RIVER` terrain, Civ river metadata, freshwater adjacency, and UI-visible rivers are interchangeable.

### Falsifiers

This note would be wrong if any of the following were proved:

- current mainline already separates terrain-row readback from Civ river metadata readback and keeps mocks metadata-bound;
- current mainline has a proved minor-river writer and records runtime metadata parity;
- direct terrain stamping alone is the official/authoritative Civ surface for both navigable and minor rivers;
- current downstream consumers are keyed off runtime river facts rather than Hydrology's tile intent surrogate.

### Evidence hierarchy

1. Current code and tests in the checked-out tree.
2. Semantic git diffs/commit lineage showing ownership changes.
3. Branch-local June 9 archaeology/proof docs, treated as useful but non-canonical if unmerged.
4. Higher-level design docs/proposals, treated as intent only.

### Stop conditions

- Stop once the failure chain explains both the stamping/visibility regression and the minor-vs-major/runtime drift with concrete file + commit evidence.
- Stop if evidence collapses into "maybe UI only" without a code/history cause. That did not happen here.

## 3. Timeline / archaeology findings

### 2026-01-17: Hydrology gets discharge-driven `riverClass`, but engine still owns visible rivers

Commit `2d37707c3` (`refactor(hydrology): discharge-driven hydrography projection`) introduced Hydrology-owned `riverClass` truth, but the step still called `context.adapter.modelRivers(...)` in the rivers step. Evidence:

- `git show 2d37707c3:mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-core/steps/rivers.ts`
- `riverAdjacency` was projected from `riverClass`, but visible rivers still depended on engine modeling.

This is the last clearly coherent state: Hydrology owned truth; Civ still owned river realization.

### 2026-01-28 to 2026-02-14: early direct stamping lineage already existed

Commits `9583caeb6` / `418c9cddb` ("map-hydrology: stamp navigable rivers from hydrography") and `73d7435ce` ("refresh area and water caches after river modeling") show an older lineage where river projection and cache refresh were already being manipulated outside pure engine delegation.

That matters because the June work did not invent the idea from scratch; it resurrected and hardened it.

### 2026-05-29: lakes get normalized through the adapter boundary

Commit `1914cb44d` (`refactor(hydrology): project lake plans through adapter`) moved lakes to a much cleaner shape:

- Hydrology truth artifact: `artifact:hydrology.lakePlan`
- adapter-owned projection/readback: `stampLakes(...)`
- downstream consumers switched to Hydrology truth instead of projection diagnostics

This is the important contrast case. Lakes moved toward a truth-plus-adapter boundary. Rivers did not.

### 2026-05-31: projection public surface still described river modeling in Civ terms

Commit `64a32130e` (`feat(mapgen): align projection authoring surface`) gave `map-rivers` a semantic public surface. In current tree, `openspec/changes/projection-authoring-surface-alignment/proposal.md` still frames `riverProjection` as owning "Civ7 river-model length thresholds," even though current code repurposes those knobs for repo-owned trunk selection rather than `modelRivers(...)`.

This is already authoring-surface drift: the public description stayed Civ-model-shaped while the implementation moved elsewhere.

### 2026-06-03: visible-river problem is reframed as projection parity, and `modelRivers` is replaced

Commit `33ca94aa3` (`fix(mapgen): enforce Swooper projection parity`) is the decisive ownership inversion.

It introduced:

- `mods/mod-swooper-maps/src/recipes/standard/projection-policies/navigableRiverMaterialization.ts`
- direct `setTerrainType(..., TERRAIN_NAVIGABLE_RIVER)` stamping in `map-rivers/steps/plotRivers.ts`
- a guard test that changed from "only `map-rivers` may call `modelRivers`" to later "no one may call it"

Evidence:

- `git show 33ca94aa3:mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts`
- `git show 33ca94aa3:mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`

This is where the problem stopped being "how do we make Civ realize rivers?" and became "how do we satisfy projection parity without delegating to Civ scripts?"

### 2026-06-05: direct-stamping frame is preserved during stack recovery

Commit `d7ceb780a` (`fix(mapgen): consolidate Swooper stack recovery`) kept `navigableRiverMaterialization.ts` and continued the direct-stamping architecture. The same line appears in current docs and tests:

- `docs/system/mods/swooper-maps/architecture.md`
- `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`
- `mods/mod-swooper-maps/test/hydrology-knobs.test.ts`

The repo started asserting that MapGen-owned projection was the correct repair, not a temporary workaround.

### 2026-06-09 morning: branch-local archaeology proves the missing writer surface, but current tree does not absorb that correction

Commit `58d0974dd` (`fix(mapgen): add river metadata readback guardrails`) is the strongest disconfirming evidence against the direct-stamping narrative:

- it records live runtime river metadata as `NO_RIVER=-1`, `RIVER_MINOR=0`, `RIVER_NAVIGABLE=1`;
- it separates terrain-row readback from metadata readback;
- it explicitly records that `TerrainBuilder.setRiverValidationValues()` was not a working minor-river writer;
- it states current official resources still use `modelRivers(...)`, `defineNamedRivers()`, `storeWaterData()`, and no public per-tile minor-river writer was found.

Evidence:

- `git show 58d0974dd:packages/civ7-map-policy/src/river-constants.ts`
- `git show 58d0974dd:packages/civ7-adapter/test/civ7-river-projection.test.ts`
- `git show 58d0974dd:scripts/civ7-direct-control/probe-river-writer.ts`
- `git show 58d0974dd:openspec/changes/earthlike-visible-river-acceptance/workstream/history-evidence.md`

This branch-local work found the real contract drift. The current checked-out tree does not contain that correction.

### 2026-06-09 afternoon/evening: branch-local follow-ups improve the surrogate, not the underlying owner problem

Commits `57a2e7659`, `6fd550d4e`, `4faa4e9df`, `57f934926`, and `c9f7354be` do useful work, but they also show how far the workstream had already drifted:

- `57a2e7659` hardens a Hydrology-owned `riverClass` contract as non-negative intent with `>=2` meaning major/projectable.
- `6fd550d4e` explicitly fixes the mock so terrain stamping no longer impersonates metadata.
- `4faa4e9df` moves navigable selection into Hydrology and even calls the previous selector "wrong-owner," but only within the already shifted direct-stamping frame.
- `57f934926` and `c9f7354be` improve trunk coherence and diagnostics for projected navigable terrain.

These commits refine the surrogate system. They do not prove that the surrogate equals Civ river behavior.

## 4. Root-cause chain(s)

### Chain A: ownership inversion turned a runtime river problem into a terrain-row projection problem

1. Hydrology truth was made tile-based and discharge-driven (`2d37707c3`), but engine river realization still existed.
2. Projection-parity work (`33ca94aa3`) reframed the failure as "satisfy engine materialization requirements without delegating terrain ownership to Civ scripts."
3. `map-rivers` started selecting trunks from Hydrology truth and stamping `TERRAIN_NAVIGABLE_RIVER` directly via `setTerrainType(...)`:
   - current file: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts`
4. Current tests then codified the ban on `adapter.modelRivers(...)`:
   - current file: `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`
5. Result: the repo optimized for terrain-row parity while dropping the question of who authors Civ river metadata and minor rivers at runtime.

Why this matters: if Civ-visible rivers depend on more than the terrain row, direct stamping can never fully repair the failure. The repo changed the owner before proving the contract.

### Chain B: minor-vs-major semantics collapsed from Civ metadata into a repo-local tile intent surrogate

1. Civ runtime semantics, as later proved in `58d0974dd`, are metadata values:
   - `NO_RIVER=-1`
   - `RIVER_MINOR=0`
   - `RIVER_NAVIGABLE=1`
2. Current repo semantics use Hydrology `riverClass` as a non-negative tile field:
   - `0=none`, `1=minor`, `2=major`
   - current consumers describe it that way in contracts and code, e.g.
     - `mods/mod-swooper-maps/src/domain/placement/ops/plan-discoveries/contract.ts`
     - `mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/contract.ts`
     - `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/rules/river-adjacency-mask.ts`
3. Downstream systems consume `riverClass` as if tile occupancy were the same thing as river presence:
   - discoveries reject any tile with `riverClass[i] > 0`
   - starts use `(riverClass / 2)` as freshwater strength
   - ecology computes adjacency by scanning neighboring `riverClass != 0`
4. That surrogate is not the same shape as Civ's edge/metadata model for minor rivers.

Result: the codebase now has an internally consistent river surrogate, but it is not the runtime contract it claims to be repairing.

### Chain C: mocks and harness defaults hid the runtime disagreement

1. Current `MockAdapter.setTerrainType(...)` treats `TERRAIN_NAVIGABLE_RIVER` terrain as river metadata by writing `riverMask` and `riverTypes`:
   - current file: `packages/civ7-adapter/src/mock-adapter.ts`
2. Current `MockAdapter.isRiver`, `isNavigableRiver`, and `isAdjacentToRivers` follow those mock-written values, so terrain stamping looks like full river authoring in tests.
3. Current global test setup still hardcodes `GameplayMap.getRiverType()` to `0`:
   - current file: `packages/mapgen-core/test/setup.ts`
4. But `0` is later proved to mean `RIVER_MINOR`, not "no river." So the default harness itself encodes the wrong sentinel.
5. Branch-local fix `6fd550d4e` exists precisely because this mismatch was masking terrain-vs-metadata divergence.

Result: current local tests are structurally biased toward validating the wrong-owner patch.

### Chain D: rivers missed the clean adapter/readback normalization that lakes received

1. Lakes were normalized in `1914cb44d` into:
   - Hydrology truth (`lakePlan`)
   - adapter projection/readback (`stampLakes`)
   - downstream consumption from truth rather than projection diagnostics
2. Rivers, by contrast, were normalized into:
   - Hydrology tile intent (`riverClass`)
   - repo-owned trunk selector
   - direct terrain stamping
   - no current mainline readback contract separating terrain from metadata
3. The branch-local June 9 work discovered this gap and started to repair it, but current mainline still lacks that boundary.

Result: lake recovery became a projection boundary problem. River recovery became a surrogate-authoring problem.

## 5. False leads / prior overclaims

### "MapGen-owned navigable river stamping repaired rivers"

Overclaim. It repaired, at best, one surface: selected `TERRAIN_NAVIGABLE_RIVER` terrain rows. It did not prove Civ minor-river metadata, `GameplayMap.getRiverType`, `isRiver`, `isNavigableRiver`, or UI-visible river behavior.

Evidence:

- current `map-rivers` stamps terrain rows directly;
- `58d0974dd` branch-local proof records terrain matches with metadata still all zero;
- current mainline lacks the readback contract that would force this distinction.

### "Minor vs major is handled by `riverClass` 0/1/2"

Overclaim. That is a repo-owned intent encoding, not Civ runtime semantics. It collapses edge/metadata rivers into tile occupancy and changes the no-river sentinel from `-1` to `0`.

Evidence:

- current downstream contracts use `0/1/2`;
- branch-local map-policy evidence proves runtime uses `-1/0/1`.

### "No one should call `adapter.modelRivers(...)` anymore"

Wrong-owner patch, or at minimum an unproved conclusion. The current guard test bans `modelRivers(...)` categorically, but the June 9 archaeology branch simultaneously documents that official resources still use `modelRivers(...)` and that no public per-tile minor-river writer was found.

Evidence:

- current `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`
- `58d0974dd` history/probe docs

### "Hydrology owns river truth, so moving navigable selection into Hydrology fixes the owner issue"

Partial truth used to hide the real owner problem. `4faa4e9df` correctly notices that `map-rivers` was owning too much selector logic, but it still keeps the system inside the direct-stamping frame. The owner problem is not just "which repo layer selects trunks"; it is "who can author the runtime river surfaces that Civ actually uses."

### "Floodplain and freshwater behavior are proved by current product tests"

Overclaim. Current product tests prove downstream behavior against the surrogate:

- floodplain tests explicitly inject `RIVER_CLASS_MAJOR` and `navigableRiverMask`;
- placement/freshwater logic uses `riverClass` and `lakeMask`, not runtime river metadata.

Evidence:

- `git show 58d0974dd:mods/mod-swooper-maps/test/ecology/floodplain-feature-product-row.test.ts`
- current `mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/strategies/default.ts`
- current `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts`

## 6. Concrete repair implications

1. Stop treating "navigable terrain row stamped" as the same acceptance row as "rivers repaired."
   Separate at least:
   - terrain-row parity,
   - Civ river metadata parity,
   - freshwater/adjacency gameplay parity,
   - floodplain product parity,
   - UI-visible parity.

2. Remove the categorical ban on `adapter.modelRivers(...)` until the runtime owner question is settled.
   The current ban bakes in an unproved answer.

3. Pull the June 9 contract corrections into mainline before any more river-recovery claims:
   - shared river metadata constants,
   - metadata-bound mock behavior,
   - explicit terrain-vs-metadata readback separation,
   - removal of the `getRiverType() => 0` harness lie.

4. Treat lakes as the boundary model, not current map-rivers.
   Rivers need the same shape lakes got:
   - Hydrology truth upstream,
   - adapter/runtime projection boundary,
   - explicit readback surface,
   - honest unsupported-state handling when a writer does not exist.

5. Re-audit downstream consumers for where they should read Hydrology intent versus runtime facts.
   Current placement/ecology logic is heavily keyed to `riverClass`, which is useful as internal planning data but unsafe to advertise as runtime-equivalent.

6. Reclassify prior repairs that only improved trunk selection/materialization coherence.
   `4faa4e9df`, `57f934926`, and `c9f7354be` are not worthless, but they are refinements of the surrogate path, not proof that the original failure is solved.

7. Update docs so the public authoring surface does not describe one river owner while code enforces another.
   Current tree still has mixed messaging:
   - stale example docs still show `modelRivers(...)`;
   - current projection docs say MapGen satisfies river policy without Civ's river generator;
   - branch-local June 9 docs say metadata remains unsupported until proven.

## 7. Highest-risk unknowns still needing proof

1. What exact combination of surfaces makes rivers "visible" in live Civ?
   Terrain row only, metadata only, both, or additional cache/UI state.

2. Is there any stable official/public writer for minor-river metadata besides bulk `modelRivers(...)` behavior?
   `setRiverValidationValues()` was explicitly disproved in the June 9 probe branch, but that is not equivalent to proving no other writer exists.

3. If `modelRivers(...)` is reintroduced at the adapter boundary, can it restore the missing runtime surfaces without reintroducing unacceptable nondeterminism?

4. Which downstream gameplay behaviors actually require runtime river metadata, and which can safely remain Hydrology-intent-driven?
   Starts, freshwater scoring, floodplains, and wonder/resource filters are the most dangerous ones.

5. Are the branch-local June 9 proofs reproducible on current mainline once mock/test drift is removed?
   Right now the branch-local archaeology is ahead of the checked-out tree's contract honesty.

6. Did any product-acceptance or parity workstream silently accept branch-local proof artifacts as if they described current repo behavior?
   That needs an explicit audit before closure claims are trusted.
