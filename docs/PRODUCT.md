# Product

Civ7 Modding Tools is a TypeScript platform for authoring, realizing,
inspecting, and operating Civilization VII products without hand-maintaining
game files or confusing local output with game behavior.

## Actors

- **Mod authors** express portable, type-safe Civ7 content.
- **Map authors and playtesters** generate, inspect, compare, realize, and
  validate procedural maps.
- **Operators and agents** observe a running Civ7 session and make lawful native
  game decisions through stable product surfaces.
- **Tool builders** consume public contracts, generated Civ7 policy, and
  owner-issued evidence.

## Capabilities

- **Official game knowledge:** extract an identified official resource corpus
  and deterministically derive public Civ7 types and policy.
- **Generic mod authoring:** admit one portable mod definition and render its
  exact expected tree and `.modinfo`.
- **Swooper Physics:** author and execute deterministic MapGen domains, recipes,
  diagnostics, metrics, trace, and visualization outside Civ7.
- **Mod realization:** materialize, install, replace, and separately prove
  loader and live behavior for an exact build.
- **Live observation and control:** inspect epoch-scoped Civ7 facts and perform
  native game decisions without treating dispatch as acceptance.
- **Map configuration and operations:** author stable MapGen configuration and
  run request-correlated Save & Deploy, Run in Game, inspection, adoption, and
  cancellation flows.
- **Product surfaces:** project those capabilities through the CLI, Studio,
  public SDKs, APIs, docs, examples, and Civ7 loader entrypoints without
  duplicating semantic ownership.

## Product Laws

- Every durable fact, policy decision, transition, and correction has one
  authority. An actor outcome may traverse several owners, but no fact has
  shared writers.
- Portable definition differs from environment-qualified realization.
- Deterministic MapGen truth differs from engine-current observation.
- Admission, dispatch, observation, consumer acceptance, and product outcome
  are distinct facts.
- Generated, installed, loader, and live-behavior evidence are independent
  proof claims.
- Public surfaces preserve owner meaning and remain subject to explicit
  consumer gates.

The active normative models and the current-to-destination migration authority
live in [Civ7 Capability Realization](projects/civ7-capability-realization/).
Target paths in that project are not current behavior until their
constructibility, consumer, and proof gates close.

## Quick Links

- [System](SYSTEM.md)
- [Architecture](system/ARCHITECTURE.md)
- [Process](PROCESS.md)
- [Roadmap](ROADMAP.md)
