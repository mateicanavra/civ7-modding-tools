<toc>
  <item id="purpose" title="Purpose"/>
  <item id="start-here" title="Start here (choose your path)"/>
  <item id="routing" title="Routing map (Diátaxis)"/>
  <item id="status" title="Status + drift posture"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# MapGen

## Purpose

This is the canonical documentation entrypoint for the MapGen system (core SDK, pipeline/recipe model, domains, and MapGen Studio integration).

This doc routes you into the correct doc type (tutorial / how-to / reference / explanation), plus the policy rails that keep the docs “target-architecture-first” without inventing APIs.

## Start here (choose your path)

- If you want to **run MapGen end-to-end**: start in `docs/system/libs/mapgen/tutorials/TUTORIALS.md`.
- If you want to **change or extend MapGen** (add a step/op/artifact/tag): start in `docs/system/libs/mapgen/how-to/HOW-TO.md`.
- If you want the **exact SDK and pipeline contracts**: start in `docs/system/libs/mapgen/reference/REFERENCE.md`.
- If you want the **why / architecture / model**: start in `docs/system/libs/mapgen/explanation/EXPLANATION.md`.
- If you are writing docs or code and want the “rules of the road”: start in `docs/system/libs/mapgen/policies/POLICIES.md`.
- If you are an **AI agent** and want curated pointers: start in `docs/system/libs/mapgen/llms/LLMS.md`.

## Routing map (Diátaxis)

MapGen has multiple reader modes. We use a Diátaxis-aligned structure:

- Tutorials: learning-oriented, end-to-end flows
- How-to: task-oriented, “I need to do X”
- Reference: contract-oriented, complete and precise
- Explanation: understanding-oriented, architecture + rationale

This is a routing-only scaffold. Content is built out incrementally.

## Status + drift posture

This doc spine is target-architecture-first (engine-refactor-v1), while remaining correct by making current drift explicit when needed.

Hard rules:
- Do not guess contracts. If a claim can’t be anchored to code/spec, treat it as an open question.
- Prefer published package entrypoints in docs/examples; avoid workspace-only aliases like `@mapgen/*`.
- Visualization (deck.gl pipeline viz) is **current canon**; do not create competing viz docs.

## Ground truth anchors

Primary alignment artifacts for this doc spine:

- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md`
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-PROPOSAL.md`
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-IMPLEMENTATION-PROPOSAL.md`

