# Domino 052: Admit Domain Operation Strategy Blueprint Authority

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

`domain-operation-strategy` was admitted as product-backed blueprint authority based on operation strategy envelope source/docs, but no live rule moved because current predicates are foundation-local, helper authority, or contract-quality pressure rather than every-valid-strategy authority.

## Detail

#### 52. Admit Domain Operation Strategy Blueprint Authority

Purpose: assert the product-backed blueprint destination for MapGen domain
operation strategies without forcing current foundation-local or helper
cleanup rules into the wrong authority.

Source-backed constructibility:

- MapGen op authoring docs require a strategy surface and bind operations with
  `defineOp({ ..., strategies })` plus `createOp(Contract, { strategies })`.
- The glossary and ops-module contract define ops as strategy envelopes used
  within steps.
- `packages/mapgen-core/src/authoring/op/contract.ts` requires strategy config
  schemas and builds the operation config envelope.
- `packages/mapgen-core/src/authoring/op/create.ts` rejects missing or unknown
  strategy implementations and dispatches normalize/run by selected strategy.
- `packages/mapgen-core/src/authoring/op/strategy.ts` defines
  `createStrategy` and the typed strategy implementation surface.
- Current source has 104 strategy implementation files and 104
  `createStrategy(...)` calls across foundation, morphology, hydrology,
  ecology, resources, and placement domains.

Disposition:

| Row | Decision | Reason | Follow-up |
| --- | --- | --- | --- |
| `domain-operation-strategy` | admit blueprint authority | The construct has independent source shape: strategy id, config schema, optional normalization, run function, and op-contract binding. | Future whole-rule strategy predicates can target `.habitat/blueprints/domain-operation-strategy/`. |
| `prohibit_foundation_strategy_nonlocal_imports` | no move | The predicate is a foundation-specific allowed import list, not every valid operation strategy. | Design a generic positive strategy-locality rule before moving or deleting this guard. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | no move | The predicate is helper-surface consolidation across strategy and non-strategy files. | Name positive helper/import authority before deletion or admission. |
| `validate_ecology_op_contract_quality` | no move | The predicate is ecology operation contract-quality pressure, not strategy implementation authority. | Define general operation contract-quality authority and repair stale ecology path coverage. |

Moves it forward:

- Creates `.habitat/blueprints/domain-operation-strategy/README.md` as the
  admitted authority lane.
- Updates `AUTHORITY-TREE-SHAPE.md` and supersedes the older
  `DESTINATION-SIMPLIFICATION-FRAME.md` exclusion.
- Converts the Layer 1 action matrix and former authority-tree rule ledger into
  one canonical JSON operational record so future metrics and process queries
  do not depend on brittle Markdown parsing or duplicated matrices.

Review disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| `domain-operation-strategy` is constructible and product-backed. | P2 | accepted | Authority lane and tree-shape docs created. | Generic strategy-locality or strategy-contract rules still need decision packets before movement. |
| No current live rule moves whole into the new authority. | P2 | accepted | Explicit non-move dispositions recorded in slice, ledger, and blueprint README. | Avoid using `strategies/**/*.ts` scan roots as an owner test. |
| The old authority-tree rule ledger still looked like a second current-state matrix. | P2 | accepted | Absorbed its unique process data into `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json` and removed the Markdown ledger. | None; JSON is the active source of truth. |

Closure note:

- No rule manifests, runners, support files, or execution-surface docs changed.
- This slice does not delete any negative guard and intentionally stops before
  positive-kind assertion/deletion pairs.
- The current live corpus remains 122 rules.
