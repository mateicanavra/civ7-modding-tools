# Domain Source Topology Domino

Status: closed; current domain source topology rule is green.

This domino records the path-level `require_domain_source_topology` advisory red
that existed after the config-law repair source burn-down. A later closure pass
burned down that topology pressure; the rows below are retained as historical
proof of what was tracked, not as current red paths.

Current proof:

```bash
bun habitat check --rule require_domain_source_topology --json
```

Current result: 0 diagnostics. The rule is still advisory, but the current tree
passes the positive domain blueprint topology check.

## Re-entry Trigger

Run this domino only if `require_domain_source_topology` goes red again or
before promoting the rule from advisory to enforced. Do not treat the historical
path rows below as current work.

## Historical Path-Level Rows

| Status row | Current red path | Required next discriminator |
| --- | --- | --- |
| `S3-001` | `mods/mod-swooper-maps/src/domain/ecology/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/ecology/index.ts`, artifact exports, model owners, or operation contracts by symbol. |
| `S3-003` | `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers` | decompose operation helper bucket into `ops/classify-biomes/rules/**`, `ops/classify-biomes/strategies/**`, or ecology model owners by symbol. |
| `S3-004` | `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies` | move policy helpers to operation `rules/**` or `domain/ecology/model/policy/**` by symbol. |
| `S3-005` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies` | move policy helpers to operation `rules/**` or `domain/ecology/model/policy/**` by symbol. |
| `S3-006` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies` | move policy helpers to operation `rules/**` or `domain/ecology/model/policy/**` by symbol. |
| `S3-007` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies` | move policy helpers to operation `rules/**` or `domain/ecology/model/policy/**` by symbol. |
| `S3-008` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies` | move policy helpers to operation `rules/**` or `domain/ecology/model/policy/**` by symbol. |
| `S3-009` | `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared` | split operation-family score helpers into ecology model schemas/policy or operation-local rules/strategies by symbol; do not keep as pseudo-op. |
| `S3-010` | `mods/mod-swooper-maps/src/domain/ecology/shared` | split domain shared bucket into ecology `model/schemas/**`, `model/policy/**`, artifacts, or deletion by symbol. |
| `S3-011` | `mods/mod-swooper-maps/src/domain/ecology/types.ts` | split root type bucket into ecology model schemas/policy, artifacts, Civ7 authority, or deletion by symbol. |
| `S3-012` | `mods/mod-swooper-maps/src/domain/foundation/constants.ts` | split constants into foundation `model/policy/**`, `model/schemas/**`, artifacts, or deletion by symbol. |
| `S3-013` | `mods/mod-swooper-maps/src/domain/foundation/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/foundation/index.ts`, artifacts, model owners, or operation contracts by symbol. |
| `S3-014` | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib` | split operation lib into operation rules/strategies, foundation model owners, or approved core extraction by symbol. |
| `S3-015` | `mods/mod-swooper-maps/src/domain/foundation/shared` | split domain shared bucket into foundation model schemas/policy, artifacts, or deletion by symbol. |
| `S3-016` | `mods/mod-swooper-maps/src/domain/hydrology/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/hydrology/index.ts`, artifacts, model owners, or operation contracts by symbol. |
| `S3-017` | `mods/mod-swooper-maps/src/domain/hydrology/ops/shared` | split operation-family shared helpers into hydrology model owners or real operation-local rules/strategies; do not keep as pseudo-op. |
| `S3-019` | `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts` | move standalone river-network metrics primitive/policy to `domain/hydrology/model/schemas/**` or `domain/hydrology/model/policy/**` by symbol. |
| `S3-020` | `mods/mod-swooper-maps/src/domain/hydrology/shared` | split domain shared bucket into hydrology model schemas/policy, artifacts, or deletion by symbol. |
| `S3-021` | `mods/mod-swooper-maps/src/domain/morphology/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/morphology/index.ts`, artifacts, model owners, or operation contracts by symbol. |
| `S3-022` | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts` | move helper into operation rules/strategies or morphology/foundation model owner by symbol. |
| `S3-023` | `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared` | split operation-family pseudo-op into morphology model schemas/policy or operation-local rules/strategies; do not keep as pseudo-op. |
| `S3-024` | `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts` | move fake-op rules into morphology model policy or real operation rules, or delete after reference proof. |
| `S3-025` | `mods/mod-swooper-maps/src/domain/morphology/shared` | split domain shared bucket into morphology model schemas/policy, artifacts, or deletion by symbol. |
| `S3-027` | `mods/mod-swooper-maps/src/domain/placement/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/placement/index.ts`, artifacts, model owners, or operation contracts by symbol. |
| `S3-029` | `mods/mod-swooper-maps/src/domain/resources/contract.ts` | retire root facade into `mods/mod-swooper-maps/src/domain/resources/index.ts`, artifacts, model owners, or operation contracts by symbol. |
| `S3-030` | `mods/mod-swooper-maps/src/domain/resources/lib` | split resource data/evidence helpers into `domain/resources/model/data/**`, `domain/resources/model/policy/**`, artifacts, `@civ7/map-policy`, or the exact `resource-policy-data-contract.domino.md` rows by symbol. |
| `S3-032` | `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/signals.ts` | split signal helper into operation rules, resource model policy/schema, deletion, or exact resource policy data-contract row by symbol. |
| `S3-033` | `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/signals.ts` | split signal helper into operation rules, resource model policy/schema, deletion, or exact resource policy data-contract row by symbol. |
| `S3-034` | `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/signals.ts` | split signal helper into operation rules, resource model policy/schema, deletion, or exact resource policy data-contract row by symbol. |
| `S3-035` | `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/signals.ts` | split signal helper into operation rules, resource model policy/schema, deletion, or exact resource policy data-contract row by symbol. |
| `S3-036` | `mods/mod-swooper-maps/src/domain/resources/policy` | split resource policy folder into `domain/resources/model/policy/**`, `@civ7/map-policy`, or deletion by symbol. |

## Closed During Repair

These historical Stage 3 rows no longer appear in the current topology output:

- `S3-002`: `domain/ecology/feature-engine-legality.ts` deleted; official feature legality is owned by `@civ7/map-policy` and map-stage projection/application.
- `S3-018`: `domain/hydrology/river-class.ts` moved to `domain/hydrology/model/policy/river-class.ts`.
- `S3-026`: `domain/placement` no longer reports a missing model slot in current topology output.
- `S3-028`: `domain/resources` now has `domain/resources/model/schemas/**`.
- `S3-031`: `domain/resources/ops/derive-habitat-fields/note-to-agent.md` deleted as non-source residue.
