# Swooper Maps Test Topology

This file defines how Swooper Maps tests are classified and placed.
Core engine, SDK, adapter, and platform behavior belongs in the package that
owns it rather than in this mod's test tree.

## Ownership Roots

- `domains/<domain>` owns algorithm, rule, invariant, metrics, and benchmark
  behavior for Swooper Maps domains.
- `recipes/swooper-physics-standard/recipe` owns concrete recipe authorship,
  composition, and whole-recipe orchestration.
- `recipes/swooper-physics-standard/stages/<stage>` owns concrete stage
  authorship and orchestration. Step behavior lives under
  `stages/<stage>/steps`.
- `maps` owns the map catalog, map config, generated-map metadata,
  run-manifest, and file-plan behavior.
- `diagnostics` owns diagnostic and verifier component behavior.
- `build` owns behavior observable only in built artifacts.
- `support` contains non-owning helpers and fixtures. Shared setup does not
  transfer behavioral ownership to support code.

`@swooper/mapgen-metrics` owns pure count, summary, component, and target
evaluation contracts. The Standard recipe owns its scenario capture, map product
sample and cohort shapes, measurements, and concrete product targets under
`src/recipes/standard/metrics`; tests assert those shared targets rather than
hiding thresholds in test support. One captured generation may be evaluated by
multiple targets without rerunning it.

Classify a test by its SUT and behavioral owner. Execution labels such as unit,
integration, conformance, offline, and live do not create ownership roots.
Structural and import topology belongs to Habitat, not source-string tests.

## Test Claims

- Domain tests may exercise a stable algorithm unit directly when it has an
  independent mathematical or policy contract. Otherwise they exercise the
  public operation.
- Domain metrics and benchmarks evaluate domain outcomes across declared
  regimes or seed cohorts. They do not become recipe tests merely because a
  recipe supplies the fixture.
- Recipe, stage, and step tests own authorship and orchestration: selected
  operations, dependency chains, artifact flow, materialization, projection,
  and whole-recipe outcomes.
- A generic contract or runtime law is tested once by its owning SDK or engine.
  Concrete Swooper tests add only behavior that requires Swooper domain or
  recipe knowledge.

Tests must not freeze a complete config property inventory unless that exact
schema is the SUT. Config fixtures begin from a recipe-produced complete config
and modify only the behavior under examination.

## Current Runtime Schema Capability

Typed-array schemas use `Type.Unsafe(Type.Any(...))` for static typing and carry
enumerable `x-runtime` metadata for the required constructor and optional grid
shape. The metadata is available to runtime validation, but `Type.Any` and the
schema's static type do not validate a runtime value.

Current helpers such as `runOpValidated` validate operation config only. They do
not validate operation input or output constructors and grid shapes. A future
generic harness must invoke the production-owned validator to interpret
`x-runtime`; it must not duplicate runtime checks or treat static typing as
runtime validation.

## Planned Harness Family

The destination is one composable harness family aligned to the authored
runtime hierarchy:

1. A strategy case invokes one real strategy with explicit valid input and a
   complete strategy config.
2. An operation case resolves a real operation and strategy, validates input,
   config, and output against their declared contracts, and leaves the
   behavioral oracle to the caller.
3. A step case runs a real authored step with explicit dependencies and an
   observable artifact/effect boundary.
4. A stage case composes real steps through the production stage surface.
5. A recipe case compiles and executes a real recipe with a caller-supplied
   runtime, context, and complete config.

Step and stage cases may wire only the operations needed for the scenario, but
they must do so through production authoring factories. They are not mock
implementations of compilation or execution.

The harness implementation and its own conformance tests belong to the generic
MapGen testing owner. Swooper tests provide fixtures and assertions; they do not
fork the harness by domain.

## Harness Admission

No generic harness is part of the current test suite yet. It may be admitted
after domain-operation topology is normalized and the test TypeScript projects
are green. A pilot must delete duplicated setup while preserving or
strengthening an independent behavioral oracle before broader migration.

No harness may copy config normalization, operation binding, dependency
satisfaction, artifact publication, execution planning, or runtime execution.
It may not infer missing operation inputs, construct domain defaults, keep a
global fixture registry, or introduce a domain switch. Variants exist only
when they produce a behaviorally distinct case.
