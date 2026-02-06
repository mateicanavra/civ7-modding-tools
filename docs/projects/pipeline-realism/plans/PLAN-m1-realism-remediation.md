# PLAN — M1 Realism Remediation (Foundation ↔ Morphology ↔ Viz ↔ Authoring)

> Living plan. This document is intended to be updated continuously until remediation is complete.

## Narrative (Why)

Milestone M1 (“Pipeline Realism”) landed a large Foundation refactor intended to establish a **physics-first tectonic foundation** (ocean world + basaltic lid → differentiated continental crust over eras) and to have **Morphology** consume that tectonic history to generate coherent continents, mountain belts, and realistic landforms.

Current outcomes (as observed in the diagnostic spike) show degraded realism and poor visual coherence:
- “Spread-out” landforms rather than merged, tectonically grounded continents.
- Weak/opaque plate motion and era evolution in Studio.
- Missing or incomplete wiring between Foundation outputs and Morphology inputs.

This effort completes the wiring/contracts and upgrades the authoring + visualization experience while preserving the existing stage/step/recipe architecture.

## Precision (What)

<!-- Path roots -->
$CORE = packages/mapgen-core
$STUDIO = apps/mapgen-studio
$SWOOPER = mods/mod-swooper-maps
$PROJECT = docs/projects/pipeline-realism

### Goals (Success Criteria)

1) **Foundation realism**
   - Basaltic-lid initial state evolves into differentiated crust over eras with meaningful history/provenance.
   - Boundary mechanics emit tectonic events that **mutate crust truth**, producing non-degenerate deltas across eras.

2) **Morphology coherence**
   - Landmask is seeded from evolved crust + provenance projections and yields merged continents (not scattered blobs).
   - Belts/mountains are driven by a unified Morphology-owned belt-driver artifact derived from tectonic history/events.

3) **Studio DX + Viz**
   - Causal spine layers are visible and stable by default (mantle → forcing → motion → events → crust → belts → landmask).
   - Era scrubbing is first-class (ability to inspect evolution, not just final snapshots).
   - Authoring surface is physics-first with strict **knobs vs advanced config** separation and complete schema documentation.

### Non-Goals (Explicit)
- Do not re-architect the stage/step model (`$CORE/src/authoring/*`) beyond what is required for schema metadata and validation.
- Do not add “output sculpting” controls to authoring (no land% targets, painted belts, authored velocities).
- Do not introduce parallel legacy execution paths. Any required bridges must be temporary and removed in the cleanup slice.

### Normative Authoring Rules (Knobs vs Advanced)

**Knobs** (high-level UX):
- Semantic scalars that deterministically scale physics inputs.
- Must not encode painted outputs (no belts, no velocities, no land%).

**Advanced config** (physics-first levers):
- Initial conditions + constitutive parameters + simulation resolution/time horizon.
- Must not expose derived motion fields or derived shaping structures.

### Schema Documentation Guarantees

Foundation authoring surface MUST satisfy:
- Every advanced-config property has a `description`.
- `gs.comments` exists:
  - At Foundation schema roots and major subgroups (e.g. `profiles`, `advanced`, `advanced.budgets`, `advanced.lithosphere`, `advanced.mantleForcing`).
  - At property level where nuance/warnings matter (units, interactions, determinism).

### `gs.comments` (Schema + Studio)

We define a JSON-schema-safe extension keyword:
```ts
gs?: { comments?: string | string[] }
```

Studio must render:
- object/group `gs.comments` **above** the group content,
- scalar `gs.comments` as secondary help text distinct from `description`.

### Budgets / Era Controls

Budgets (e.g. `eraCount`) are treated as **physics time-horizon / simulation resolution** and live in:
- `foundation.advanced.budgets.eraCount` (range 1–8; default per profile/preset).

This requires reconciling D08r language that previously forbade author-controlled budgets while preserving bans on derived motion/belts authoring.

### Contract + Artifact Targets (High-level)

We expect to introduce/clarify canonical artifacts (final IDs subject to contract slice):
- `artifact:foundation.crustInit` (t=0 basaltic lid)
- `artifact:foundation.crust` (evolved crust truth)
- `artifact:foundation.tectonicEvents`
- `artifact:foundation.tectonicHistory` (era-indexed / scrubbable)
- `artifact:foundation.crustTiles.v2` (tile-space projection for Morphology)
- `artifact:morphology.beltDrivers` (Morphology-owned unified drivers)

### Work Slices (Graphite layers)

Workflow constraints:
- One Graphite branch per slice, stacked on the existing review stack.
- Avoid restack/resync; prefer `gt sync --no-restack` only when needed.
- Do **not** submit PRs yet.

```yaml
steps:
  - slice: 0
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-026-docs-m1-realism-remediation-plan"
    title: "docs(plan): remediation plan"
    status: done
    includes:
      - "$PROJECT/plans/PLAN-m1-realism-remediation.md"
      - "$PROJECT/resources/research/SPIKE-m1-foundation-realism-regression-2026-02-04.md (if untracked)"

  - slice: 1
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-027-studio-gs-comments-schema-doc-enforcement"
    title: "studio(schema): gs.comments + description enforcement"
    status: done
    includes:
      - "$STUDIO/src/features/configOverrides/rjsfTemplates.tsx"
      - "$STUDIO/test/config/*"

  - slice: 2
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-028-foundation-authoring-budgets-advanced-surface"
    title: "foundation(authoring): budgets + physics-first advanced surface"
    status: done
    includes:
      - "$SWOOPER/src/recipes/standard/stages/foundation/index.ts"
      - "$PROJECT/resources/spec/sections/authoring-and-config.md (D08r update)"

  - slice: 3
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-029-foundation-crust-evolution-crustInit-artifact"
    title: "foundation(runtime): crust evolution + event→truth wiring"
    status: done
    includes:
      - "$SWOOPER/src/domain/foundation/ops/**"
      - "$SWOOPER/src/recipes/standard/stages/foundation/steps/**"

  - slice: 4
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-030-morphology-beltDrivers-landmask-coherence"
    title: "morphology(runtime): beltDrivers + landmask coherence"
    status: done
    includes:
      - "$SWOOPER/src/domain/morphology/ops/**"
      - "$SWOOPER/src/recipes/standard/stages/morphology-coasts/**"
      - "$SWOOPER/src/recipes/standard/stages/map-morphology/**"

  - slice: 5
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-031-viz-causal-spine-era-scrubbing"
    title: "viz(foundation+morphology): causal spine defaults + era scrubbing"
    status: in-progress
    includes:
      - "$SWOOPER/src/** (dataTypeKey publishing)"
      - "$STUDIO/src/** (layer catalogs + UX)"

  - slice: 6
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-032-docs-schema-presets-pass"
    title: "docs pass: schema + presets alignment"
    status: done

  - slice: 7
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-033-testing-verification-suite"
    title: "testing pass: build/check/lint/deploy + targeted tests"
    status: done

  - slice: 8
    branch: "agent-URSULA-M1-LOCAL-TBD-PR-M1-034-cleanup-legacy-config-presets"
    title: "cleanup pass: remove legacy config/dual paths/presets"
    status: done
```

### Verification (Global)

End-state verification suite (run in the dedicated testing slice):
- Build
- Check
- Lint
- Deploy

Additionally, Studio verification must include:
- Confirm `description` and `gs.comments` appear in the config UI where expected.
- Confirm causal-spine layers are visible and meaningful (screenshots captured for review).

### Open Questions / Prework Prompts

- Confirm final artifact IDs and any unavoidable breaking contract boundaries (minimize churn while preserving correctness).
- Decide how era scrubbing is represented in artifacts and surfaced in Studio (schema vs UI-only timeline control).
- Confirm whether any legacy preset must remain supported for backward compatibility; default posture is “migrate all in-repo presets”.
- Studio verification: Chrome MCP tools currently fail with HTTP 400 for the MCP endpoint; if this persists, capture screenshots manually from the running Studio dev server.
