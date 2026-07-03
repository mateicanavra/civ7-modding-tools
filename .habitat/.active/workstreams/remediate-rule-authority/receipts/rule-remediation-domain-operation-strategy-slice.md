# Rule Remediation Domain Operation Strategy Slice

Status: closed

Branch: `codex/habitat-domain-operation-strategy-authority`

Source matrix: `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

Action class: product-backed blueprint authority creation

Purpose: record the Layer 2 authority decision and Layer 3 documentation slice
for admitting `domain-operation-strategy` as an affirmed Habitat blueprint
authority without moving any current rule packet.

## Selection

Selected for authority admission:

| Authority | Semantic outcome | Proof class |
| --- | --- | --- |
| `domain-operation-strategy` | Admit as constructible MapGen blueprint kind for strategy implementations bound to domain operation contracts. | source presence plus product/architecture authority |

Selected for explicit non-move:

| Rule id | Disposition |
| --- | --- |
| `prohibit_foundation_strategy_nonlocal_imports` | Keep in foundation context. The whole predicate is a foundation-specific strategy import allowlist, not every valid operation strategy. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | Keep in foundation `_remainder`. The whole predicate is helper-surface consolidation across strategy and non-strategy files. |
| `validate_ecology_op_contract_quality` | Keep in ecology `_remainder`. The whole predicate is operation contract-quality pressure, not strategy implementation authority. |

## Decision Packet

Authority: `domain-operation-strategy`.

Input: user direction to treat product-backed blueprint authorities as admissible
when architecture/docs clearly authorize them, plus Layer 1 action pressure
around operation strategy rows.

Constructibility evidence:

| Evidence | Role |
| --- | --- |
| `docs/system/libs/mapgen/how-to/add-an-op.md` | Requires an op author to know the strategy surface and use `defineOp({ ..., strategies })` plus `createOp(Contract, { strategies })`. |
| `docs/system/libs/mapgen/reference/GLOSSARY.md` | Defines an op as a strategy envelope within a step. |
| `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md` | Documents op variability through a `strategy` envelope with `config.strategy` and strategy-specific config. |
| `packages/mapgen-core/src/authoring/op/contract.ts` | Requires a `strategies` map with `default`, applies schema conventions per strategy, and creates the operation config envelope. |
| `packages/mapgen-core/src/authoring/op/create.ts` | Requires strategy implementations, rejects missing/unknown strategy ids, and dispatches normalize/run by selected strategy. |
| `packages/mapgen-core/src/authoring/op/strategy.ts` | Defines `createStrategy`, `StrategyImplFor`, and the strategy implementation surface. |
| `mods/mod-swooper-maps/src/domain/**/ops/*/strategies/*.ts` | Provides 104 current concrete strategy implementation files and 104 `createStrategy(...)` calls across six domains. |

Whole-authority fit: yes. The construct has independent product/source shape:
strategy id, schema, optional normalization, run function, and binding to an
operation contract.

Live-rule movement: none. No current live rule's entire predicate governs every
valid operation strategy implementation.

Rule id plan: no rule ids are moved, split, renamed, or deleted in this slice.

Semantic remediation decision: create the affirmed authority lane and update
tree-shape records so future packets can target `domain-operation-strategy`
when their whole predicate actually governs strategy implementations.

Proof limit: this proves constructibility and destination admission. It does
not prove a generic strategy-locality rule exists, does not delete foundation
negative guards, and does not settle contract-quality or helper-surface
positive authority.

## Implementation Receipt

Changes made:

- Created `.habitat/blueprints/domain-operation-strategy/README.md`.
- Updated `.habitat/AUTHORITY-TREE-SHAPE.md` to list and define the admitted
  blueprint authority.
- Updated `.habitat/.active/frames/DESTINATION-SIMPLIFICATION-FRAME.md` so the old
  `domain-operation-strategy` exclusion is explicitly superseded.
- Promoted `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`
  as the single canonical operational matrix for current live-corpus queries.
- Absorbed the former authority-tree rule ledger matrix into the canonical JSON
  operational ledger; no separate Markdown ledger is retained.
- Updated ledger and domino records with the no-move disposition.

No rule manifests, runners, support files, or execution-surface docs changed.

## Review Disposition

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| `domain-operation-strategy` is constructible and product-backed. | P2 | accepted | Created the blueprint authority README and updated authority tree shape. | Future rows still need positive strategy-locality/strategy-contract packets before movement or deletion. |
| No current live rule moves whole into the new authority. | P2 | accepted | Explicit non-move rows recorded for foundation strategy locality, foundation helper consolidation, and ecology contract quality. | The next implementation slice must not treat scan roots alone as strategy authority. |
| The old Markdown rule ledger still looked like a second operational matrix. | P2 | accepted | Moved its unique process data into `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json` and removed the Markdown ledger. | None; the JSON is the only active source for current matrix/process queries. |

## Closure

Verification:

- JSON matrix query and coverage assertion passed.
- Live rule manifest count remains 122.
- No rule packet paths changed; execution-surface regeneration was not needed.

Next likely action classes:

- remaining clean garbage collection: `prohibit_retired_studio_devlive_daemon_file`, only after Studio devops survivor authority is decided;
- positive authority packets that may pair with deletion, especially deterministic authored generation and helper/tag family authority;
- semantic splits, especially mixed generator/runtime and placement/resource rows.
