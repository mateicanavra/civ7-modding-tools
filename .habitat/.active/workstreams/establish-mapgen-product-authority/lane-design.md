# Product Authority Framing Lane Design

## Team Shape

This investigation uses an orchestrator-plus-specialists shape. The lead owns synthesis, evidence policy, and final judgment. Lane agents own bounded corpus reads and write one live artifact each. Reviewers own final adversarial findings.

Agents are fresh and stateless. No agent may rely on prior session memory or prior agent threads. Agents may write only their assigned artifact file under `.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/`.

## Lane Output Contract

Each lane artifact must include:

- sources processed
- key extracts or tight paraphrases
- interpretation
- provenance
- conflicts or contradictions
- confidence/authority status
- open questions
- candidate claims for final synthesis

A summary without provenance is not acceptable.

## Prompt Quality Criteria

Each prompt is designed for sub-agent mode:

- one bounded job
- stateless context
- repo path and no-mutation scope restated
- artifact path named
- source scope named
- relevant skills named
- exact search/read method stated
- convergence rule stated
- return contract stated

## Lane 1 Prompt: Product Intent And Design Philosophy

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: extract product intent, design philosophy, and desired guarantees for MapGen/Swooper Maps from canonical product docs and accepted project authority.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/product-intent.md

Read and use these skills before acting: civ7-product-authority, civ7-architecture-authority, cognition:investigation-design. Use their source-order/evidence rules.

Source scope:
- AGENTS.md
- docs/PRODUCT.md
- docs/SYSTEM.md
- docs/system/ARCHITECTURE.md
- docs/system/libs/mapgen/MAPGEN.md
- docs/system/libs/mapgen/reference/GLOSSARY.md
- docs/system/libs/mapgen/reference/STANDARD-RECIPE.md
- docs/system/mods/swooper-maps/vision.md
- docs/system/mods/swooper-maps/architecture.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md

Method:
1. Read the sources deeply enough to identify product intent, design philosophy, and guarantees.
2. Record claims as accepted authority, intended-but-not-built, source-only, stale/superseded, or open.
3. For each claim, include path provenance and a tight paraphrase or short extract.
4. Note contradictions and stale pressure rather than resolving them by vibes.

Stop when you have processed the assigned sources and can name the load-bearing product claims future Layer 2 packet authors need.

Final return contract: confirm the artifact path you wrote, list the top 5-10 claims, list unresolved conflicts, and list any high-leverage source you could not inspect.
```

## Lane 2 Prompt: Architecture Topology And Import Boundaries

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: extract architecture topology, owners, non-owners, import boundaries, and package/module separation relevant to MapGen/Swooper Maps rule remediation.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/architecture-boundaries.md

Read and use these skills before acting: civ7-architecture-authority, civ7-product-authority, cognition:investigation-design.

Source scope:
- AGENTS.md and relevant subtree AGENTS files for packages/mods you inspect
- docs/system/ARCHITECTURE.md
- docs/system/libs/mapgen/explanation/ARCHITECTURE.md
- docs/system/libs/mapgen/policies/IMPORTS.md
- docs/system/libs/mapgen/policies/MODULE-SHAPE.md
- docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md
- docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md
- docs/system/libs/mapgen/reference/domains/DOMAINS.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- source roots sufficient to check constructibility: packages/mapgen-core/src, packages/mapgen-viz/src, packages/sdk/src, packages/civ7-adapter/src, mods/mod-swooper-maps/src/domain, apps/mapgen-studio/src

Method:
1. Build a compact owner/non-owner map.
2. Trace import/boundary rules that appear authoritative.
3. Compare docs to source shape only enough to mark constructible vs contradicted.
4. Identify broader positive authorities that would absorb local negative import rules.

Stop when the assigned authority docs and representative source anchors have been processed enough to identify accepted boundaries, intended boundaries, contradictions, and likely stale claims.

Final return contract: confirm the artifact path you wrote, list owner/non-owner claims, positive-boundary candidates, contradictions, and missing high-leverage sources.
```

## Lane 3 Prompt: Engine Refactor V1 Hidden Authority

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: excavate hidden or partially promoted product/architecture authority from engine-refactor-v1 materials without treating every old note as current truth.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/engine-refactor-v1-authority.md

Read and use these skills before acting: civ7-architecture-authority, civ7-product-authority, cognition:investigation-design. Do not build an ontology in this lane. Only record naming/identity commitments that appear in accepted or decision-grade engine-refactor-v1 materials; Lane 5 owns ontology modeling.

Source scope:
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- docs/projects/engine-refactor-v1/PROJECT-engine-refactor-v1.md
- docs/projects/engine-refactor-v1/deferrals.md
- docs/projects/engine-refactor-v1/architecture-normalization-sources/*.md
- additional issue/archive docs only when directly linked from the primary files above or found by this exact search:
  `rg -n "(artifact|config|stage|step|recipe|projection|domain operation|helper|authority|accepted|superseded)" docs/projects/engine-refactor-v1 docs/_archive .habitat --glob "*.md"`

Retrieval budget:
- Inspect at most 12 additional files beyond the primary set.
- Prefer files with explicit links from primary materials over name/search hits.
- Do not inspect general archives by intuition.

Method:
1. Classify each source as accepted baseline, decision evidence, review evidence, deferral, scratch, or archive/discovery before using it.
2. Extract authority claims and intended architecture from accepted/decision materials.
3. Record stale or superseded claims separately.
4. Flag positive authority candidates and naming/identity commitments.

Stop when the primary set is classified and the bounded additional pass produces no new accepted/decision authority category, or the 12-file budget is exhausted.

Final return contract: confirm the artifact path you wrote, list accepted/intended/stale claims, cite source paths, and call out hidden authority that should seed Layer 2 packets.
```

## Lane 4 Prompt: Source Code Reality And Constructibility

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: inspect source code to determine which authority claims are constructible, currently implemented, contradicted, or only aspirational.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/source-constructibility.md

Read and use these skills before acting: civ7-architecture-authority, civ7-product-authority, cognition:investigation-design.

Source scope:
- packages/mapgen-core/src/authoring/artifact/**
- packages/mapgen-core/src/core/types.ts
- packages/mapgen-core/src/**
- mods/mod-swooper-maps/src/**
- apps/mapgen-studio/src/browser-runner/**
- apps/mapgen-studio/src/recipes/**
- packages/mapgen-viz/src/**
- packages/sdk/src/**
- packages/civ7-adapter/src/**

Method:
1. Use rg and focused reads to locate constructs for artifacts, recipes, stages, steps, domains, operations, configs, dependency/effect tags, projection, Studio runtime, and helper surfaces.
2. Record constructibility evidence with file paths and symbol names.
3. Do not infer intended architecture from source alone; mark source-only claims clearly.
4. Identify source contradictions to docs and cases where source supports positive authority creation.

Stop when you can identify the main constructible authority surfaces and the main contradictions relevant to future Layer 2 packet work.

Final return contract: confirm the artifact path you wrote, list constructible authority surfaces, contradictions, source-only claims, and missing source areas.
```

## Lane 5 Prompt: Ontology And Authority Model

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: model the authority ontology needed for future Layer 2 rule-remediation decisions: identities, aliases, candidate kinds, bounded contexts, relationships, and evidence status.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/ontology-authority-model.md

Read and use these skills before acting: cognition:ontology-design, civ7-architecture-authority, civ7-product-authority, cognition:investigation-design.

Source scope:
- .habitat/.active/frames/BLUEPRINT-KIND-GATHERING-FRAME.md
- .habitat/.active/frames/RULE-ACTION-CLASSIFICATION-FRAME.md
- .habitat/.active/frames/RULE-DECISION-PACKET-FRAME.md
- .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
- docs/system/libs/mapgen/reference/GLOSSARY.md
- docs/system/libs/mapgen/reference/ARTIFACTS.md
- docs/system/libs/mapgen/reference/TAGS.md
- docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md
- docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md

Method:
1. Start from competency questions: what must packet authors decide, classify, admit, split, consolidate, delete, or defer?
2. Define identities and aliases only when they help those decisions.
3. Separate accepted authority from candidates, raw evidence, contradictions, and stale claims.
4. Pay special attention to artifact, dependency-tag, effect-tag, stage, step, domain, domain-operation, domain-operation-strategy, helper surface, config, projection, recipe, Studio runtime, and SDK/core.
5. Do not inspect source code in this lane. If implementation status matters, mark it as requiring Lane 4 source-constructibility evidence.

Stop when you can provide a compact authority model and candidate-kind map that avoids noun harvesting.

Final return contract: confirm the artifact path you wrote, list accepted concepts, candidates, aliases/merge risks, relationship semantics, and packet-decision implications.
```

## Lane 6 Prompt: Adversarial Contradiction And Stale-Intent Review

```text
You are a fresh, stateless lane agent for a Civ7 Modding Tools source/rule/code non-mutating investigation.

Repo path:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Your single job: adversarially identify contradictions, stale claims, overclaiming risks, and places where a positive authority assertion would be forced or duplicate an existing concept.

No-mutation scope: do not edit rule packets, Habitat rules, product source, generated output, or package tests. You may write only this artifact:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/.active/workstreams/establish-mapgen-product-authority/lane-artifacts/adversarial-review.md

Read and use these skills before acting: cognition:investigation-design, cognition:ontology-design, civ7-architecture-authority, civ7-product-authority.

Source scope:
- .habitat/.active/workstreams/establish-mapgen-product-authority/investigation-brief.md
- .habitat/.active/workstreams/establish-mapgen-product-authority/corpus-inventory.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
- docs/system/libs/mapgen/**/*.md, inspected through the search pass below
- source anchors only when needed to validate a specific contradiction already identified from the docs/action matrix

Method:
1. Read the brief, corpus inventory, architecture normalization packet, and action matrix first.
2. Run focused `rg` over `docs/system/libs/mapgen/**/*.md` for stale/contradiction signals: deprecated, superseded, archive, stale, TODO, contradiction, owner, owns, must, should, stage, artifact, domain, recipe, projection.
3. Inspect only files with direct hits or files named by the corpus inventory as current authority.
4. Inspect source anchors only for a named contradiction, and record the symbol/path that bears on it.
5. Hunt for claims that look normative but are stale, archived, contradicted, or source-only.
6. Identify local-proxy risks: niche-local rules that probably indicate missing broader authority.
7. Identify over-naming risks: multiple names for the same authority, or too-small concepts promoted to blueprint kind.
8. Record what evidence would overturn each concern.

Stop when every P1/P2 contradiction candidate from the first-pass corpus has either supporting provenance or a stated missing-evidence condition. Do not continue into general archive/code exploration.

Final return contract: confirm the artifact path you wrote, list P1/P2/P3 concerns, source paths, and recommended synthesis constraints.
```
