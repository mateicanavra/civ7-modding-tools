# Row Ledger Seed

Status: seed corpus from 2026-07-06 censuses; evidence lanes re-derive at execution open

Staleness rule:
every count and pointer below is dated evidence, not authority. The first
execution act of this descent is a fresh census that confirms or supersedes
each row. A row that no longer reproduces is closed as stale with the fresh
command output quoted.

Terrain baseline (2026-07-06):

- 101 operation roots under `mods/mod-swooper-maps/src/domain/*/ops/*/`;
- every operation root conforms to the enforced depth-one grammar
  (`contract.ts`, `index.ts` + allowed `types.ts`, `rules/`, `strategies/`,
  `policy/`);
- zero ops children lack `contract.ts` (the old shared/support pockets are
  gone);
- 92 operations have `strategies/`; 83 of those are exactly
  `default.ts + index.ts`;
- zero `artifacts.ts` files currently exist inside operation directories.

R6 re-verification (2026-07-07):
the readiness R6 advisory scout re-ran the seed census on this stack tip and
reproduced the standard-recipe child list, zero missing operation contracts,
and the strategy import census. The Studio runtime packet-train remains
advisory context for final review; its current tip has `.habitat`, tooling,
domain, and recipe deltas that are not folded into this seed until they land or
are otherwise selected as this descent's execution base.

## A. Residual Rule Rows

| Row | Rule | Current state (ledger) | Destination class | Waiting on |
| --- | --- | --- | --- | --- |
| A1 | `require_ecology_canonical_op_module_topology` | blocked-prior-source-owner-design; exemplar proxy, mode `open`, ecology-only | replace: generalize its three clauses into the operation scope grammar, then delete after survivor proof | D1, D4 |
| A2 | `prohibit_domain_artifacts_modules` | deletion-blocked-partial-absorber; a nested `rules/artifacts.ts` probe passed topology and failed only this sentry | delete after support-directory grammar closes the gap it guards, with the same injected probe failing the survivor law | D4 (grammar), execution |
| A3 | `prohibit_foundation_strategy_nonlocal_imports` | complete-no-generic-domain-operation-slice; foundation-local allowlist, underbroad | replace: generic positive strategy import law, then retire the foundation row after clean-sample plus injected-violation proof | D2 |
| A4 | `prohibit_foundation_rules_tectonics_shim_reexports` | complete-no-generic-domain-operation-slice; exact blacklist | delete by absence (zero live `lib/tectonics` re-exports in foundation ops `rules/` on 2026-07-06) or absorb into the `rules/` grammar | D4 |
| A5 | `validate_ecology_op_contract_quality` | blocked-prior-source-owner-design; mixed script: schema descriptions + JSDoc + stale stage path | split: schema-description clause to the ruled owner; JSDoc and stale-path clauses delete | D3 |

`prohibit_foundation_op_contract_config_bags` is not a row here: readiness
slice R2 retires it before this descent executes.

## B. Source Rows: Strategy Import Anomalies

Census command:

```bash
rg -o "from ['\"]([^'\"]+)['\"]" -r '$1' --no-filename \
  mods/mod-swooper-maps/src/domain/*/ops/*/strategies/*.ts
```

Observed class distribution (509 specifiers): 162 `@swooper/mapgen-core/*`,
108 op-local `./`, 104 `../contract.js`, 56 `../rules/*`, 53 own-domain
`model/*`, 13 `../policy/*`, 3 `../types.js`, 3 `@civ7/map-policy`, and the
anomalies below.

| Row | Pointer | Violation under the expected law | Destination class |
| --- | --- | --- | --- |
| B1 | `placement/ops/plan-starts/strategies/default.ts:18` imports `../../../../hydrology/index.js` | cross-domain reach from a strategy | needs semantic move: consume via contract inputs or placement model policy; exact destination locked during D2 execution |
| B2 | `placement/ops/plan-natural-wonders/strategies/default.ts:38` imports `@mapgen/domain/hydrology/model/policy/river-class.js` | cross-domain reach via package specifier | same class as B1 |
| B3 | `ecology/ops/plot-effects-score-snow/strategies/default.ts:3` imports `../../plan-plot-effects/rules/index.js` | cross-operation reach from a strategy | move the shared signal to ecology `model/` or the consuming contract; lock during D2 execution |
| B4 | one census specifier parsed as bare `mountain` | parse artifact, not a confirmed violation | re-derive in the fresh census; close as stale if it does not reproduce |

## C. Source Rows: Support-Directory Grammar Gaps

| Row | Pointer | Gap | Destination class | Waiting on |
| --- | --- | --- | --- | --- |
| C1 | `foundation/ops/compute-plates-tensors/rules/` | no `index.ts` aggregation | defined destination: add aggregation or ruled files-only grammar | D4 |
| C2 | `morphology/ops/compute-belt-drivers/rules/` | same | same | D4 |
| C3 | `morphology/ops/plan-foothills/rules/` | same | same | D4 |
| C4 | `morphology/ops/plan-ridges/rules/` | same | same | D4 |
| C5 | `placement/ops/plan-starts/policy/` | no `index.ts` aggregation | same grammar decision applied to `policy/` | D4 |
| C6 | `resources/ops/select-resource-sites/policy/` | same | same | D4 |

## D. Source Rows: Strategy Container Presence

Nine operations have no `strategies/` directory; all are foundation
`compute-*` and every one of their contracts declares a strategy envelope:

`compute-crust-evolution`, `compute-crust`, `compute-mantle-forcing`,
`compute-mantle-potential`, `compute-mesh`, `compute-plate-graph`,
`compute-plate-motion`, `compute-plates-tensors`, `compute-tectonic-segments`.

Row state: red only under decision packet 001 option (a); destination is a
mechanical single-strategy wrap per operation. Under option (b) these rows
close green with the alternate shape recorded.

## E. Source Rows: Contract Metadata Gaps

95 of 101 contracts carry `description:` metadata. The six gaps:

`foundation/ops/compute-hotspot-events/contract.ts`,
`foundation/ops/compute-segment-events/contract.ts`,
`foundation/ops/compute-tectonic-provenance/contract.ts`,
`foundation/ops/compute-tectonics-current/contract.ts`,
`foundation/ops/compute-tracer-advection/contract.ts`,
`placement/ops/plan-wonders/contract.ts`.

Row state: red only under the owner ruled in decision packet 003; destination
is mechanical metadata completion under that owner's proof surface.

## Row Obligations

Rows stay individually visible through grouping, fanout, and review. Before
any source-moving execution, moved or deleted rows expand to exported symbols
and behavior-bearing definitions, each marked Preserved, Intentional loss, or
Unresolved loss, per the descent frame's execution-authorization gate.
