# Verification and Guardrails

This reference defines the minimum proof for domain-authoring changes:

- structural classification and policy enforcement;
- contract and behavior tests;
- project checks and builds;
- deletion scans; and
- behavioral or live-engine proof when output changes.

Habitat and Nx own executable proof. Do not substitute a project-era lint
wrapper or a hand-built parallel command graph for the current workspace task
graph.

## Classify first

Classify every unfamiliar or structurally changed path before editing:

```bash
bun habitat classify <path>
```

Treat the emitted kind, project, target, and rule metadata as routing facts.
Run every available target reported by classification. A target that
classification does not resolve is not a command to invent.

For a multi-file slice, classify representatives from every changed kind:
domain, module, operation, strategy, artifact, stage, and step as applicable.

## Structural guardrails

The active domain shape is:

- domain `contract.ts`, `router.ts`, and `index.ts`;
- direct semantic modules with the same three singular surfaces;
- module contracts that directly compose leaf operation contracts;
- module routers that directly bind leaf operation implementations; and
- an `ops/` directory containing only semantic operation directories.

The operation shape is:

- `contract.ts` owning shared input/output schemas and the complete semantic
  strategy-definition tuple;
- `index.ts` creating the executable operation;
- optional private `rules/`; and
- semantic strategy directories, each with `config.ts` and `index.ts`, plus
  one executable `strategies/index.ts` aggregate.

Guardrails must reject:

- a flat operation cabinet directly under a domain;
- extra operation registry files inside a module's `ops/` directory;
- operation envelope type bags or envelope-derived shared types;
- generic strategy identities or flat strategy implementation files;
- named re-exports of constituent operation contracts from aggregate surfaces;
- module-owned model vocabulary or artifacts hoisted to a domain-wide cabinet;
- cross-operation runtime calls;
- adapter, engine-runtime, recipe, ambient RNG, or projection-effect imports
  inside domain operations; and
- operation implementations imported directly by recipe steps.

## Step and artifact guardrails

Each step uses `config.ts` for `defineStep(...)` contract ownership and
`step.ts` for `createStep(...)` behavior.

- Step config declares exact operation contracts, artifact
  requirements/provisions, dependency/effect tags, and step-owned schema
  fields.
- Runtime receives operations and dependencies through
  `run(context, config, ops, deps)`.
- Runtime reads dimensions from `context.setup.dimensions`.
- Runtime reads and publishes only declared immutable products through
  `deps.artifacts`.
- Recipe stages order steps; they do not define domain artifact catalogs.

Artifacts stay with the exact domain module that produces them. Current engine
state remains invocation-local adapter observation, while metrics,
visualization, trace, and diagnostics remain evidence capabilities.

## Truth and projection guardrails

- Physics operations and physics step config do not reference or consume
  `artifact:map.*` or `effect:map.*`.
- Physics truth may be tile-indexed. The ban is on engine-facing ids, adapter
  coupling, and consuming materialized map state.
- Projection and materialization steps own `artifact:map.*`.
- Adapter writes provide a semantic `effect:map.<thing><Verb>` tag only after
  the write succeeds.
- Projection intent consumed by stamping is write-once before stamping begins.
- No realized-map artifact namespace is introduced.

## Documentation

Documentation is part of the correctness surface:

- exported operations, strategies, artifacts, step config contracts, and
  cross-file helpers have behavior-oriented JSDoc where the behavior is not
  self-evident;
- TypeBox fields have descriptions explaining behavioral impact and relevant
  interactions;
- semantic knobs state missing/empty/null and determinism behavior;
- callsites are traced before definition-site docs are changed; and
- one canonical model owns each rule. Project notes link to it rather than
  copying a competing architecture.

## Tests

Add at least one domain-local test for every new or materially changed
operation. Prefer the public domain router and the supported testing helpers:

- `runAdmittedOperationForTest` to exercise schema admission, config
  normalization, and execution;
- `normalizeOperationSelectionForTest` when a test needs admitted strategy
  config without running the operation; and
- exact output admission or artifact tests when a relational invariant matters.

Representative tests live under:

```text
mods/mod-swooper-maps/test/domains/<domain>/<module>/
```

Keep tests deterministic:

- use a fixed map-size fixture;
- derive or pass a fixed `rngSeed`;
- do not pass RNG callbacks across the operation boundary; and
- test weighted selection/config semantics directly when they are part of the
  contract.

If a slice changes an artifact edge between steps, add one thin recipe
integration test that proves declaration, publication, satisfaction, and
consumption. If it changes adapter-facing materialization, add the narrow
projection/materialization test plus live proof.

## Deletion scan

After consumer migration:

- remove retired entrypoints and compatibility exports;
- remove dead helpers, translators, empty folders, and unused config bags;
- remove direct imports that bypass public domain/module surfaces;
- remove alternate artifact authorities and stale recipe-owned catalogs; and
- search active docs and code for every retired path or symbol named in the
  slice plan.

Searches are evidence, not the architecture authority. A zero-result scan does
not replace Habitat policy or type checking.

## Nx proof

Run the smallest relevant operation or test while iterating. Before submission,
run all project proof in one Nx graph:

```bash
nx run-many -t check test build -p mapgen-core mod-swooper-maps
```

This invocation lets Nx own dependency freshness, ordering, caching, and
deduplication. Do not start nested Nx schedulers from Habitat or split
output-materializing targets into competing command graphs.

Run any additional targets emitted by `bun habitat classify`. For a
behavior-changing MapGen slice, finish with the relevant diagnostic generation
and live-engine verification workflow. Deployment, successful execution, log
markers, parity evidence, and in-game observation are stronger evidence than a
mock-only build.

## Completion

A domain slice is complete only when:

- structural policy passes;
- contract and behavior tests pass;
- checks and builds pass;
- migrated consumers use the public nested domain surface;
- retired authorities are deleted;
- active authoring docs describe the same model; and
- behavior-changing work has the strongest available live verification.
