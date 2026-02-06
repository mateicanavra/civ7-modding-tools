# Agent Plan (Complete): Pipeline-Realism “Finish The Spec” Wave

Date: 2026-02-04  
Status: Approved for execution

This document is the **complete execution plan** for the next wave of work to finish the maximal Foundation refactor SPEC under `docs/projects/pipeline-realism/`.

It is intentionally detailed. The goal is to avoid the failure mode where agents “rush” and ship under-specified docs.

## North Star

We are designing a **single maximal strategy** for a basaltic-lid, mantle-forced, evolutionary tectonics engine with:

- maximal realism/wow factor **within bounded computation**
- first-class mantle forcing (not “noise proxy”)
- mandatory dual outputs (Eulerian era fields + Lagrangian provenance)
- mandatory downstream consumption (Morphology-first)
- willingness to **break and migrate** contracts

No “optional artifacts” language is allowed in the target-state spec. Optionality is allowed only as *strategy selection*, but we are choosing **Maximal only** for this project.

## What We’re Completing

We’ll finish the remaining author-facing and implementation-ready parts:

1. **D08r Authoring & Config Surface (Maximal-only)**
2. **D09r Validation & Observability (distinct from visualization)**
3. **Visualization & Tuning Loop Spec** (deck.gl posture; stable keys)
4. **Units/Scaling + Artifact Catalog + Schema/Versioning**
5. **Migration Slices (prepare → cutover → cleanup; no legacy left)**
6. **Stack Integration Pass** (Morphology/Hydrology/Coastal/Wind/Current changes)

This wave is **docs-only**, but deliverables must be implementation-grade:

- explicit schemas (space/dtype/shape)
- deterministic algorithms with fixed iteration budgets
- non-render invariants + regression gates
- clear authoring semantics and tuning loop expectations
- causal “wow scenarios” to validate the story end-to-end

## Definitions (Keep These Separated)

### Validation / Observability

- Purpose: **correctness, determinism, regression safety**.
- Outputs: invariant checks, metrics, trace events, diagnostic artifacts when necessary.
- Must not depend on deck.gl rendering logic.

### Visualization / Tuning

- Purpose: **human interpretability** (authors/devs understand what changed and why).
- Outputs: stable `dataTypeKey` + layer payloads (mesh + tile), debug layers and refined layers.
- Uses the canonical viz plumbing (`VizDumper` / trace) but is not itself a “correctness gate.”

## Ground Rules (All Agents)

- Base branch: `agent-codex-pipeline-realism-maximal-spec-v1`
- Safe sync: `gt sync --no-restack`
- Worktrees root: `WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"`
- Branch/worktree names must start with `agent-<id>-`
- Deliverables must land under `docs/projects/pipeline-realism/`
- Each worker branch produces **exactly one commit** (no fixup commits).

### Shared Inputs (Must Read First)

- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- `docs/projects/pipeline-realism/resources/spec/budgets.md`
- `docs/projects/pipeline-realism/resources/spec/sections/*`

### Canonical Repo Contracts (Must Align With, Or Explicitly Supersede)

- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`

### Templates (Required Formatting)

- Decision packet template: `~/.codex-rawr/skills/architecture/assets/decision-packet.md`
- Migration slice template: `~/.codex-rawr/skills/architecture/assets/migration-slice.md`

## Agent Roles (How We Avoid “Safe” Defaults)

For Tracks 1–5:

- **Default agent (reasoning brief; no repo edits)**:
  - produce “decision space + traps + recommendation”
  - explicitly call out fake/cheap algorithm risks
  - force the worker to be decision-complete (no “later”)

- **Worker agent (docs + one commit)**:
  - produce the files with schemas, algorithms, invariants, budgets, wow scenario
  - must cross-link to canonical contracts
  - must include explicit “trap list” and how the spec avoids each trap

Track 6 is a **default integration agent** who *does* edit docs, because it’s a consistency sweep.

## Execution Order (Pragmatic)

Run in parallel, integrate in a fixed order to minimize conflicts:

1. Run all default-agent briefs first (fast; message-only).
2. Run worker tracks A–E in parallel (doc writing).
3. Run integration agent F in parallel, but it should be prepared to reconcile late.
4. Cherry-pick worker commits into base branch in this order:
  - D08r → D09r → Viz → Units/Catalog → Migration → Integration pass
5. Final pass: update canonical SPEC + indices and ensure internal consistency.

## Worktree/Branch Setup (Concrete Commands)

From the primary repo checkout:

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
gt sync --no-restack
```

Create a worker worktree:

```bash
WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"
BRANCH="agent-A-..."
git worktree add -b "$BRANCH" "$WORKTREES_ROOT/wt-$BRANCH" agent-codex-pipeline-realism-maximal-spec-v1
cd "$WORKTREES_ROOT/wt-$BRANCH"
gt track --parent agent-codex-pipeline-realism-maximal-spec-v1
git status
```

One-commit rule:

```bash
gt add -A
gt modify --commit -am "<commit message>"
```

## Deliverable Quality Gates (For Every Worker Output)

Each deliverable must include:

- **Pointers**: doc path + heading OR code path for every non-obvious claim.
- **Normative language**: MUST/SHALL for contracts; avoid “could”/“maybe”.
- **Budgets**: fixed iteration counts and memory surfaces, with explicit justification.
- **Invariants**: non-render assertions; specify “what fails the run”.
- **Wow scenario**: at least one causal narrative proving the mechanism.
- **No optional artifacts**: if an output is described, it must be emitted + consumed.

## Track 1 — D08r: Authoring & Config Surface (Maximal-only)

### Default Agent Brief (message-only)

Must answer:

- What author control is allowed vs forbidden (“velocity hacks”)?
- Where authoring injects:
  - mantle source initial conditions (position, strength, radius, polarity)
  - lithosphere initial state and inventories (water/heat budgets if present)
  - boundary constraints (if any; must not be a hidden kinematics engine)
- How to keep authoring deterministic, composable, and explainable.

Trap list (must include):

- authoring becomes hidden second kinematics engine
- profiles/presets hide real knobs and prevent tuning
- non-local knobs create non-local effects without diagnostics/viz

### Worker Agent (docs + one commit)

Branch/worktree:

- Branch: `agent-A-pipeline-realism-d08r-authoring-surface`
- Worktree: `$WORKTREES_ROOT/wt-agent-A-pipeline-realism-d08r-authoring-surface`

Creates:

- `docs/projects/pipeline-realism/resources/decisions/d08r-authoring-and-config-surface.md`
- `docs/projects/pipeline-realism/resources/research/d08r-authoring-and-config-surface-evidence.md`
- `docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md`

Decision-complete requirements:

- Normative config structure consistent with strict compilation:
  - align with `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- “Scenario templates” (if present) compile into explicit knobs (templates are defaults).
- Explicit separation:
  - **Physics inputs**: mantle sources, lithosphere state, water/heat budgets.
  - **Outputs**: never directly authored (plate velocities, belts, masks).
- Studio UX mapping:
  - which controls exist, where, and which viz layers they should light up.
- Determinism:
  - same seed + config → identical compiled config and artifacts.

Commit message:

- `docs(pipeline-realism): decision D08r authoring surface`

## Track 2 — D09r: Validation & Observability (Not Visualization)

### Default Agent Brief (message-only)

Must answer:

- Which invariants are **hard gates** (fail run)?
- Which diagnostics are emitted but not gating?
- How to ensure invariants are physics-aligned (not render-aligned)?

Trap list (must include):

- validation depends on deck.gl/viewer logic
- metrics are qualitative-only and can’t catch regressions
- determinism checks too weak (don’t detect drift)

### Worker Agent (docs + one commit)

Branch/worktree:

- Branch: `agent-B-pipeline-realism-d09r-validation-observability`
- Worktree: `$WORKTREES_ROOT/wt-agent-B-pipeline-realism-d09r-validation-observability`

Creates:

- `docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md`
- `docs/projects/pipeline-realism/resources/research/d09r-validation-and-observability-evidence.md`
- `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`

Decision-complete requirements:

- Required invariant list grouped by artifact stage:
  - mantle potential/forcing
  - plate motion
  - partitions/segments
  - events/era fields
  - provenance/tracers
  - morphology belt drivers (correlation checks, not aesthetics)
- Required diagnostics contract:
  - what is emitted via trace events
  - what is stored as artifacts (only if needed for replay/determinism)
- Explicit separation from visualization in headings + intro:
  - validation asserts correctness
  - visualization helps humans understand/tune
- Determinism gates:
  - identical replay checks (hash/fingerprint)
  - explicit float tolerance policy (if any)

Commit message:

- `docs(pipeline-realism): decision D09r validation`

## Track 3 — Visualization & Tuning Loop (Dedicated; references canonical deck.gl doc)

### Default Agent Brief (message-only)

Must answer:

- What layers are “debug truth” vs “refined author visuals”?
- Which coordinate spaces must be shown (mesh vs tile; projection correctness)?
- How authors trace causality: config → mantle → plates → events → provenance → morphology?

Trap list (must include):

- creating a second competing viz architecture doc
- tile-only viz loses mesh causality
- unstable layer keys/dataTypeKeys

### Worker Agent (docs + one commit)

Branch/worktree:

- Branch: `agent-C-pipeline-realism-visualization-spec`
- Worktree: `$WORKTREES_ROOT/wt-agent-C-pipeline-realism-visualization-spec`

Creates:

- `docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md`
- `docs/projects/pipeline-realism/resources/research/visualization-and-tuning-evidence.md`

Spec requirements:

- Do not fork viz architecture docs; reference:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
  - `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Define required stable `dataTypeKey`s + payload shapes for:
  - mantle potential + derived fields
  - plate motion (per-cell vectors + per-plate summary)
  - boundary regime fields + event corridors
  - provenance/tracer visualizations (age, origin, transport)
  - morphology consumption drivers (belts, age, diffusion drivers)
- Define “debug vs refined” layer sets and expected emission timing.
- Define minimum Studio interactions:
  - era scrubber
  - projection toggles
  - correlation overlays (e.g., mantle divergence vs rift)

Commit message:

- `docs(pipeline-realism): visualization tuning spec`

## Track 4 — Units/Scaling + Artifact Catalog + Versioning (Single Source of Truth)

### Default Agent Brief (message-only)

Must answer:

- Canonical unit conventions:
  - mesh-distance
  - potential magnitude
  - stress proxy magnitude
  - velocity magnitude
  - era semantics (“time”)
- How do we prevent “numbers nobody can reason about”?

Trap list (must include):

- making everything “0..1” without meaning
- inconsistent normalization across artifacts
- no schema/versioning plan → drift

### Worker Agent (docs + one commit)

Branch/worktree:

- Branch: `agent-D-pipeline-realism-units-and-artifact-catalog`
- Worktree: `$WORKTREES_ROOT/wt-agent-D-pipeline-realism-units-and-artifact-catalog`

Creates:

- `docs/projects/pipeline-realism/resources/spec/units-and-scaling.md`
- `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`
- `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md`

Spec requirements:

- Units/scaling:
  - define mesh-distance and relation to tile distance
  - define canonical ranges for potential/forcing/stress/velocity (dimensionless but interpretable)
  - define era semantics (what one era represents)
- Artifact catalog:
  - table: artifact id, space (mesh/tile), dtype, shape, meaning, consumers, viz keys
  - explicitly mark truth vs projection vs diagnostics
- Schema/versioning:
  - bump rules
  - viz behavior by schema version
  - protect Morphology consumption from drift

Commit message:

- `docs(pipeline-realism): units and artifact catalog`

## Track 5 — Migration Slices (Prepare → Cutover → Cleanup)

### Default Agent Brief (message-only)

Must answer:

- Minimal prepare slice that can land without “half legacy”.
- Cutover boundary: what flips at once?
- Bridges required and deletion targets (must not become permanent).

Trap list (must include):

- forever-bridges without deletion trigger
- parallel systems diverge silently
- migrating Morphology last loses the point

### Worker Agent (docs + one commit)

Branch/worktree:

- Branch: `agent-E-pipeline-realism-migration-slices`
- Worktree: `$WORKTREES_ROOT/wt-agent-E-pipeline-realism-migration-slices`

Creates directory + docs:

- `docs/projects/pipeline-realism/resources/spec/migration-slices/`
- At least 3 slices using the template `~/.codex-rawr/skills/architecture/assets/migration-slice.md`:
  - `slice-01-prepare-new-artifacts-and-viz.md`
  - `slice-02-cutover-foundation-maximal.md`
  - `slice-03-cutover-morphology-consumption-and-cleanup.md`

Requirements:

- Each slice defines:
  - scope + prerequisites
  - prepare vs cutover vs cleanup steps
  - deletion targets for every bridge
  - validation gates + required viz support
- “No later” posture:
  - unresolved items are either in-scope or hard blockers (recorded).

Commit message:

- `docs(pipeline-realism): migration slices`

## Track 6 — Stack Integration Pass (Morphology/Hydrology/Coastal/Wind/Current)

Agent type: default agent, but owns doc edits for consistency.

Branch/worktree:

- Branch: `agent-F-pipeline-realism-stack-integration-pass`
- Worktree: `$WORKTREES_ROOT/wt-agent-F-pipeline-realism-stack-integration-pass`

Scope:

- Identify and reconcile recent changes:
  - Morphology stage renaming/splitting (config/defaults/artifacts/setup)
  - Coastal shelving changes
  - Hydrology changes (wind/current calculations)
- Update pipeline-realism docs/plans so nothing is out of sync:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/*` (esp. morphology-contract, visualization)
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/*`
  - any decision packets referencing stage IDs or artifact IDs

Required grounding checks (must cite):

- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md` (if present) or other hydrology docs in `docs/system/libs/mapgen/reference/domains/`
- Code anchors (stage/step IDs + artifacts):
  - `mods/mod-swooper-maps/src/recipes/standard/`

Deliverables:

1. Integration memo + checklist:
  - `docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md`
  - Must include:
    - what changed
    - where pipeline-realism assumed old shapes (file + heading)
    - required updates (concrete edits)
    - “no change needed” list (if applicable)
    - traps (stage id drift, viz key drift)
2. Apply doc edits across pipeline-realism docs/plans (as needed).

Commit message:

- `docs(pipeline-realism): integrate recent morphology/hydrology stack changes`

## Final Integration (Single Owner; Base Branch)

On `agent-codex-pipeline-realism-maximal-spec-v1`:

1. Cherry-pick worker commits from Tracks 1–6 in order.
2. Update:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
    - link the new sections (authoring, validation, visualization)
    - link units/catalog/versioning
    - link migration slices
    - ensure artifact lists match `artifact-catalog.md`
  - `docs/projects/pipeline-realism/resources/decisions/README.md`
    - include D08r and D09r as canonical
3. Sanity checks:
  - no duplicate deck.gl architecture doc created
  - validation vs visualization separation is explicit
  - morphology/hydrology stage naming + artifact IDs match current canonical docs/code

## Acceptance Criteria

- D08r packet + evidence + spec section exists and is maximal-only and physics-first.
- D09r packet + evidence + spec section exists and separates validation/observability from visualization.
- Visualization/tuning section exists with stable `dataTypeKey`s, referencing canonical deck.gl docs.
- Units/scaling, artifact catalog, schema/versioning docs exist and are consistent with the SPEC and each other.
- Migration slices exist (prepare/cutover/cleanup) with deletion targets and gates.
- Stack integration memo exists and pipeline-realism docs/plans are updated to reflect recent Morphology/Hydrology/Coastal/Wind/Current changes (or explicitly documented as “no change needed”).

