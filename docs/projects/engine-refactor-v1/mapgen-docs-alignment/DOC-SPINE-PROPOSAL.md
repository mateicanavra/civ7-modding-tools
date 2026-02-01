<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="goals" title="Goals + success criteria"/>
  <item id="sources" title="External doc-writing sources consulted (Firecrawl)"/>
  <item id="principles" title="Principles (MapGen-specific)"/>
  <item id="audiences" title="Audience entrypoints (devs, authors, agents)"/>
  <item id="spine" title="Proposed canonical doc spine (tree)"/>
  <item id="page-contract" title="Page contract (AI-friendly + human-friendly)"/>
  <item id="content-mapping" title="Mapping from existing docs to the spine"/>
  <item id="drift-posture" title="Target-first posture (and how to handle drift)"/>
  <item id="rollout" title="Rollout plan (for a future agent team)"/>
</toc>

# MapGen canonical docs spine — proposal

## TL;DR

Use a Diátaxis-aligned spine (Tutorials / How-to / Reference / Explanation), but with MapGen-specific “policy rails” and AI-friendly structure:

- A single MapGen gateway doc at the library scope (`docs/system/libs/mapgen/MAPGEN.md`) that routes readers/agents into the right doc type quickly.
- Four subtrees under `docs/system/libs/mapgen/` (tutorials/how-to/reference/explanation) with short, narrow pages that each have:
  - a mini XML `<toc>` at the top,
  - explicit audience + purpose,
  - “ground truth anchors” (files/symbols/tests),
  - and an explicit target-vs-current status section when drift exists.
- A small “policy bundle” that prevents reintroducing multiple architectures in parallel (imports, compilation responsibility split, tag registry rules, artifact mutability posture, ops module boundary).

This proposal is target-architecture-first (engine-refactor-v1 specs/ADRs), while remaining *correct* by explicitly mapping unavoidable current-code drift.

## Goals + success criteria

### Goals

1) **One coherent MapGen mental model**
- A new contributor shouldn’t have to reconcile multiple architectures from scattered docs.

2) **First-class DX for two human roles**
- **Developers**: implement steps/ops, extend the SDK, integrate Studio, debug runs.
- **Authors**: tune recipes, knobs, presets, and “product-like” map configurations without spelunking code.

3) **First-class usability for AI agents**
- Agents should be able to quickly find “the one right doc” for a question and extract the precise contract without needing to infer it from prose.

4) **Target-first**
- Prefer the accepted engine-refactor-v1 posture (spec/ADR authority) and keep legacy implementation details quarantined as “current mapping notes”.

### Success criteria (acceptance)

- There is a stable top-level gateway page for MapGen that answers:
  - “How do I run a recipe end-to-end?”
  - “Where do I add a new step/op?”
  - “Where do I tune knobs/presets?”
  - “What is canonical vs derived (truth vs projection)?”
  - “What is target vs current drift (Env vs RunSettings; field vs buffer)?”
- Every doc page is clearly one of: tutorial, how-to, reference, explanation.
- There is a single canonical place for DX guardrails (import policy, schema/compile split, tags/artifacts, mutation posture).

## External doc-writing sources consulted (Firecrawl)

These were used to drive the information architecture and page-level writing contract:

- Diátaxis framework (documentation types): `https://diataxis.fr/`
- Google developer documentation style guide (clarity/consistency; “break rules for clarity”): `https://developers.google.com/style`
- Microsoft Style Guide (developer content: reference + code examples): `https://learn.microsoft.com/en-us/style-guide/developer-content/`
- Write the Docs — documentation principles (skimmable, exemplary, comprehensive, etc.): `https://www.writethedocs.org/guide/writing/docs-principles/`
- Write the Docs — Docs as Code (docs integrated with code workflow): `https://www.writethedocs.org/guide/docs-as-code/`
- llms.txt proposal (curated, machine-friendly doc indexes): `https://llmstxt.org/`

## Principles (MapGen-specific)

### 1) Diátaxis as the primary information architecture

MapGen has multiple reader “modes”. Diátaxis gives us a clean routing system:
- **Tutorials**: learning by doing (a guided path).
- **How-to**: accomplishing a specific task quickly (goal-oriented).
- **Reference**: authoritative contracts (schemas, APIs, IDs, invariants).
- **Explanation**: architecture and rationale (mental models, tradeoffs, “why”).

This avoids the common failure mode we have today: mixing architecture rationale, procedural steps, and API details into a single page (which becomes unusable for both humans and agents).

### 2) Target-first, but explicitly drift-aware

The spine should default to target architecture (engine-refactor-v1).
When drift exists, it must be handled with:
- a short, consistent “Current mapping” callout (same structure everywhere),
- and a pointer to the drift ledger / alignment status.

### 3) Treat “policy rails” as first-class canonical docs

MapGen’s most expensive failure mode is silent divergence: people reintroduce old patterns because docs don’t enforce guardrails.
So: policies are not “guidelines”; they are the rails that keep the system coherent.

### 4) Make “truth vs projection” a first-class model

Canonical docs must teach that:
- “truth” stages publish canonical artifacts (physics/world state),
- “projection” stages derive engine-facing fields/effects (gameplay surfaces),
- derived views/overlays are non-canonical debug convenience.

### 5) Optimize for skimmability + extraction (humans + agents)

Every page should be:
- narrow in scope,
- strongly sectioned,
- and anchored to ground-truth code locations.

## Audience entrypoints (devs, authors, agents)

We should support three “entrypoint maps” (each is mostly link routing, not new content):

1) **Developer entrypoint**
- “I need to implement or extend MapGen.”
- Routes to: how-to (tasks), reference (contracts), explanation (architecture).

2) **Author entrypoint**
- “I need to configure/tune maps.”
- Routes to: tutorial (run + tune), how-to (add knob/preset), reference (config schema and semantic knobs).

3) **Agent entrypoint**
- “I need machine-readable, curated pointers.”
- Routes to: a small “LLM index” page that lists the spine with 1–2 line descriptions and stable anchors.
  - This is conceptually aligned with the `llms.txt` proposal, but applied to our repo/doc tree.

## Proposed canonical doc spine (tree)

This is a proposal for the *future canonical location* under `docs/system/libs/mapgen/**` (evergreen).
It deliberately separates “doc type” (Diátaxis) from “topic”.

```text
docs/system/libs/mapgen/
  MAPGEN.md                         # Gateway: entrypoints + routing (canonical)

  tutorials/
    index.md
    run-standard-recipe-in-studio.md
    tune-a-preset-and-knobs.md
    implement-a-new-step-end-to-end.md

  how-to/
    index.md
    run-a-recipe-headless.md
    add-a-new-stage.md
    add-a-new-step.md
    add-a-new-op-contract.md
    add-a-new-artifact.md
    add-a-new-tag.md
    add-a-new-knob.md
    add-a-new-preset.md
    debug-with-trace-and-viz.md

  reference/
    index.md
    glossary.md                      # Canonical terms + ID prefixes
    run-settings.md                  # Target: RunSettings; maps to current Env
    recipe-schema.md                 # RecipeV2 schema + invariants
    stage-and-step-authoring.md      # Authoring API contracts
    config-compilation.md            # Schemas/defaults/normalize contract
    plan-compilation.md              # ExecutionPlan nodes, gating rules
    tags.md                          # TagRegistry, kinds, satisfaction model
    artifacts.md                     # Artifact contracts, publish/read, mutability posture
    ops-module-contract.md           # Op contract + strategy encoding + type export rules
    observability.md                 # runId/fingerprint/tracing contract
    adapter.md                       # Engine-coupled adapter capability reference
    standard-recipe.md               # Standard recipe: stage order, provides/requires summary

  explanation/
    index.md
    architecture.md                  # System map + ownership boundaries
    pipeline-model.md                # Truth vs projection; domains in the pipeline
    domain-modeling.md               # Ops/rules/strategies; boundaries
    determinism.md                   # Determinism + seeds + reproducibility
    mutation-model.md                # Artifacts vs fields/buffers; safe mutation patterns
    narrative-status.md              # Target narrative contract + current integration status
    studio-as-consumer.md            # Studio is reference consumer, not architecture authority

  policies/
    index.md
    imports.md                       # published entrypoints; forbid @mapgen/* in canon
    schemas-and-validation.md         # strict schemas; compiler-owned defaults
    dependency-ids-and-registries.md  # registered-only; fail-fast; collisions
    artifact-mutation.md              # write-once + buffer-handle exception rules
    module-shape.md                  # file layout and “no types export from rules”

  llms/
    index.md                         # curated, machine-first spine pointer (optional)
```

Notes:
- `MAPGEN.md` is the only required new canonical top-level page; the rest can be added incrementally.
- A separate `policies/` subtree is intentional: it’s where drift is prevented, not where it’s explained away.
- The `llms/` subtree is optional but recommended; it is the repo-native analogue of `llms.txt` (curated pointers, not prose).

## Page contract (AI-friendly + human-friendly)

Every page in the spine (tutorial/how-to/reference/explanation/policies) should follow a consistent “page contract”.
This is the key twist to make the docs maximally usable by both humans and agents.

### Required page structure (template)

1) Mini XML ToC at the top:
- Keep it short (major sections only).
- Use stable IDs.

2) “Purpose” (1–3 sentences)
- What the page is for, and what it is not for.

3) “Audience”
- One line: developer | author | both | agent.

4) “Ground truth anchors”
- Explicit links to authoritative code/spec entrypoints (paths and key symbols).
- This is how we keep “target-first” docs *correct* and prevent drift.

5) “Status”
- `target` | `current` | `mixed`.
- If `mixed`, include a consistent “Current mapping” block (short, structured).

6) The main content (Diátaxis-appropriate)
- Tutorials: numbered steps and checkpoints.
- How-to: prerequisite + task steps + verification.
- Reference: definitions, schemas, signatures, invariants.
- Explanation: rationale, architecture, tradeoffs.

### Strong recommendations for agent-friendliness

- Prefer deterministic, parseable structure over prose:
  - lists, tables, and stable headings.
- Use a consistent vocabulary glossary and link to it from every page.
- Avoid “floating” examples; tie examples to real code or tests.
- Keep “drift mapping” short and centralized; avoid repeating long drift details everywhere.

## Mapping from existing docs to the spine

This proposal is not asking to move files right now; it’s a content map for the build-out phase.

Existing strong docs that become explanation/reference inputs:

- `docs/system/libs/mapgen/architecture.md`
  - Maps to: `explanation/architecture.md` and `explanation/pipeline-model.md`
- `docs/system/libs/mapgen/hydrology-api.md`
  - Maps to: `reference/ops-module-contract.md` (pattern exemplar) and domain-linked reference
- `docs/system/libs/mapgen/realism-knobs-and-presets.md`
  - Maps to: `tutorials/tune-a-preset-and-knobs.md` + `reference/config-compilation.md`
- `docs/projects/engine-refactor-v1/resources/spec/**`
  - Maps to: primary authority for `reference/*`, `policies/*`, and `explanation/*`

Existing docs that become “studio-as-consumer” explanation inputs:

- `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
  - Maps to: `reference/adapter.md`

## Target-first posture (and how to handle drift)

Principle: **teach the target architecture**, and “bind it to reality” with explicit mapping.

Concretely:

- Prefer target terms in explanation/reference:
  - `RunSettings` (target) with an explicit mapping to `Env` (current).
  - `buffer/field` with a canonical glossary mapping until unified.
- Keep current-only details in:
  - “Current mapping” blocks, and
  - reference pages that explicitly describe the present code surface.
- Do not imply target features are implemented unless they are actually wired:
  - Narrative is the key example: target-canonical contract, current pipeline not wired.

## Rollout plan (for a future agent team)

This is a suggested phased build sequence using agents without losing coherence.

For the full execution plan (agent team setup + guardrails + slice-by-slice delivery), see:
`docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-IMPLEMENTATION-PROPOSAL.md`.

### Phase 0 — Scaffold (routing only)

- Create `docs/system/libs/mapgen/MAPGEN.md` as the gateway with:
  - entrypoints for dev/author/agent,
  - the Diátaxis routing map,
  - and a link to the “policy bundle”.

### Phase 1 — Stop-the-bleeding references

- Create minimal reference pages that eliminate the biggest sources of confusion:
  - `reference/run-settings.md`
  - `reference/tags.md`
  - `reference/config-compilation.md`
  - `policies/imports.md`
  - `explanation/narrative-status.md`

### Phase 2 — Tutorials + How-to

- Add the two core tutorials:
  - run standard recipe in Studio
  - tune preset/knobs
- Add a small set of high-frequency how-to pages:
  - add stage/step/op/artifact/tag
  - debug with trace/viz

### Phase 3 — Deepen explanation + domain indices

- Expand explanation pages and ensure domain docs are correctly routed, not duplicated.
- Add/verify “truth vs projection” and mutation model explanation pages.
