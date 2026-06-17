# Worked Examples — Four Archetypes Through the Loop

> Open when you have a request in hand and want to see how a *similar* one ran end-to-end: which evidence was gathered, what alternatives were weighed, where the change landed (exact mod path), how it was verified, and how it closed. Use these to calibrate scope and proof class — not as recipes to copy literally.

Each archetype is real and recorded under `docs/projects/<project>/`. They are presented as completed history, not active work. Read the project doc for full rationale; this file distills the loop shape. For the loop's canonical 11 steps see `references/orchestration.md`; for the structure vocabulary see `references/pipeline-map.md`.

The four archetypes map onto the request taxonomy:

| # | Archetype | Class | Project doc | Best for learning |
|---|---|---|---|---|
| 1 | Morphology 4-stage split | TECHNICAL | `docs/projects/morphology-4stage-split/` | structural split/recombine; invariant-preserving review |
| 2 | Coasts by erosion / coast projection | BEHAVIORAL | `docs/projects/coasts-by-erosion/` + commit `621658f3c` | physics-grounded model choice; drift-at-boundary fixes |
| 3 | Placement realignment | BEHAVIORAL (complex) | `docs/projects/placement-realignment/` | the most complete loop: ledger + live proof + hotfix |
| 4 | Studio runtime simplification | VISUALIZATION | `docs/projects/studio-runtime-simplification/` | display/runtime, not generation; ownership review |

---

## 1. TECHNICAL — Morphology 4-stage split

**Request shape:** *"Split the morphology stages and recombine them differently."*

**Evidence / diagnostics.** Three parallel analysis agents (recorded under `docs/projects/morphology-4stage-split/agents/`): a blast-radius inventory (22 downstream contract imports, 7 test files consuming morphology artifacts), a Studio/viz-coupling check (does the split move any `dataTypeKey`?), and decision-packet authors. The key finding: artifact ids, op ids, and viz `dataTypeKey`s could all stay stable across the split — so no generated terrain changes.

**Alternatives.** Aliased migration (keep old stage ids as shims) vs hard cutover (delete `morphology-pre/mid/post`, no aliases). Hard cutover was chosen because aliases would have left two names for one boundary — durable confusion for a one-time structural move.

**Where it landed.** `mods/mod-swooper-maps/src/recipes/standard/stages/` — three stages became four: `morphology-coasts`, `morphology-routing`, `morphology-erosion`, `morphology-features`. `morphology-pre/mid/post` deleted. Registration touched `recipes/standard/contract-manifest.ts` (stage order + step manifests) and `recipes/standard/recipe.ts` (`orderStandardStages` map). The residual `stages/morphology/` directory remains as a shared `artifacts.ts` export surface — *not* a stage (see `references/pipeline-map.md` on non-stage dirs). Scaffolds for this kind of move: `assets/recipe-scaffolds.md`.

**Verification — proof class: schema-compile + test. Live game NOT required.** Because no projected terrain changed, the gate was: artifact ids unchanged, op ids unchanged, viz `dataTypeKey` unchanged, publish-once handle locations preserved, the no-water-drift assertion unchanged, and the existing test suite green. There is nothing for the live engine to disagree with when the output bytes are identical.

**Architecture review.** Dominant phase. `civ7-architecture-authority` confirmed boundary compliance (Nx `kind:mod` import rules, Grit `sibling_stage_step_imports`, `recipe_domain_surface`) and that every invariant above held. For a technical split, the review *is* the hard part.

**Finalization.** Bounded and spec-driven → handed off to `civ7-open-spec-workstream`. Implemented at commit `4e696d237` (PR #1044) plus later refinements.

> **Lesson.** A technical split is judged by what *stayed the same*. Pre-declare the invariants (ids, dataTypeKeys, publish locations, drift assertions); the review prosecutes those, and live verification is skippable precisely when you can prove the output bytes did not move.

---

## 2. BEHAVIORAL — Coasts by erosion / coast projection

**Request shape:** *"Coastlines look wrong — make coasts come from the terrain, not from the engine."*

**Evidence / diagnostics.** The original work (`docs/projects/coasts-by-erosion/REPORT.md` + `scratchpad.md`) established that Civ7's `expandCoasts` was overwriting Morphology's shelf truth with an engine heuristic. Grounding: passive vs active continental-margin shelf-width physics (passive margins have wide shelves; active margins narrow) — the Earth anchor for "what a coast should be" (see `references/facet-physics.md`).

**Alternatives.** Four candidate coast models were carried: distance-band, bathymetry-threshold, hybrid, and margin-aware hybrid. **Option D (margin-aware hybrid)** was chosen because it is the one grounded in real shelf physics rather than a tile-distance proxy.

**Where it landed — two layers.**
- *Layer 1 (original):* remove `expandCoasts`; stamp `TERRAIN_COAST` deterministically from Morphology shelf-mask truth at projection time.
- *Layer 2 (commit `621658f3c`, 17 files):* a second-order drift fix. Adapter terrain maintenance in `map-morphology`, `map-rivers`, and `placement` was silently demoting coast→ocean *after* the stamp. The fix treats `artifact:map.morphology.coastClassification.waterClass` as the authoritative surface post-`plotCoasts` and **reapplies it at each adapter-maintenance boundary**. `sourceCoastMask` was exposed as a separate field from the post-policy `waterClass` so shelf/coastal source selection stays diagnosable apart from the final engine terrain. The `coastClassification` artifact carries `baseWaterClass` (pre-policy), `sourceCoastMask` (pre-policy shelf), and `waterClass` (post-policy/authoritative).

**Verification — proof class: test-level + Studio viz.** Regression coverage for the coast-projection contract; Studio visual inspection of the coast surface. Live in-game verification rode along on the broader placement milestone (the coast surface feeds start/resource legality, which *is* live-gated — see archetype 3, expectation E2.4).

**Architecture review.** `civ7-architecture-authority` on the truth-vs-projection boundary: the coast *truth* stays in Morphology; the `map-*` stages only *project* it. The artifact-field split (`sourceCoastMask` vs `waterClass`) keeps the diagnostic surface clean.

**Finalization.** Folded into the placement milestone closure (`civ7-open-spec-workstream`).

> **Lesson.** The bug was not at the stamp — it was the *drift after adapter maintenance*. Behavioral coast/terrain fixes must locate every adapter-maintenance boundary downstream and reassert the authoritative surface there. This is the coupling of the two arms: a behavioral fix (coast realism) required a structural locus (the adapter-maintenance boundaries).

---

## 3. BEHAVIORAL (complex) — Placement realignment

**The most complete end-to-end loop evidence in the repo.** Read `docs/projects/placement-realignment/` in full before any large behavioral request. `resource-distribution-policy` was absorbed into its slices S0–S3 — treat it as a sub-example, not a separate project.

**Request shape:** *"Placement is screwed up."* (Ambiguous — routed through intake; see step 0 in `references/orchestration.md`.)

**Evidence / diagnostics.** 7 parallel evidence agents produced a verdict table on 6 user impressions (each confirmed or refuted with precise shape, in `diagnosis.md`) plus 7 root causes. This is the canonical example of behavioral analysis spawning **both** structural agents (op/artifact ownership, policy-table provenance) and behavioral/diagnostic agents (Earth-realism prosecutors). See `references/facet-verification.md` for the prosecutor-lane pattern.

**Pre-declared expectation ledger (the gate that defines this archetype).** *Before any tuning*, `docs/projects/placement-realignment/expectations.md` declared E1 (player starts), E2 (resources), E3 (resource↔start interaction), E4 (Studio↔live parity) with measures and baseline ranges. The ledger is amended *only with recorded evidence* — e.g. E1.4 fertility target was lowered from 1.3× to a measured-feasible band with a dated amendment and a pointer to `evidence/s4-results-2026-06-10.md`, never silently. Copy this discipline from `assets/earthlike-expectation-ledger.md`. **Pre-declaring expectations is step 5 of the loop and is a hard gate for behavioral work** (`references/facet-verification.md`).

**Alternatives.** Target architecture: an op/artifact model (`plan → select → reconcile`) with thin recipe materializers, vs continuing to tune the existing inline placement logic. The op/artifact model won — it made each placement decision an inspectable artifact.

**Where it landed.** `mods/mod-swooper-maps/src/domain/{placement,resources}` and the `placement` stage. 9 implementation slices S0–S8 plus **S9 live-compat hotfix** — each slice an OpenSpec change + its own Graphite branch, one behavior change per slice, artifacts regenerated in-slice. Restoring the static policy-table generator (`@civ7/map-policy`) was part of the structural work (the behavioral fix needed correct legality tables — arms coupled again).

**Verification — proof class: full live in-game, milestone-scoped.** This is the archetype that proves the gate is load-bearing:
- **Live run 2026-06-11** — Huge 106×66, seed 1337, 10 players (`evidence/milestone-a-2026-06-11.md`).
- **Attempt 1 FAILED** at step 50/53 `placement.place-resources`: `console.warn is not a function` — the Civ7 `MapGeneration` scripting runtime exposes only `console.log`. A MockAdapter-valid map hit a live-only runtime gap.
- **S9 hotfix** replaced `console.warn` call sites with an engine-safe `warnLog`; recovery branch `placement-realignment-s9-live-compat` (integration commit `409f35de5`).
- **Attempt 2 ran 53/53.** Verdicts: E4.4 PASS at 0.9863 mock-vs-live legality agreement; E2.4 PASS (26 marine resources); live full-grid 321/321 deltas classified, 0 unexplained.
- See `assets/live-verification-runbook.md` for the exact gate (`[mapgen-complete]` + `"seed":<N>` markers, `rejectPattern`, the `final-surface-parity` proof flow) and the attempt-1 recovery branch.

**Human follow-ups (left open, honestly).** In-game *visual* QA past the Civ7 age-intro overlay was deferred (`docs/projects/placement-realignment/workstream/closure-checklist.md`), because the overlay + macOS `screencapture` stale-frame behavior block reliable map screenshots. The log-marker + parity gate is the *proof*; the visual pass is a separate, lower-tier follow-up.

**Architecture review.** Per slice, not deferred — `civ7-architecture-authority` on the op/artifact ownership (`plan`/`select`/`reconcile` boundaries) and Grit `placement_outcome_boundary`.

**Finalization.** Corpus-touching (all resource lanes, all start regions) but driven by bounded OpenSpec slices → both closure skills in play: per-slice `civ7-open-spec-workstream`, with the corpus-coverage framing of `civ7-systematic-workstream`. Closure mechanics: per-slice OpenSpec change validated (`bun run openspec validate <id> --strict`) + Graphite branch; `workstream-record.md` with proof gates labeled honestly by class; `closure-checklist.md`; `DEFERRALS.md`.

> **Lesson.** Behavioral closure means: pre-declared ledger → adversarial multi-agent prosecution → sliced implementation → milestone-scoped live verification where attempt-1 failure and a hotfix slice are *normal*. The live engine rejected a locally-valid map; that is exactly why in-game verification is the closure test, not Studio.

---

## 4. VISUALIZATION — Studio runtime simplification

**Request shape:** *"The Studio is fragile / state is everywhere"* — a display/runtime problem, **not** a generation problem.

**The discriminator first.** Before treating this as a generation bug, the team confirmed generation was correct: the raw dump binaries (`diag:dump` / `viz:standard` output) were right, and `FinalSurfaceParityProof.unresolvedLinks` was empty. The defect was that the *client* was compensating for a daemon that did not own its state. The clean separator between "generation wrong" and "view wrong" is `diff-layers.ts` (local-vs-local) + `unresolvedLinks` (local-vs-live) — see `references/facet-verification.md` and the bug-classification table in `references/facet-civ7-domain.md`.

**Evidence / diagnostics.** Daemon state was smeared across 4 localStorage keys, 5 polling loops, a watchdog, and 3 oRPC mounts (`PLAN.md`, `RUNTIME-EFFECT-REFACTOR-FRAME.md`).

**Alternatives.** Add a DB as a level-2 buffer vs make the level-6 server own ephemeral truth and push it. Rejected the DB; chose **"daemon owns ephemeral truth and pushes it; client renders."** 5 decision packets: one oRPC surface, in-memory ops state with TTL, one multiplexed `eventIterator`, hybrid Civ7 interface, sealed error spine.

**Where it landed.** `apps/mapgen-studio/src` (daemon at `src/server/daemon/daemon.ts`, one oRPC mount at `/rpc`, Effect `ManagedRuntime`, `runtimeMode: "studio-daemon-effect-orpc"`). **No `mods/mod-swooper-maps/src` change** — generation logic was untouched. For where display edits live (color scales → `features/viz/presentation.ts`, layer picker → `dataTypeModel.ts`, projection → `deckgl/render.ts`), see the edit-surface map in `references/facet-verification.md`.

**Verification — proof class: display-correctness (operator click-through).** No Earth-like benchmark, no physics facet — the question is "does the view render the right thing," answered by operator interaction. Slices D0–D12 landed on `main` (PR #1748).

**Architecture review.** On *ownership*: who owns ephemeral state (daemon, not client). `civ7-orpc-control-architecture` is the relevant authority for the Studio control surface — referenced only for the visualization class.

**Finalization.** `civ7-open-spec-workstream` (OpenSpec packet train, `OPENSPEC-PACKET-TRAIN.md`). **The D10 live-game watcher proof gap remains open as of 2026-06-16** — do not present live-watcher reconnect/replay as fully proven.

> **Lesson.** The diagnostic skill *is* the work: "generation was right; the view was wrong." Prove it with `diff-layers.ts` + `unresolvedLinks` *first*, then fix in `apps/mapgen-studio/src` and verify by display-correctness. The physics facet is absent; the ownership question dominates review.

---

## 5. The common loop pattern (extracted)

Every archetype above runs the same skeleton (canonical 11-step form in `references/orchestration.md`):

0. **Intake / route** — which arm, which problem class? (`inquiry-design` only if ambiguous — placement was; the split was not.)
1. **Frame** — `framing-design`, a fresh frame per request.
2. **Investigation design** — `investigation-design`, pre-declared stop conditions.
3. **Multi-agent parallel analysis** — always BOTH a blast-radius/structural lane AND a behavioral/diagnostic lane.
4. **Design** with ≥1 *recorded rejected* structural alternative.
5. **Pre-declare expectations before tuning** — the gate. (Behavioral: Earth-like ledger. Technical: invariant list. Visualization: display-correctness criteria.)
6. **Implementation in slices** — one behavior change per slice; OpenSpec change + Graphite branch per slice; regenerate artifacts in-slice.
7. **Architecture review per slice** — not deferred.
8. **In-game verification at milestone boundaries** — expensive, not per-slice; record branch/commit/run/config/timestamps/payloads.
9. **Refinement** — hotfix slices for live-only defects (attempt-1 failures are normal).
10. **Finalization** — hand off to a closure skill; proof gates labeled honestly by class.

---

## 6. How the three request classes differ in practice

The skeleton is shared; what *changes* is the proof class, where the change lands, and which review dominates.

| Dimension | TECHNICAL (split) | BEHAVIORAL (coasts / placement / rivers) | VISUALIZATION (studio) |
|---|---|---|---|
| Investigation focus | blast radius (downstream imports, tests) | Earth-realism + pipeline boundary + Civ-runtime | "generation right, view wrong" discrimination |
| Pre-declared gate (step 5) | invariant list (ids, dataTypeKeys, publish locs) | **Earth-like expectation ledger** (mandatory) | display-correctness criteria |
| Where it lands | `src/recipes/standard/...` (structure) | `src/{domain,recipes}` (generation logic) | `apps/mapgen-studio/src` (display/runtime) |
| Physics facet | absent | central (Facet 1) | absent |
| Live in-game | **not required** if no terrain output changes | **mandatory, milestone-scoped** | not applicable (display-correctness instead) |
| Dominant review | architecture (invariant preservation) | architecture + behavioral both | ownership (who owns state) |
| Loop cost | shorter / cheaper | longest; hotfix slices expected | medium |
| Discriminator tool | test suite + diff assertions | `expectations.md` ledger + live parity | `diff-layers.ts` + `FinalSurfaceParityProof.unresolvedLinks` |

**The arms are always coupled.** A behavioral fix keeps surfacing a structural locus: the coast fix (behavioral) required locating the adapter-maintenance boundaries (technical); placement realignment (behavioral) required restoring the `@civ7/map-policy` table generator and the op/artifact ownership model (technical). Never resolve one arm in isolation — a structural change is judged behaviorally (did realism/quality hold?) and a behavioral change is constrained structurally (does it fit the stage/artifact contract?). See `references/pipeline-map.md` and `references/facet-physics.md` for the two owners these reviews lean on.
