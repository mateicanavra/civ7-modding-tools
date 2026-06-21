# Foundation Stage Decomposition — Framing & Investigation

> Living working document. Maintained from first discovery through design and into
> implementation. Grounds the whole workstream: skills + repo context gathered,
> domain constraints, prior artifacts, assumptions, hypotheses, evidence, current
> understanding, and the proposed design. Not a status log — the durable frame.

**Branch:** `agent-fnd-foundation-stage-split` (worktree, off `main` @ `a061eec65`)
**Date opened:** 2026-06-20
**Owner stance:** steward/driver of the workstream (own investigation, design, slice sequence, verification, follow-through).

---

## 1. Mission

Decompose the monolithic `foundation` **recipe stage** into multiple well-defined,
physically-grounded **stages** — each a composable, self-contained node in the
pipeline graph with explicit input/output artifacts — and realign every producer
and consumer accordingly. Clean up loose/orphaned artifacts and make all
visualization intentional.

The right model is **physical / algorithmic grounding**: the stage boundaries
should reflect the real dependency graph of the earth-science processes
(mantle convection → lithosphere/plates → tectonic history → crustal evolution →
tile projection), not arbitrary groupings or the patterns of other stages.

### Hard constraint discovered: behavior-preserving structural refactor

`mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts` asserts shipped
maps generate identically. This decomposition is therefore a **pure structural
refactor**: same ops, same execution order, same resolved configs, **byte-identical
generated maps**. No behavioral/physics change rides along. The identity test is
the safety net for the whole refactor. (Material-history / landform-intent /
provenance-confidence enrichments proposed by the architecture packet are
explicitly *out of scope* here — they are follow-on slices that become possible
*because* of this decomposition.)

---

## 2. The lens: gameplay and physics must agree

- **Physics:** the world must hold together as a simulated place — plates,
  convection, crust, tectonic history causally consistent. The decomposition is
  judged by whether each stage is a coherent earth-science unit.
- **Gameplay:** foundation is upstream of everything the player stands in
  (coasts, mountains, fair starts, naval geography). Decomposition value is
  **composability + legibility**: a downstream consumer should depend on exactly
  the foundation stage it needs, and any author/dev should immediately see what
  each stage needs and produces.
- Reason in **complexity vs. parallelism**, never effort/time. Within foundation
  the earth-science dependency graph is largely linear (each layer feeds the
  next), so the gain is in *composability and clarity*, not intra-foundation
  parallelism. That is the honest representation of the physics.

---

## 3. Skills & context gathered (read in full)

Anchor skills (entry → relevant references, read fully):
- `civ7-mapgen-workstream` SKILL + `references/pipeline-map.md` + `references/facet-physics.md`
  + `templates/mapgen-workstream-starting-frame.md`.
- `civ7-systematic-workstream` SKILL (12-gate evidence loop).
- `civ7-open-spec-workstream` SKILL (phase loop, dominoes → OpenSpec changes).
- `dev:graphite` SKILL + `dev:git-worktrees` SKILL (worktree + stack mechanics).
- `mapgen:foundation` (philosophy-only / outdated arch — used for domain
  philosophy, never for current paths).

Authoritative repo grounding (live source + canonical docs):
- Recipe wiring: `recipes/standard/recipe.ts`, `recipes/standard/contract-manifest.ts`.
- The monolith: `recipes/standard/stages/foundation/**`.
- Domain (unchanged target): `domain/foundation/**` (one `foundation` domain, 17 ops).
- Canonical reference: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (updated 2026-06-05).

### Decisive prior artifact — the architecture packet

`docs/projects/pipeline-realism/resources/packets/foundation-architecture-generative-pipeline/README.md`
(merged via PR #1422, 2026-06-07). An independent, source-cited review of the
*current* Foundation architecture. It is not yet an implementation spec, but it:
- Names the structural problems this workstream targets:
  - **#2** `tectonics` is a broad layer aggregator (segments + era loop + events +
    fields + rollups + current + tracers + provenance in one step).
  - **#3** Material evolution collapsed into final crust (`crust-evolution` publishes
    only `foundation.crust`).
  - **#4** Projection is still inside Foundation (publishes `map.foundation*`).
  - **#5** `plateTopology` is projection-adjacent, named as Foundation, has **no op**.
- Gives a **"Generative Layers Over Time"** model (layers 1–12) = the
  physically-grounded dependency graph this decomposition cuts along.
- Proposes candidate slices incl. `foundation-tectonics-lane-split`,
  `foundation-plate-topology-op`, projection separation — i.e. it independently
  points at the same cuts.
- **Hard core (load-bearing for us):** "material history, plate kinematics,
  tectonic events, provenance, and tile projections must remain separately
  understandable"; "downstream consumers should read explicit artifacts, not
  recover meaning from sampled/buffer-local state"; "map projection stages
  materialize truth, they do not own truth planning."

> **Note vs packet:** the packet is conservative ("separate lanes contractually
> *without prematurely promoting stages*"). This workstream's directive is to go
> further and **promote to stages** (the user's explicit goal). The packet
> supplies the layered model + problems; the user supplies the stage-promotion
> decision.

### Decisive prior artifact — the morphology precedent

`docs/projects/morphology-4stage-split/` decomposed the morphology truth pipeline
into `morphology-coasts / -routing / -erosion / -features`. This is the exact
template: **one domain → many recipe stages**, `<domain>-<stage>` naming, artifact
ids unchanged, op ids unchanged, viz dataTypeKeys unchanged, full step ids change
(stage id is embedded), author legibility preserved via labels. Hydrology
(`-climate-baseline/-hydrography/-climate-refine`) and ecology
(`-pedology/-biomes/-features`) follow the same shape. **Foundation is the last
single-stage truth domain; bringing it into line is scale-continuous with the
rest of the pipeline.**

### User clarifications (2026-06-20)

1. **Publish meaningful artifacts even if not yet consumed downstream** — as long
   as they are *usable, meaningful, and atomic*. Do NOT remove an artifact merely
   because nothing consumes it yet. Only remove/repair artifacts that are *bad,
   meaningless, or non-atomic*. → Reframes "cleanup" from "delete orphans" to
   "audit quality; every published artifact must be meaningful + atomic."
2. A recent Foundation architecture doc exists — found (the packet above); it
   informs this approach.
3. Use Narsil MCP (indexes the primary worktree = current `main`).

---

## 4. Current architecture (evidence-cited)

### 4.1 The monolith

`stages/foundation/` is one `createStage({ id: "foundation" })` with **10 steps**
(order authority = `contract-manifest.ts`):

```
mesh → mantle-potential → mantle-forcing → crust(crustInit) → plate-graph →
plate-motion → tectonics → crust-evolution → projection → plate-topology
```

Stage-level shared modules: `artifacts.ts` (977 L — the artifact catalog +
tile-space schemas re-exported to `map-artifacts.ts`), `validation.ts` (792 L —
shared per-step output validators, imported by every step's `run`), `viz.ts`
(123 L — shared mesh/tile geometry → viz-buffer converters).

### 4.2 Artifact dependency graph (the physics chain)

| Step | requires (artifacts) | provides | space |
|---|---|---|---|
| mesh | — | `mesh` | mesh |
| mantle-potential | mesh | `mantlePotential` | mesh |
| mantle-forcing | mesh, mantlePotential | `mantleForcing` | mesh |
| crust | mesh, mantleForcing | `crustInit` | mesh |
| plate-graph | mesh, crustInit | `plateGraph` | mesh |
| plate-motion | mesh, plateGraph, mantleForcing | `plateMotion` | mesh |
| tectonics | mesh, mantleForcing, crustInit, plateGraph, plateMotion | `tectonicSegments`, `tectonicHistory`, `tectonicProvenance`, `tectonics` | mesh |
| crust-evolution | mesh, crustInit, **tectonics, tectonicHistory** | `crust` (final) | mesh |
| projection | mesh, **crust**, plateGraph, plateMotion, tectonics, tectonicHistory, tectonicProvenance | `map.foundation{Plates,TileToCellIndex,CrustTiles,TectonicHistoryTiles,TectonicProvenanceTiles}` | mesh→tile |
| plate-topology | `map.foundationPlates` | `foundation.plateTopology` | tile-derived |

Key structural facts:
- **Crust is bimodal in time.** `crustInit` (mesh+forcing) is the precondition for
  plate partition; `crust` (final) is `crustInit` reworked by tectonic history.
  They are different artifacts at different causal points — `crust-evolution` is a
  genuine **merge** (crustInit lineage ⊕ tectonic history). This matches the
  user's "combination/merge stage" hint and packet problem #3.
- **`projection` is mesh→tile resampling** (`computePlatesTensors`), not adapter
  projection. It does NOT touch the adapter — it's still truth-space, producing
  tile-space `map.foundation*` artifacts. Naming overloads the pipeline's
  "projection" (= `map-*` adapter stages); must be documented clearly.
- **`plate-topology` has `ops: {}`** — it calls `buildPlateTopology` from
  `@swooper/mapgen-core/lib/plates` directly (loose code, no domain op). Packet
  slice `foundation-plate-topology-op` wants this extracted into an op.

### 4.3 Truth vs projection (the load-bearing invariant)

Mesh-space `foundation.*` artifacts are **truth**; tile-space `map.foundation*` are
**projections** (recomputable from truth, carry `tileToCellIndex` crosswalk). The
decomposition must keep this split crisp: truth stages compute mesh artifacts;
the projection stage is the explicit, labeled mesh→tile bridge.

### 4.4 Consumers (who reads foundation across the repo)

- **Mesh-space `foundation.*`**: consumed **only inside the foundation stage**
  (intermediate truth) + tests. (Confirmed by grep: no downstream domain imports
  `foundationArtifacts`.)
- **Tile-space `map.foundation*`** (the cross-domain surface):
  - `morphology-coasts/landmassPlates` ← `foundationCrustTiles`,
    `foundationTectonicHistoryTiles`, `foundationTectonicProvenanceTiles`, `foundationPlates`.
  - `morphology-features/islands`, `morphology-features/volcanoes` ← `foundationPlates`.
  - `foundationTileToCellIndex` ← only foundation/projection + validation/viz (crosswalk).
- `map-artifacts.ts` imports the 5 tile-space schemas from `foundation/artifacts.ts`
  to define the `mapArtifacts.foundation*` registry. **Downstream consumers
  reference `mapArtifacts.*` (unchanged), so the cross-domain churn is minimal.**
- Studio DAG **auto-derives** from `standardStageContractManifest`
  (`studio-contracts/index.ts`) → updates for free when the manifest changes.

### 4.5 Knobs (the one real cross-stage entanglement)

Knobs are **stage-scoped** (authored at `config.<stageId>.knobs`, reach steps via
`ctx.knobs` in `normalize`). Foundation has two:
- `plateCount` — consumed by **mesh** (`cellCount = plateCount × cellsPerPlate`)
  AND **plate-graph** (plate partition count). These land in **different stages**
  (mantle vs plates) → cross-stage knob. Resolution is a design decision (§6).
- `plateActivity` — consumed by **projection only** → lands cleanly in the
  projection stage.

### 4.6 Phase field

`defineStep({ phase })` = the **domain** name, not the stage id (morphology steps
use `phase: "morphology"` across all 4 stages). So all foundation steps keep
`phase: "foundation"` after the split — no phase change.

---

## 5. Proposed decomposition (5 stages) — to be stress-tested before implementing

One `foundation` **domain** (17 ops) is unchanged. The single `foundation` **recipe
stage** splits into 5, named `foundation-<stage>` per precedent. Each stage is
structurally identical: `index.ts` (createStage), `artifacts.ts`, `validation.ts`,
`viz.ts`, `steps/`.

| # | Stage | Steps | Physical/algorithmic unit | Primary outputs | Knob |
|---|---|---|---|---|---|
| 1 | `foundation-mantle` | mesh, mantle-potential, mantle-forcing | Computational mesh + mantle convection forcing field | `foundation.{mesh,mantlePotential,mantleForcing}` | `plateCount`* |
| 2 | `foundation-plates` | crust(init), plate-graph, plate-motion | Initial lithosphere + plate partition + rigid kinematics | `foundation.{crustInit,plateGraph,plateMotion}` | `plateCount`* |
| 3 | `foundation-tectonics` | tectonics | Plate-boundary dynamics + geological history | `foundation.{tectonicSegments,tectonicHistory,tectonicProvenance,tectonics}` | — |
| 4 | `foundation-crust` | crust-evolution | Crustal evolution (merge: crustInit ⊕ tectonic history) | `foundation.crust` | — |
| 5 | `foundation-projection` | projection, plate-topology | Project mesh truth → Civ7 tile grid (+ plate adjacency) | `map.foundation*`, `foundation.plateTopology` | `plateActivity` |

\* `plateCount` cross-stage knob — resolution pending (§6).

**Downstream dependency after the split:** morphology depends on
`foundation-projection` (the `map.foundation*` outputs). The mesh-space truth
stages (1–4) become independently dependable nodes (e.g. a future consumer of raw
crust truth depends on `foundation-crust`; a plate-kinematics consumer depends on
`foundation-plates`).

### Why this is the right cut (physical grounding)

Maps 1:1 onto the packet's generative layers: mantle (L1–3) → plates (L4–6) →
tectonics history (L7–10) → crust evolution (L11) → tile projection (L12). Each
boundary is a real causal hand-off, and each stage is one coherent earth-science
process. Tectonics and Crust are separate per the user's explicit hints and
because boundary-dynamics (history) and crustal-material-evolution are distinct
concerns coupled only by the history artifact.

---

## 6. Decisions (resolved via the 9-agent design-hardening workflow)

All 4 red-team lenses → **"sound-with-refinements"** (none reject the stage
split). The decomposition stands; refinements below.

1. **Identity safety (decisive).** `ctxRandomLabel` derives from
   `${phase}/${stepId}` and `phase` stays `"foundation"` for every step (it is the
   domain, not the stage). So RNG label sequences are **unchanged** by the split.
   With op order preserved (manifest) and op configs/knob schemas unchanged,
   output is byte-identical. → The split is a safe structural refactor; the
   identity test holds **without** snapshot regeneration (do NOT regenerate
   golden output — two agents wrongly suggested `--update-snapshots`; rejected).
2. **`plateCount` cross-stage knob → duplicate on both stages** (`foundation-mantle`
   for mesh, `foundation-plates` for plate-graph), referencing the shared
   `FoundationPlateCountKnobSchema`. Knob has no default; when omitted both ops
   independently default to 32 (identical) → identity-safe. Configs that set
   `plateCount` set it on **both** blocks. (Single-source "derive from mesh
   artifact" is cleaner but a behavioral touch → deferred follow-on; duplicate is
   the identity-safe choice for this slice.)
3. **`plate-topology` → keep + op-ify** (unanimous). Extract a real
   `foundation/compute-plate-topology` domain op from the inlined
   `buildPlateTopology` (removes the only `ops:{}` loose-code step). Stays
   tile-derived (reads `map.foundationPlates`) to preserve identity; **mesh-native
   (from plateGraph+mesh) → foundation-plates is the flagged follow-on** (packet
   slice `foundation-plate-topology-op` + FOUNDATION.md open question #1).
4. **Crust as its own stage → keep separate** (3/4 lenses; physics dissents,
   preferring merge-into-tectonics). Kept separate: it is the packet's distinct
   "layer 11" material-evolution merge, and separating it surfaces the layer for
   the future material-history contract. `foundation-crust` is the merge node.
5. **Projection / topology grouping → the one open fork for the user.** 3/4 lenses
   favor separating topology from projection (different inputs: projection reads 6
   mesh artifacts → tiles; topology reads 1 tile artifact → adjacency); the
   architecture/packet lens favors keeping them together (topology is
   projection-adjacent, post-projection, no consumer yet). → Present 5-stage
   (topology as projection's 2nd step) vs 6-stage (topology its own stage) and let
   the user pick. Recommendation: **5** (don't mint a stage for a transitional
   tile-derived diagnostic; it folds cleanly into foundation-plates when it goes
   mesh-native).
6. **Artifact-quality audit → 0 bad artifacts; remove none.** 16 artifacts are
   meaningful/usable/atomic → publish all (honors clarification #1). `plateTopology`
   = "repair" (op-ify, decision 3). `tectonicSegments` = meaningful + atomic
   boundary surface, keep (published for diagnostics/tests even though no
   cross-domain consumer). No deletions.
7. **`crustInit` placement → `foundation-plates`** (the initial lithosphere that is
   partitioned). Physics-lens alternative (place in `foundation-mantle` as the
   first material response to forcing) noted; plates chosen for the coherent
   "lithosphere + partition + motion" unit.
8. **File structure → 5–6 self-contained stage dirs; no vestigial hub.** Genuinely
   cross-stage primitives (viz geometry helpers, validation wrappers, the shared
   crust artifact schema) relocate to the domain's `lib/` (their natural owner) so
   each stage dir is structurally uniform and nothing is left "loose" in `stages/`.
   (Cleaner than current morphology/ecology shared hubs, which the normalization
   packet wants dissolved anyway.)

---

## 7. Verification plan

- **Identity (primary):** `shipped-map-identity.test.ts` must stay green —
  byte-identical maps prove behavior preservation.
- **Build/schema gate:** `nx run mod-swooper-maps:build` (tsup compile).
- **Targeted suites:** `test/foundation/**`, `test/pipeline/{artifacts,foundation-gates,foundation-topology-lock,viz-emissions,determinism-suite}.test.ts`, `test/config/{maps-schema-valid,shipped-map-identity,standard-authoring-surface-guards}.test.ts`, `test/standard-recipe.test.ts`, `test/m11-config-knobs-and-presets.test.ts`, morphology consumer tests.
- **Boundaries:** `nx run-many -t boundaries` (Nx) + Grit checks.
- **Studio DAG:** auto-derives from manifest; assert it still builds.
- **In-game (closure):** a live run is the closure test for any mapgen change
  (per workstream skill). For a pure structural refactor with identity preserved,
  in-game parity should follow from identity, but a live smoke run is the honest
  closure gate before "done."

---

## 8. Slice sequence (dominoes → Graphite stack) — draft

1. **Frame + design** (this doc + design doc + decision record). [docs-only]
2. **Plate-topology op** — extract `compute-plate-topology` domain op (no stage
   change yet); identity-preserving. (Unblocks clean projection stage.)
3. **Stage split** — the structural cutover: 5 stages, distribute
   artifacts/validation/viz, update manifest + recipe + map-artifacts + knob
   plumbing; migrate configs/presets; update tests; docs realignment. (The big
   identity-guarded domino — may sub-split if review wants.)
4. **Docs realignment** — FOUNDATION.md + any stage refs to the new 5-stage shape.

(Sequence may be refined after design red-team / blast-radius mapping.)

---

## 9. Assumptions & risks

- **A1:** One foundation domain stays; only the recipe stage splits (precedent:
  morphology/hydrology/ecology). 
- **A2:** Refactor is behavior-preserving; identity test is the guard. If identity
  can't hold for a sub-change, that sub-change is out of scope (a follow-on).
- **A3:** Config split (`foundation` block → per-stage blocks) across 10 configs +
  2 presets + canonical.ts + studio-current is mechanical but must be exact.
- **R1:** Knob plumbing change (plateCount) risks identity drift → mitigate by
  deriving the same value; verify with identity test.
- **R2:** Full step ids change (stage id embedded) → may break tests/Studio
  retention that hardcode `foundation/<step>`; inventory needed (blast radius).
- **R3:** Parallel-lane contention (busy Graphite repo) → stay on own worktree off
  main; never global `gt sync`; `gt sync --no-restack` only if needed.

---

## 10. Evidence log

- Baseline (2026-06-20): worktree `wt-agent-fnd-foundation-stage-split` off
  `main@a061eec65`; `bun install` clean; `nx run mod-swooper-maps:build` → exit 0
  (schema-compile gate green); `bun test` of `shipped-map-identity`,
  `foundation-gates`, `foundation-topology-lock`, `standard-recipe` → **10 pass / 0
  fail / 141 expects**. Proven green starting point established before any change.
- Design hardening (2026-06-20): 9-agent workflow complete (~768k tokens). All 4
  red-team lenses → "sound-with-refinements" (none reject the stage split).
  Decisive identity finding: RNG labels derive from `phase` (stays "foundation"),
  not stage id → split is byte-identity-safe with op order + phase preserved.
  Artifact audit: 16 meaningful/atomic → publish all; 0 bad → remove none;
  plate-topology → op-ify (repair, not remove). Blast radius mapped: manifest +
  recipe + map-artifacts + ~10 configs + 2 presets + inference type-test + tests +
  FOUNDATION.md; downstream morphology consumers need NO change (mapArtifacts.*
  ids unchanged). Conclusions folded into §6 decisions + DESIGN.md. Rejected two
  agents' bad advice to regenerate identity snapshots.
- Design doc written: [DESIGN.md](DESIGN.md). One fork deferred to user: 5 vs 6
  stages (plate-topology as projection step vs own stage).
- Status: **awaiting user confirmation of the shape before implementation.**
