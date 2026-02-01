<toc>
  <item id="purpose" title="Purpose"/>
  <item id="system-map" title="Target system map"/>
  <item id="policy" title="DX policies + guardrails"/>
  <item id="deferrals" title="Explicit deferrals"/>
  <item id="must-hold" title="Invariants to document"/>
</toc>

# Scratch: Target architecture (engine-refactor-v1)

## Purpose

Extract the **target** (accepted) architecture and DX/policy constraints from:
- `docs/projects/engine-refactor-v1/resources/spec/**`
- `docs/projects/engine-refactor-v1/resources/spec/adr/**`

This scratch pad is “spec-first”. It is intentionally opinionated toward what is accepted/locked, even when current code differs.

## Target system map

This is the core “what talks to what” map implied by the accepted specs/ADRs.

### Boundary input

- Boundary input is `RunRequest = { recipe, settings }`. (ADR-ER1-003, SPEC-architecture-overview)
- `recipe` is the **only** ordering/enablement source of truth. (ADR-ER1-001, ADR-ER1-002)
- `settings` are the minimal run-global values required to initialize context (seed, dimensions, etc). (ADR-ER1-003)
- There is no monolithic “mega config” owned by the engine. (ADR-ER1-003)

### Compile → execute lifecycle (target)

1) **Authoring** (mod-owned):
   - Author a recipe module (stages/steps) + map instances (settings + recipe config instances).
2) **Compile** (engine-owned runtime):
   - Validate structural recipe (`RecipeV2`).
   - Validate step IDs and step config per occurrence (schema-backed; fail fast).
   - Compile to `ExecutionPlan` (nodes carry `stepId`, `phase`, `requires`, `provides`, `config`).
3) **Execute** (engine-owned runtime):
   - Execute nodes against a `StepRegistry`.
   - Enforce dependency gating via `TagRegistry` (unknown tags hard error; missing deps hard error).
4) **Observe** (cross-cutting):
   - RunId + plan fingerprint are first-class and required; tracing is optional and toggleable. (ADR-ER1-012, ADR-ER1-022)

### Registries (target)

- `StepRegistry` is the set of available runtime steps for a given content package.
  - Duplicate step IDs are hard errors.
  - Unknown step IDs in the recipe are hard errors. (SPEC-architecture-overview)
- `TagRegistry` is the set of valid dependency tags for a given content package.
  - Duplicate tag IDs are hard errors.
  - Unknown tag references in `requires`/`provides` are hard errors. (ADR-ER1-006, SPEC-tag-registry)

### Dependency kinds (target — needs reconciliation)

Across the spec set there are two competing “second kind” terms:
- `field:*` (SPEC-step-domain-operation-modules)
- `buffer:*` (SPEC-architecture-overview, SPEC-tag-registry)

Directionally, both refer to an engine-facing mutable surface distinct from an immutable `artifact:*` snapshot.
This needs an explicit “docs-first reconciliation” decision (see `drift-ledger.md`).

### Ownership boundaries (target)

**Core SDK (`packages/mapgen-core/**`) owns:**
- plan compilation + execution runtime (engine)
- engine-owned context types + helpers (core)
- authoring factories (authoring)
- trace plumbing and optional diagnostics

**Standard content package (mod-owned; `mods/mod-swooper-maps/**`) owns:**
- domains and operations (contract-first op modules)
- recipes (stages/steps and their schemas/contracts)
- tag definitions and any tag postconditions (`satisfies`)
- map/preset entrypoints + runner glue to create adapter/context and call recipes

## DX policies + guardrails

These are the highest-leverage “make the right thing easy” rules that must be taught consistently.

### Recipe + enablement

- Ordering and enablement live **only** in the recipe; no stage manifests; no hidden enablement. (ADR-ER1-001, ADR-ER1-002)
- No “silent skips” (`shouldRun` is not part of the target step contract). (ADR-ER1-002)

### Validation posture

- Fail fast on:
  - unknown step IDs,
  - unknown dependency tags,
  - invalid config at schema boundaries,
  - duplicate IDs (steps/tags). (ADR-ER1-006, SPEC-tag-registry)

### Compile-first responsibility split

- The compiler is the *only* place that:
  - applies defaults,
  - cleans/normalizes,
  - derives “knobs-last” config baselines,
  - and validates schemas with stable error paths.
- Runtime execution should treat configs as canonical (no further cleanup/defaulting inside `step.run`).
  - This is the core DX guardrail that prevents “two places to fix config bugs”.

### Colocation + imports

- Step-owned by default: schema + derived config type + dependency IDs + artifact helpers/validators.
- Domain-owned by default: operation contracts and strategy implementations.
- Avoid centralized catalogs unless they are thin explicit re-export barrels. (SPEC-architecture-overview, SPEC-standard-content-package)

### Operations

- Steps call **ops**; steps do not import strategies directly (strategy selection is config, op-local). (SPEC-step-domain-operation-modules)
- Op types are derived from the op contract and exported only from `types.ts`; rules never export types and must not import `contract.ts`. (SPEC-step-domain-operation-modules)

### Operation inputs policy

- Ops consume plain inputs (POJOs + typed arrays) and must not accept “views” objects as inputs.
  - This keeps contracts stable and keeps test harnesses simple.
  - (See ADR-ER1-030 for the locked posture.)

### Observability

- `runId` and plan fingerprint are required; structured errors are part of the contract.
- Tracing is optional/toggleable and must not affect plan fingerprints. (ADR-ER1-012, ADR-ER1-022)

## Explicit deferrals

Non-exhaustive list of “target direction is locked, implementation can lag” deferrals:

- Foundation artifact split deferred (see ADR-ER1-007; references DEF-014).
- Placement consumes `artifact:placementInputs` and produces `artifact:placementOutputs`, but v1 implementation is deferred (ADR-ER1-011, ADR-ER1-020).
- Narrative/playability canonical contract is story entry artifacts; views/overlays are derived and non-canonical (ADR-ER1-008, ADR-ER1-025).
- Climate ownership is TS canonical artifact, engine reads; further engine read-back APIs are deferred (ADR-ER1-010, ADR-ER1-021).
- `RunRequest.settings` should own cross-cutting directionality policy (ADR-ER1-019).

## Invariants to document

Minimum invariants canonical docs must teach (even in mixed-state):

- Determinism: same settings + same recipe config ⇒ identical outputs (within floating-point caveats).
- All dependency IDs and step IDs must be registered; unknown IDs are errors.
- Compilation is split into:
  - config normalization/derivation (schema-backed; knobs-last posture), and
  - plan compilation (structural graph over steps with requires/provides).
- Execution is gated strictly by declared dependencies; no implicit “it probably exists”.
- Observability identities (`runId`, fingerprint) exist to make runs comparable and debuggable.
