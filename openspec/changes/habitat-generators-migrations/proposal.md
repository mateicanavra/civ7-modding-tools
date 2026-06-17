## Why

The harness end-state (spec draft §14) includes "new structure comes from
generators" and "agents classify before they author." With enforcement
consolidated, the remaining gap is generative: creating a new
package/plugin/pattern by hand invites the exact drift the harness exists to
prevent, and harness convention changes have no propagation mechanism. This
historical slice added Nx generators for the repo's uniform project kinds, the
first pattern-generator path, harness migration wiring, and the agent operating
procedure wiring (AGENTS.md routing) that makes classify-first the default.
Current repair packets supersede this slice where target truth, registered
pattern authority, and migration proof boundaries require stricter contracts.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (north star; hard core #1)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §10
  (agent operating procedure), §11 Phase 6 (generators/migrations)
- `docs/projects/habitat-harness/taxonomy.md` (kinds a generator may scaffold)
- `https://nx.dev/docs/extending-nx/recipes/organization-specific-plugin`

## What Changes

- `@internal/habitat-harness:project` generator: scaffolds a workspace
  project by kind (`kind:plugin`, `kind:foundation`, `kind:app` initially —
  the kinds with uniform shape), emitting package.json (with tags), tsconfig,
  src/index.ts, test stub, and rule-pack-conformant layout; refuses kinds
  whose shape is not uniform yet (mod, engine, control) with a documented
  rationale.
- `@internal/habitat-harness:pattern` generator: historical H8 output produced
  a grit pattern, fixtures, rule-pack entry, and empty baseline. Current
  Pattern Authority repair changes sparse generation to candidate-only output;
  registered advisory/enforced promotion requires accepted manifest, baseline,
  current-tree, fixture, false-positive, and hook-scope gates.
- Harness migrations wiring: migrations ship in the plugin's
  `migrations.json`; because `@internal/habitat-harness` is unpublished,
  `nx migrate @internal/habitat-harness` (npm-registry version
  resolution) does not apply — migrations are executed via a hand-authored
  migration run file whose `package` field points at
  `./tools/habitat-harness`, then `nx migrate
  --run-migrations=<run-file>.json --skip-install`; versioned migration stubs
  so future harness convention changes propagate.
- `habitat classify <path-or-diff>` completes the agent entry point. Current
  classify repair resolves project ownership and emitted targets from Nx
  metadata, records missing targets as unavailable, and separates project-local
  targets from Habitat workspace gates.
- Agent operating procedure: root `AGENTS.md` Tooling Defaults section gains
  the classify→generate→author→verify loop; harness README carries the full
  procedure (spec draft §10 adapted).

## What Does Not Change

- No retroactive restructuring of existing projects to generator output.
- No new enforcement rules; generators must produce rule-clean output (proof
  gate), not new constraints.

## Requires

- `habitat-enforcement-consolidation`
- `habitat-oclif-cli`
- `habitat-git-hooks` (strictly sequential — both slices write root
  `AGENTS.md` and the harness README; no parallelism with H7)

## Enables Parallel Work

- The H8 generator train is historical. Future rule-introduction changes use
  Pattern Authority candidate generation and registered-promotion gates, not
  the old direct rule-pack write path.

## Affected Owners

- `tools/habitat-harness/src/generators/**`, `src/migrations/**`, CLI
  `classify`
- Root `AGENTS.md` (Tooling Defaults), harness README

## Forbidden Owners

- Generators must not scaffold domain logic, recipes, stages, or steps —
  MapGen authoring surfaces are owned by the normalization train and mod
  tooling, not the harness.
- No generator output that requires immediate baseline entries.

## Stop Conditions

- A generated project fails any harness rule out of the box.
- The project generator needs kind-specific knowledge that belongs to product
  owners (e.g. mod scaffolding) — refuse the kind rather than guess.

## Consumer Impact

Agents start work with `habitat classify`, scaffold with generators, and
author only business logic. New-project drift becomes structurally
impossible for supported kinds.

## Verification Gates

- `bun run openspec -- validate habitat-generators-migrations --strict`
- Probe: generate one project per supported kind in a scratch branch →
  `bun run habitat:check` and `nx run-many -t build,check,test` green on
  generated output → probes removed.
- Probe: pattern generator output passes the fixture runner and registers in
  the rule pack.
- The no-op baseline migration executes successfully via a hand-authored
  migration run file using package `./tools/habitat-harness` +
  `nx migrate --run-migrations=<run-file>.json --skip-install` (no
  registry resolution; the package is unpublished).
- Historical `habitat classify` spot-check matrix — four probe paths with
  expected outputs (per `docs/projects/habitat-harness/taxonomy.md`), each
  naming the owning project, tags, in-scope rules, and required verification
  targets. Current classify proof additionally requires resolved Nx target
  existence and unavailable-target modeling:
  - `packages/civ7-adapter/src/<any>.ts` → project `@civ7/adapter`, tag
    `kind:adapter` (adapter `/base-standard/` ownership rules in scope)
  - `mods/mod-swooper-maps/src/recipes/<any>` → project `mod-swooper-maps`,
    tag `kind:mod`, recipe-surface rules in scope
  - `packages/config/<any>` → project `@civ7/config`, tag `kind:foundation`
  - `apps/mapgen-studio/src/<any>` → project `mapgen-studio`, tag `kind:app`
