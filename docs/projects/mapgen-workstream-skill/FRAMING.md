# Companion Frame — Map-Generation Workstream Skill

> **Normative grounding artifact.** This document is the durable, source-of-truth frame for the workstream that designs and authors a repo-local skill enabling a future agent team to take a map-generation request end-to-end — autonomously — from investigation through in-game verification to finalization. It is produced by `cognition:framing-design` (objective-framing, standalone durability) and doubles as the recorded goal per `create-goal`'s fallback mechanism. It is a *living artifact*: revise it when the falsifier or degeneration trigger below fires; do not silently overwrite it.
>
> Built by: orienting agent (Phase 0) · For: the map-gen workstream skill effort · Mode: co-framing · Object-path: objective · Durability: standalone
> Status: **REVIEWED — frame approved by user with two corrections integrated (recipe/domain logic lives in `mods/mod-swooper-maps/`; `mapgen:*` cache skills are philosophy-reference-only). Phase 1 deep discovery workflow launching.**

---

## Active Goal (controlling scope — `create-goal` form, ≤4000 chars)

Build a comprehensive, **repo-local** skill (working name `civ7-mapgen-workstream`, to be confirmed) that lets the user issue a single map-generation request in their own words — e.g. *"investigate why discoveries aren't being placed," "improve how rivers are generated," "split this stage and recombine it differently"* — reference the skill, and have a future **agent team autonomously**: pick up the right domain + harness context, structure the investigation, design the workstream, select among alternatives, implement, **verify in-game**, pass architecture review, refine, and finalize — without the user re-explaining the system each time.

The skill must be **constrained, bounded, and progressively disclosing**: a minimal navigable top level; depth in referenced sub-documents / facets. It must **reference, not duplicate**, existing skills — the cognition design skills (`framing-design`, `investigation-design`, `inquiry-design`, `system-design`, `create-goal`, and adjacent), the `mapgen:*` domain stage skills, and the repo-local `civ7-*` operating skills. It must describe the **harness**: the live Civ 7 game, the diagnostics suite, the Earth-like benchmark-driven development process, Mapjet Studio (branch `latest-juicy-config`, migrated to Effect), and the SDK with its data-flow rules and architecture docs. It must contain dedicated **facet documents** (role references) for at least: (1) an Earth-science / physics agent (climate, ocean, tectonics → physical realism); (2) an operational debugging / verification agent (diagnostics, Studio viz, benchmarks, live screenshots); (3) a Civ 7 domain agent (resource CLI sync, XML/game-data parsing, forums/web, game-design intent). It must describe the **workstream loop**: multiple agents (one per facet) coordinated through analysis → design → alternative selection → implementation → in-game verification → architecture review → refinement → finalization. It must cover **both arms** of the work: *technical pipeline engineering* (structure/stages/operations of a specific recipe) and *behavioral pipeline engineering* (physically grounded, beautiful, civilization-appropriate maps); and **both problem classes**: domain-logic changes to a recipe, and visualization issues in the Studio (display/diagnostic vs. generation logic).

**Hard constraints.** Do **not** conflate SDK/engine architecture with recipe domain logic — the skill is about the latter. **Recipe/domain logic is authored in the mod: `mods/mod-swooper-maps/src/{domain,recipes,maps}`** (the Swooper physics map mod). `@swooper/mapgen-core` (`packages/mapgen-core`) is the **engine/core substrate** the mod builds on, and SDK architecture authority is owned by `civ7-architecture-authority` — both *referenced*, not redefined. The companion framing document (this file) stays in the repo as a reference artifact, separate from the skill. Phase order is **0 → 1 → 2** with review gates; arrive at a reviewed Phase-1 answer before composing in Phase 2. Preserve the user's uncertainty markers ("I think," "I have in mind," "currently"). If scope feels larger or different than described, **pause and surface it** before going deep.

**Success boundary.** A future agent team, handed only one of the example requests plus this skill, reaches a finalized, in-game-verified outcome without re-asking the user to explain the pipeline or harness, and without duplicating logic already owned by referenced skills.

---

## WHAT (the situation as framed)

This frame treats the **unit of analysis** as a *future autonomous agent team responding to a map-generation request*, not as a document or a one-time build task. The thing being constructed is the **standing capability** that makes such a team competent: a repo-local skill that is simultaneously (a) a **router** into the map-gen domain, (b) an **orchestration spec** for a multi-agent loop, and (c) a **facet library** of role references that ground the team's reasoning.

The frame makes **signal** out of: the *recipe domain logic* (recipes, operations, algorithms, strategies, stages, and how they compose — authored in `mods/mod-swooper-maps/src/{domain,recipes,maps}`, building on the `@swooper/mapgen-core` engine); the *harness* the team operates within (live Civ 7, diagnostics, Earth-like benchmark process, Mapjet Studio, SDK data-flow/architecture docs); the *full closure loop* with **in-game verification as the non-negotiable closure test**; the *two arms* (technical / behavioral); and the *composition graph* connecting the new skill to skills that already exist. It holds **exterior**: the SDK's internal architecture, deep archaeology of the 126-branch Habitat stack, general (non-map-gen) Civ 7 modding, and transient project/migration status. A reader finishing this paragraph should know what the skill must *select in* and *route to* — and what it must deliberately leave to other owners.

The decisive structural commitment: this is a **composition / orchestration layer over a rich existing skill ecosystem**, not a greenfield monolith. The repo already contains operating skills (`civ7-operational-debugging`, `civ7-architecture-authority`, `civ7-product-authority`, `civ7-systematic-workstream`, `civ7-open-spec-workstream`, `civ7-orpc-control-architecture`), domain stage skills (`mapgen:foundation|morphology|hydrology|ecology|placement|narrative|config-tuning`), and the cognition design skills. The new skill's primary work is to **wire these into a loop and add what is genuinely missing** — chiefly the Earth-science/physics reasoning facet and the map-gen-specific orchestration.

**Skill currency rule (load-bearing — user-directed).** The composed skills are *not* all equally trustworthy on architecture/code:
- **`mapgen:*` cache plugin skills are architecturally outdated.** They describe an older structure (e.g. `mapgen:foundation` points at `packages/mapgen-core/src/foundation/plates.ts`, predating the current mod-authored `src/domain` + op-per-concern architecture). Use them **for prior thinking / domain philosophy only** — never as authoritative arch, code, file paths, or config schemas. Re-derive all structural and code claims from the live mod source and current `docs/system/` docs.
- **Cognition design skills carry no arch/code burden** — they are method/philosophy and may be leaned on directly.
- **`civ7-*` repo-local skills are current** (version-controlled here) and may be leaned on, but the Phase-1 team must still verify any specific code/path claims against the live `mods/mod-swooper-maps/` tree (the mods correction below supersedes some older assumptions).

The rule generalizes: **lean on a skill where it carries no arch/code burden (philosophy, discipline, reasoning); re-verify against live source wherever it makes an architecture or code claim.**

---

## WHY (rationale and structural alternatives considered)

**Why an objective frame (backward from an imagined future), not a problem frame.** The user's own words are intent: *"I want … a skill that allows me to come to a future agent team and say …"* The destination — a team that picks up context and runs the loop autonomously — is the fixed point; the present gaps are its negative image. Framing this as a problem ("future agents lack map-gen context") was the **structural alternative considered**; it was rejected because it would route to problem-framing and yield an investigation-shaped artifact, when the deliverable is a *constructed standing capability*. (The problem view is not discarded — it re-enters as the Phase-1 investigation seed, downstream of this objective frame.)

**Why composition over monolith (the load-bearing WHY).** A second structural alternative — author one self-contained playbook that re-states the domain, the harness, and the verification discipline inline — was rejected on contact with the repo. Re-stating `civ7-operational-debugging`'s proof-boundary discipline, `civ7-architecture-authority`'s stage/boundary rules, or the `mapgen:*` stage references inline would (a) violate the user's explicit *reference-not-duplicate* constraint, (b) drift out of sync the moment those skills evolve (the Studio is mid-Effect-migration; the stack is 126 branches deep), and (c) bloat the top level, breaking progressive disclosure. The composition frame makes the skill *durable under change* because it points at owners instead of copying them. This is why the skill is small at the top and deep only in the one place depth is genuinely new (the facets, especially physics).

**What is at stake if the frame degenerates.** If the skill becomes a content dump (duplicating owned logic) it rots and misleads; if it omits the orchestration loop it becomes just another reference and the team still needs the user to drive; if it omits in-game verification it will close on plausible-but-wrong map changes (the engine SIGSEGVs on MockAdapter-valid maps — verification is not optional here).

---

## Scope & Provenance

**In scope (this frame governs):**
- The design and authoring of the repo-local map-gen workstream skill and its facet documents.
- The description of the harness and the multi-agent loop shape.
- The reference graph: which existing skills the new skill composes and how.
- The Phase-0 → Phase-1 → Phase-2 sequencing and its review gates.

**Out of scope (deliberately not governed here — see Exterior):**
- The internal architecture of the SDK (`packages/sdk/`) — owned by `civ7-architecture-authority`; referenced, not redefined.
- Authoring or revising the cognition design skills themselves — they are upstream dependencies, consumed as-is.
- A deep dive of the 126-branch Habitat stack — only architectural-pattern awareness (Grit/Biome-enforced) is in scope.
- Project status, migration notes, and per-request workstream state — those live in `docs/projects/<project>/...`, not in the skill.

**Source pointers (where load-bearing commitments came from):**
- User directive (this session) — full multi-phase brief; the source of the goal text above.
- `cognition:framing-design` (SKILL + foundations + pipeline + objective-framing walkthrough + standalone template) — the method.
- `cognition:investigation-design`, `inquiry-design`, `system-design` (SKILLs) — the downstream chain.
- `create-goal` (`magic-apply/.../.agents/skills/create-goal/SKILL.md`) — the goal-attachment wrapper.
- Repo: `.agents/skills/README.md` and `.agents/skills/civ7-*/SKILL.md` — repo-local skill conventions + existing operating skills.
- Repo: `docs/projects/` listing (pipeline-realism, river-lake-recovery, morphology-4stage-split, placement-realignment, resource-distribution-policy, mapgen-studio, …) — the real archetypes the example requests map to.
- Plugin: `mapgen:foundation` SKILL (and siblings) — domain *philosophy* reference shape only; its arch claims (e.g. `packages/mapgen-core/src/foundation/plates.ts`) are **outdated** per user correction.
- **Live mod source `mods/mod-swooper-maps/AGENTS.md` + `src/{domain,recipes,maps,dev}`** — authoritative recipe/domain logic location (op-per-concern domain, recipes, map configs, local diagnostics/viz). User correction: this is where the recipe/domain logic is authored.
- Canonical docs (per mod AGENTS.md): `docs/system/libs/mapgen/MAPGEN.md` (engine arch/config), `docs/system/mods/swooper-maps/` (mod arch & presets), `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` (normalization baseline), `docs/system/TESTING.md`.
- **User corrections (this session):** recipe/domain logic lives in `mods/`; cache `mapgen:*` skills are architecturally outdated (philosophy reference only); lean on skills only where they carry no arch/code burden.
- Root `AGENTS.md`, `civ.config.jsonc`, `packages/`, `apps/`, `tools/` — repo geography (light grounding only; deep mapping is Phase 1's job).

---

## Selection Commitments

**In (what the lens pulls inside):**
- The map-gen **recipe domain logic** and how stages/operations/strategies compose.
- The **harness**: live Civ 7, diagnostics suite, Earth-like benchmark-driven process, Mapjet Studio (Effect), SDK data-flow rules + architecture docs.
- The **closure loop** with in-game verification as the gate.
- The **two arms** and **two problem classes** (generation-logic vs. Studio-visualization).
- The **composition graph** to cognition / `mapgen:*` / `civ7-*` skills.

**Foreground (made salient within the selection):**
- **Autonomy** — the team self-serves context and runs the loop without re-explanation.
- **Progressive disclosure** — bounded navigable top; depth in facets/sub-docs.
- **Reference-not-duplicate** — point at owners; never copy owned logic.
- **In-game verification** — the closure test that distinguishes "looks right in Studio" from "the engine produced a good, stable map."
- **Both arms held together** — physical realism *and* recipe structure, not one at the expense of the other.

**Exterior (deliberately off-frame — constructed, not absent):**
- SDK architecture internals → if the work keeps needing to *redefine* SDK boundaries, that is the falsifier (the frame mis-drew the line between recipe domain logic and SDK architecture).
- Deep Habitat-stack archaeology → only pattern-awareness is admitted; full stack analysis is off-frame.
- General Civ 7 modding unrelated to map generation → off-frame.
- Transient project status / migration carry-forward → off-frame; belongs in `docs/projects/`.

---

## The Two Arms (both must be served)

| Arm | Question it answers | Primary owners / references | Verification surface |
|---|---|---|---|
| **Technical pipeline engineering** | *How is this recipe structured?* Stages, steps, ops (op-per-concern), strategies, artifacts (`artifact:*`/`field:*`), and how they compose; splitting/recombining stages; data flow between stages. | Live source `mods/mod-swooper-maps/src/{domain,recipes}`; `civ7-architecture-authority` (stage/step/domain shape, boundaries); `system-design` (stage composition as a system of loops/flows); `@swooper/mapgen-core` engine (referenced); `docs/system/libs/mapgen/MAPGEN.md` | Architecture review; diagnostics that the pipeline composes and runs; Studio stage outputs. |
| **Behavioral pipeline engineering** | *Does this recipe produce physically grounded, beautiful, civilization-appropriate maps?* Algorithms and parameters that yield realistic climate/ocean/tectonics, aesthetics, and Civ-appropriate playability. | **Earth-science/physics facet (net-new)**; live `src/domain/{foundation,morphology,hydrology,ecology,placement,narrative,resources}`; `mapgen:*` skills *(philosophy only — outdated arch)*; Civ 7 domain facet (Civ-appropriateness); Earth-like benchmark | Earth-like benchmark deltas; diagnostics/statistics; Studio visual inspection; **live in-game screenshots**. |

The arms are coupled: a structural change (split a stage) is judged behaviorally (did realism/quality hold?), and a behavioral change (improve rivers) is constrained structurally (does it fit the stage/artifact contract?). The loop runs both verifications.

---

## The Harness (what the team operates within)

The skill must describe — by reference and orientation, not re-specification — the operating environment:

1. **Live Civ 7 game** — the ground truth. Maps that pass MockAdapter can still SIGSEGV the live engine; standard write/prep ops are required. Launch + capture is a known, documented procedure (cold-boot Steam → shell → single-player-from-setup → explore-reveal → foreground → screenshot). Owner of the operational discipline: `civ7-operational-debugging`; live-launch memory exists.
2. **Diagnostics suite** — statistics, expected ranges, surface deltas, parity checks emitted by the pipeline (referenced throughout `pipeline-realism` and the recent coast-projection work). Note: diagnostics and viz are **partly local to the mod** (`mods/mod-swooper-maps/src/dev/{diagnostics,viz}`) and feed Studio. The verification facet leverages these.
3. **Earth-like benchmark-driven development** — the process of measuring recipe output against an Earth-like reference and iterating to close deltas. Home: `docs/projects/pipeline-realism/`.
4. **Mapjet Studio** — the visualization/inspection app at `apps/mapgen-studio/`, migrated to Effect (one-mount runtime simplification is **already executed**, on main via PR #1748; `mapgen-studio-redesign` is a design audit, not a pending migration). `latest-juicy-config` is an existing map *config*, not necessarily the current working branch — agents must re-check `git branch` rather than trust a snapshot (live checkout was observed as `codex/studio-effect-error-boundaries`). The surface where stage outputs and diagnostics are seen; when a problem is *display/diagnostic* rather than *generation logic*, the fix lives here (`apps/mapgen-studio/src`). Studio daemon: `apps/mapgen-studio/src/server/daemon/daemon.ts` (port 5174, `runtimeMode`).
5. **The SDK / engine with its data-flow rules and architecture docs** — the substrate the recipe runs on (`@swooper/mapgen-core` = `packages/mapgen-core`; SDK = `packages/sdk`). **Referenced, not owned** by this skill; `civ7-architecture-authority` is the authority; engine config/arch lives in `docs/system/libs/mapgen/MAPGEN.md`. Recipe domain logic (mod-authored, `mods/mod-swooper-maps/src/`) is distinct from engine/SDK architecture.
6. **Habitat SDK patterns (top of the 126-branch stack)** — architectural patterns enforced via **Grit and Biome**. In scope only as *pattern awareness* for keeping new/changed recipe code idiomatic; not a deep dive.

---

## The Facet Roster (role references — novelty-calibrated)

The user named three facets. Grounding reveals they differ in novelty; the skill should build each at the depth its novelty warrants and reference existing owners for the rest. **This calibration is a finding to confirm in Phase 1, not a closed decision.**

| Facet | Charter | Novelty | Composition |
|---|---|---|---|
| **1. Earth science / physics** | Obsessed with climate systems, ocean systems, tectonics; brings physical realism into procedural generation. Grounds the **behavioral arm**. | **Net-new** — no existing skill owns physical-realism reasoning end-to-end. This is where the skill's deepest *new* content lives. | Composes `mapgen:foundation` (tectonics/wind/currents), `hydrology` (rivers/water), `ecology` (climate/vegetation), `morphology` (landforms); informs the Earth-like benchmark. |
| **2. Operational debugging / verification** | Leverages diagnostics, Studio visualizations, benchmarks, and live in-game screenshots to operationally debug, benchmark, and verify. | **Base exists + 3 net-new overlays** (Phase 1 sharpened this — "largely exists" understated the delta). Base: `civ7-operational-debugging` owns proof boundaries, logs, FireTuner, in-game proof. | Reference the base proof discipline (don't restate); **author three net-new overlays**: (i) Studio-viz verification (display-bug vs generation-bug via `diff-layers.ts`/parity), (ii) Earth-like benchmark-driven iteration (`diag:dump` → `computeEarthMetrics` → compare; pre-declared expectation ledger), (iii) pipeline-internal diagnostics (`src/dev/{diagnostics,viz}`, distinct from Civ7 Logs). |
| **3. Civilization 7 domain** | Understands Civ 7 as an engine: sync resources via CLI, parse XML/game-data, read game data, search forums/web, reason about game behavior and design intent. | **Partially exists** — `civ7-product-authority` owns official game-data authority; `civ7-operational-debugging` knows resources/logs/FireTuner. | The facet **references** product-authority + operational-debugging and adds the *research/intent* dimension (forums, web, design-intent reasoning, Civ-appropriateness judgments) not owned elsewhere. |

---

## The Workstream Loop (what kicks off on a request)

When the user issues a request and references the skill, the team runs a structured loop. The loop is the orchestration spec the skill encodes. Stages map onto the cognition chain:

```
REQUEST ("investigate why discoveries aren't placed" / "improve rivers" / "split this stage")
   │
   ├─ 0. Intake & route        → inquiry-design (only if request is ambiguous) → which arm? which problem class?
   ├─ 1. Frame                 → framing-design (problem/objective frame for THIS request)
   ├─ 2. Investigation design  → investigation-design (frame → rail-neutral brief: evidence policy, stop conditions)
   ├─ 3. Analysis              → facet agents gather evidence across harness (diagnostics, Studio, mapgen-core, game data)
   ├─ 4. Design                → system-design (pipeline as system) + arch-authority (structure) + physics facet (behavior)
   ├─ 5. Alternative selection → generate ≥1 structurally different alternative; choose with rationale
   ├─ 6. Implementation        → recipe domain-logic change (mapgen-core) OR Studio-viz change
   ├─ 7. In-game verification  → operational-debugging facet: diagnostics + benchmark + Studio + LIVE screenshots
   ├─ 8. Architecture review   → arch-authority: boundaries, drift, idiomatic (Grit/Biome) patterns
   ├─ 9. Refinement            → loop back to 4–7 until verified + reviewed
   └─ 10. Finalization         → close per civ7-open-spec-workstream / systematic-workstream; proof-labeled claims
```

Two problem classes branch at step 6: **(a) generation-logic** changes land in the mod recipe domain — `mods/mod-swooper-maps/src/{domain,recipes}` (only engine-substrate changes touch `packages/mapgen-core/`) — and are verified behaviorally + in-game; **(b) Studio-visualization** changes land in the Studio app (`apps/mapgen-studio/`) and are verified by display correctness (the generation output was right; the *view* was wrong). Distinguishing the two early is a core diagnostic skill the verification facet must encode — Phase 1 found the concrete discriminator: `diff-layers.ts` + `FinalSurfaceParityProof.unresolvedLinks`.

---

## Reference Graph (compose, do not duplicate)

```
                       civ7-mapgen-workstream  (NEW repo-local skill — router + orchestration + facets)
                                │
   ┌────────────────────────────┼─────────────────────────────────────────────┐
   │ cognition (thinking spine)  │ mapgen:* (domain stages)                     │ civ7-* (operating)
   │  framing-design             │  foundation  morphology  hydrology           │  architecture-authority  (technical arm / SDK boundary)
   │  investigation-design       │  ecology     placement   narrative           │  operational-debugging   (verification facet base)
   │  inquiry-design             │  config-tuning                               │  product-authority        (game-data authority)
   │  system-design              │                                              │  systematic-workstream    (closure discipline)
   │  create-goal                │  (skills = PHILOSOPHY ONLY; arch outdated) │  open-spec-workstream     (bounded phase closure)
   │  (+ solution/testing/info)  │                                              │  orpc-control-architecture(control/CLI/Studio surfaces)
   └─────────────────────────────┴──────────────────────────────────────────────┘
   LIVE recipe/domain source (authoritative): mods/mod-swooper-maps/src/{domain,recipes,maps,dev}  ·  engine: @swooper/mapgen-core
   NEW depth lives in: Facet 1 (physics) ; the orchestration loop ; the map-gen-specific verification + Civ7-domain-research extensions.
```

---

## Hard Core (load-bearing — violating any forces a complete reframe)

1. **The skill is a composition/orchestration layer, not a content monolith.** It routes to and wires existing owners; it duplicates none of their logic.
2. **The closure test is in-game verification.** No request is "done" on Studio/diagnostic evidence alone.
3. **Recipe domain logic ≠ engine/SDK architecture.** The skill governs the former (mod-authored: `mods/mod-swooper-maps/src/{domain,recipes,maps}`); it references the latter (`@swooper/mapgen-core`, `packages/sdk`, owned by `civ7-architecture-authority`).
4. **Both arms, always.** Technical structure and behavioral realism are verified together; neither is sacrificed for the other.
5. **Progressive disclosure is structural.** A minimal navigable top; depth in facets/sub-docs; the top is usable without reading everything.

## Protective Belt (can flex without a reframe)
- The skill's exact name (`civ7-mapgen-workstream` is provisional).
- The exact number/boundaries of facet documents (≥3 required; may grow).
- The precise step labels in the loop (the *shape* — analysis→design→alt→impl→verify→review→refine→finalize — is hard core; the labels are not).
- Where the framing doc and skill physically live (proposed: `docs/projects/mapgen-workstream-skill/` and `.agents/skills/civ7-mapgen-workstream/`).
- The novelty calibration of facets 2 and 3 (to be confirmed in Phase 1).

---

## Reframe Conditions

**Specific falsifier (what would force a reframe):** If a Phase-1 investigation, or a first real use, shows that **(a)** a competent agent team handed the skill + one example request still must ask the user to explain the pipeline or harness; **or (b)** building the skill requires *redefining* SDK architecture boundaries (not just referencing them) to make recipe changes — meaning the recipe-domain / SDK-architecture line was mis-drawn; **or (c)** the loop closes successfully on changes that the live engine then rejects or that fail the Earth-like benchmark (verification gate not actually load-bearing) — then the hard core is violated and the frame must be reconstructed, not patched.

**Degeneration trigger (accumulation rule):** If **3 or more** facet/loop decisions in a row get resolved by *copying* logic from a referenced skill rather than pointing to it (because "it's easier to inline"), the composition hard core is degenerating — stop and re-run framing before authoring more.

---

## Assumptions Committed
- The cognition design skills and `civ7-*` repo-local skills remain available to a future agent in this repo. The `mapgen:*` cache skills are **architecturally outdated** (philosophy reference only). Authoritative arch/code is the live mod source.
- Recipe domain logic is authored in `mods/mod-swooper-maps/src/{domain,recipes,maps}` (op-per-concern domain, recipes that compose stages, map configs/presets), building on the `@swooper/mapgen-core` engine; the Phase-1 team will confirm exact locations and the current recipe/operation/strategy/artifact vocabulary from live source.
- "Mapjet Studio" is the Studio app on branch `latest-juicy-config` (Effect migration); its current shape is confirmable in Phase 1.
- The Earth-like benchmark process is real and lives in/near `docs/projects/pipeline-realism/`.
- In-game launch + capture is feasible and documented (per existing operational-debugging skill + memory).

---

## Philosophy (the spirit the skill must carry)
- **The team serves the map, the map serves the player.** Physical realism is not realism for its own sake — it is in service of maps that are *beautiful and civilization-appropriate to play*. Behavioral engineering holds aesthetics and playability alongside physics.
- **Evidence over assertion; proof has boundaries.** Every claim carries the strongest evidence actually collected (built / generated / deployed / logged / in-game / benchmark) — inherited from `civ7-operational-debugging`'s discipline.
- **Construct the frame before pouring the request through it.** Each request gets its own frame (problem or objective) before investigation — the skill teaches the team to do this, not to pattern-match to a template.
- **Compose, don't accrete.** The skill's power is in wiring specialists, not in being a single all-knowing document. Smallness at the top is a feature.
- **Verify where it counts.** Studio is where you *see*; the live engine is where you *know*.

---

## Phase 1 Seed (hands to `investigation-design` — execution-neutral)

Phase 1 is a discovery investigation, not skill authoring. Its objective: **confirm or correct this frame's assumptions and produce the grounded map of (a) the recipe domain pipeline and (b) the harness, plus (c) the exact reference targets for the skill.** Primary questions the discovery team must answer (exteriors preserved — do *not* drift into SDK-architecture redesign):
- **Pipeline domain shape (from LIVE mod source, not cache skills):** What are the recipes, operations (op-per-concern), algorithms, strategies, stages — and how do they compose? Map `mods/mod-swooper-maps/src/{domain,recipes,maps}` precisely (files/dirs per stage), the engine boundary to `@swooper/mapgen-core`, and the `artifact:*`/`field:*` data-flow contract between stages. Cross-check against `docs/system/libs/mapgen/MAPGEN.md` and the engine-refactor-v1 normalization packet; flag any drift between docs and live source.
- **Harness:** Concretely, how does a future agent invoke each harness component — diagnostics, the Earth-like benchmark, Studio (on `latest-juicy-config`), live launch+capture? What does each emit and how is it read?
- **Reference targets:** For each of the three facets and each loop step, which existing skill / doc / code path is the owner the new skill should point at? Confirm the facet novelty calibration (esp. facets 2 & 3).
- **Stack patterns:** What Habitat SDK patterns (Grit/Biome-enforced) must changed recipe code respect? (Awareness-level only.)
- **The two arms, made concrete:** What does a *technical* change (e.g. `morphology-4stage-split`) and a *behavioral* change (e.g. `river-lake-recovery`, `mapgen-orographic-precipitation`) actually look like in this repo, end to end?

**Stop / reframe condition for Phase 1:** if discovery shows the recipe-domain / SDK-architecture boundary is not cleanly drawable, halt and return to this frame (falsifier b).

## Phase 2 Seed (the target skill shape)
- Repo-local skill at `.agents/skills/civ7-mapgen-workstream/` (name TBC), following the `civ7-*` house pattern: lean `SKILL.md` router; `references/` for depth; `assets/` for templates; `<invariants>`.
- Top-level `SKILL.md`: scope, the loop, the routing table (request → arm → problem class → facets → owners), the reference graph, invariants. Minimal and navigable.
- Facet documents (≥3): physics (deep, net-new), verification (extends `civ7-operational-debugging`), Civ7-domain (extends `civ7-product-authority` + adds research/intent). Authored at novelty-calibrated depth.
- Cross-references to cognition / `mapgen:*` / `civ7-*` skills throughout; no duplication.
- A clear statement of the two problem classes (generation-logic vs. Studio-viz) and how to tell them apart.

---

## Scope Observations Surfaced (per "pause and surface if scope feels different")
1. **Two of the three facets substantially overlap existing repo skills.** Operational debugging/verification ≈ `civ7-operational-debugging`; the Civ7 domain facet ≈ `civ7-product-authority` + parts of `civ7-operational-debugging`. This *strengthens* the user's reference-not-duplicate instruction: facets 2 & 3 should be thin extensions/reference maps, and the genuinely new authored depth concentrates in **Facet 1 (physics)** and the **orchestration loop**. (Consonant with intent; refines build strategy.)
2. **The example requests are real archetypes.** "improve rivers" → `river-lake-recovery`; "split this stage" → `morphology-4stage-split`; "discoveries aren't placed" → `placement-realignment` / `resource-distribution-policy`. Phase 1 should mine these as worked examples for the skill.
3. **The new skill overlaps `civ7-systematic-workstream` / `civ7-open-spec-workstream` at the closure end.** The map-gen skill should *invoke* those for finalization rather than re-implement closure discipline. Boundary to settle in Phase 1: where the new skill's loop hands off to those workstream skills.
4. **No genuine scope contradiction found.** The work is large but coherent and matches the brief. No pause-blocking conflict — proceeding to the review gate.

---

## NOT HOW
*This frame deliberately excludes implementation HOW — exact file edits, the skill's final prose, the discovery team's agent decomposition, and per-request procedures. HOW rots fastest and belongs to Phase 1 (investigation) and Phase 2 (authoring). If HOW material surfaced during framing, it was moved into the Phase-1/Phase-2 seeds as questions and targets, not answers.*
