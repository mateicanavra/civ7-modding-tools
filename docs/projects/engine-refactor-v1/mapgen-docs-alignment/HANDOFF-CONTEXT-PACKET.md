<toc>
  <item id="purpose" title="Purpose"/>
  <item id="tldr" title="TL;DR (what to do next)"/>
  <item id="where" title="Where the canonical docs live"/>
  <item id="invariants" title="Critical invariants (do not regress)"/>
  <item id="workflow" title="Workflow + tooling"/>
  <item id="current-state" title="Current stack state (high level)"/>
  <item id="next-work" title="Next work (cleanups + parity)"/>
  <item id="gotchas" title="Gotchas"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Handoff context packet: MapGen docs alignment + follow-up cleanup

## Purpose

This packet is meant to onboard a fresh agent so they can continue MapGen docs work without rediscovering context or
reintroducing architecture regressions.

## TL;DR (what to do next)

Immediate follow-ups:

1) **Viz parity patch (post-merge)**  
   - The viz implementation stack (`dev-viz-v1-*`) is still moving; once it stabilizes, reconcile canonical viz docs:
     - match UI terminology (`layer` → `dataType`, `projection` → `renderMode`),
     - confirm paths/symbols in `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`,
     - and update `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md` if workflows changed.

2) **Docs sweep + deprecation manifest execution**  
   - Use `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md` as the working manifest.
   - Decide which candidate docs are `archive` vs `keep/update/route`, then execute moves/routers as a slice using Python scripts for bulk moves.

3) **Link normalization / lightweight backlinks (optional)**  
   - If desired, implement `docs/projects/engine-refactor-v1/mapgen-docs-alignment/LINKING-BACKLINKS-PROPOSAL.md` as Slice 14A/14B.

## Where the canonical docs live

Canonical MapGen docs:

- Gateway (start here): `docs/system/libs/mapgen/MAPGEN.md`
- Tutorials: `docs/system/libs/mapgen/tutorials/TUTORIALS.md`
- How-to: `docs/system/libs/mapgen/how-to/HOW-TO.md`
- Reference: `docs/system/libs/mapgen/reference/REFERENCE.md`
- Explanation: `docs/system/libs/mapgen/explanation/EXPLANATION.md`
- Policies: `docs/system/libs/mapgen/policies/POLICIES.md`
- AI-agent entrypoint: `docs/system/libs/mapgen/llms/LLMS.md`
- Canonical viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

Project alignment artifacts (planning/audit; not the “product docs”):

- Prompt: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/PROMPT.md`
- Spike synthesis: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md`
- Claims audit directive: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SLICE-12A-CLAIMS-AUDIT-DIRECTIVE.md`
- Claims ledger: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/claims-ledger/CLAIMS-LEDGER.md`
- Examples plan (Slice 12B): `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SLICE-12B-CONCRETE-EXAMPLES-PROPOSAL.md`

## Critical invariants (do not regress)

Architecture posture:
- Do not “invent” architecture via docs. Maintain separation of:
  - **WHAT IS** (anchored to current code), vs
  - **WHAT SHOULD BE** (anchored to authoritative workflow/spec docs).

Known canonical decisions encoded in docs:
- `Env` is the canonical run boundary. `RunSettings` is legacy naming only (router acceptable).
- Gameplay absorbs Narrative + Placement; do not present Narrative/Placement as target-canonical MapGen domains.
- Deck.gl visualization pipeline is **current canon** (implemented). Do not fork competing viz docs.

Docs conventions:
- Do not edit `docs/_sidebar.md` (auto-generated).
- Canonical pages start with a mini XML `<toc>`.
- Canonical pages include “Ground truth anchors” (except explicit “legacy router” stubs).

## Workflow + tooling

Repo uses Graphite stacks (small, reviewable slices):
- Each slice should be its own stacked branch/PR (avoid mega PRs).
- During `gt sync`/`gt submit`, accept restacks and branch deletions (normal cleanup as merges happen below).

Useful commands:
- View stack: `gt log --stack`
- Sync + restack: `gt sync`
- Submit current branch (non-interactive): `gt submit`
- Docs linter: `bun run lint:mapgen-docs`

Code-intel:
- `narsil-code-intel` MCP may be unavailable (“Transport closed”). Fallback to `rg` + direct file reads.

## Current stack state (high level)

As of the end of Slice 12B:
- Slice 12A resolved P0/P1 drift via claims ledger + corrective patches.
- Slice 12B upgraded how-tos/tutorials with runnable commands and minimal anchored code excerpts, including:
  - trace + viz dump replay workflow,
  - Studio worker seam snippets,
  - runnable tutorials.

If you need exact branch/PR numbers, run `gt log --stack` in the active worktree.

## Next work (cleanups + parity)

1) **Viz parity patch**  
   - Wait for the viz implementation stack (`dev-viz-v1-*`) to stabilize/merge.
   - Reconcile canonical docs to match the merged UI naming and any contract changes:
     - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
     - `docs/system/libs/mapgen/reference/VISUALIZATION.md`
     - `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`

2) **Repo-wide docs sweep / archive execution**  
   - Populate and execute `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md`.
   - Goal: prevent agents from discovering old project docs and treating them as canonical usage instructions.

3) **Ecology refactor readiness**  
   - For the ecology domain rework, prefer:
     - canonical MapGen docs for “how to work in the system”, plus
     - the engine-refactor workflow plan docs for “target modeling workflow”.
   - Do not let “current ecology implementation docs” silently define the target architecture.

## Gotchas

- Studio “presets” vs “schema defaults”: Studio currently defaults pipeline config using schema defaults, not a curated preset catalog. Docs should reflect reality.
- Viz “layer” terminology is in flux: current Studio UI code is trending toward “dataType/renderMode/variant”; avoid hardcoding UI labels until the viz stack merges.
- Don’t mass-edit links or archive content without a manifest and a Python-scripted move (bulk operations policy).

## Ground truth anchors

- Canonical MapGen gateway: `docs/system/libs/mapgen/MAPGEN.md`
- Canonical viz: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Authority posture: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SLICE-12A-CLAIMS-AUDIT-DIRECTIVE.md`
- Deprecation sweep manifest: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md`
