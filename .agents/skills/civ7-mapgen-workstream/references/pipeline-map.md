# Pipeline And Ownership Map

Use this reference to locate a map-generation change. It describes durable
roles and discovery points, not a frozen stage inventory.

## Capability Chain

```text
Swooper definition + pure MapGen packages
  -> admitted authored configuration
  -> deterministic recipe execution
  -> causal artifacts, diagnostics, metrics, trace, and visualization evidence

Swooper definition
  -> Swooper realization app Nx targets
  -> generated deployable mod artifact
  -> qualified installation effect and receipt
  -> Civ7 loader/live evidence

Studio caller
  -> Studio web/API projections
  -> MapGen-runs public client
  -> app-bound config/run/log/realization/controller capabilities
  -> operation state, correlation, reconciliation, and semantic outcome
```

No part of this chain authorizes one owner to absorb another.

## Durable Owner Map

| Concern | Owner |
| --- | --- |
| Swooper domains, recipe, product config, diagnostics, metrics, trace, and visualization semantics | `plugins/mod/map/swooper-physics` |
| Generic authoring/execution language and deterministic runtime mechanics | `packages/mapgen-core` |
| Neutral diagnostic, metric, and visualization mechanics | matching `packages/mapgen-*` package |
| Static Civ7 map legality/policy derived from official sources | `packages/civ7-map-policy` |
| Portable engine-adapter contract/static vocabulary/mock | `packages/civ7-adapter` |
| Engine globals, map loader, generated map script, deployable outcome | `apps/mods/map/swooper-physics` |
| Save & Deploy / Run in Game operation authority | `services/mapgen-runs` |
| Studio physical materialization/install effects | `apps/mapgen-studio/src/runtime/adapters/swooper-map-realization.ts` |
| Typed live Civ7 app/game/map/UI facts | `services/civ7-controller`, executed inside the controller mod |
| CLI/API/web caller presentation | matching projection plugin |
| Provider selection, client binding, host mount, process lifetime | matching app |

The Swooper realization app and Studio's realization adapter have different
outcomes. The app owns the deployable product produced by its Nx targets. The
Studio adapter owns one ephemeral Studio operation's physical effects and
receipts. Studio does not import the realization app or call its targets.

## Definition Source Grammar

The portable product root is `plugins/mod/map/swooper-physics`.

```text
src/domain/<domain>/
  contract.ts
  router.ts
  index.ts
  modules/<module>/
    contract.ts
    router.ts
    index.ts
    model/                     # owner-local facts/policy when earned
    artifacts/                 # module-owned immutable products
    ops/<operation>/
      contract.ts
      index.ts
      rules/                   # operation-private mechanics
      strategies/
        index.ts
        <semantic-id>/{config,index}.ts

src/recipes/standard/
  contract-manifest.ts         # stage and step order authority
  recipe.ts                    # recipe composition
  stages/<semantic-path>/
    index.ts
    steps/<step>/{config,step}.ts

authoring/{config,index,targets}.ts
src/maps/{catalog,configs}/
test/{domains,recipes}/
```

Verify this grammar against live source before copying it. Qualified Habitat
law and tests, not this reference, decide which optional leaves are admitted.

## Vocabulary

- **Domain:** pure semantic concern composed from module contracts. It has no
  recipe or host lifecycle authority.
- **Module:** cohesive capability within a domain. It owns its operation
  contracts, router, model, and immutable products.
- **Operation:** one semantic input/output transition. Its contract owns the
  shared envelope; its executable strategies implement that same transition.
- **Strategy:** replaceable semantic model satisfying one operation contract.
  A model with different inputs, outputs, or transition timing is another
  operation, not a strategy.
- **Artifact:** typed, write-once causal product owned by the module that
  produces it. Diagnostic, metric, trace, and visualization evidence is not a
  causal artifact merely because it is recorded.
- **Step:** recipe execution boundary declaring exact operations and artifact
  requirements/provisions.
- **Stage:** recipe-level composition of ordered steps and any earned public
  authoring translation.
- **Recipe:** global composition and order of stages plus the one canonical
  executable operation collection.

Use `assets/recipe-scaffolds.md` only after checking the nearest live example.

## Re-Derive The Pipeline

Do not preserve stage counts, operation counts, strategy lists, or artifact
inventories in planning prose. Rebuild the map from current owners:

1. Read `src/recipes/standard/contract-manifest.ts` for ordered stage and step
   identities.
2. Read `recipe.ts` for composition and executable domain collection.
3. Read a domain's `contract.ts` and `router.ts` for module symmetry.
4. Read a module's `contract.ts`, `router.ts`, and `ops/` leaves for operation
   symmetry.
5. Read an operation contract and `strategies/index.ts` for admitted strategy
   identities and default authority.
6. Search an artifact definition by id/name through recipe step contracts to
   find all producers and consumers.
7. Read tests and Habitat rules for the closed structural and behavioral law.

## Truth, Planning, Projection, And Realization

Classify each step before moving it:

- **Truth:** computes portable causal products without a live Civ7 adapter.
- **Planning:** converts admitted truth and policy into intents without
  claiming the host effect happened.
- **Projection:** applies or observes truth through the engine adapter. It does
  not become the truth owner.
- **Realization:** generates, installs, loads, or executes the engine-bound mod.
  It returns receipts/evidence for its exact effect.

Names such as `projection` are hints, not authority. Read imports, operations,
artifacts, and effects. A tile-space projection can still be pure truth; a
placement step can combine planning and engine materialization. Split facts by
what they mean, not by directory names alone.

## Strategy Selection

An operation contract owns the available semantic strategies and the default.
Selection enters through the authored operation envelope or an earned stage
compiler that translates a genuinely different public surface. Before tuning:

1. Find the operation contract and its shared transition.
2. Find the authoring point that supplies its envelope.
3. Confirm no compiler overwrites that value.
4. Decide whether the request is a re-tune, existing-strategy selection, new
   strategy, or new operation.
5. Add a behavioral comparison that keeps the incumbent visible whenever a
   new physical model is introduced.

## Artifact Discipline

- The producing module owns definition, schema, semantic refinement, and
  catalog membership.
- Step contracts select exact artifact authorities, not copied ids or parallel
  payload interfaces.
- Publication is write-once per invocation; consumers read the admitted value.
- Engine state is observed at the adapter boundary, not copied into an artifact
  to make it look portable.
- Metrics, trace, diagnostics, and visualization observe; they do not silently
  become causal state.

## Run And Realization Boundaries

MapGen-runs consumes exact app-bound dependencies for authored config,
run-files, fresh logs, realization, the public controller client, and clock. It owns
accepted intent, phase transitions, operation records, correlation,
cancellation, reconciliation, and final semantic outcomes.

The Studio app constructs adapters directly from public definition/package
surfaces. The realization adapter owns physical materialization and installation
receipts. The run service neither imports app source nor performs filesystem or
provider acquisition.

## Verification Routing

- Definition structure -> definition contract/type/Habitat checks.
- Domain behavior -> focused semantics tests and deterministic recipe runs.
- Product expectation -> named metric study over a stable cohort.
- Diagnostic comparison -> the diagnostic leaf selected from native MapGen CLI
  help.
- Generated realization -> `swooper-physics-mod` artifact tests.
- Installation -> realization adapter/deploy receipt.
- Loader/live behavior -> uncached live target plus bounded logs/readback.
- Save & Deploy / Run in Game -> MapGen-runs semantics, adapter receipts, and
  caller projection proof.
- Browser display -> web projection/UI tests after raw values are proven.

Discover current targets with Nx and CLI help rather than recording remembered
syntax here.

## Boundary Smells

- Domain logic imports a recipe, adapter, host API, or app.
- A projection recomputes product truth.
- A definition writes files or installs itself.
- A service acquires a provider or imports an app.
- An app authors a second service contract.
- A caller imports a private router or constructs a hidden live dependency.
- A diagnostic result is promoted to a causal artifact.
- A generated/install receipt is called live proof.
- A new root exists only to preserve an old import or directory.
