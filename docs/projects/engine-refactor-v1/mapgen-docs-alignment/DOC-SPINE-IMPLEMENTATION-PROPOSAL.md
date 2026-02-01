<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="scope" title="Scope + non-goals"/>
  <item id="inputs" title="Inputs + ground truth"/>
  <item id="path-roots" title="Path roots (variables)"/>
  <item id="known-current" title="Known current-canonical surfaces (viz is current)"/>
  <item id="strategy" title="Implementation strategy"/>
  <item id="team" title="Agent team model (roles + guardrails)"/>
  <item id="roster" title="Recommended agent roster + ownership"/>
  <item id="workflow" title="Workflow + coordination protocol"/>
  <item id="slices" title="Slices (full build-out plan)"/>
  <item id="qa" title="QA + correctness checks"/>
  <item id="risks" title="Risk register + mitigations"/>
  <item id="open-questions" title="Open questions (do not guess)"/>
  <item id="hardening" title="Hardening pass (do we need it?)"/>
  <item id="appendix-agent-prompts" title="Appendix: agent prompts"/>
  <item id="appendix-checklists" title="Appendix: checklists"/>
</toc>

# MapGen canonical doc spine — implementation proposal (build-out plan)

## TL;DR

We’re ready to **start filling out** the canonical MapGen doc spine, but doing it well requires:

1) **A strict “policy + reference first” approach** (stop the bleeding, prevent drift).
2) A **small multi-agent team** producing pages in parallel **with one integrator** enforcing a single mental model and page contract.
3) A **slice plan** that creates reviewable, Graphite-friendly layers (each slice = one PR/branch; no mega-PR).

This proposal is the “how we execute” companion to:
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-PROPOSAL.md`
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md`

## Scope + non-goals

### Scope

Build the **future evergreen, canonical** MapGen doc set under `docs/system/libs/mapgen/**`, aligned to:
- engine-refactor-v1 target architecture and DX
- Diátaxis (tutorial/how-to/reference/explanation)
- explicit “policy rails” to prevent reintroducing parallel architectures
- AI-friendly structure (mini XML `<toc>`, ground truth anchors, consistent drift handling)

### Non-goals (for this build-out phase)

- Refactoring MapGen runtime code to match docs (docs should be target-first but drift-aware).
- “Perfect prose” polish (we harden later; initial goal is correctness + routing + contracts).
- Rewriting every legacy page immediately (we gate legacy cleanup behind correctness-first canon).
- Touching auto-generated nav (`docs/_sidebar.md`).

## Inputs + ground truth

### Authority order (hard rule)

1) engine-refactor-v1 canonical specs/ADRs (target posture)
2) the actual code (current reality)
3) existing docs (treated as non-authoritative until proven accurate)

### Primary inputs (must be referenced in pages via anchors)

- Spike synthesis: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md`
- Drift ledger: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/drift-ledger.md`
- Target model notes: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/target-architecture.md`
- Current model notes: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/current-architecture.md`
- Policies: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/policies.md`
- Pipeline model: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/pipeline.md`
- Studio seams: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/studio.md`
- Domain contracts: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/domains-*.md`

## Path roots (variables)

Use these path roots in the future evergreen docs (to keep anchors readable and stable):

```text
$MAPGEN_DOCS = docs/system/libs/mapgen
$MAPGEN_SPIKE = docs/projects/engine-refactor-v1/mapgen-docs-alignment
$MAPGEN_SCRATCH = $MAPGEN_SPIKE/scratch

$MAPGEN_LIB = packages/mapgen-core
$MAPGEN_STUDIO = packages/mapgen-studio
$MAPGEN_VIZ = packages/mapgen-viz
```

## Known current-canonical surfaces (viz is current)

### Visualization pipeline (deck.gl) is now current + canonical

This plan treats MapGen visualization as **present-day, current architecture**, not “future ambition”.

Current canonical doc (until migrated into the new spine location):
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

Hard rule for build-out:
- Any “trace/viz” or Studio visualization guidance must reflect this current deck.gl posture.
- Do not write a second competing “viz architecture” doc; instead, route into the canonical one and migrate it into the spine in a dedicated slice.

## Implementation strategy

### Why “Reference + Policies first”

Right now, MapGen has a predictable failure mode: if we publish tutorials/how-tos before we publish the hard contracts, we will accidentally:
- encode current drift as “the way”,
- reintroduce alias/import patterns that fracture the ecosystem,
- and create docs that are “true for one branch of the architecture”.

So we execute in this order:

1) **Gateway + routing skeleton**
2) **Policies (rails)**
3) **Reference (contracts, schemas, identifiers, invariants)**
4) **How-to (tasks)**
5) **Tutorials (learning journeys)**
6) **Explanation (architecture + rationale)**
7) **Legacy mapping + deprecation/archival pass**

## Agent team model (roles + guardrails)

### Recommendation: multi-agent team + single integrator

This is not a safe “one agent writes everything” job if we want correctness and speed.
There are too many concurrent axes (SDK + pipeline + domains + Studio + authoring) and too much drift risk.

Proposed model:

- **Integrator (me / one owner)**:
  - owns the canonical mental model, terms, and doc spine coherence
  - owns final edits/QA for every page
  - enforces the page contract and drift posture
  - slices work into Graphite-friendly PRs

- **Peer agents (writers/researchers)**:
  - each owns a bounded subtree (e.g., “Hydrology reference”, “SDK reference”, “Studio how-tos”)
  - writes pages to spec (page contract) and cites anchors into code/spec
  - does not merge policies/terminology unilaterally; proposes changes via notes

### Guardrails (non-negotiable)

1) **No implied truth**
- If a claim isn’t anchored, it isn’t canonical.

2) **Target-first, drift-aware**
- Every page must either be:
  - target-only (no drift), or
  - target + a short “Current mapping” section, or
  - explicitly labeled “Legacy / superseded” and routed away from.

3) **No architecture mixing**
- Do not blend “old pipeline” patterns with target patterns in the same instructions.

4) **Import + entrypoint policy**
- Prefer published entrypoints (see spike policy notes); avoid internal aliases in docs unless explicitly labeled internal.

5) **Mini XML ToC at top**
- Every new canonical page follows the same `<toc>` pattern as the spike artifacts.

6) **Sidebar is auto-generated**
- Never edit `docs/_sidebar.md`.

## Recommended agent roster + ownership

This roster is designed to minimize merge conflicts and maximize coherence.

**Integrator (single owner)**
- Owns: terminology, policy language, drift posture, routing correctness, and final QA.

**Peer agents (bounded file ownership per slice)**
- Agent `SDK+RunBoundary`: `reference/{SDK-OVERVIEW,RUN-BOUNDARY,ARTIFACT-KINDS,STEP-AND-OP-CONTRACTS}.md`
- Agent `Pipeline+Recipe`: `reference/{PIPELINE,STANDARD-RECIPE,STAGES}.md`
- Agent `Domains`: `reference/domains/*.md` (split by domain when needed)
- Agent `Studio+Viz`: viz migration slice + `how-to/*viz*` + `reference/STUDIO-INTEGRATION.md`
- Agent `Authoring`: `reference/recipe-schema.md` + authoring/tutorials/how-tos for knobs/presets

## Workflow + coordination protocol

### Semantic preservation (hardening posture)

This plan is hardened for execution. It must:
- **not change the objective** (fill out the canonical MapGen docs spine),
- **not quietly decide unresolved contracts** (flag as open questions),
- and **make implicit work explicit** (acceptance, verification, ownership, ordering).

### Branching + slicing (Graphite)

- Each slice is its own stacked branch + PR.
- Agents can work in parallel, but we avoid merge conflicts by:
  - assigning disjoint file ownership per slice, and
  - having the integrator land changes into the slice branch after review.

**Branch naming convention**
- `docs-mapgen-spine-<slice>-<slug>`

**Per-slice workflow**
- Integrator creates the slice branch (stacked) and adds empty routing stubs if needed.
- Peer agents implement within their assigned subtree and deliver a patchset for review.
- Integrator merges into the slice branch, runs the QA checklist, and restacks as needed.

### File ownership

Ownership is per slice; within a slice, each agent has exclusive ownership of a subtree.
No two agents edit the same file in the same slice.

### “Definition of done” for a page

A page is “done” for the slice when it has:
- mini XML `<toc>`
- purpose + audience
- links to upstream routing pages (gateway + relevant subtree index)
- ground truth anchors (code/spec paths + named symbols or IDs)
- drift posture section (if applicable)
- a small “Common mistakes” or “Footguns” section when relevant

## Slices (full build-out plan)

This section enumerates **all slices**, not just “slice 1”.
Each slice is intended to be a reviewable layer with clear acceptance criteria.

```yaml
steps:
  - slice: "00"
    mode: sequential
    description: Scaffold + routing stubs (no claims).
  - slice: "01"
    mode: sequential
    after: ["00"]
    description: Policy rails (imports, tags, compilation split, mutability).
  - slice: "02"
    mode: sequential
    after: ["01"]
    description: Core SDK reference surfaces + run boundary.
  - slice: "03"
    mode: sequential
    after: ["02"]
    description: Pipeline + standard recipe reference (two compilation layers; truth vs projection).
  - slice: "03B"
    mode: sequential
    after: ["03"]
    description: Viz (deck.gl) canonical routing + migration; prevent forking.
  - slice: "04"
    mode: parallel
    after: ["03"]
    description: Domain reference contracts (split across agents by domain).
  - slice: "05"
    mode: parallel
    after: ["04"]
    description: Dev how-tos (add step/op/artifact/tag, debug).
  - slice: "06"
    mode: sequential
    after: ["05"]
    description: Dev tutorials (run end-to-end, inspect artifacts/projections).
  - slice: "07"
    mode: sequential
    after: ["01", "03"]
    description: Authoring/tuning tutorial + how-tos (knobs/presets).
  - slice: "08"
    mode: sequential
    after: ["03"]
    description: Explanation/rationale (engine-refactor-v1 posture).
  - slice: "09"
    mode: sequential
    after: ["03B"]
    description: Studio seam docs aligned to current pipeline + viz posture.
  - slice: "10"
    mode: sequential
    after: ["00", "01", "02", "03", "03B", "04", "05", "06", "07", "08", "09"]
    description: Legacy routing + archival pass (no ambiguity left).
```

### Slice 00 — Create the evergreen scaffold (routing skeleton)

**Goal:** Create the canonical directories + stub pages, with correct routing and minimal content.

**Deliverables (new):**
- `docs/system/libs/mapgen/MAPGEN.md` (gateway)
- `docs/system/libs/mapgen/policies/`
- `docs/system/libs/mapgen/reference/`
- `docs/system/libs/mapgen/how-to/`
- `docs/system/libs/mapgen/tutorials/`
- `docs/system/libs/mapgen/explanation/`

**Acceptance:**
- You can reach any leaf page from the gateway in ≤ 3 clicks.
- Every stub page follows the page contract.

**Verification (docs correctness)**
- `rg -n "MAPGEN\\.md" docs/system/libs/mapgen` (ensure gateway exists and links are consistent)
- Manual: open `docs/system/libs/mapgen/MAPGEN.md` and click through to each subtree index (no dead links)

### Slice 01 — Policy rails (the guardrail bundle)

**Goal:** Publish the “rails” that prevent parallel architectures from reappearing.

**Deliverables (examples):**
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/system/libs/mapgen/policies/ARTIFACTS-AND-TAGS.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`
- `docs/system/libs/mapgen/policies/MUTABILITY-AND-OWNERSHIP.md`

**Acceptance:**
- Every policy has explicit “Allowed / Disallowed” and “Why” sections.
- Policies point to code/spec anchors and to the drift ledger when needed.

**Verification**
- Manual: every policy page contains a “Ground truth anchors” section and at least one concrete anchor.

### Slice 02 — Reference: SDK surface + run boundary

**Goal:** Make the SDK contract discoverable and unambiguous.

**Deliverables (examples):**
- `docs/system/libs/mapgen/reference/SDK-OVERVIEW.md`
- `docs/system/libs/mapgen/reference/RUN-BOUNDARY.md` (RunSettings vs Env drift called out)
- `docs/system/libs/mapgen/reference/ARTIFACT-KINDS.md` (field vs buffer drift called out)
- `docs/system/libs/mapgen/reference/STEP-AND-OP-CONTRACTS.md`

**Acceptance:**
- Reference pages are contract-first (no tutorial prose).
- Every exported concept has at least one anchor (symbol or schema ID).

**Verification**
- `rg -n "Ground truth anchors" docs/system/libs/mapgen/reference` (expect anchors everywhere)
- Manual: “Run boundary” page explicitly calls out `RunSettings` ↔ `Env` drift with a pointer to the drift ledger.

### Slice 03 — Reference: pipeline + standard recipe contract

**Goal:** Document “the one real pipeline” (target) and how the standard recipe maps today.

**Deliverables (examples):**
- `docs/system/libs/mapgen/reference/PIPELINE.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/STAGES.md` (truth/projection; responsibility split)

**Acceptance:**
- Explicitly teaches the two compilation layers (config vs plan).
- Explicitly teaches truth vs projection and artifact publication rules.

**Verification**
- Manual: “Standard recipe” page includes stage order and a “current wiring” caveat where needed (Narrative).

### Slice 03B — Visualization (deck.gl pipeline) migration + canonical routing

**Goal:** Treat visualization as first-class, current canon; route the spine to the deck.gl posture and remove ambiguity.

**Deliverables:**
- Migrate/reshape existing canon into the spine (choose one):
  - move `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` → `docs/system/libs/mapgen/how-to/visualize-pipeline-deckgl.md`, or
  - keep file but add a canonical routing pointer from `how-to/debug-with-trace-and-viz.md` and the gateway.
- Add a small reference page describing the “viz contract” surface:
  - `docs/system/libs/mapgen/reference/visualization.md`

**Acceptance:**
- There is exactly one canonical deck.gl visualization doc; all “viz” links route to it.
- The gateway and debugging how-to both reference the same viz posture.

**Verification**
- `rg -n "pipeline-visualization-deckgl" docs/system/libs/mapgen` (ensure routing exists and is not duplicated)

### Slice 04 — Reference: domains (per-domain contracts)

**Goal:** Publish per-domain “what this stage owns” and the artifacts it produces/consumes.

**Deliverables (examples):**
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` (explicitly notes current wiring status)

**Acceptance:**
- Each domain page has a machine-scannable “Inputs/Outputs” section.
- Each domain page states ownership boundaries and invariants.

**Verification**
- Manual: each domain page has an explicit “Provides / Requires” summary.
- Manual: Narrative page explicitly states “current wiring status” (wired vs not wired) and does not imply activation.

### Slice 05 — How-to: SDK extension tasks (developer)

**Goal:** The “I’m implementing MapGen” workflow is easy and safe.

**Deliverables (examples):**
- `docs/system/libs/mapgen/how-to/add-a-step.md`
- `docs/system/libs/mapgen/how-to/add-an-op.md`
- `docs/system/libs/mapgen/how-to/add-a-new-artifact-tag.md`
- `docs/system/libs/mapgen/how-to/debug-a-run.md`

**Acceptance:**
- Every how-to has a working checklist and points to reference contracts.
- No how-to introduces a new concept without linking to reference.

**Verification**
- Manual: every how-to ends with a “Verification” section with commands or observable outcomes.

### Slice 06 — Tutorial: run end-to-end (developer)

**Goal:** A new engineer can run MapGen end-to-end with a clear mental model.

**Deliverables (examples):**
- `docs/system/libs/mapgen/tutorials/run-a-standard-recipe.md`
- `docs/system/libs/mapgen/tutorials/inspect-artifacts-and-projections.md`

**Acceptance:**
- Tutorial uses stable entrypoints and avoids internal imports.
- Tutorial explicitly calls out where drift exists.

**Verification**
- Manual: tutorials reference the canonical viz posture (deck.gl) when they mention visualization.

### Slice 07 — How-to + Tutorial: authoring & tuning (author)

**Goal:** An author can tune maps without needing SDK internals.

**Deliverables (examples):**
- `docs/system/libs/mapgen/how-to/tune-realism-knobs.md`
- `docs/system/libs/mapgen/reference/CONFIG-SCHEMA.md` (or equivalent)
- `docs/system/libs/mapgen/tutorials/tune-a-preset-and-compare-results.md`

**Acceptance:**
- Authoring docs only reference SDK internals when absolutely necessary.
- Tuning docs are parameter/semantics-driven, not implementation-driven.

**Verification**
- Manual: tuning docs never instruct authors to import internal modules.

### Slice 08 — Explanation: architecture + rationale (engine-refactor-v1)

**Goal:** Capture “why this architecture exists” without contaminating reference/how-to.

**Deliverables (examples):**
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/explanation/TRUTH-VS-PROJECTION.md` (rationale complementing policy)
- `docs/system/libs/mapgen/explanation/PIPELINE-COMPILATION.md`

**Acceptance:**
- Explanation pages link down to reference/policies, not the other way around.

### Slice 09 — Studio integration seam (developer)

**Goal:** Studio is documented as the canonical consumer without drifting.

**Deliverables (examples):**
- `docs/system/libs/mapgen/how-to/integrate-mapgen-studio-worker.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`

**Acceptance:**
- Seam docs reference the current best end-to-end example path(s).
- No outdated UI/legacy workflow is presented as canonical.

**Verification**
- Manual: Studio docs refer to current pipeline/viz posture; if a legacy UI is mentioned, it is explicitly labeled legacy.

### Slice 10 — Legacy page routing + archival pass

**Goal:** Remove ambiguity by clearly marking superseded pages and routing to canon.

**Deliverables:**
- Add “This page is superseded; go here instead” headers to old pages, or move them to `_archive` as appropriate.
- Update gateway routing to prefer new canon.

**Acceptance:**
- No legacy page is reachable without a “superseded” label or redirect.
- Canon pages do not link into legacy pages except via explicit “history” pointers.

## QA + correctness checks

### Integrator QA checklist (per slice)

- Terminology consistent with target architecture (as captured in the spike)
- Drift callouts are consistent and point to the drift ledger
- Imports/entrypoints follow policy
- Every page has anchors into code/spec
- Diátaxis separation: tutorial/how-to/reference/explanation are not mixed
- Cross-links form a navigable graph (no orphan pages)

### Minimal validation (optional but recommended)

For pages that claim runnable flows, run the referenced commands once (or mark as “unverified” if not runnable in the current environment).

### Repo-wide sanity (optional)

- `bun run lint` (ensure docs changes don’t break lint rules, if configured)

## Risk register + mitigations

1) **Risk: parallel architectures reappear via tutorials**
- Mitigation: tutorials/how-tos are gated behind policies + core reference slices; integrator enforces link discipline and import policy.

2) **Risk: “viz” forks into two competing docs**
- Mitigation: explicit viz migration slice (03B) and a hard “one canonical viz doc” rule.

3) **Risk: agents guess contracts**
- Mitigation: anchors are mandatory; unresolved items become “open questions” rather than prose guesses.

4) **Risk: docs drift out of sync with code**
- Mitigation: every reference page includes “ground truth anchors”; drift callouts link to the drift ledger; hardening pass tightens wording.

## Open questions (do not guess)

These are the known ambiguity points that must be escalated before we publish tutorial guidance.

- Is the long-term target naming `RunSettings` (spec) vs `Env` (code) going to converge via code change, or remain a docs-only mapping for a while?
- Is the artifact kind vocabulary going to converge to `buffer:*` or `field:*`, and what is the canonical “buffer-handle exception” wording?
- For Narrative: what is the explicit “not wired yet” contract we want exposed to users (status, roadmap pointer, gating rules)?

## Hardening pass (do we need it?)

Yes — we should plan one explicit hardening pass after Slice 02–04 land (policies + core reference).

Reason:
- those pages establish the “language law” of MapGen docs,
- and any mistakes will propagate into every tutorial and how-to.

Hardening pass outcomes:
- tighten contracts to remove ambiguity,
- replace soft language with enforceable invariants,
- ensure every anchor resolves cleanly,
- ensure drift callouts are complete (RunSettings/Env, artifact kinds, and any other ledger items).

## Appendix: agent prompts

### Bootstrap prompt (peer agent)

Use this verbatim when spinning up a peer agent for build-out:

- You are a peer agent writing canonical MapGen documentation under `docs/system/libs/mapgen/**`.
- You must follow the doc spine and page contract in `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-PROPOSAL.md`.
- You must treat `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md` as the authoritative alignment report, especially drift posture and policies.
- Visualization is **current canon**: follow the deck.gl posture described in `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` (or its migrated equivalent in the spine).
- Every page you write must start with a mini XML `<toc>` and include “ground truth anchors” (code/spec filepaths + symbols/IDs).
- Be target-architecture-first (engine-refactor-v1); if current code drifts, add a short “Current mapping” block and point to the drift ledger.
- Do not edit `docs/_sidebar.md`.
- Do not invent APIs; if you can’t anchor a claim, flag it as a question for the integrator.

### Task prompt template (peer agent)

Fill in bracketed fields:

> Scope: Write/upgrade the following pages: [paths].
> 
> Success criteria:
> - Each page follows page contract
> - Anchors for every contract claim
> - Drift callouts added where needed
> - Links to/from gateway + relevant subtree index
> 
> Out of scope:
> - Editing unrelated docs
> - Introducing new policies without integrator review
> 
> Deliver back:
> - A short list of “open questions / ambiguous contracts” with pointers to code/spec.

## Appendix: checklists

### Page contract quick checklist

- `<toc>` present
- “Purpose” section
- “Audience” section
- “Ground truth anchors” section
- “Target posture” (and optional “Current mapping”)
- Links: gateway + related reference/policy pages
