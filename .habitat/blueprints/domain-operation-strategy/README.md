# Domain Operation Strategy Blueprint

Status: affirmed constructible kind, enforced source topology, advisory import-boundary red corpus

Owner: DRA Habitat authority-tree workstream

Domino: 52. Admit Domain Operation Strategy Blueprint Authority

## Purpose

`domain-operation-strategy` is the MapGen blueprint kind for swappable semantic
implementations bound to domain operation contracts. A domain or direct
semantic module is a router; its operations expose the strategies authors can
select. The strategy kind governs a declared strategy id, its strategy-specific
config schema, optional normalization, deterministic `run` behavior, and the
`defineOp`/`createOp`/`createStrategy` binding that makes it selectable through
the operation config envelope.

This is not the parent `domain-operation` blueprint. Operation contracts,
operation roots, domain registry wiring, operation topology, and operation
entrypoint atomicity remain parent `domain-operation` authority unless a whole
rule specifically governs valid strategy implementations.

## Constructibility Evidence

Current source-backed anchors:

- `docs/system/libs/mapgen/how-to/add-an-op.md`
- `docs/system/libs/mapgen/reference/GLOSSARY.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `packages/mapgen-core/src/authoring/op/contract.ts`
- `packages/mapgen-core/src/authoring/op/create.ts`
- `packages/mapgen-core/src/authoring/op/strategy.ts`
- `mods/*/src/domain/*/ops/*/strategies/*.ts`
- `mods/*/src/domain/*/modules/*/ops/*/strategies/*.ts`

The live source has concrete `createStrategy(...)` implementations across
multiple domains and semantic modules. The construct is not domain-specific
cleanup and not generic folder hygiene.

## Admission Rule

Admit rule packets here only when the whole predicate governs every valid
domain operation strategy implementation or strategy binding. Good candidates
include rules about strategy id binding, strategy config schema ownership,
missing or unknown strategy implementations, deterministic strategy execution,
strategy normalization, or strategy envelope participation.

Do not admit rules merely because their scan roots include `strategies/**/*.ts`.
Strategy files can be evidence for helper-surface, domain-local import,
operation topology, runtime validation, or recipe policy concerns without being
strategy-kind authority.

## Explicit Non-Moves

The initial admission slice moved no live rule packets. The later generic
boundary closes the gap left by retiring the domain-specific strategy-locality
guard:

- `require_domain_operation_strategy_import_boundaries` is the positive
  kind-level dependency law. A strategy composes its local operation contract
  and rules, atoms and policy from its owning or ancestor semantic models,
  shared map policy, and sanctioned public MapGen Core computation surfaces.
  It cannot reach recipes, engine or adapter surfaces, sibling private
  operations, or unrelated implementations. This preserves author control over
  swappable behavior and makes every semantic dependency visible at its owner.
  MapGen Core package exports and TypeScript own exact entrypoint validity
  inside the admitted package root, `authoring`, and `lib` owner classes.
`require_domain_operation_strategy_source_topology` now closes every admitted
strategy directory to one `index.ts` barrel plus semantically named kebab-case
strategy modules and refuses the identity-erasing `default.ts` filename.
TypeScript and the operation SDK remain the authority for declared strategy
keys, implementation binding, and sole-strategy default inference; Structure
does not duplicate those source relationships.

The import boundary is expressed against the direct kind topology rather than
named domains or modules: operation-local files sit under `ops/<operation>/`,
while shared atoms and policy rise only to the owning module or root-domain
`model/` owner. Domain and module routers remain composition surfaces, not
strategy dependencies.
