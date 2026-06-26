# Habitat Implemented Surface

This document records the durable surface that now exists in the Habitat
toolkit. It is written as current-state reference, not as a commit log.

## Established Outcome

Habitat now provides a credible repo-local structural substrate for agents
working in this Civ7 codebase:

- one CLI entrypoint for structural checks and local hook delegation;
- normalized Habitat diagnostics over heterogeneous tools;
- shrink-only baseline contracts;
- graph-owned target integration;
- project-plane boundary enforcement;
- formatter hygiene routing;
- Habitat pattern source-shape checks;
- guarded Habitat apply transactions for approved codemods;
- staged file-layer protection for generated/protected zones;
- classification of paths and diffs into owning projects, rules, and targets;
- two workspace generators for supported uniform projects and pattern lifecycle
  scaffolding.

This is meaningful platform-substrate work. It makes many architecture and
tooling failures visible, routable, and graph-owned.

It does not, by itself, satisfy the stronger authoring-workflow outcome:
"an agent can ask Habitat to create a new MapGen recipe/domain/op/stage/step
and receive correct runnable structure."

## CLI and Entrypoints

Implemented commands:

- `check`
- `verify`
- `classify`
- `fix`
- `graph`
- `hook`

Implemented root aliases:

- `habitat`
- `habitat:check`
- `habitat:fix`
- graph-owned root `lint`, `verify`, and `check`

Implemented command qualities:

- command classes live under `tools/habitat-harness/src/host/commands`;
- `bin/dev.ts` runs source commands for local development;
- `bin/run.js`, `dist/**`, and `oclif.manifest.json` are generated/built
  runtime artifacts;
- command tests cover command argument forwarding and output behavior.

## Workspace Graph Ownership

Implemented graph integration:

- Habitat inference plugin loaded by the workspace graph;
- inferred aggregate `habitat:check:all` for one-pass full Habitat graph checks;
- inferred `habitat:check` per rule owner;
- inferred `habitat:rule:<rule-id>` aliases;
- inferred repo-wide boundary, formatter, pattern, and generated-zone checks;
- explicit package-owned `validate:boundary-taxonomy` target for current
  workspace taxonomy validation;
- explicit package-owned `validate:grit-patterns` target for checked-in
  Habitat/Grit pattern fixture validation;
- public-surface guard logic owned in Habitat source, with the root lint script
  serving as the current-tree rule wrapper;
- root scripts normalized onto workspace graph entrypoints instead of manual task
  chaining;
- package-local scripts kept leaf-local where possible.

The key result is that Habitat checks participate in the workspace DAG instead of
living as loose repo scripts.

## Enforcement Layers

Implemented owner tools:

- native checks
- wrapped scripts
- pattern checks
- project boundaries
- formatter hygiene
- file protection

Implemented rule state:

- 49 registered rules;
- 48 enforced;
- 1 advisory;
- locked and debt-carrying baselines modeled explicitly;
- selector validation for unknown, wrong-namespace, and empty-intersection
  rule selections.

## Pattern Work

Implemented diagnostic/check state:

- 34 registered source-check rules;
- 34 source-check rule modules under
  `tools/habitat-harness/src/core/domains/source-check/rules`;
- shared source-check helper runtime under
  `tools/habitat-harness/src/core/domains/source-check/rule-runtime.mjs`;
- fixture tests for pattern validity;
- Grit provider normalization over machine JSON output;
- cache/failure handling tests;
- Effect-backed process boundary for the Grit provider.

Implemented apply state:

- two apply pattern files exist;
- one apply pattern is wired into `habitat fix`;
- apply transactions have clean-worktree protection for live writes;
- apply transactions produce transaction records and fail closed on ambiguous
  output, unapproved paths, creates, deletes, and unexpected file changes.

## Generators

Implemented `project` generator:

- supported kinds: `plugin`;
- canonical roots and package names enforced;
- root collision and package-name collision checks;
- unsupported project kinds refuse before writes.

Implemented `pattern` generator:

- candidate-only generation by default;
- active registration requires accepted pattern manifest state;
- registered promotion validates baseline and rule-introduction contracts;
- registered promotion writes active Habitat pattern plus rule-pack entry;

## Hooks and Hook Check

Implemented:

- Husky delegators for pre-commit and pre-push;
- resource submodule state checks;
- staged generated-zone checks;
- partial-staging refusal before formatting;
- staged formatting and restaging for formatter-touched files;
- staged pattern checks;
- affected pre-push verification.

Hooks are workstation checks. CI and explicit graph checks remain the
review and merge confidence.

## Test Coverage

Current tests cover:

- command forwarding and command JSON behavior;
- rule selection;
- baselines and baseline integrity;
- classification;
- Grit provider behavior;
- Habitat apply transaction behavior;
- generated/protected zones;
- hooks;
- project generator behavior;
- pattern generator behavior;
- pattern manifest Manifest validation;
- workspace-owned tool command materialization without executing native vendor
  binaries for availability checks;
- public-surface guard model coverage through injected in-memory fixture files;
- process boundary behavior;
- workspace tool discovery and verification receipt construction.

These tests cover Habitat's enforcement and orchestration behavior. They do not
cover current workspace topology by resolving the live graph; that validation is
owned by graph targets such as `validate:boundary-taxonomy`, `boundaries`, and
`source:check`.
