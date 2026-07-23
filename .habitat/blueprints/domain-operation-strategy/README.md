# Domain Operation Strategy Blueprint

Status: affirmed constructible kind, advisory aggregate-and-leaf migration, target-leaf import boundary ready

Owner: DRA Habitat authority-tree workstream

Domino: 52. Admit Domain Operation Strategy Blueprint Authority

## Purpose

`domain-operation-strategy` is the MapGen blueprint kind for swappable semantic
implementations bound to domain operation contracts. A domain or direct
semantic module is a router; its operations expose the strategies authors can
select. The strategy kind governs a declared strategy id, its strategy-specific
config schema, deterministic implementation behavior, and the
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
- `mods/*/src/domain/**/ops/*/strategies/*/{contract.ts,index.ts}`

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
  kind-level dependency law. A leaf contract owns the strategy id, config, and
  nothing executable, without depending on its operation contract. The leaf
  implementation alone binds that strategy contract to the local operation,
  owns optional configuration normalization and deterministic execution, and
  may compose operation-private rules and types. Both roles may compose atoms
  and policy from their owning or ancestor semantic models and shared map
  policy. Contracts use only MapGen Core's authoring-contract surface;
  implementations may additionally use sanctioned public Core computation
  surfaces. Neither can reach
  recipes, engine or adapter surfaces, sibling private operations, or unrelated
  implementations. This preserves author control over swappable behavior and
  makes every semantic dependency visible at its owner. MapGen Core package
  exports and TypeScript own exact entrypoint validity inside the admitted
  package root, `authoring`, and `lib` owner classes.
- `require_domain_operation_strategy_source_topology` defines one complete
  aggregate-and-leaf hierarchy for every operation. The aggregate owns
  `strategies/{contract.ts,index.ts}` and semantically named strategy directories;
  each strategy leaf owns only `{contract.ts,index.ts}`. This strategy blueprint
  requires the strategy slot without weakening the parent operation blueprint,
  and refuses the identity-erasing `strategies/default/` directory and every
  alternate helper or flat-module surface. The rule remains advisory only while
  the current source corpus migrates; it carries no baseline and becomes enforced
  when the corpus is green.

TypeScript and the operation SDK remain the authority for declared strategy
keys, contract/implementation binding, multi-strategy default selection, and
sole-strategy default inference. Structure does not duplicate those source
relationships. Parent operation type-boundary authority remains the single
owner that prevents implementations from deriving working types from complete
operation input/output envelopes.

The import boundary is expressed against the operation kind rather than named
domains, modules, or a fixed nesting depth: operation-local files sit under
`ops/<operation>/`, while shared atoms and policy rise only to an ancestor
`model/` owner. Domain and module routers remain composition surfaces, not
strategy dependencies.
