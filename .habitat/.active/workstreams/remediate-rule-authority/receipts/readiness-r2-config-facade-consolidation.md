# Readiness R2 Config-Facade Consolidation Receipt

Date: 2026-07-07

Slice: R2, config-facade consolidation.

Authority:
`.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`
R2.

## Changes

`prohibit_root_config_facade_imports_in_domain_ops` remains the live
domain-operation authority. Its source matcher now covers both existing
parent-traversal root config imports and package-alias root/domain config
facade imports:

- `@mapgen/domain/config.js`
- `@mapgen/domain/<domain>/config.js`

The Foundation-local
`prohibit_foundation_op_contract_config_bags` packet was deleted, and its live
ledger row was retired into `retiredRules`. The survivor row and corpus counts
were updated in the ledger. No replacement assertion was created for
`FoundationConfigSchema`; it is retired literal residue.

## Proof

Habitat wrapper behavior:

```bash
bun habitat check --json --rule prohibit_root_config_facade_imports_in_domain_ops --output /tmp/habitat-r2-survivor-final.json
```

Output: exited 0. The widened survivor passed on the current tree with
`ok: true` and zero diagnostics.

Injected violation proof:

```bash
bun habitat check --json --rule prohibit_root_config_facade_imports_in_domain_ops --output /tmp/habitat-r2-survivor-violation.json
```

Probe:
`mods/mod-swooper-maps/src/domain/foundation/ops/__r2_config_facade_probe__/contract.ts`
temporarily imported `@mapgen/domain/config.js`.

Output: exited 1. The survivor produced one diagnostic on the probe file at
line 1 with message `Do not import domain-root config facades from ops.`

Injected violation proof:

```bash
bun habitat check --json --rule prohibit_root_config_facade_imports_in_domain_ops --output /tmp/habitat-r2-survivor-domain-alias-violation.json
```

Probe:
`mods/mod-swooper-maps/src/domain/foundation/ops/__r2_config_facade_probe__/contract.ts`
temporarily imported type-only `@mapgen/domain/foundation/config.js`.

Output: exited 1. The survivor produced one diagnostic on the probe file at
line 1 with message `Do not import domain-root config facades from ops.`

Clean sample proof:

```bash
bun habitat check --json --rule prohibit_root_config_facade_imports_in_domain_ops --output /tmp/habitat-r2-survivor-clean-probe.json
```

Probe:
`mods/mod-swooper-maps/src/domain/foundation/ops/__r2_config_facade_probe__/clean.ts`
temporarily imported `./config.js`, `../config.js`, and
`@mapgen/domain/foundation/ops/demo/config.js`.

Output: exited 0. The survivor passed with `ok: true` and zero diagnostics.

Record truth proof / source absence proof:

```bash
rg -n "FoundationConfigSchema" mods packages --glob '*.ts' --glob '*.tsx' --glob '!dist/**' --glob '!node_modules/**'
```

Output: exited 1 with zero matches.

Record truth proof / source absence proof:

```bash
rg -n "from [\"'](?:@mapgen/domain(?:/[^/]+)?/config(?:\.js)?|(?:\.\./){2,}config\.js)[\"']|import\([\"'](?:@mapgen/domain(?:/[^/]+)?/config(?:\.js)?|(?:\.\./){2,}config\.js)[\"']\)|export (?:\*|\{[^}]*\}) from [\"'](?:@mapgen/domain(?:/[^/]+)?/config(?:\.js)?|(?:\.\./){2,}config\.js)[\"']" mods/mod-swooper-maps/src/domain --glob '*.ts'
```

Output: exited 1 with zero matches.

Record truth proof:

```bash
bun habitat check --json --rule prohibit_foundation_op_contract_config_bags --output /tmp/habitat-r2-deleted-selector.json
```

Output: exited 1 through `rule-selection-integrity` with
`Unknown Habitat rule id: "prohibit_foundation_op_contract_config_bags".`

Record truth proof:

```bash
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json | wc -l
jq '.rules | length' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
jq '.retiredRules | length' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

Output: live manifests `111`, live ledger rows `111`, retired rows `25`.

Record truth proof:

```bash
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json -exec jq -r '.id' {} + | sort > /tmp/habitat-r2-live.ids
jq -r '.rules[].ruleId' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json | sort > /tmp/habitat-r2-ledger.ids
comm -23 /tmp/habitat-r2-live.ids /tmp/habitat-r2-ledger.ids
comm -13 /tmp/habitat-r2-live.ids /tmp/habitat-r2-ledger.ids
uniq -d /tmp/habitat-r2-ledger.ids
```

Output: missing, extra, and duplicate sections were empty.

Native tool behavior:

```bash
jq empty .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
git diff --check
```

Output: both exited 0.

## Review

Fresh review lane: Ramanujan (`019f39ea-f90a-7983-bcab-7853e29d4c70`).

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Ledger `updatedOn` remained `2026-07-06` while R2 records were dated `2026-07-07`. | P2 | accepted | Updated the ledger top-level `updatedOn` to `2026-07-07`. |
| Receipt still said the review lane was pending. | P2 | accepted | Replaced the pending note with this review disposition. |
| R2 must land on the recorded `codex/readiness-r2-config-facade-consolidation` layer. | P2 | accepted | Committed from that Graphite layer; the ledger records `branch-head`. |
| Absence proof labels could be made stricter. | P3 | accepted | Relabeled the source absence command blocks as `Record truth proof / source absence proof`. |

The reviewer found no P1 issues. After the accepted fixes above, no accepted
unresolved P1/P2 findings remain for R2.

## Non-Claims

This does not begin the descent. It does not claim operation-contract topology
or schema metadata authority. It does not preserve a Foundation-specific config
bag rule id, and it does not preserve `FoundationConfigSchema` as a live
negative guard. The remaining rule owns only root/domain config-facade imports
from domain ops while preserving op-local and named operation config imports.
