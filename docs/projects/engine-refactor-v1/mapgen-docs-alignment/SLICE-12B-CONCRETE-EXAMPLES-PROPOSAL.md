<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="goal" title="Goal"/>
  <item id="prework" title="Prework (must complete 12A)"/>
  <item id="principles" title="Principles (examples that don’t rot)"/>
  <item id="deliverables" title="Deliverables"/>
  <item id="team" title="Multi-agent build-out plan"/>
  <item id="slices" title="Sub-slices (12B.1–12B.6)"/>
  <item id="qa" title="QA gates"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Slice 12B: concrete examples + code illustrations (make docs actually usable)

## TL;DR

After Slice 12A reconciles authority and corrects drift framing, Slice 12B upgrades the canonical MapGen docs from “organized + anchored” to “copy/paste usable” by adding:
- short, real code snippets (with file anchors),
- runnable commands,
- and end-to-end “golden paths” for extending/running/debugging MapGen.

## Goal

Make the docs useful to:
- SDK developers (extend steps/ops/contracts correctly),
- content authors (tuning/knobs/presets),
- and AI agents (extract correct patterns without hallucinating).

Success looks like:
- A new engineer can add a step or op in <30 minutes by following docs.
- A contributor can run a verbose trace + viz dump and inspect it in Studio.
- The docs do not reintroduce parallel architectures.

## Prework (must complete 12A)

12B must treat the Slice 12A outputs as authority:
- the claims ledger must have P0/P1 drift resolved,
- and any “target vs current” posture that affects examples must be explicit.

If we add examples before 12A, we will encode the wrong architecture and create high-cost rework.

## Principles (examples that don’t rot)

1) **Snippets are anchored to real files**  
   Each snippet includes:
   - the minimal excerpt (5–25 lines),
   - and a “see full file” pointer under Ground truth anchors.

2) **Prefer stable APIs**  
   Prefer public/published entrypoints (`@swooper/*`) in examples; avoid workspace-only aliases unless the doc is explicitly about internal development.

3) **Make “current vs target” explicit**  
   If an example is “current implementation”, label it as such and anchor it to code.
   If an example illustrates “target posture”, label it and anchor it to target modeling/workflow docs.

4) **Keep examples narrow**  
   One task per page. Avoid mega tutorials.

5) **Examples are verified**  
   Every page that introduces a workflow provides a verification step (`bun run …`).

## Deliverables

### D1) How-to pages become executable

Upgrade the how-tos under `docs/system/libs/mapgen/how-to/**` by adding:
- minimal code snippets,
- minimal commands to validate,
- and a “common failure modes” section with real error strings.

### D2) Reference pages include representative shapes

Upgrade contract reference pages to include:
- 1–2 representative code examples for schemas/contracts,
- and “what to grep for” guidance for agents.

### D3) Tutorials become true “golden paths”

Tutorials under `docs/system/libs/mapgen/tutorials/**` become end-to-end runnable:
- Studio run (live)
- Dump + replay (offline)
- Add a step end-to-end (optional if stable enough)

## Multi-agent build-out plan

This is a multi-agent job. Split by doc clusters; agents operate as peers and commit via a stack of sub-slices.

Ownership:
- **Agent How-to**: add code + commands to each how-to.
- **Agent Tutorials**: ensure tutorials are runnable and include screenshots-as-text guidance (no images required).
- **Agent Reference**: add code excerpts to contract docs (`defineStep`, `createStep`, tags, artifacts, plan compilation).
- **Agent Studio/Viz**: ensure debug/viz workflows are fully concrete (both streaming + dumps).
- **Integrator** (me): enforce vocabulary, import policy, and “no competing architectures”; ensure `bun run lint:mapgen-docs` still passes.

## Sub-slices (12B.1–12B.6)

Each is a stacked PR. Each sub-slice should be independently reviewable.

### 12B.1 — Step authoring “golden snippet”

Targets:
- `docs/system/libs/mapgen/how-to/add-a-step.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`

Adds:
- `defineStep` snippet (contract)
- `createStep` snippet (implementation)
- stage registration snippet

### 12B.2 — Op authoring “golden snippet”

Targets:
- `docs/system/libs/mapgen/how-to/add-an-op.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`

Adds:
- op contract + schema envelope snippet
- op module export shape snippet

### 12B.3 — Tags + artifacts workflow (with failure modes)

Targets:
- `docs/system/libs/mapgen/how-to/add-a-new-tag.md`
- `docs/system/libs/mapgen/how-to/add-a-new-artifact.md`
- `docs/system/libs/mapgen/reference/TAGS.md`
- `docs/system/libs/mapgen/reference/ARTIFACTS.md`

Adds:
- tag registry snippet
- artifact tag constant snippet
- “MissingDependencyError” / failure examples

### 12B.4 — Observability + viz debug workflow (fully concrete)

Targets:
- `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`
- `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

Adds:
- enabling trace verbosity snippet (`Env.trace` or whatever 12A confirms as canonical)
- dump harness invocation
- Studio dump viewer usage steps

### 12B.5 — Studio worker integration (concrete seam)

Targets:
- `docs/system/libs/mapgen/how-to/integrate-mapgen-studio-worker.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`

Adds:
- minimal worker message protocol snippet
- Transferables guidance snippet

### 12B.6 — Tutorial pass (runnable, verified)

Targets:
- all tutorials under `docs/system/libs/mapgen/tutorials/**`

Adds:
- exact command lines
- “what success looks like” checklists

## QA gates

For each sub-slice:

- `bun run lint:mapgen-docs` passes.
- Snippets are anchored (each includes full-file pointer).
- No new “target” claims without target authority anchor.
- Verify commands are real (no placeholders).

## Ground truth anchors

- Claim audit outputs (must be consumed first): `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/claims-ledger/CLAIMS-LEDGER.md`
- Canonical doc roots: `docs/system/libs/mapgen/`
- Docs QA linter: `scripts/lint/lint-mapgen-docs.py`
