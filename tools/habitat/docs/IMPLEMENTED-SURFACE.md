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
- registered-authority fix admission and no-write planning;
- staged file-layer protection for generated/protected zones;
- classification of paths and diffs into owning projects, rules, and targets;
- kind-scoped workspace generator support for uniform projects and candidate
  pattern drafting.

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

- command classes live under `tools/habitat/src/cli/commands`;
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
- explicit package-owned `lint` target for current Toolkit read-only checks,
  including CLI smoke, boundary taxonomy, and service-module shape;
- public-surface guard logic owned in Habitat source, with the root lint script
  serving as the current-tree rule wrapper;
- root scripts normalized onto workspace graph entrypoints instead of manual task
  chaining;
- package-local scripts kept leaf-local where possible.

The key result is that Habitat checks participate in the workspace DAG instead of
living as loose repo scripts.

## Enforcement Layers

Implemented runners:

- `grit`
- `habitat:structure`
- `habitat:script`
- `habitat:file-layer`
- `nx`

Implemented rule state:

- the live manifest corpus, lane mix, runner mix, and owner distribution are
  reported by the registry-loader query in
  [CAPABILITIES.md](CAPABILITIES.md#live-rule-inventory), rather than copied
  into this reference;
- that query validates and counts the whole registry corpus, while a given
  `habitat check` report describes only the rules selected and executed by that
  invocation;
- locked and debt-carrying baselines modeled explicitly;
- selector validation for unknown, wrong-namespace, and empty-intersection
  rule selections.

## Pattern Work

Implemented diagnostic/check state:

- Grit-backed source checks are rule manifests that point at pattern files rather than
  source-check modules or owner-tool records;
- fixture tests for pattern validity;
- Grit provider normalization over machine JSON output;
- cache/failure handling tests;
- Effect-backed process boundary for the Grit provider.

Implemented fix-admission and no-write planning state:

- registered Grit rules may atomically admit one plan-only pattern through
  `runner.fix`;
- `habitat fix --dry-run` plans all admitted rules or an explicit repeatable
  `--rule` selection without writing;
- unknown and unadmitted explicit selections refuse as a whole before provider
  execution;
- observed rewrites are successful affected-path evidence, not live fixes;
- non-dry `habitat fix` refuses before service or provider realization.

Live writes, formatting, post-fix gates, rollback, changed-file/diff records,
and commit-readiness are not implemented. The current fix surface is planning
only.

## Generators

Implemented `project` generator:

- supported kinds: `plugin`;
- canonical roots and package names enforced;
- root collision and package-name collision checks;
- unsupported project kinds refuse before writes.

Implemented `pattern` generator:

- candidate-only generation; its schema accepts no registered lifecycle state;
- active rules are authored and reviewed separately as `rule.json` authority;

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
- authority-derived fix admission, multi-rule planning, and early live-write refusal;
- generated/protected zones;
- hooks;
- project generator behavior;
- pattern generator behavior;
- workspace-owned tool command materialization without executing native vendor
  binaries for availability checks;
- public-surface guard model coverage through injected in-memory fixture files;
- process boundary behavior;
- workspace tool discovery and verification receipt construction.

These tests cover Habitat's enforcement and orchestration behavior. They do not
cover current workspace topology by resolving the live graph; that validation is
owned by graph targets such as `lint`, `boundary`, and `source:check`.
