# Swooper Maps Test Topology

This file defines how Swooper Maps tests are classified and placed.
Core engine, SDK, adapter, and platform behavior belongs in the package that
owns it rather than in this mod's test tree.

## Ownership Roots

- `domains/<domain>/<capability>` owns algorithm and policy behavior for one
  Swooper domain. A generic `operations` cabinet is not an owner.
- `recipes/swooper-physics-standard` owns concrete Standard config,
  composition, cross-stage orchestration, and whole-product behavior.
- `recipes/swooper-physics-standard/fixtures/standard-recipe.ts` is the sole
  direct Standard recipe test runner. Whole-recipe tests select a static Civ7
  map-size preset through this fixture; they do not invent product dimensions.
- `recipes/swooper-physics-standard/metrics` owns Standard scenario capture and
  map-product metric behavior.
- `recipes/swooper-physics-standard/trace` and `viz` own the recipe's optional
  evidence emissions without turning those projections into product or SDK
  behavior tests.
- `recipes/swooper-physics-standard/stages/<stage>` owns concrete stage
  authorship and orchestration, grouped first by stage family. Step behavior
  lives under `stages/<family>/<stage>/steps`.
- `maps` owns the map catalog, map config, generated-map metadata,
  run-manifest, and file-plan behavior.
- `scripts` owns behavior of mod-local analysis and live-verification commands.
- `build` owns behavior observable only in built artifacts.

`@swooper/mapgen-metrics` owns pure count, summary, component, and target
evaluation contracts. The Standard recipe owns its scenario capture, map product
sample and cohort shapes, measurements, and concrete product targets under
`src/recipes/standard/metrics`; tests assert those shared targets rather than
hiding thresholds in incidental fixtures. One captured generation may be evaluated by
multiple targets without rerunning it.

Classify a test by its SUT and behavioral owner. Execution labels such as unit,
integration, conformance, offline, and live do not create ownership roots.
Structural and import topology belongs to Habitat, not source-string tests.

Direct operation, step, artifact, and fault-mechanics tests may use a small
synthetic grid when its cardinality is the subject or fixture. Such dimensions
must be named as synthetic and never presented as a Civ7 product map size.

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

## Admission Ownership

Authored operation execution admits typed-array constructors and declared
cardinality before strategy code runs. Artifact modules admit published values
before they enter the pipeline. Tests call those production surfaces and add
only the semantic oracle owned by the domain, stage, or recipe.

Runtime-neutral helpers come from `@swooper/mapgen-core/testing`: operation
input admission, artifact publication, declared step dependencies, and one-step
lifecycle execution. Swooper's canonical whole-recipe fixture remains local
because it owns Civ7 setup, the Standard runtime, and the shipped config.

Do not duplicate generic admission checks, inspect `x-runtime` metadata, or
pin generic admission-message formatting. Core owns those mechanics. A semantic
validator may assert a discriminating message fragment when it exposes no typed
issue code.
