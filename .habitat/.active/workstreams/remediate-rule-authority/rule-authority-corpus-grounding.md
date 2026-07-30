# Rule Authority Corpus Grounding

Status: active grounding note; identity counts reconciled 2026-07-30.

Purpose:
establish where the live rule corpus and operational ledger live before the
rule-by-rule authority cleanup pass starts. This note is not a disposition ledger and does
not authorize rule deletion, runner changes, baseline growth, or source
movement.

## Corpus Home

The executable corpus is the current live Habitat rule manifest set:

```text
.habitat/**/rule.json
```

The machine-readable operational ledger is:

```text
.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

That ledger supersedes the old `rule-remediation-layer1-action-matrix.json`
name. The old name described a prior workstream layer, not the current
rule authority cleanup container. The ledger itself remains the single active
machine-readable source for live rule rows, retired/stale references, slices,
blockers, findings, counts, and gate state.

Markdown receipts under `receipts/` remain historical explanation of prior
intent. They are not current evidence until revalidated, and they do not define
active rule rows or current queue state.

## Fresh Coverage Check

Fresh canonical-registry evidence on 2026-07-30 after
`rule-authority-ledger-identity-reconciliation-2026-07-30`:

| Measure | Count |
| --- | ---: |
| Current live `rule.json` manifests | 122 |
| Current live ledger rows | 122 |
| Missing live rows | 0 |
| Manifestless current rows | 0 |
| Retired historical rows retained in ledger | 91 |
| Duplicate live/current ids | 0 / 0 |

The reconciliation classified 46 live rules omitted from the ledger and proved
that all 45 manifestless current rows were already-deleted rule identities.
Those 45 rows moved to retired history with deletion evidence; none was
restored. The lifecycle-bound
`require_active_rule_authority_ledger_identity_parity` rule now keeps the
active identities and summary counts exact. Its receipt is
`receipts/rule-authority-ledger-identity-reconciliation.md`.

### Prior 2026-07-06 Grounding

The earlier domain-root closure had corrected eight then-omitted positive-law
rows:

- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `require_domain_model_schema_policy_owner_shape`
- `require_domain_operation_contract_file_shape`
- `require_domain_ops_binding_surface`
- `require_domain_ops_registry_surface`
- `require_domain_source_topology`
- `require_recipe_stage_authoring_file_shape`

Those rows entered as `context admission`: live authority in their then-current
context, not permanent reusable-class acceptance.

The two absorbed post-ratchet duplicate rules have been removed from the live
corpus and retained as retired history:

- `prohibit_retired_domain_root_catalogs`
- `require_domain_ops_root_presence`

## Quick Analytics

Current live manifest distribution:

| Axis | High-signal counts |
| --- | --- |
| Top areas | `.habitat/blueprints`: 66; Studio: 18; platform/resources/toolkit remainder: 14; pipeline: 10; docs: 7; workspace/global: 7 |
| Owner projects | `swooper-physics`: 58; `habitat`: 37; `mapgen-studio`: 16; all others: 11 |
| Runners | `grit`: 78; `habitat:structure`: 22; `habitat:script`: 17; `nx`: 3; `habitat:file-layer`: 2 |
| Categories | boundary: 42; structure: 27; contract: 26; execution: 14; quality: 9; output: 2; policy: 2 |
| Primary ID verbs | `require`: 65; `prohibit`: 23; `enforce`: 6; `validate`: 5; `block`: 3; `ensure`: 3; `preserve`: 3; `verify`: 3 |

Interpretation:
this is not a pure garbage-collection pass. Positive `require` authority now
substantially outweighs `prohibit` residue. Cleanup still separates durable
positive law, durable boundary rails, transitional negative guards, split-owner
rules, native-tool proof rails, and fossils.

## First Revalidation Pair

The reusable method frame for post-ratchet cleanup is:

```text
.habitat/.active/frames/POST-RATCHET-RULE-REVALIDATION-FRAME.md
```

The first active workstream document paired with that method frame is:

```text
.habitat/.active/workstreams/remediate-rule-authority/domain-root-topology-rule-revalidation-workstream.md
```

Its earlier draft input is retained at:

```text
.habitat/.active/workstreams/remediate-rule-authority/domain-root-topology-rule-revalidation-workstream-draft.md
```

The frame is the reusable component. The active workstream document is the
instance-specific controller for the completed domain-root topology ratchet.
Keep future ratchet-specific admission criteria, agent lanes, stop conditions,
and proof commands in their own workstream documents rather than in the generic
frame or this grounding note.

## Non-Claims

- No additional rule disposition is final from this grounding pass.
- No old receipt is re-promoted to current authority by being referenced here.
- No rule is safe to retire merely because it is negative.
- No positive rule is permanent standing law until it has reusable-class proof
  in the Rule Authority Cleanup container.

## Reproduction Commands

```bash
bun habitat check --json --rule require_active_rule_authority_ledger_identity_parity
jq '.corpus' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

The selected rule uses Habitat's canonical registry loader. Do not replace it
with a second `find`-based definition of live membership.
