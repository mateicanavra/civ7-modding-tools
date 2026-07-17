# Domain Operation Strategy Blueprint

Status: affirmed constructible kind, initial authority lane

Owner: DRA Habitat authority-tree workstream

Domino: 52. Admit Domain Operation Strategy Blueprint Authority

## Purpose

`domain-operation-strategy` is the MapGen blueprint kind for strategy
implementations bound to domain operation contracts. It governs a declared
operation strategy id, its strategy-specific config schema, optional
normalization, deterministic `run` behavior, and the `defineOp`/`createOp`/
`createStrategy` binding that makes the strategy selectable through the
operation config envelope.

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
- `mods/mod-swooper-maps/src/domain/**/ops/*/strategies/*.ts`

The live source has 104 concrete strategy implementation files and 104
`createStrategy(...)` calls across foundation, morphology, hydrology, ecology,
resources, and placement domains. The construct is not foundation-only cleanup
and not generic folder hygiene.

## Admission Rule

Admit rule packets here only when the whole predicate governs every valid
domain operation strategy implementation or strategy binding. Good candidates
include rules about strategy id binding, strategy config schema ownership,
missing or unknown strategy implementations, deterministic strategy execution,
strategy normalization, or strategy envelope participation.

Do not admit rules merely because their scan roots include `strategies/**/*.ts`.
Strategy files can be evidence for helper-surface, foundation-local import,
operation topology, runtime validation, or recipe policy concerns without being
strategy-kind authority.

## Explicit Non-Moves

The initial admission slice moves no live rule packets.

- `prohibit_foundation_strategy_nonlocal_imports` remains foundation context
  authority. Its predicate is a foundation-specific allowed import list for
  decomposed foundation strategy files, not a rule for every valid strategy
  implementation.
- `prohibit_foundation_duplicate_math_helper_redefinitions` remains foundation
  `_remainder` debt. It governs helper-surface consolidation across strategy
  and non-strategy files, not strategy-kind authority.
- `validate_ecology_op_contract_quality` is retired. Generic MapGen Grit
  authority owns declaration-site JSDoc; schema-description semantics remain
  outside strategy topology and are not approximated by an Ecology source
  parser.

Future strategy-locality or strategy-contract rules should be designed as
positive `domain-operation-strategy` authority before moving or deleting the
foundation-local negative guard.
