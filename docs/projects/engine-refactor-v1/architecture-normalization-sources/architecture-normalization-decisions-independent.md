# Source Material Notice

This document is preserved for provenance only. The active normalization
authority is `../architecture-normalization-packet.md`.

# MapGen Architecture Normalization — Decision Resolutions (independent pass)

Status: `source-material-only`.
Date: `2026-05-29`.
Branch: `codex/mapgen-architecture-normalization-review`.

This document resolves the open decisions **D1–D5 (+0e)** left in
`../architecture-normalization-packet.md` (§5 Slice 0a, §5.0e). It is a **sibling decision
artifact**, deliberately kept separate so these resolutions can be reviewed alongside the
parallel Codex decisions **before** anything is written back into the packet. **The packet is
unchanged.**

## Method

Resolved via a team-of-agents, adversarial workflow:

1. **Foundational research (parallel):** a Civ 7-only reference investigation (repo-vendored
   scripts + official sources), an authoring-SDK/ORPC wiring grounding (read from code, not
   docs), and a git-history/ADR evidence miner.
2. **Position synthesis:** a phase/stage/step definition derived from the wiring grounding,
   then a candidate resolution + strongest alternative for each decision.
3. **Adversarial red team (parallel):** three reviewers tried to break each position, steelmanned
   the strongest alternative, and re-verified every claim against code/commits/ADRs. Three
   positions changed as a result (D1, D3, D5).
4. **Sign-off:** decisions ratified by the project owner (D1 flat; D2/D4/D5/0e accepted;
   **D3 ratified as contract split**, overriding the adversarial internal-refactor recommendation —
   see D3 below, where the dissent is preserved as an implementation caveat).

Evidence is cited as `file:line`, commit hash, or ADR id throughout.

---

## 0. The driver — phase / stage / step (sanity-checked against Civ 7)

Read from the actual code (`packages/mapgen-core/src/authoring/recipe.ts`,
`.../authoring/stage.ts`, `.../execution/PipelineExecutor.ts`), not from docs:

- **Step** — the atomic unit and the **only real contract boundary**. Owns config `schema`,
  `requires`/`provides` tags, `artifacts`, `ops`, `run`/`normalize`, and a `phase` label. Steps are
  flattened into one ordered list at recipe time (`recipe.ts` finalizeOccurrences ~199-243).
- **Stage** — a **config-surface + knobs-scope + compile container**. It buys **zero runtime
  wiring**. `createRecipe` flattens every stage into a single flat ordered step list; execution
  order = recipe-array order (no topological sort, `PipelineExecutor.ts:107-138`); `requires`/
  `provides` is a *gate* that throws if unsatisfied (`:110-122`), not an ordering input; artifacts
  are write-once **global** (single-provider enforced recipe-wide, `recipe.ts:143-197`). The stage
  id survives only as a string prefix in the full step id and as a config-lookup key. The **only**
  thing co-stage steps share that cross-stage steps don't is the stage's **`knobs` object**,
  resolved once in `stage.ts toInternal` (~140-156) and passed to every step's `normalize` — a
  config-normalization concern, never runtime data flow.
- **Recipe** — the single source of global stage+step ordering and enablement (membership in the
  array) plus the global tag/artifact namespace.
- **Phase** — already a per-step `GenerationPhase` field in code; an orthogonal coarse grouping
  used for trace metadata. **Not** a structural container.

### The decision rule (load-bearing)

> **Split a phase into multiple stages only when each stage needs a distinct authoring/config
> surface or knobs scope. That is the only thing a stage buys. Wiring (order, requires/provides,
> artifacts) is identical whether steps are co-staged or split.**

This sharpens the original framing: stages provide **no** "unique wiring/connection" — so the
split criterion is purely about config surface / knobs ownership, not about connection mechanics.

### Civ 7 corroboration (Civ 7 only; no Civ 6)

- Civ 7 has **no first-class phase object**. One `generateMap()` driver
  (`.civ7/outputs/resources/Base/modules/base-standard/maps/continents.js:25-196`) calls a flat,
  ordered list of discrete steps; files are the only coarse grouping. "Phase" in our model is an
  added label, matching the per-step `phase` field — not a Civ 7 concept.
- Civ 7 **interleaves** our conceptual phases: lakes (hydrology) runs inside the morphology block
  (`continents.js:150`, before `buildElevation` `:152`); biomes (`:158`) and features (`:162`) are
  non-adjacent, separated by natural wonders + floodplains. So phases are labels over a
  dependency-ordered step list, not hard barriers — consistent with the recipe's flat-list model.
- Civ 7's `addFeatures` is itself a mini-pipeline (positional → scatter → ice → aquatic,
  `feature-biome-generator.js:72-77`), arguing for surfacing ecology sub-concerns as separately
  ordered units (relevant to D5).

---

## D1 — Schema surface → **FLAT passthrough (no SDK affordance).** *(overturns packet)*

**Decision.** Do **not** add an SDK affordance to synthesize a nested `{ knobs?, advanced? }`
surface. **Shape A already synthesizes a flat `{ knobs?, [stepId]?: stepConfig }` surface with
zero boilerplate** (`stage.ts:55-63,147-155`); `foundation` is the live proof. Delete the five
hand-rolled `public`+`compile` blocks
(`morphology-{coasts,routing,erosion,features}/index.ts`, `map-hydrology/index.ts`) and let those
stages fall back to the existing flat passthrough. A hand-written `compile` remains the **exception**
for genuine transforms (e.g. `map-morphology`'s key-renaming).

**Why (first principles + DX rule).** The user's rule is "if the SDK can hide it cleanly, hide it."
Shape A already hides it — flatly. The flat shape already separates semantics: `knobs` is its own
top-level key; per-step overrides are sibling keys ("knobs = curated dials, everything else = raw
step config"). The `advanced` nesting is **decorative**, and synthesizing it would add a second
auto-surface shape to maintain purely to preserve a cosmetic key.

**Steelman (nested `advanced`, the packet's call).** `advanced` is a clearer "expert overrides live
here" namespace and matches the documented knobs/advanced mental model
(`how-to/tune-realism-knobs.md`); it also pre-empts collisions with future top-level `public`
fields. **Why it loses:** the only real risk (a top-level `public` field colliding with a step id)
is already handled by `additionalProperties:false` + `RESERVED_STAGE_KEY` checks
(`stage.ts:34-48,119`) and by the Shape A→B graduation boundary — a stage that grows genuine
top-level fields becomes Shape B anyway (where `map-morphology`'s real transform lives). The
nesting earns nothing the flat shape doesn't already provide.

**Evidence.** The unwrap-`compile` idiom was **born as boilerplate**, never a decayed transform:
introduced already-ceremonial in `73ff249f1`/`ec48ed0e7` (#1043); the only later change was
cosmetic (`882adfa68` rewrote `?? {}` to `config.advanced ? config.advanced : {}`).

**Required follow-through.** This is a **public config-surface change** — overrides move from
`advanced.{stepId}` to top-level `{stepId}`. It needs a coordinated migration of Studio config,
presets/configs, default-config tests, and docs, plus an update to **ADR-ER1-032**
(proposed/at_risk) which governs the recipe-config authoring surface and mandates explicit
per-step config (the flat surface satisfies this — it is per-step-occurrence config, no global
overrides). Guardrail **G9** (ban the hand-written unwrap-`compile`) still applies.

**Net vs packet:** removes Slice 2c's SDK affordance work; keeps the boilerplate deletion + G9.

---

## D2 — Lakes → **Hydrology TRUTH, adapter capability sequenced first.** *(accepted; sequencing sharpened)*

**Decision.** Ratify lakes as Hydrology truth: implement `plan-lakes` (give the stub
`index.ts`/`types.ts`/`strategies/`) and project an explicit lake mask in `map-hydrology`. **Bind
the sequencing:** (1) land an adapter `stampLakeMask(...)` capability **first**; (2) migrate the
projection to stamp the planned mask and deprecate `adapter.generateLakes(...)` as truth; (3) **only
then** add a fail-hard parity gate, and only as an **identity check against the stamped mask** —
**never** against `sinkMask`.

**Why this is feasible (Civ 7).** Civ 7's own `generateLakes()` stamps lakes per-tile via
`TerrainBuilder.setTerrainType` and seeds purely from `getRandomNumber`, consuming **no** intent
mask (`elevation-terrain-generator.js:98-125`). So the engine does **not** own lake *intent* — it
owns a random projection. A `stampLakeMask` capability is a thin wrapper over an API the base game
already uses; it is not scope creep.

**Steelman (keep engine-projected, labeled limitation — the current reverted-to state).** It's
green and DEF-020 documents it honestly. **Why it loses:** lakes presently have **no upstream
truth at all** (`plan-lakes` is a contract-only stub), and Civ 7 proves "the engine owns lakes" is
false — the truth-vs-projection violation has no excuse.

**Revert trap (must avoid).** Fail-hard lakes were built (`7be523270`) and reverted to telemetry
within ~24h (`e380a191b`) because the adapter exposed only `generateLakes(...)`, not explicit
stamping. Today `lakes.ts:73` still calls `generateLakes(...)` as truth; `sinkMask` is a candidate-
sink **drainage diagnostic** demoted to telemetry (`lakes.ts:122-124`) — gating against it
reproduces the revert exactly.

**Flag for the packet.** **DEF-020** ("Discharge-Driven Hydrography Stamping",
`deferrals.md:~55`) covers **rivers AND lakes jointly**. Split it into lakes/rivers sub-deferrals
before scoping Slice 4a, or it either under-delivers (lakes only) or balloons (rivers too).

---

## D3 — Placement → **SPLIT into contract-bounded sub-steps.** *(ratified by owner; adversarial dissent preserved)*

**Decision (owner call).** Split the ~1115-line `apply.ts` into contract-bounded sub-steps, as in
the packet's D3: promote each `runPlacementStep(...)` block to a sub-step with explicit
artifact/effect tags. **Multi-PR**, one boundary at a time, each independently green (the sub-ops
share mutable engine state in sequence). Prerequisite framing for D4 and guardrail G8 retained.

**Adversarial dissent (recorded for the implementer — do not lose this).** A full 1115-line read
argued *against* a naive split and it should shape *how* the split is done:
- The `runPlacementStep` harness (`apply.ts:69-81`) is **cosmetic** today — a try/catch + trace
  wrapper with **no** `requires`/`provides`, no artifact, no schema. It is step-framing, not a
  contract boundary.
- The 11 sub-ops (wonders, floodplains, terrain.validate, areas.recalculate, water.store,
  landmassRegion.restamp, resources, starts, discoveries, fertility.recalculate,
  advancedStart.assign) mutate **shared engine state** in a strict linear chain with **no
  intermediate artifacts** between them (only end-of-run publishes at `:288,313,350`). A boundary
  drawn here risks manufacturing fake `requires: previous.provides` contracts that merely re-encode
  array order.
- The **genuine** contract seam already exists at **plan → apply**: the planning ops are already
  contracted and `apply` consumes their typed outputs
  (`apply.ts:34-39`, `Static<typeof placement.ops.planX["output"]>`). `apply` behaves like a
  **projection step** (cf. `map-hydrology`/`map-ecology`).

**Implementation guardrails implied by the dissent (so the split is real, not ceremony):**
1. Each promoted sub-step must carry a **genuine artifact/effect contract** (a distinct
   `provides` a later step actually consumes, or a distinct engine-effect tag), not a synthetic
   `requires: previous.provides` chain.
2. Leverage the existing plan/apply seam: keep planning ops as the truth contracts; the projection
   sub-steps stamp them. Don't re-plan inside the split.
3. Reframe **G8** to fire on **uncontracted hidden** sub-concerns (LOC/sub-op heuristic *plus*
   "no declared contract boundary"), so a well-contracted multi-step placement passes and a relapse
   into an uncontracted god-step fails.

**Evidence.** `wc -l apply.ts` = 1115 (confirmed). Wonders already fail-hard on
`placedCount !== plannedCount || rejectedCount > 0` (`apply.ts:432-435`) because
`adapter.stampNaturalWonder` is a per-tile boolean primitive (`:421-429`). No prior split attempt
exists in git history.

---

## D4 — Resources/discoveries → **Plan-authoritative INTENT with typed reconciliation.** *(accepted)*

**Decision.** The plan is authority for **intent**; the projection **reconciles** plan vs
engine-feasible placement and fails hard **only on unexplained drift** (placed-but-unplanned, or
planned-dropped with no feasibility reason), while **allowing** engine-feasibility rejections that
are explicitly accounted for. **Not** a naive `placed===planned` gate.

**Why not naive equality (the wonders pattern).** Wonders fail-hard works because
`stampNaturalWonder` is a **per-tile boolean primitive** — feasibility is pre-resolved, so a
rejection is genuinely exceptional (`apply.ts:421-435`). Resources/discoveries instead call
**count-returning aggregate generators** that own feasibility internally
(`ResourceBuilder.canHaveResource`/`setResourceType`, `resource-generator.js:116,184,192,199`;
`generateOfficialDiscoveries`, `apply.ts:498`). There is **no per-tile feasibility signal** to
reconcile against, so naive equality fail-hards on *correct* engine behavior — exactly what got
reverted (`61a17a46f` → `78e8e4aef`; #1348 `7c903cd89` is the weakened finite/≥0 survivor at
`apply.ts:504-508`).

**Steelman (abandon determinism; plans become pure diagnostics).** Honest about current adapter
limits and already green. **Why it loses:** reproducibility is the SDK's reason to exist;
surrendering deterministic placement intent for resources/discoveries is a category error, not a
tradeoff. Typed reconciliation is the **minimum honest** design given the aggregate-generator
constraint — anything simpler is either a lie (naive equality) or surrender (pure diagnostics).

**Required sequencing.** (1) The plan/apply contract seam already exists (D3 split formalizes the
projection boundaries; no *additional* seam needed for reconciliation). (2) Add an adapter
capability that yields **per-tile placement + rejection reason** (mirroring the wonder
boolean-return shape) — **must land before any gate**. (3) **Supersede ADR-ER1-020** honestly (its
accepted "best-effort placeholders / avoid new adapter read surfaces" stance, lines 33-34, directly
blocks reconciliation). (4) Then gate on unexplained drift only. (5) Until (2), label official-
generator output as projection diagnostics, not silent truth.

---

## D5 — Ecology → **Keep the 7 split stages; rule = one stage per plausible knob owner; fix the split-brain.** *(refined)*

**Decision.** Keep the recipe's seven split ecology stages (`ecology-pedology`, `-biomes`,
`-features-score`, `-ice`, `-reefs`, `-wetlands`, `-vegetation`). Do **not** collapse to one
mega-stage. **Fix the split-brain:** `ecology-pedology` and `ecology-biomes` re-export their steps
from the sibling `../ecology/steps/index.js` hub (`ecology-pedology/index.ts:7`,
`ecology-biomes/index.ts:2`) while the others import local `./steps/`; move those step folders under
their own stage dirs so all seven are self-contained (Slice 3c). Dissolve the bare `stages/ecology/`
hub into a stage-neutral shared module.

**The rule (corrected from my first draft).** I initially proposed "demote any stage with no
genuine surface to a step." Adversarial review falsified the premise: **all 7 ecology stages have
empty `knobs` and all 8 underlying step contracts have empty `schema`** today — the ecology phase
has *zero* tunable surface. "Earn a surface *now*" would demote all seven → collapse → revert.
Replace it with:

> **One stage per coherent ecology concern that is a plausible future knob owner.** Ice extent,
> reef frequency, wetland prevalence, vegetation density, biome assignment, pedology, feature
> scoring are each distinct tunables a future author would set independently — so each earns a
> stage as the namespace its knob will attach to.

**Why not collapse (steelman).** Collapsing the thin wrappers into 2–3 stages reverts `#1221`/`#1223`
(the deliberate mega-stage→split, with the legacy `ecology` stage deleted in `6471a7f7a`) and erases
the per-concern namespaces knobs will attach to — churn now to re-promote later. Civ 7 also splits
biomes from features and treats features as a mini-pipeline, supporting per-concern decomposition.

**Doc realignment.** `reference/STANDARD-RECIPE.md` and `ECOLOGY.md` still describe a single
`ecology` stage — stale doc gravity to fix (Slice 0d) before file moves target standalone stages.

---

## 0e — `@mapgen/*` import guardrail → **Keep G4; ship it narrowly after a SMALL remediation.** *(accepted)*

**Decision.** Do not drop G4 and do not ship a broad `@mapgen/*` ban. Sanction the three documented
surfaces (`@mapgen/domain/<domain>`, `/ops`, `/config`); forbid deep reach-ins **from
`src/recipes/**` only**; exempt a domain importing its own internals. Turn G4 on immediately after a
single knobs-surface remediation slice.

**Sizing (real counts).** `@mapgen/*` is **intra-mod** (`mods/mod-swooper-maps/tsconfig.json:6-8`
maps it to `src/domain/*`), so G4 polices recipe→own-domain reach-ins, not cross-package. The
genuine cross-boundary debt is **35 occurrences / 7 distinct specifiers**, tightly clustered:

| Specifier | ~count |
|---|---|
| `@mapgen/domain/morphology/shared/knobs.js` | 9 |
| `@mapgen/domain/hydrology/shared/knobs.js` | 9 |
| `@mapgen/domain/morphology/shared/knob-multipliers.js` | 5 |
| `@mapgen/domain/hydrology/shared/knob-multipliers.js` | 5 |
| `@mapgen/domain/foundation/shared/knobs.js` | 4 |
| `@mapgen/domain/foundation/shared/knob-multipliers.js` | 1 |
| `@mapgen/domain/ecology/types.js` | 2 |

The 89 deep imports under `src/domain/` are **intra-domain cohesion** (exempt); `narrative`'s 72
occurrences are a **missing-public-surface** observation (it has zero sanctioned entrypoint),
separate from recipe debt.

**Remediation (one focused slice).** Add a sanctioned re-export of `knobs`/`knob-multipliers` from
each of foundation/morphology/hydrology's public surface (31 of 35 occurrences), repoint ~16 recipe
files, and route `ecology/types.js` (×2) through `@mapgen/domain/ecology`. Then G4 turns on.

---

## Cross-cutting insight (the most important sequencing constraint)

**D2 and D4 are the same failure mode twice.** Both implemented pipeline-truth + a fail-hard drift
check, the engine/official generator couldn't honor `planned`, and the gate was reverted to
telemetry/diagnostic within ~24h (D2: `7be523270`→`e380a191b`; D4: `61a17a46f`→`78e8e4aef`). Both
are blocked on the **same missing adapter capability** — the adapter has writes but no authoritative
read-back / explicit stamping (DEF-020 for lakes; ADR-ER1-020 + DEF-017 for placement).

> **Hard rule for Slices 4a/4c: no fail-hard gate may land before its adapter capability does.**
> Lakes need `stampLakeMask`; resources/discoveries need per-tile placement-with-reason. Add the
> capability, migrate the projection, *then* gate. Skipping this reproduces the revert.

---

## Delta vs. the current packet (for the joint review)

| Decision | Packet's current call | This pass's resolution | Status |
|---|---|---|---|
| **D1** | SDK synthesizes nested `advanced`; add affordance (Slice 2c) | **Flat passthrough; no SDK affordance**; delete boilerplate; migrate config surface | **Overturns** (owner: flat) |
| **D2** | Lakes = truth; add stamping or label limitation | Same, with **adapter-first sequencing** + split DEF-020 lakes/rivers | Accepted, sharpened |
| **D3** | Split = mandatory, multi-PR | **Split ratified by owner**; adversarial dissent recorded as implementation caveats (real contracts only; leverage plan/apply seam; reframe G8) | Accepted with caveats |
| **D4** | Assert `placed===planned` or stronger typed evidence | **Typed reconciliation** (unexplained-drift only); adapter-first; supersede ADR-ER1-020 | Accepted, sharpened |
| **D5** | Ratify split; give each stage a genuine surface | Keep 7 stages; rule = **plausible knob owner** (phase has no surfaces yet); fix split-brain | Refined |
| **0e** | Narrow deep-import policy; G4 PENDING | **Keep G4**, ship narrowly after a **small** (35-occ/7-specifier) knobs-surface slice | Accepted, sized |

**Packet status:** unchanged, pending joint review of these resolutions alongside the Codex
decisions. On approval, fold into `../architecture-normalization-packet.md` §2/§5/§6/§7/§8 and the
Slice 0a decision list.
