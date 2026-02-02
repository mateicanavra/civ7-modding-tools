<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="goal" title="Goal"/>
  <item id="authority" title="Authority model (no unplanned decisions)"/>
  <item id="scope" title="Scope + non-goals"/>
  <item id="deliverables" title="Deliverables (ledger + patches)"/>
  <item id="team" title="Multi-agent team setup"/>
  <item id="workflow" title="Workflow (fractal passes)"/>
  <item id="rubric" title="Claim rubric + states"/>
  <item id="hotspots" title="Known hotspots (fix drift, don’t regress)"/>
  <item id="handoff" title="Integrator handoff"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Slice 12A (pre-slice): claims audit + authority reconciliation directive

## TL;DR

We are not “undoing” the doc spine work. We are making it **correct**.

This slice is a **multi-agent claim audit** across the canonical MapGen docs (`docs/system/libs/mapgen/**`, excluding `_archive/**`), producing:
- a claim ledger that separates **what is** (current code) from **what should be** (target specs/phase modeling),
- a small set of **surgical patch PRs** that fix outright wrong statements or mis-framed “target” claims,
- and a decision-safe posture so future examples don’t encode accidental architecture regressions.

This slice exists because the doc spine landed routing + contracts first; it did not fully validate every interpretive claim against the most authoritative target docs.

## Goal

1) Identify and correct “quiet regressions” introduced by interpretation drift (example: treating `RunSettings` as target when **`Env` is intentionally canonical**).
2) Resolve “domain ownership drift” (example: Narrative/Placement being described as canonical domains when Phase 2 modeling states they are legacy or dissolve into Gameplay).
3) Produce a **reliable authority model** that lets us add concrete examples next without re-litigating architecture every time.

## Authority model (no unplanned decisions)

Hard rule: agents must not “decide architecture” while auditing claims. They must **classify claims** and attach anchors.

Priority order for truth:

1) **Target modeling + workflow authority (Phase 2 / domain-refactor workflow)**  
   Use when classifying “what should be” (target architecture, boundaries, bans).
2) **Non-archived canonical system docs** (`docs/system/**` excluding `_archive/**`)  
   Use for canonical posture and doc architecture rules.
3) **Current code**  
   Use when classifying “what is implemented today”.
4) **Archived docs/specs**  
   Use only as historical context. Never treat as target authority.

When two “target” sources disagree:
- Record a **Conflict** claim state with both anchors.
- Do not invent a third framing to “split the difference”.

## Scope + non-goals

### In scope

- All non-archive MapGen docs: `docs/system/libs/mapgen/**` excluding `_archive/**`.
- All high-impact interpretive claims:
  - naming (“target vs current”),
  - ownership boundaries (MapGen vs Gameplay),
  - “canonical domains” membership,
  - step/stage wiring semantics,
  - observability/viz/Studio posture.

### Out of scope

- Adding new tutorials/how-to code snippets (that is Slice 12B).
- Changing runtime architecture to match docs.
- Deep rewriting archived docs.

## Deliverables (ledger + patches)

### D1) Claims ledger (canonical)

Create a ledger that captures each claim as a row:

- `claimId` (stable id)
- `docPath` (where the claim is written)
- `quotedClaim` (verbatim sentence/fragment)
- `claimType` (naming / ownership / domain-boundary / API / behavior / workflow / other)
- `state` (see rubric)
- `anchors` (paths to target docs and/or code)
- `recommendedEdit` (1–3 sentences; minimal)
- `notes` (optional)

Ledger location:
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/claims-ledger/CLAIMS-LEDGER.md`

### D2) Patch set (surgical)

Produce *small* PRs that:
- convert incorrect “target” statements into “current vs target” notes,
- update pages that are plainly wrong against authoritative target modeling/workflow docs,
- and update glossary vocabulary so it does not imply architecture regressions.

Rule: don’t do broad rewrites inside this slice. Prefer minimal diffs that restore correctness and postpone exposition improvements to Slice 12B.

## Multi-agent team setup

Spawn peers; each agent owns one cluster:

- **Agent A — Run boundary + observability**: `reference/RUN-SETTINGS.md`, `reference/OBSERVABILITY.md`, trace/viz posture cross-check.
- **Agent B — Domains + ownership**: `reference/domains/**`, `reference/STANDARD-RECIPE.md`, boundary to Gameplay.
- **Agent C — Policies + glossary coherence**: `policies/**`, `reference/GLOSSARY.md`, import policy vs examples posture.
- **Agent D — Studio + visualization integration**: `reference/STUDIO-INTEGRATION.md`, `pipeline-visualization-deckgl.md`, `how-to/*studio*`, `how-to/*viz*`.
- **Agent E — Tutorials/how-to correctness (no new examples yet)**: ensure steps are accurate; flag where examples are missing for 12B.

Each agent must:
- write findings as ledger rows (not prose essays),
- attach anchors (code paths and/or authoritative target docs),
- propose minimal edits, not refactors.

## Workflow (fractal passes)

Each agent runs:

1) **Inventory pass**: list all claims in their cluster that contain “target posture” language, “should”, “canonical”, “domain”, “owned by”, or naming assertions.
2) **Anchor pass**: attach at least one authority anchor per claim (target doc or code).
3) **State pass**: assign the claim rubric state.
4) **Patch suggestion pass**: propose the smallest edit to make the page correct.

The integrator then:
- merges ledgers,
- de-duplicates repeated claims,
- executes the minimal patch PRs.

## Claim rubric + states

Each claim must be one of:

- **CURRENT-CORRECT**: correct vs code; anchored to code.
- **TARGET-CORRECT**: correct vs target modeling/workflow; anchored to target docs.
- **CURRENT-DRIFT**: doc claims X but code does Y (doc must be corrected or labeled “target”).
- **TARGET-DRIFT**: doc claims X as target but target docs disagree (doc must be corrected).
- **CONFLICT**: target sources disagree (requires an explicit decision later; doc should avoid prescriptive language).
- **OPEN-QUESTION**: cannot find an authoritative anchor; must be labeled explicitly as open.

## Known hotspots (fix drift, don’t regress)

These are intentionally called out because prior doc work likely made an interpretive choice that may be wrong:

### Hotspot 1: `Env` vs `RunSettings`

If target authority indicates `Env` is the canonical run boundary name, then:
- docs must not imply “migration back” to `RunSettings`,
- `RUN-SETTINGS.md` should be reframed (conceptual “run boundary” with `Env` as canonical).

### Hotspot 2: Narrative + Placement ownership

If Phase 2 modeling/workflow states that:
- narrative overlays are forbidden/legacy to delete/replace, and/or
- placement dissolves into Gameplay ownership,
then MapGen docs must not present “Narrative” or “Placement” as canonical MapGen domains in target posture.

Doc-safe posture:
- “Current wiring may include these stages; target modeling places them in Gameplay or removes them.”
- avoid “domain reference” voice if the target posture says the domain should not exist.

## Integrator handoff

Integrator responsibilities:
- enforce the authority model,
- keep changes surgical in 12A,
- ensure the linter (`bun run lint:mapgen-docs`) continues to pass,
- and produce a short “resolution summary” that Slice 12B will treat as authority for examples.

## Ground truth anchors

- Canonical doc spine root: `docs/system/libs/mapgen/MAPGEN.md`
- Claim-audit ledger root: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/claims-ledger/CLAIMS-LEDGER.md`
- Domain-refactor workflow authority: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
- Phase 2 modeling authority: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`
- Run boundary schema (current): `packages/mapgen-core/src/core/env.ts`
