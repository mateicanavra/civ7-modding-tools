# Agent Briefs

Status: active packet prompts

All agents work in:

```text
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame
```

Decision line:

```text
determine which mods/mod-swooper-maps/src/domain/narrative/** paths and
symbols are live, which owner controls the live material, and which unused
material can be deleted.
```

Shared hard core:

- The domain blueprint applies generatively by kind.
- `domain/narrative/**` is current source evidence for liveness and ownership.
- Current paths are evidence, not architecture authority.
- Destinations come from existing law or a named later owner-law domino.
- Artifact output is the working space; memory-only conclusions are insufficient.

## Authority Mapper

Prompt:

```text
You are the Authority Mapper for the Habitat active workstream decision packet.
Work read-only in the checkout path above.

Read:
- .habitat/.active/workstreams/domain-closed-structure-dominoes/slices/002-prework-decision-qualification/frame.md
- .habitat/.active/workstreams/domain-closed-structure-dominoes/slices/002-prework-decision-qualification/single-prework-decision-frame.md
- .habitat/.active/workstreams/domain-closed-structure-dominoes/decision-book/*.md
- .habitat/.active/workstreams/domain-closed-structure-dominoes/scopes/domain/**/*.md
- docs/system/ADR.md
- docs/system/mods/swooper-maps/architecture.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- any docs found by rg for narrative, story, gameplay, and placement that materially affect owner boundaries.

Return a markdown artifact body for corpus/architecture-authority.md. Include
authority order, controlling decisions, owner criteria, exact source docs read,
and implications for narrative/story, placement, recipe/stage, domain, adapter,
and deletion.
```

## Source Corpus Mapper

Prompt:

```text
You are the Source Corpus Mapper. Work read-only in the checkout path above.

Build corpus/narrative-source-inventory.md for:
- every file under mods/mod-swooper-maps/src/domain/narrative/**
- collars connected by imports/exports/callers: domain barrels, recipe/stage
  references, placement/gameplay/story references, tests, and related public
  exports.

Use rg/find/sed. For each row include current role, exported symbols when
practical, local imports, external importers/callers, and initial evidence tag.
Expand globs. Keep row-level obligations visible. Return markdown only.
```

## Narsil Graph Tracer

Prompt:

```text
You are the Narsil Graph Tracer. Work read-only in the checkout path above.

Use mcp__narsil_code_intel_civ7 symbol/reference/call tools with repo
civ7-modding-tools. Use find_references, get_callers, get_callees, and code
graph tools where useful. Hybrid search is outside this packet.

Trace:
- storyTagStrategicCorridors
- storyTagOrogenyBelts
- publishStoryOverlay
- getStoryOverlay
- STORY_OVERLAY_KEYS
- NarrativeConfigSchema
- narrative domain/root exports if tool support allows

Return evidence/narsil-graph.md with exact tool calls, relevant results,
interpretation, and limitations.
```

## Dead-Code Auditor

Prompt:

```text
You are the Dead-Code Auditor. Work read-only in the checkout path above.

Check whether KNIP is configured or available. Use existing installation or
bunx, with no fix mode. Capture commands and relevant output around narrative,
story, placement, recipe/stage collars, and dead exports/files.

Return evidence/knip-dead-code.md. Separate raw KNIP findings from steward
interpretation. Capture limitations caused by missing repo-specific KNIP config.
```

## Owner Classifier

Prompt:

```text
You are the Owner Classifier. Consume the authority, source, Narsil, and KNIP
artifacts. Produce synthesis/disposition-table.md.

For each narrative path or symbol and each connected collar path, assign one
outcome:
- delete with consumer proof;
- qualified for Domino 001 with exact destination;
- recipe/stage-owned with exact owner path;
- domain-owned with governing scope/file law;
- Gameplay/story-artifact owner-law domino.

Each row needs liveness, owner, action, evidence strength, and governing
authority. Directory-only destinations are not sufficient.
```

## Adversarial Reviewer

Prompt:

```text
You are a fresh adversarial reviewer. Read the completed packet. Check for
invented destinations, generic buckets, current-path authority, weak liveness
claims, missed collars, stale historical docs treated as target authority, and
rows hidden by grouping.

Return findings for reviews/review-findings.md. Findings must cite packet paths
and the evidence that would repair them.
```

## Process And Preservation Reviewer

Prompt:

```text
You are a fresh process and preservation reviewer. Read the completed packet.
Check whether it answers the selected prework decision, preserves row-level
obligations, records Narsil and KNIP evidence, separates raw evidence from
interpretation, and keeps all results in the decision packet.

Return findings for reviews/review-findings.md. Findings must be actionable and
classed as P1, P2, or P3.
```
