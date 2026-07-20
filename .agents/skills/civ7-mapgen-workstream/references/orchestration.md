# Orchestration — the 11-step loop and the facet-agent team pattern

> Open when running a map-gen request end-to-end: deciding which step you are on, what each step consumes/produces, where the gates are, how to shape the facet-agent team, and where the loop hands off at closure.

This is the operating spec for `civ7-mapgen-workstream`. It expands the loop named in `SKILL.md` and points at owners for each step — it does **not** restate them. The team-shape philosophy is owned by `cognition:team-design`; the closure mechanics are owned by `civ7-open-spec-workstream` / `habitat:systematic-workstream`. This file gives only the thin map-gen-specific recipe and the gates.

## How to read this

- **Steps 0–2** frame the request. Cheap, sequential, mostly cognition skills. (`framing-design`, `inquiry-design`, `investigation-design` are real skills in the local `cognition` plugin; load them if the session has not surfaced them.)
- **Step 3** is where the team spawns. Always ≥2 agents; behavioral work adds prosecutors.
- **Steps 4–9** are the build/verify cycle. Steps 5, 7, and 8 are **gates** — do not pass them on weaker evidence than they demand.
- **Step 10** never re-implements closure. It hands off.

Two gates are load-bearing enough that skipping them violates the hard core: **step 5 (pre-declare Earth-like expectations)** and **step 7 (in-game verification)**. Studio is where you *see*; the live engine is where you *know*.

---

## Step 0 — Intake & route

- **Owner / skill:** `cognition:inquiry-design` — **only if the request is ambiguous.** A clear request ("improve how rivers meander", "split morphology-features") skips straight to step 1. Use inquiry-design when you cannot yet name the arm or the problem class.
- **Input:** the user's request in their own words.
- **Output:** a routed request — which **arm** (technical / behavioral), which **problem class** (generation-logic vs Studio-visualization), and a first guess at which facets and owners are in play. See `SKILL.md` routing table and `references/pipeline-map.md` for the arm/class discriminators.
- **Gate:** none. Routing is a hypothesis, refined by the frame.
- **Discriminator to settle here:** generation-logic vs Studio-viz. The concrete test (do NOT defer it) is `diff-layers.ts` + `FinalSurfaceParityProof.unresolvedLinks` — if the raw binary mapgen output is wrong the bug is generation-side; if the binaries are right but the canvas is wrong it is Studio-side. Owner of that test: `references/facet-verification.md`.

## Step 1 — Frame

- **Owner / skill:** `cognition:framing-design` — frame **this** request, not the meta-workstream. Choose a problem frame ("rivers terminate inland incorrectly") or an objective frame ("rivers should reach the sea like Earth's") per the request's shape.
- **Input:** the routed request from step 0.
- **Output:** a frame for this request — its hard core, its falsifier, what is in/out of scope. Lightweight; one request rarely needs the full standalone framing artifact.
- **Gate:** none, but the frame's falsifier becomes the stop condition the investigation brief inherits.
- **Note:** do not pattern-match to a template. Each request gets its own frame before investigation. This is a discipline the skill teaches the team to perform, not a form to fill.

## Step 2 — Investigation design

- **Owner / skill:** `cognition:investigation-design` — convert the frame into a **rail-neutral** brief: evidence policy, stop conditions, what would falsify the leading hypothesis. Rail-neutral means it does not pre-decide the answer or the implementation.
- **Input:** the frame from step 1.
- **Output:** an investigation brief with pre-declared stop conditions and an evidence ledger shape. For behavioral work, the brief should already anticipate the Earth-like expectation ledger that step 5 will fill (see `assets/earthlike-expectation-ledger.md`).
- **Gate:** none, but the pre-declared stop conditions bind the analysis in step 3 — the team stops when they are met, not when it feels done.

---

## Step 3 — Analysis (the team spawns here)

This is the one loop step with no single existing owner. **Reference `cognition:team-design` for the spawn/coordinate/accountability pattern** — do not author a competing team framework. What follows is only the thin map-gen-specific spawn recipe; defer team philosophy (autonomy boundaries, coordination overhead, prosecutor-lane rationale) to that skill.

- **Input:** the investigation brief from step 2.
- **Output:** an evidence package per facet, reconciled into a shared finding. Each claim carries the strongest evidence actually collected (inherited proof discipline from `civ7-operational-debugging`).
- **Gate:** none, but the analysis must satisfy the step-2 stop conditions before design begins.

### Always spawn BOTH of these (non-negotiable minimum):

1. **Structural / blast-radius agent** — maps the affected stages/steps/ops/strategies/artifacts and the boundaries a change would cross. Grounds in `references/pipeline-map.md` and `references/facet-civ7-domain.md`; consults `civ7-architecture-authority` for ownership/boundary questions. Answers: *what is the blast radius, which contracts move, what artifact dependencies break?*
2. **Behavioral / diagnostic agent** — runs the diagnostics, reads Studio viz, measures against Earth-like references. Grounds in `references/facet-physics.md` (the deep, net-new physics facet) and `references/facet-verification.md`. Answers: *what is the recipe actually producing, and how far is it from the physical/aesthetic/Civ-appropriate target?*

These two map onto the **two arms** — never run only one. The arms are coupled in practice: a coast fix (behavioral) needed the adapter-maintenance structural locus (technical); placement realignment (behavioral) needed restoring the policy-table generator and op/artifact ownership (technical).

### For BEHAVIORAL work, add adversarial PROSECUTOR lanes

When the change touches generated terrain (coasts, placement, rivers, climate, biomes), the team adds adversarial prosecutors — each tries to *break* the leading design from one angle. The map-gen prosecutor roster (from live precedent — coast-projection, placement-realignment):

- **earth-hydrology prosecutor** — "this violates physical realism / water-routing / mass-conservation."
- **pipeline-boundary prosecutor** — "this leaks domain logic into projection, or crosses a Grit-enforced boundary."
- **Civ-runtime prosecutor** — "the live engine rejects this / SIGSEGVs / `console.warn` crashes the step."
- **studio-UX prosecutor** — "this is a display bug masquerading as a generation bug" (or vice-versa).
- **verification-closure prosecutor** — "the proof you have does not actually close the claim at its labeled boundary."

Prosecutor lanes are the behavioral arm's defense against closing on plausible-but-wrong changes. **Reference `cognition:team-design` for how to run a prosecutor/adversarial lane** (charter, independence, when to convene) — do not re-specify it here. Technical-only changes (e.g. a stage split with no terrain-output change) may skip prosecutors; their defense is architecture review (step 8).

Lane heuristic (mapgen-specific; team-shape HOW stays in `cognition:team-design`): coasts/rivers → earth-hydrology + pipeline-boundary lanes; placement/resources → add Civ-runtime + verification-closure lanes; any Studio symptom → add a studio-UX lane.

---

## Step 4 — Design

- **Owner / skill:** `cognition:system-design` (pipeline as a system of loops/flows) + `civ7-architecture-authority` (stage/step/domain placement, boundary law) + the physics facet (`references/facet-physics.md`) for behavioral correctness.
- **Input:** the reconciled analysis from step 3.
- **Output:** a design that names the exact ops/strategies/steps/stages/artifacts to add or change, and respects the truth-vs-projection split (truth stages compute; `map-*` projection stages only project truth artifacts to engine terrain — see `references/pipeline-map.md`).
- **Gate:** none yet — design feeds the alternative-selection gate.

## Step 5 — Alternative selection — PRE-DECLARE Earth-like expectations (GATE)

- **Owner / skill:** `cognition:system-design` (leverage points) for generating alternatives; this skill for the expectation ledger.
- **Input:** the design from step 4.
- **Output (two parts):**
  1. **≥1 structurally different alternative**, recorded with the rationale for the rejection. "Structurally different" means a different stage/op/artifact shape, not a parameter tweak. A design with no recorded rejected alternative has not cleared this step.
  2. For behavioral work, a **pre-declared Earth-like expectation ledger** — the measurable deltas you expect to move, declared **before** you tune anything. Template: `assets/earthlike-expectation-ledger.md`; generic authority: `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; reusable measurements live in Standard metric families, admitted expectations in `MetricTarget`s, and stable Civ7-preset cohorts in `STANDARD_METRIC_STUDIES` under the recipe's `metrics/studies/` bank.
- **GATE:** you may not start tuning until the expectation ledger is declared. Tuning-to-a-screenshot is how behavioral work closes on confirmation bias. The ledger is the falsifiable target; step 7 checks against it. (Technical-only changes with no terrain output still owe the rejected-alternative, but not the metric ledger.)

---

## Step 6 — Implementation (BRANCHES on problem class)

- **Input:** the selected alternative + expectation ledger from step 5.
- **Output:** the code change, sliced. Prefer **one behavior change per slice**; regenerate registration/artifacts in-slice; one OpenSpec change + one Graphite branch per slice (mechanics owned downstream — see step 10).
- **Gate:** none — verification follows.

The class decided at step 0 determines *where* the change lands:

- **(a) Generation-logic** → `mods/mod-swooper-maps/src/{domain,recipes}`. Only engine-substrate changes touch `packages/mapgen-core`. Copy-paste scaffolds for new op/strategy/step/stage/artifact + the three registration points: `assets/recipe-scaffolds.md`. Verified **behaviorally + in-game** (step 7).
- **(b) Studio-visualization** → `apps/mapgen-studio/src` (color/scale → `features/viz/presentation.ts`; missing layer → `dataTypeModel.ts`; projection/hex → `deckgl/render.ts`; defaults/overlay → `useVizState.ts`). The generation output was right; the *view* was wrong. Verified by **display-correctness**, not the live engine; the physics facet is absent for this class. Edit-surface map: `references/facet-verification.md`.

Distinguishing the two early is a core diagnostic skill — re-run the step-0 discriminator (`diff-layers.ts` + `FinalSurfaceParityProof.unresolvedLinks`) if the class is in doubt.

## Step 7 — In-game verification (GATE — the closure test)

- **Owner / skill:** the verification facet (`references/facet-verification.md`), extending `civ7-operational-debugging`'s proof boundaries; runnable gate checklist in `assets/live-verification-runbook.md`.
- **Input:** the deployed change.
- **Output:** a proof labeled by class (built / generated / deployed / logged / in-game / benchmark). For behavioral work: the Earth-like deltas measured against the **step-5 ledger**, plus a live `studio-run-in-game-live` proof and (where surfaces changed) a `final-surface-parity` proof.
- **GATE — this is the closure test.** No request is "done" on Studio/diagnostic evidence alone. Maps that pass `MockAdapter` headless validation can still **SIGSEGV** the live engine; retain the standard deployed recipe write/prep operations and launch through the live verifier's `@civ7/control-orpc` lifecycle. For generation-logic changes the live run is **mandatory and milestone-scoped** (expensive — run at milestone boundaries, not per-slice; record branch/commit/run-id/config/timestamps/payloads).
- **Realistic expectation:** **attempt-1 live failures are normal.** Live-only defects (e.g. `console.warn is not a function` in the `MapGeneration` context; age-intro overlay blocking OS capture; SIGSEGV from missing write/prep) appear *only* in the live engine and are not caught by headless tests. Plan for **hotfix slices** off the live proof — they are part of the loop, not a sign the design failed. (Studio-visualization changes substitute display-correctness proof here; the live engine is not the gate for that class.)

## Step 8 — Architecture review (GATE on boundaries)

- **Owner / skill:** `civ7-architecture-authority` (`references/ownership-boundaries.md`).
- **Input:** the implemented + in-game-verified change.
- **Output:** confirmation that the change respects domain/op/projection boundaries, preserves invariants, and is idiomatic under **Grit and Biome** enforcement (Grit checks: `recipe_domain_surface`, `domain_ops_boundary_imports`, `domain_ops_projection_effects`, `step_contract_domain_surface`, `mapgen_core_runtime_civ7`, and siblings; Biome: formatting/lint law on all recipe/domain source). Run **per slice, not deferred** to the end.
- **GATE:** a change that crosses a boundary (e.g. domain logic leaking into a projection stage, a domain op importing a sibling) fails review even if it verified in-game. For technical-only changes, architecture review *dominates* the loop — invariant preservation is the primary defense in the absence of prosecutor lanes.

## Step 9 — Refinement

- **Owner / skill:** loops back through **steps 4–7** (and 8 per slice).
- **Input:** gaps from step 7 (ledger deltas not met, live failures) or step 8 (boundary violations).
- **Output:** the next slice. Hotfix slices from live-only defects land here.
- **Gate:** none of its own — it re-enters the existing gates. Iterate until the step-5 ledger is met, the step-7 live proof is clean, and step-8 review passes.

---

## Step 10 — Finalization (HAND OFF — never re-implement closure)

The new skill's loop **stops at the boundary of closure** and hands off. It does not re-implement realignment, Graphite commit topology, phase records, or the closure checklist.

- **Hand off to `civ7-open-spec-workstream`** when the change is **bounded and spec-driven** (a defined slice of behavior — most map-gen requests). Closure mechanics it owns: per-slice OpenSpec change + Graphite branch (`bun run openspec validate <id> --strict`); `workstream-record.md` with proof-gates labeled honestly by class; `closure-checklist.md` for remaining human-visual follow-ups; `deferrals.md` for known-but-unscheduled items.
- **Hand off to `habitat:systematic-workstream`** when the work requires **corpus-wide** evidence/coverage (all resource placements, all biomes, the full 12-gate evidence loop).
- **Reference (not own):** `dev:graphite-stack-drain` for branch topology at finalization.

- **Input:** a verified, reviewed change.
- **Output:** a closed workstream record with proof gates labeled by their honest evidence class — including any **retained open proof gap** (e.g. an unverified live-watcher claim) recorded rather than silently dropped.
- **Gate:** owned by the closure skill, not this one. The handoff is the deliverable of step 10.

---

## The loop at a glance

```
0 Intake/route     inquiry-design (if ambiguous)        → arm + problem class
1 Frame            framing-design (this request)        → frame + falsifier
2 Investigation    investigation-design                 → rail-neutral brief, stop conditions
3 Analysis         TEAM: structural + behavioral        → evidence (+ prosecutors if behavioral)
                   (spawn pattern → cognition:team-design)
4 Design           system-design + arch-authority + physics facet
5 Alt selection    ≥1 rejected structural alt           → GATE: pre-declare Earth-like ledger
6 Implementation   (a) src/{domain,recipes}  | (b) apps/mapgen-studio/src
7 In-game verify   verification facet + runbook         → GATE: live proof (attempt-1 fails are normal)
8 Arch review      civ7-architecture-authority          → GATE: Grit/Biome boundaries, per slice
9 Refinement       loop 4–7 (+ hotfix slices)
10 Finalization    HAND OFF → open-spec (bounded) | systematic (corpus-wide)
```

## How the three request classes ride the loop differently — the GATE each leans on

This file's unique cut is *which gate dominates per class*; the full per-dimension matrix (investigation focus, where it lands, physics facet, loop cost, discriminator tool) is owned by `references/worked-examples.md` §6.

| Class | Dominant gate |
|---|---|
| **Technical** (e.g. stage split) | step 8 (architecture review) — invariant preservation is the defense in the absence of prosecutors |
| **Behavioral** (coasts, placement, rivers, climate) | step 7 (in-game) + step-3 prosecutor lanes, against the **step-5 Earth-like ledger** |
| **Visualization** (Studio) | step 8 (state-ownership), with display-correctness substituting for the step-7 live gate |

The arms are always coupled: never close a behavioral change without confirming its structural locus, and never close a structural change without confirming behavior held.

## Pointers (owners — do not duplicate)

- Team shape / spawn / prosecutor lanes → `cognition:team-design`
- Frame / investigation / system design → `cognition:framing-design`, `cognition:investigation-design`, `cognition:inquiry-design`, `cognition:system-design`
- Pipeline structure (stages/ops/artifacts/boundaries) → `references/pipeline-map.md`
- Physics correctness + Earth anchors → `references/facet-physics.md`
- Verification + display/generation discriminator → `references/facet-verification.md`
- Civ7 data/research/intent → `references/facet-civ7-domain.md`
- Worked archetype loops → `references/worked-examples.md`
- Expectation ledger / live runbook / scaffolds → `assets/earthlike-expectation-ledger.md`, `assets/live-verification-runbook.md`, `assets/recipe-scaffolds.md`
- Boundaries, Grit/Biome → `civ7-architecture-authority`
- Proof discipline → `civ7-operational-debugging`
- Closure → `civ7-open-spec-workstream`, `habitat:systematic-workstream`
