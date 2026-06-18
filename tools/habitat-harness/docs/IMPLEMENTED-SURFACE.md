# Habitat Implemented Surface

This document records the durable surface that now exists in the Habitat
toolkit. It is written as current-state reference, not as a commit log.

## Established Outcome

Habitat now provides a credible repo-local structural substrate for agents
working in this Civ7 codebase:

- one CLI entrypoint for structural checks and local hook delegation;
- normalized Habitat diagnostics over heterogeneous tools;
- shrink-only baseline contracts;
- graph-owned Nx target integration;
- project-plane boundary enforcement;
- Biome hygiene routing;
- GritQL source-shape checks;
- guarded Grit apply transactions for approved codemods;
- staged file-layer protection for generated/protected zones;
- classification of paths and diffs into owning projects, rules, and targets;
- two Nx generators for supported uniform projects and Grit rule lifecycle
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

- command classes live under `tools/habitat-harness/src/commands`;
- `bin/dev.ts` runs source commands for local development;
- `bin/run.js`, `dist/**`, and `oclif.manifest.json` are generated/built
  runtime artifacts;
- command tests cover command argument forwarding and output behavior.

Deep Habitat Phase 3 compatibility is recorded in
`docs/projects/habitat-harness/deep-refactor/D0-public-contract-inventory.md`.
Later refactor packets must consult that ledger before moving or narrowing
command, DTO, package export, root script, Nx target, generator, or hook
surfaces.

## Nx Graph Ownership

Implemented graph integration:

- Habitat inference plugin loaded from `nx.json`;
- inferred aggregate `habitat:check:all` for one-pass full Habitat graph checks;
- inferred `habitat:check` per rule owner;
- inferred `habitat:rule:<rule-id>` aliases;
- inferred repo-wide `boundaries`, `biome:*`, `grit:check`, and
  `generated:check`;
- root scripts normalized onto Nx graph entrypoints instead of manual task
  chaining;
- package-local scripts kept leaf-local where possible.

The key result is that Habitat checks participate in the Nx DAG instead of
living as loose repo scripts.

## Enforcement Layers

Implemented owner tools:

- `habitat-native`
- `wrapped-script`
- `grit-check`
- `nx-boundaries`
- `biome`
- `file-layer`
- `wrapped-test`

Implemented rule state:

- 51 registered rules;
- 49 enforced;
- 2 advisory;
- locked and debt-carrying baselines modeled explicitly;
- selector validation for unknown, wrong-namespace, and empty-intersection
  rule selections.

## Grit Pattern Work

Implemented diagnostic/check state:

- 31 active Habitat check patterns;
- matching 31 registered `grit-check` rules;
- fixture tests for Grit pattern validity;
- Grit adapter normalization over machine JSON output;
- injected-probe and cache/failure handling tests;
- Effect-backed process boundary for the Grit adapter.

Implemented apply state:

- two apply pattern files exist;
- one apply pattern is wired into `habitat fix`;
- apply transactions have clean-worktree protection for live writes;
- apply transactions produce proof artifacts and fail closed on ambiguous
  output, unapproved paths, creates, deletes, and unexpected file changes.

## Generators

Implemented `project` generator:

- supported kinds: `foundation`, `plugin`, `app`;
- canonical roots and package names enforced;
- root collision and package-name collision checks;
- generated scratch projects are covered by Nx discovery tests.

Implemented `pattern` generator:

- candidate-only generation by default;
- active registration requires Pattern Authority Manifest acceptance;
- registered promotion validates baseline and rule-introduction contracts;
- registered promotion writes active Grit pattern plus rule-pack entry;
- hook-scoped rules require manifest/invocation agreement.

## Hooks and Local Feedback

Implemented:

- Husky delegators for pre-commit and pre-push;
- resource submodule state checks;
- staged generated-zone checks;
- partial-staging refusal before formatting;
- staged Biome formatting and restaging for formatter-touched files;
- staged Grit checks;
- affected pre-push verification.

Hooks are intentionally local feedback. CI and explicit graph proof remain the
authority for review and merge confidence.

## Proof Coverage

Current tests cover:

- command forwarding and command JSON behavior;
- rule selection;
- baselines and baseline integrity;
- classification;
- Grit adapter behavior;
- Grit apply transaction behavior;
- generated/protected zones;
- hooks;
- project generator behavior;
- pattern generator behavior;
- Pattern Authority Manifest validation;
- Effect parity and process boundary behavior;
- workspace tool discovery and proof artifact construction.

These proofs establish Habitat as an enforcement and orchestration substrate.
They do not prove broad MapGen authoring generation.
