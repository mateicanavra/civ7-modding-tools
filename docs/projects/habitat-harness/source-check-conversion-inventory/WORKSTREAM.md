# Habitat Rule/Adapter Inventory Workstream

Status: active inventory workstream

Branch: `agent-DRA-habitat-source-check-conversion-inventory`

## Objective

Build a complete, parseable inventory of all Habitat rule records and all
centralized source-check adapters so the next implementation slice can extract
the best candidates into Grit pattern authority.

This workstream does not convert rules, edit packet metadata, delete adapters,
or change execution behavior. It classifies current authority and execution
surfaces so the following turn can make those moves mechanically.

## Source Order

Use this order when sources disagree:

1. Current user direction for this workstream.
2. `.habitat/FRAME.md`, `.habitat/AUTHORITY.md`, and
   `.habitat/AUTHORITY-TREE-SHAPE.md`.
3. Current `.habitat/**/*.rule.json` records and adjacent authority files.
4. Centralized source-check adapters in
   `.habitat/_support/execution/source-check/adapters/`.
5. Execution-surface analytics under
   `docs/projects/habitat-harness/execution-surface-map/`.
6. Current `tools/habitat` source and provider behavior.
7. Older project notes and history as discovery material only.

Current adapter shape is evidence, not authority. `rule-runtime.policy.mjs` and
the `.rule.mjs` adapters are deletion targets after their legitimate predicates
are ported or dispositioned.

## Row Schema

Every row in `corpus.jsonl` and `lanes/*.jsonl` must be valid JSON with these
fields:

- `ruleId`
- `lane`
- `rulePath`
- `adapterPath`
- `ownerTool`
- `authorityFiles`
- `predicateSummary`
- `currentExecutionSurface`
- `gritFeasibility`
- `primaryDisposition`
- `splitRequired`
- `confidence`
- `evidenceRefs`
- `notes`

Allowed `primaryDisposition` values:

- `grit_pattern_authority`
- `data_driven_import_path_rule`
- `package_local_test_or_validator`
- `delete_or_demote`
- `needs_split`

## Classification Rules

Prefer `grit_pattern_authority` when the predicate is structural source
matching, import/export legality, identifier/property/call matching,
path-scoped code shape, or a markdown/source pattern that Grit can express.

Choose `data_driven_import_path_rule` only when a generic import/path/source
schema would delete more state than individual Grit patterns.

Choose `package_local_test_or_validator` when the oracle is runtime behavior,
API behavior, package validation semantics, command output correctness,
generated runtime output, or live integration behavior.

Choose `delete_or_demote` when the row is triage-only, transitional ledger
material, compatibility residue, duplicate enforcement, stale orphan support,
or not worth enforcing.

Choose `needs_split` when one rule mixes predicates with different owners,
proof classes, or implementation strategies.

## Agent Lanes

Each lane owns only its paired files under `lanes/`:

- `mapgen-domain`: `.habitat/civ7/mapgen/domain/**`
- `mapgen-pipeline`: `.habitat/civ7/mapgen/pipeline/**`
- `mapgen-other`: `.habitat/civ7/mapgen/{core,map-output,sdk,studio,visualization}/**`
- `platform-resources`: `.habitat/civ7/{platform,resources}/**`
- `global-docs-toolkit`: `.habitat/{global,docs,habitat}/**`
- `adapter-crosswalk`: `.habitat/_support/execution/source-check/adapters/**`
  as a crosswalk/review lane. These rows duplicate adapter facts for review and
  are not merged into canonical `corpus.jsonl` as extra rule rows.

Each agent must inspect every assigned rule record and every assigned or
related adapter. No sampled sweeps.

## Stages

1. Open the workstream: create schema, artifact home, source order, and
   stop conditions.
2. Mechanically extract the corpus from filesystem truth.
3. Calibrate Grit capability using official docs before classifying rows.
4. Run six lane agents with disjoint artifacts.
5. Review coverage and quality findings.
6. Synthesize `matrix.md` and `next-grit-extraction-slices.md`.

## Stop Conditions

Stop and reframe if:

- a rule record cannot be parsed;
- an adapter imports behavior outside the centralized source-check runtime that
  changes the classification model;
- a lane cannot account for every assigned row;
- a non-Grit disposition lacks evidence;
- an agent treats current `.rule.mjs` existence as target architecture.
