---
name: civ7-mapgen-workstream
description: |
  Use in the Civ7 Modding Tools repo to take a map-generation request end-to-end — investigate, design, implement, verify in-game, and hand off. Routes between the two arms (technical recipe structure vs. behavioral physical realism) and the two problem classes (generation-logic vs. Studio-visualization). Trigger phrases include "investigate why discoveries aren't being placed", "improve how rivers are generated", "split this stage and recombine it", "tune the map for realism", "make the map more Earth-like", "the Studio viz looks wrong", "add a strategy to this op", "why does the coastline look like that", "is this map gen change verified in-game", and "map gen workstream".
---

# Civ7 Map-Generation Workstream

## Purpose

Take a map-generation request — in the user's own words — from intake through
investigation, design, implementation, **in-game verification**, architecture
review, and finalization, without re-explaining the pipeline or harness each
time. This skill is a **router + orchestration spec + facet library**. It wires
existing owners (cognition design skills, `civ7-*` operating skills, live mod
source) into a loop and adds the genuinely-new depth (physics reasoning, map-gen
verification overlays, the orchestration loop).

Two load-bearing lines govern everything below:

- **Recipe-domain logic is NOT engine/SDK architecture.** Generation logic is
  authored in the mod: `mods/mod-swooper-maps/src/{domain,recipes,maps,dev}`.
  `@swooper/mapgen-core` (`packages/mapgen-core`) is the engine/authoring
  substrate; `packages/sdk` is the SDK. Engine/SDK architecture is owned by
  `civ7-architecture-authority` — referenced, never redefined here.
- **In-game verification is the closure test.** No request is "done" on Studio or
  diagnostic evidence alone. MockAdapter-valid maps still SIGSEGV the live
  engine. Studio is where you *see*; the live engine is where you *know*.

## When To Use

- A map-gen request lands and you must route it: which arm, which problem class,
  which facets, which owner skills.
- Structuring an investigation, design, alternative selection, or refinement loop
  over the recipe pipeline.
- Deciding whether a symptom is a generation bug or a Studio display bug.
- Reasoning about physical realism (climate, ocean, tectonics, hydrology) as it
  flows into the recipe.

## When Not To Use

- Engine/SDK architecture decisions → `civ7-architecture-authority`.
- Official game-data authority (resource catalogs, XML) → `civ7-product-authority`.
- Pure build/deploy/log/tuner operational debugging → `civ7-operational-debugging`.
- Closure/PR discipline → `civ7-open-spec-workstream` / `habitat:systematic-workstream`
  (this skill *hands off* to them; it does not re-implement closure).

## Routing Table

Route every request before going deep. Pick the arm, then the problem class, then
the facets and owners.

| Request shape (example) | Arm | Problem class | Lead facets | Primary owners to reference |
|---|---|---|---|---|
| "split this stage / recombine it differently", "add a strategy to this op", "change how this artifact flows" | **Technical** | generation-logic | facet-civ7-domain (intent), facet-verification | `civ7-architecture-authority`, `cognition:system-design`, `references/pipeline-map.md`, `assets/recipe-scaffolds.md` |
| "improve how rivers are generated", "make rain shadows realistic", "tune the map for realism / more Earth-like" | **Behavioral** | generation-logic | **facet-physics** (deepest), facet-verification | `references/facet-physics.md`, `mapgen:*` *(philosophy only)*, `assets/earthlike-expectation-ledger.md` |
| "investigate why discoveries aren't being placed", "starts cluster badly", "resources feel wrong" | Behavioral + Technical | generation-logic | facet-civ7-domain, facet-physics, facet-verification | `civ7-product-authority`, `references/facet-civ7-domain.md`, `mapgen:placement` *(philosophy only)* |
| "the Studio viz looks wrong", "this layer is missing / mis-colored / mis-projected" | n/a | **Studio-visualization** | facet-verification | `civ7-orpc-control-architecture` *(Studio-viz only)*, `references/facet-verification.md` (overlay 1) |

If the request is ambiguous about arm or problem class, run `cognition:inquiry-design`
to disambiguate before framing (loop step 0).

## The Loop (overview)

A request runs an 11-step loop. This is the orchestration spine; depth, the
facet-agent team pattern, and the closure handoff live in
`references/orchestration.md`.

```
0  Intake & route      → cognition:inquiry-design (only if ambiguous) → arm? problem class?
1  Frame               → cognition:framing-design (problem/objective frame for THIS request)
2  Investigation brief → cognition:investigation-design (rail-neutral: evidence policy, stop conditions)
3  Analysis            → facet agents gather evidence (diagnostics, Studio, live source, game data)
4  Design              → cognition:system-design + civ7-architecture-authority (structure) + physics (behavior)
5  Alternatives        → ≥1 structurally different alternative; PRE-DECLARE Earth-like expectations here
6  Implementation      → generation-logic (mods/src/{domain,recipes}) OR Studio-viz (apps/mapgen-studio/src)
7  In-game verification → GATE: diagnostics + Earth-like benchmark + Studio + LIVE run/screenshots
8  Architecture review  → civ7-architecture-authority: boundaries, drift, idiomatic (Grit/Biome) patterns
9  Refinement          → loop 4–7 until verified + reviewed
10 Finalization        → HAND OFF to civ7-open-spec-workstream / habitat:systematic-workstream
```

Step 6 branches on problem class: **generation-logic** lands in
`mods/mod-swooper-maps/src/{domain,recipes}` (only engine-substrate changes touch
`packages/mapgen-core/`) and is verified behaviorally + in-game; **Studio-viz**
lands in `apps/mapgen-studio/src` and is verified by display correctness.

## Generation Bug vs Display Bug (discriminator)

The single most important early diagnostic. **If the raw binary coming out of
generation is wrong → generation bug** (fix in `src/{domain,recipes}`); **if the
binaries are right but the canvas renders wrong → display bug** (fix in
`apps/mapgen-studio/src/features/viz/*`).

The two authoritative discriminators (local-vs-local binary diff and the
local-vs-live parity proof), their exact script paths, the Studio edit-surface
map, and the benchmark overlay are in `references/facet-verification.md`.

## Reference Graph (compose, do not duplicate)

> **CURRENCY BANNER.** Live source is authoritative for all arch/code/path/schema
> claims. The `mapgen:*` cache plugin skills (`mapgen:foundation`, `morphology`,
> `hydrology`, `ecology`, `placement`, `narrative`, `config-tuning`) are
> **philosophy-only / outdated arch** — lean on them for *domain philosophy and
> prior thinking only*; never cite their file paths, config schemas, or stage
> structure as current. `civ7-*` repo-local skills are current — reference them,
> but verify any specific path/code claim against live source. `cognition:*`
> skills carry no arch/code burden — lean on them directly.

```
                      civ7-mapgen-workstream   (this skill: router + loop + facets)
                                │
  ┌─────────────────────────────┼──────────────────────────────────────────────┐
  │ cognition (thinking spine)   │ mapgen:* (domain PHILOSOPHY only — outdated)  │ civ7-* (operating, current)
  │  framing-design              │  foundation  morphology  hydrology            │  architecture-authority  (technical arm / engine+SDK boundary)
  │  investigation-design        │  ecology     placement   narrative            │  operational-debugging   (verification base: build/deploy/log/tuner/in-game)
  │  inquiry-design              │  config-tuning                                │  product-authority       (official game-data authority)
  │  system-design               │                                              │  orpc-control-architecture (Studio-viz problem class only)
  │  team-design                 │                                              │  open-spec-workstream / systematic-workstream (closure handoff)
  └──────────────────────────────┴───────────────────────────────────────────────┘
  LIVE recipe/domain source (AUTHORITATIVE): mods/mod-swooper-maps/src/{domain,recipes,maps,dev} · engine: @swooper/mapgen-core
  NEW depth lives in: references/facet-physics.md ; the orchestration loop ; the map-gen verification + Civ7-domain-research overlays.
```

## Vocabulary (current — from live source)

The structure vocabulary nests **domain → op → strategy → step → stage → recipe →
artifact** (re-derive from live source, not `mapgen:*`; authoring factories live in
`@swooper/mapgen-core/authoring`). The load-bearing split is **truth-stage**
(stages 1–10, compute domain artifacts; never touch the adapter) vs
**projection-stage** (`map-*` + `placement`, project truth to engine terrain).

Full glossary + current call shapes: `references/pipeline-map.md`. Strategy
selection (the three control points) is owned there and in
`references/facet-physics.md`.

## Reference Map

| File | Open when |
|---|---|
| `references/pipeline-map.md` | You need the technical-arm grounding: the 17 stages, their ops/recipes/artifacts, truth↔projection boundary, and data flow. |
| `references/facet-physics.md` | **Behavioral arm, deepest/net-new.** Earth-science/physics per domain (tectonics, climate, ocean, hydrology, landforms) and how realism maps onto ops/strategies. |
| `references/facet-verification.md` | You are verifying: base proof discipline (defer to `civ7-operational-debugging`) plus the 3 net-new overlays (Studio-viz discrimination, Earth-like benchmark iteration, pipeline-internal diagnostics). |
| `references/facet-civ7-domain.md` | Civ7-as-engine: game-data modalities (defer to `civ7-product-authority`) plus the research/design-intent dimension (forums/web, Civ-appropriateness). |
| `references/worked-examples.md` | You want the 4 archetype workstreams — stage-split / coasts / placement / studio-viz (technical / behavioral / behavioral / visualization) — and the loop pattern made concrete. |
| `references/orchestration.md` | You are running the loop: the 11 steps in depth, the facet-agent team pattern (`cognition:team-design`), and the closure handoff. |
| `assets/recipe-scaffolds.md` | You are implementing: copy-paste templates for a new op / strategy / step / stage / artifact, plus registration points. |
| `assets/earthlike-expectation-ledger.md` | Step 5 — pre-declare Earth-like expectations *before* implementing, so verification is honest. |
| `assets/live-verification-runbook.md` | Step 7 — the runnable in-game verification gate checklist (deploy → health → run → log markers → parity). |

## Core Invariants

<invariants>
<invariant name="live-source-authoritative">Live source (`mods/mod-swooper-maps/src/...`, `packages/mapgen-core`) is authoritative for every arch/code/path/schema claim. Re-derive structure from it.</invariant>
<invariant name="never-cite-cache-skill-paths">`mapgen:*` skills are philosophy-only / outdated arch. Use them for domain philosophy; never cite their file paths, config schemas, or stage structure as current.</invariant>
<invariant name="verify-path-claims">`civ7-*` and cognition skills may be leaned on, but verify any specific path/code claim against live source before acting on it.</invariant>
<invariant name="recipe-domain-not-engine-arch">Generation-logic changes land in `mods/mod-swooper-maps/src/{domain,recipes}`. Only engine-substrate changes touch `packages/mapgen-core/`. Never conflate recipe domain logic with engine/SDK architecture.</invariant>
<invariant name="in-game-verification-is-closure">A request is closed only after live-engine verification. Studio/diagnostic evidence alone is never closure — MockAdapter-valid maps can still SIGSEGV the live engine.</invariant>
<invariant name="pre-declare-earthlike-expectations">Declare the Earth-like expectation ledger at alternative-selection (step 5), before implementing, so verification cannot be retrofitted to the result.</invariant>
<invariant name="compose-not-duplicate">Point at owners (other skills, live source); never copy their logic. If 3+ loop/facet decisions in a row get resolved by inlining owned logic, stop and re-frame.</invariant>
<invariant name="proof-labeled-claims">Label every claim with the strongest evidence actually collected: built, generated, deployed, logged, benchmark-delta, in-game observed, or unresolved.</invariant>
</invariants>

## Quick Start

1. **Route.** Use the Routing Table to pick arm + problem class + facets. If
   ambiguous, run `cognition:inquiry-design` first.
2. **Discriminate** (if a symptom): generation bug vs display bug via
   `diff-layers.ts` + `FinalSurfaceParityProof.unresolvedLinks`.
3. **Frame and brief.** `cognition:framing-design` → `cognition:investigation-design`.
   Open `references/orchestration.md` to run the loop.
4. **Ground the pipeline.** `references/pipeline-map.md` (structure) and the lead
   facet reference (`facet-physics` / `facet-verification` / `facet-civ7-domain`).
5. **Pre-declare** Earth-like expectations (`assets/earthlike-expectation-ledger.md`)
   at step 5.
6. **Implement** with `assets/recipe-scaffolds.md`; **verify in-game** with
   `assets/live-verification-runbook.md`.
7. **Hand off** closure to `civ7-open-spec-workstream` / `habitat:systematic-workstream`.
