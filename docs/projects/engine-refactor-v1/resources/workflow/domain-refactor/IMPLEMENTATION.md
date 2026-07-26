---
name: domain-refactor-implementation-subflow
description: |
  Detailed implementation sub-flow for refactoring a domain into semantic
  modules and operation directories. Focuses on slice planning, completion,
  and sizing guardrails.
---

# SUB-FLOW: Domain Refactor Implementation (Slices)

This is the detailed implementation phase for a domain refactor.

It assumes you already produced:

- a domain inventory covering callsites, contracts, configuration, artifacts,
  shared model vocabulary, and deletions; and
- a locked operation catalog covering semantic module ownership, operation ids
  and kinds, strategy definitions, schemas, and config resolution.

Keep these references open while implementing:

- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/implementation-reference.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/implementation-traps-and-locked-decisions.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/op-and-config-design.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`

## Execution posture

- Keep slices end-to-end and green. Do not carry partial migrations forward
  until a later cleanup.
- Prefer durable fix anchors. Correct behavior at contract, schema,
  normalization, or ownership boundaries before patching replaceable internals.
- Default to deletion. Remove legacy surfaces, compatibility layers,
  placeholders, and dead bags within the slice that migrates their consumers.
- Stop when a locked decision is threatened. Update the owning Phase 3 issue
  and add an executable guardrail before proceeding.

## Target ownership spine

The active structure is:

```text
domain
  -> modules
    -> ops
      -> semantic operation directories
        -> semantic strategy directories
```

Every domain and direct module has one `contract.ts`, one `router.ts`, and one
`index.ts`.

- A domain contract directly composes its module contracts.
- A domain router directly composes its module routers.
- A module contract directly composes its leaf operation contracts.
- A module router directly binds the corresponding leaf operation
  implementations.
- The module's `ops/` directory contains only semantic operation directories;
  it is not another aggregate layer.
- An operation owns `contract.ts`, `index.ts`, optional `rules/`, and
  `strategies/`.
- A strategy owns `strategies/<semantic-id>/config.ts` and
  `strategies/<semantic-id>/index.ts`; `strategies/index.ts` collects executable
  strategies.

Do not add a flat domain operation cabinet, a per-operation type bag, a generic
strategy identity, or child-contract re-export barrels. Model atoms, policy,
rules, and immutable artifacts belong at the lowest truthful semantic owner.

## Phase 2 posture locks

These locks are non-negotiable. If a slice touches a relevant path, preserve or
extend its executable guardrails in the same slice.

Canonical anchors:

- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- The Phase 2 canon for the domain being implemented, usually under
  `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/<domain>/spec/`

- **Topology invariant:** Civ7 is always `wrapX=true`, `wrapY=false`. Wrap
  behavior is not an author knob and does not cross operation, step, or
  artifact contracts.
- **Boundary:** physics domains publish truth-only artifacts. Projection and
  materialization own `artifact:map.*`, adapter writes, and engine-facing
  annotations.
- **No backfeeding:** physics steps do not consume `artifact:map.*` or
  `effect:map.*`.
- **Effects are boolean:** an `effect:map.<thing><Verb>` tag is provided only
  after the corresponding adapter write succeeds.
- **Hard ban:** no `artifact:map.realized.*` namespace.
- **TerrainBuilder no-drift:** Civ7 elevation and cliffs come from
  `TerrainBuilder.buildElevation()`. Decisions that require built elevation
  belong after `effect:map.elevationBuilt`.
- **Effect honesty via freeze:** projection intent consumed by stamping is
  write-once before stamping begins.

## Slice sizing

Choose slices from the domain inventory. Slice boundaries are flexible, but
slice completion is not.

Hard guardrails:

- Preserve meaningful step granularity. Do not collapse causally distinct work
  into a mega-step to simplify migration.
- Preserve operation granularity. Avoid noun-first bucket operations such as
  `placement`, `terrain`, or `features`.
- Prefer stable, verb-forward operations such as `compute*`, `plan*`, `score*`,
  and `select*`.

The default slice is one step, or a small cluster that must move together
because it shares a contract, artifact, or configuration boundary. A healthy
slice is small enough to delete its legacy path immediately and explain the
whole diff without another investigation.

Avoid:

- one slice for a whole domain unless it truly has one operation surface;
- one operation that absorbs unrelated behavior; and
- keeping the old path until the final slice.

## Drift response protocol

If implementation reveals drift or ambiguity:

1. Record what changed, what is in flight, and the decision now required.
2. Update the Phase 3 issue so the decision is an explicit gate.
3. Replace vague later-work buckets with concrete subissues and slices.
4. Add the structural, contract, or behavior guardrail that prevents
   reintroduction.

## Slice planning artifact

Before coding, record in the domain issue:

- slice name;
- step ids and paths;
- owning domain modules and operations to create or modify;
- legacy entrypoints and exports deleted by the slice;
- operation contract tests and thin integration edges;
- expected Habitat classifications, project targets, and policy rules;
- locked decisions and how each is enforced;
- projection effects, freeze points, and TerrainBuilder ordering when relevant;
- causality spine, step boundaries, and produced/consumed artifacts; and
- consumer migration matrix.

## Slice completion checklist

Complete every section before starting the next slice.

### 1) Place model and artifacts at their truthful owner

- Choose the direct semantic module before adding an operation.
- Keep shared model atoms, policy, and rules at the lowest owner whose siblings
  genuinely share them.
- Keep operation-private algorithm types and rules private.
- Define immutable artifacts in the exact module that produces them and expose
  them through that module's artifact catalog.
- Do not use an artifact payload or operation envelope as a substitute for
  decomposed domain vocabulary.

### 2) Author each operation contract-first

Create the operation under:

```text
mods/mod-swooper-maps/src/domain/<domain>/modules/<module>/ops/<operation>/
  contract.ts
  index.ts
  rules/                         # optional
  strategies/
    index.ts
    <semantic-id>/
      config.ts
      index.ts
```

- `contract.ts` owns the shared input schema, output schema, and complete tuple
  of strategy definitions.
- Input and output are POJO-like data plus typed arrays. Adapters, execution
  context, and RNG callbacks never cross this boundary.
- Each strategy definition has a semantic id and lives with its config schema.
  A sole strategy is inferred; a multi-strategy operation explicitly selects
  its semantic default.
- `index.ts` creates one executable operation from the contract and executable
  strategy tuple.
- Rules consume decomposed model atoms or private algorithm types, not inferred
  operation-envelope types.
- Runtime handlers assume admitted, normalized config. They do not add hidden
  defaults or fallbacks.

For any semantic knob or weighted choice, document and test its meaning,
missing/empty/null behavior, composition, and determinism.

### 3) Compose module and domain surfaces directly

- Add the leaf operation contract directly to the owning module's
  `contract.ts`.
- Add the leaf implementation under the same key directly to the module's
  `router.ts`.
- Keep the module `index.ts` narrow; do not publish leaf operation contracts as
  parallel named exports.
- If a new module is introduced, compose its contract and router directly from
  the domain's `contract.ts` and `router.ts`, then expose only the intended
  domain surface from `index.ts`.
- Keep contract keys, router keys, and canonical contract identity symmetric.

### 4) Wire recipe steps

Each authored step uses:

```text
mods/mod-swooper-maps/src/recipes/<recipe>/stages/<family>/<stage>/steps/<step>/
  config.ts
  step.ts
```

- `config.ts` owns `defineStep(...)`, declares operation contracts, exact
  artifact requirements/provisions, dependency/effect tags, and only
  step-owned schema fields.
- `step.ts` owns `createStep(...)` behavior.
- Runtime code receives operations and artifact runtimes through
  `run(context, config, ops, deps)`.
- Read map dimensions from `context.setup.dimensions`.
- Call injected `ops.<key>` implementations; do not import operation
  implementations or call their private rules.
- Read and publish only declared immutable products through
  `deps.artifacts.<key>`.
- Stages order steps. They do not recreate domain contracts or artifact
  catalogs.

### 5) Delete legacy surfaces

- Delete the migrated entrypoints, helpers, compatibility exports, and
  old/new switches in the same slice.
- Migrate every consumer before deleting the old authority; do not leave dual
  compute paths.
- Remove empty directories, unused config bags, translators, and projections
  that no longer have an owner.

### 6) Test behavior and contracts

- Add at least one domain-local operation contract test for every operation
  introduced or materially changed.
- Add a thin integration test when artifact or config contracts cross steps.
- Use fixed seeds and explicit `rngSeed` inputs. RNG callbacks do not cross an
  operation boundary.
- For weighted behavior, add a deterministic test that fails when seed or
  selection semantics drift.
- Assert normalized config directly for authored-config composition rather
  than relying only on emergent map output.

### 7) Update documentation at the owner

- Trace callsites before documenting exported symbols.
- Add behavior-oriented JSDoc where an exported contract, operation, strategy,
  artifact, or cross-file helper needs context.
- Give TypeBox fields meaningful `description` text that explains behavioral
  impact and relevant interactions.
- Update canonical authoring references when a public contract changes. Do not
  duplicate a second canonical model in project notes.

### 8) Run structural and project proof

Classify every unfamiliar or structurally changed path:

```bash
bun habitat classify <path>
```

Run every target reported by classification. For the standard MapGen domain
surface, the normal proof is:

```bash
nx run-many -t check test build -p mapgen-core mod-swooper-maps
```

Behavioral changes also require the relevant diagnostic or in-game proof. A
build alone does not prove generated-map behavior.

### 9) Commit the complete slice

Use the repository's Graphite workflow and keep one logical slice per layer:

```bash
gt add -A
gt modify --commit -am "refactor(<domain>): <slice summary>"
```

## Final slice additions

The final slice performs the surrounding cleanup:

- remove shared helpers that existed only for retired paths;
- remove obsolete exports that bypass module and operation boundaries;
- update docs, presets, tests, and recipe wiring that named retired structures;
- confirm no placeholders or compatibility layers remain; and
- run the full reported Habitat and Nx proof, plus live verification for
  behavior-changing work.

Finish the Phase 5 traceability pass by recording what changed from the plan
and why. Environmental limits may block an operational gate, but they do not
justify leaving an in-scope migration or deletion half complete.
