# Foundation Stage Decomposition — Design

> The proposed end-state for `foundation`: what each stage is, what it needs and
> produces, the file layout, and how the realignment stays byte-identical.
> Companion to [FRAMING.md](FRAMING.md). Read that for the evidence + decisions.

**Nature of the change:** a **behavior-preserving structural refactor**. The single
`foundation` recipe stage (10 steps) becomes a sequence of small,
physically-grounded stages. Same ops, same execution order, same resolved configs,
**byte-identical generated maps** (guarded by `shipped-map-identity.test.ts`). The
`foundation` *domain* (17 ops) is unchanged. This mirrors how `morphology`,
`hydrology`, and `ecology` are already **one domain → many stages**.

---

## 1. The decomposition

Physically-grounded cut along the earth-science dependency chain (= the
architecture packet's "generative layers"): **mantle convection → lithosphere &
plates → tectonic boundary history → crustal evolution → tile projection**.

| # | Stage | Steps (in order) | Unit of work | Produces (artifacts) | Knob |
|---|---|---|---|---|---|
| 1 | `foundation-mantle` | mesh, mantle-potential, mantle-forcing | Computational mesh + mantle convection forcing field — the deep-earth driver | `foundation.{mesh, mantlePotential, mantleForcing}` | `plateCount` (mesh sizing) |
| 2 | `foundation-plates` | crust (init), plate-graph, plate-motion | Initial lithosphere, partitioned into rigid plates with kinematics | `foundation.{crustInit, plateGraph, plateMotion}` | `plateCount` (partition) |
| 3 | `foundation-tectonics` | tectonics | Plate-boundary dynamics + geological history (segments, era loop, events, fields, rollups, current drivers, tracers, provenance) | `foundation.{tectonicSegments, tectonicHistory, tectonicProvenance, tectonics}` | — |
| 4 | `foundation-crust` | crust-evolution | **Merge:** initial crust ⊕ tectonic history → final crustal material state | `foundation.crust` | — |
| 5 | `foundation-projection` | projection **[+ plate-topology]** | Resample mesh-space truth → Civ7 tile grid **[+ plate adjacency graph]** | `map.foundation{Plates, TileToCellIndex, CrustTiles, TectonicHistoryTiles, TectonicProvenanceTiles}` **[+ `foundation.plateTopology`]** | `plateActivity` |

**Open fork (for the user):** `plate-topology` lands either as the **2nd step of
`foundation-projection`** (5 stages — recommended) or as its **own
`foundation-topology` stage** (6 stages). See §6.

### Dependency DAG (after the split)

```
foundation-mantle ─▶ foundation-plates ─▶ foundation-tectonics ─▶ foundation-crust ─▶ foundation-projection ─▶ (morphology-coasts …)
   mesh,                crustInit,            segments, history,       crust(final)        map.foundation*  (the cross-domain surface)
   mantlePotential,     plateGraph,           provenance, tectonics
   mantleForcing        plateMotion
```

Mesh-space truth flows down the chain; only the tile-space `map.foundation*`
products cross into morphology (unchanged artifact ids → **near-zero downstream
churn**: consumers still read `mapArtifacts.foundation*`).

### Why these boundaries (physical grounding)

- **mantle | plates** — convective *forcing* (a field on the mesh) vs the *rigid
  lithosphere* it produces and moves. Different objects (continuous field vs
  discrete plates).
- **plates | tectonics** — plate *formation/kinematics* vs what happens *at their
  boundaries over geological time*. tectonics requires fully-formed moving plates.
- **tectonics | crust** — boundary *history* (a process record) vs the *material
  state* that history produces. `crust-evolution` is the one step that merges
  `crustInit` lineage with `tectonicHistory` → the user's "combination/merge
  stage" and the packet's distinct material layer.
- **truth | projection** — all of 1–4 are mesh-space **truth** (never touch the
  adapter); stage 5 is the explicit, labeled **mesh→tile resampling** bridge
  (still truth-space — it does NOT write engine terrain; that is the later `map-*`
  stages). This keeps the load-bearing truth/projection invariant crisp.

---

## 2. File structure (scale-continuous; nothing loose)

Each stage is a **structurally identical, self-contained directory**:

```
recipes/standard/stages/
  foundation-mantle/
    index.ts            createStage({ id:"foundation-mantle", knobsSchema:{plateCount}, public:{meshResolution,mantleSources,mantleForcing}, steps, compile })
    artifacts.ts        defineArtifact for mesh, mantlePotential, mantleForcing
    validation.ts       validators for this stage's artifacts (+ shared wrapper from domain lib)
    viz.ts              viz meta/colors owned by this stage (imports shared geometry from domain lib)
    steps/{index.ts, mesh.ts, mesh.contract.ts, mantlePotential.ts, …, mantleForcing.contract.ts}
  foundation-plates/      … crust(init), plate-graph, plate-motion ; public:{lithosphere,platePartition,plateMotion} ; knob plateCount
  foundation-tectonics/   … tectonics ; public:{tectonicSegmentation,tectonicEras,tectonicFields,tectonicRollups}
  foundation-crust/       … crust-evolution ; public:{} ; no knob
  foundation-projection/  … projection [+ plate-topology] ; public:{} ; knob plateActivity
```

**Shared primitives** (genuinely cross-stage) move to the domain's natural home so
no `stages/foundation/` hub lingers:
- `domain/foundation/lib/viz-geometry.ts` ← the pure geometry converters from
  today's `viz.ts` (`interleaveXY`, `segmentsFromCellPairs`, `segmentsFromMeshNeighbors`,
  `pointsFromPlateSeeds`, `pointsFromTileCentroids`, `segmentsFromTileTopologyNeighbors`).
- `domain/foundation/lib/artifact-validation.ts` ← `wrapFoundationValidate` /
  `wrapFoundationValidateNoDims` (per-artifact validators move into each stage's
  `validation.ts`, beside the artifacts they guard).
- The shared **crust artifact schema** (`FoundationCrustArtifactSchema`, used by
  `crustInit` and `crust`) → defined once (in `foundation-plates/artifacts.ts`,
  owner of `crustInit`) and imported by `foundation-crust/artifacts.ts`.
- The **tile-space schemas** (consumed by `recipes/standard/map-artifacts.ts`) live
  in `foundation-projection/artifacts.ts`; `map-artifacts.ts` imports from there.

The old `stages/foundation/{index.ts, artifacts.ts, validation.ts, viz.ts, steps/}`
is fully removed — its content is distributed, nothing is orphaned.

---

## 3. Artifact ownership & quality

Audit result: **16 artifacts are meaningful + usable + atomic → publish all; 0 are
bad/meaningless → remove none** (honors the "publish meaningful artifacts even if
unconsumed" directive). Per-stage ownership:

- **mantle:** `mesh`, `mantlePotential`, `mantleForcing`.
- **plates:** `crustInit`, `plateGraph`, `plateMotion`.
- **tectonics:** `tectonicSegments` (boundary topology — kept; meaningful + atomic
  even though consumed only by tests/viz today), `tectonicHistory`,
  `tectonicProvenance`, `tectonics`.
- **crust:** `crust` (final).
- **projection:** the 5 `map.foundation*` tile products [+ `plateTopology`].

**One repair (not a removal):** `plate-topology` currently has `ops:{}` and calls
`buildPlateTopology` inline — the only loose-code step. Extract a real
`foundation/compute-plate-topology` domain op (identity-preserving: same function,
same inputs). It stays tile-derived for this slice; going mesh-native (→ move into
`foundation-plates`) is the flagged follow-on.

---

## 4. Knobs

- `plateCount` (shared `FoundationPlateCountKnobSchema`) is declared on **both**
  `foundation-mantle` (→ mesh `cellCount`) and `foundation-plates` (→ partition
  count). Identity-safe: no default; configs set it on both blocks; omission →
  both ops default to 32. (Single-source "derive from mesh artifact" = clean
  follow-on, not this slice.)
- `plateActivity` (shared `FoundationPlateActivityKnobSchema`) → `foundation-projection`
  only (projection `normalize`). Clean, single stage.

---

## 5. Visualization (intentional)

Viz is co-located in each step (`context.viz?.dump*` + `defineVizMeta`); there is no
separate registry. The split moves each step's viz with it, so groups stay coherent
and intentional per stage:
- `Foundation / Mesh`, `Foundation / Mantle*` → mantle stage.
- `Foundation / Crust` (cell type/age/maturity), `Foundation / Plates` (seeds/graph),
  plate-motion fields → plates stage.
- `Foundation / Tectonics`, `Foundation / Tectonic History` (per-era) → tectonics stage.
- `Foundation / Crust` (final) → crust stage (shares the `Foundation / Crust` group
  with crustInit — deliberate: init vs evolved crust read as one family; colors/labels
  reviewed so the two are distinguishable).
- `Foundation / Plates` (tile), `… Crust Tiles`, `… Tectonic History/Provenance Tiles`,
  `Foundation / Plate Topology` → projection stage. Spaces: mesh steps emit in
  `world.xy`; projection/topology in `tile.hexOddQ` — preserved.

Shared geometry converters move to `domain/foundation/lib/viz-geometry.ts`; the
color/label/`defineVizMeta` choices stay with the owning step. Boundary-type colors
(convergent=red, divergent=blue, transform=amber, none=grey) and crust-type colors
(oceanic=blue, continental=green) are preserved and applied consistently.

---

## 6. The one open fork: 5 vs 6 stages (plate-topology placement)

`plate-topology` is, this slice, tile-derived (reads `map.foundationPlates`), so it
must run **after** projection. Two clean placements:

- **5 stages (recommended):** `plate-topology` is the **2nd step of
  `foundation-projection`**. Cohesive "tile-facing outputs" stage; doesn't mint a
  whole stage for a transitional, currently-viz-only diagnostic; folds cleanly into
  `foundation-plates` when it later goes mesh-native. (Architecture/packet lens.)
- **6 stages:** `plate-topology` is its **own `foundation-topology` stage** after
  projection. Maximizes composability (a consumer of plate adjacency depends only
  on this node) and keeps `foundation-projection` purely mesh→tile resampling.
  (Physics / gameplay / naming lenses.)

Either is identity-safe and structurally uniform. Recommendation: **5**.

---

## 7. Identity-safety invariants (the guard rails)

1. Every step keeps `phase: "foundation"` → RNG labels (`${phase}/${stepId}`) are
   unchanged. **The single most important invariant.**
2. Op execution order preserved exactly (manifest order = mesh → … → plate-topology).
3. Artifact ids, op ids, op configs, knob schemas/defaults — all unchanged.
4. Step contracts' `requires`/`provides` unchanged (only the owning stage changes).
5. Identity test passes **without** regenerating golden output. If it fails, the
   refactor changed behavior — fix the refactor, never the snapshot.

---

## 8. Realignment edit set (blast radius)

| Surface | Change |
|---|---|
| `contract-manifest.ts` | Replace the one `stage("foundation", […10])` with 5(/6) `stage("foundation-*", […])` entries in order; `StandardStageId` union expands. |
| `recipe.ts` | Import 5(/6) stages; pass them to `orderStandardStages({…})`. Domain wiring (`collectCompileOps(foundationDomain,…)`) unchanged. |
| `stages/foundation/**` | Removed; redistributed into `stages/foundation-*/**` + `domain/foundation/lib/*` (shared primitives). |
| `map-artifacts.ts` | Import the 5 tile-space schemas from `foundation-projection/artifacts.ts` (was `foundation/artifacts.ts`). `mapArtifacts.*` ids unchanged. |
| `studio-contracts/index.ts` | Auto-derives from the manifest → updates for free. |
| **Map configs** (`maps/configs/*.json`, `canonical.ts`, `studio-current.config.json`) | Split each `foundation: {…}` block into `foundation-mantle/-plates/-tectonics/-crust/-projection` blocks; `plateCount` knob duplicated to mantle+plates, `plateActivity` to projection. (~10 configs.) |
| **Presets** (`maps/presets/realism/*.ts`) | Same block split (young-tectonics, old-erosion). |
| `maps/__type_tests__/createMap-config.inference.ts` | Update `_FoundationKnobs` references to the new stage keys. |
| **Tests** (`test/foundation/**`, `test/pipeline/**`, `test/config/**`, `test/standard-*.ts`, `test/m11-config-knobs-and-presets.ts`, `test/support/**`, morphology consumer tests) | Update any hardcoded stage id `"foundation"`, full step id `"foundation/<step>"`, or `foundation` config block. Identity/topology-lock/gates tests must stay green unchanged-in-spirit. |
| **Docs** | `FOUNDATION.md` stage-composition section → 5(/6) stages; `STANDARD-RECIPE.md`; backlink the packet + this design. |

Downstream domain code (morphology consumers) needs **no change** — it reads
`mapArtifacts.foundation*`, whose ids are unchanged.

---

## 9. Slice sequence (Graphite stack on `main`)

1. **`frame+design`** — this doc + FRAMING + decisions. *(docs-only; current branch)*
2. **`compute-plate-topology op`** — extract the inlined `buildPlateTopology` into a
   domain op; rewire the existing `plate-topology` step to call it. Identity-preserving,
   self-contained, independently reviewable. Removes the last `ops:{}` step.
3. **`foundation stage split`** — the structural cutover: scaffold the 5(/6) stages,
   distribute artifacts/validation/viz, relocate shared primitives to `domain/foundation/lib`,
   update manifest + recipe + map-artifacts + knob plumbing, migrate all configs/presets,
   update tests, remove the monolith. Identity-guarded. *(internally ordered commits:
   scaffold → migrate configs → update tests → delete monolith, each kept green.)*
4. **`docs realignment`** — FOUNDATION.md + STANDARD-RECIPE.md to the new shape.

Each slice ends green (build + identity + targeted suites) before the next stacks.

---

## 10. Verification per slice

`nx run mod-swooper-maps:build` · `bun test test/config/shipped-map-identity.test.ts`
(primary) · `test/pipeline/{foundation-gates,foundation-topology-lock,artifacts,viz-emissions,determinism-suite}` ·
`test/foundation/**` · `test/standard-recipe.test.ts` · `test/m11-config-knobs-and-presets.ts` ·
`nx run-many -t boundaries` (Nx) + Grit checks · Studio DAG build. Closure: a live
in-game smoke run (identity ⇒ parity, but the live engine is the closure test).

---

## 11. Explicitly out of scope (enabled follow-ons)

These are made *possible* by the decomposition but are **not** part of this
behavior-preserving refactor (they change output):
- `foundation-material-history-contract` (per-era crust snapshots / material deltas).
- `plate-topology` → mesh-native (from `plateGraph`+`mesh`), moved into `foundation-plates`.
- `plateCount` → single-source (derive from mesh artifact instead of duplicate knob).
- `foundation-projection-provenance-confidence`, `morphology-landform-intents`, etc.
  (from the architecture packet's candidate slices).
