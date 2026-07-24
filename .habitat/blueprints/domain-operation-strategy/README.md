# Domain Operation Strategy Blueprint

Status: affirmed constructible kind, advisory implementation-aggregate-and-leaf migration, target-leaf import boundary ready

Owner: DRA Habitat authority-tree workstream

Domino: 52. Admit Domain Operation Strategy Blueprint Authority

## Purpose

`domain-operation-strategy` is the MapGen blueprint kind for swappable semantic
implementations bound to domain operation contracts. A domain or direct
semantic module is a router; its operations expose the strategies authors can
select. The strategy kind governs one semantic definition (an immutable id plus
its strategy-specific authored config schema), deterministic implementation
behavior, and the
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
- `packages/mapgen-core/src/authoring/operation/contract.ts`
- `packages/mapgen-core/src/authoring/operation/create.ts`
- `packages/mapgen-core/src/authoring/operation/strategy.ts`
- `mods/*/src/domain/**/ops/*/strategies/*/{config.ts,index.ts}`

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
  kind-level dependency law. A leaf config owns the strategy definition and
  nothing executable, without depending on its operation contract. The leaf
  implementation alone binds that definition to the local operation contract,
  owns optional configuration normalization and deterministic execution, and
  may compose policy and rules owned by the same operation. Both roles may
  compose dependencies from ancestor semantic model owners and shared map
  policy; the domain-model structure law owns the valid children beneath
  `model/`. Cross-domain dependencies use admitted public domain roots or
  public model surfaces. Among MapGen Core surfaces, configs use only authoring
  contracts; implementations may additionally use sanctioned public Core
  computation surfaces. Neither can reach recipes, engine or adapter surfaces,
  private sibling operations, or unrelated implementations. This preserves
  author control over swappable behavior and makes every semantic dependency
  visible at its owner. MapGen Core package
  exports and TypeScript own exact entrypoint validity inside the admitted
  package root, `authoring`, and `lib` owner classes.
- `require_domain_operation_strategy_source_topology` defines one complete
  implementation-aggregate-and-leaf hierarchy for every operation. The strategy
  root owns only `strategies/index.ts` plus semantically named strategy
  directories; each strategy leaf owns only `{config.ts,index.ts}`. The operation contract
  imports those leaf configs directly and composes their definition tuple, so no
  strategy-root definition barrel can create a cycle. This strategy blueprint
  requires the strategy slot without weakening the parent operation blueprint,
  and refuses the identity-erasing `strategies/default/` directory and every
  alternate helper or flat-module surface. The rule remains advisory only while
  the current source corpus migrates; it carries no baseline and becomes enforced
  when the corpus is green.

TypeScript and the operation SDK remain the authority for declared strategy
keys, definition/implementation binding, multi-strategy default selection, and
sole-strategy default inference. Structure does not duplicate those source
relationships. Parent operation type-boundary authority remains the single
owner that prevents implementations from deriving working types from complete
operation input/output envelopes.

The import boundary is expressed against the operation kind rather than named
domains, modules, or a fixed nesting depth: operation-local files sit under
`ops/<operation>/`, operation-private policy and rules remain under that same
operation, and shared semantic vocabulary rises to an ancestor `model/` owner.
Domain and module routers remain public composition surfaces rather than private
strategy interiors.
