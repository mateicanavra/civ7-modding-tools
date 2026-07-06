# Rule Authority Corpus Grounding

Status: active grounding note for the upcoming Rule Authority Cleanup container.

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

Markdown receipts under `receipts/` remain historical explanation and evidence.
They do not define active rule rows or current queue state.

## Fresh Coverage Check

Fresh disk evidence on 2026-07-06:

| Measure | Count |
| --- | ---: |
| Current live `rule.json` manifests | 114 |
| Current live ledger rows | 114 |
| Missing live rows | 0 |
| Extra live rows | 0 |
| Retired historical rows retained in ledger | 22 |
| Stale/superseded references retained in ledger | 16 |

The previous ledger had 106 active rows and missed the eight positive-law rules
created or ratcheted by the completed domain-root topology descent:

- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `require_domain_model_schema_policy_owner_shape`
- `require_domain_operation_contract_file_shape`
- `require_domain_ops_binding_surface`
- `require_domain_ops_registry_surface`
- `require_domain_source_topology`
- `require_recipe_stage_authoring_file_shape`

Those rows are now seeded as `context admission` entries. That is a tracking
state, not final standing-law classification. The Rule Authority Cleanup pass
must still review each row with fresh evidence before keep, retire, replace, or
split decisions are authorized.

## Quick Analytics

Current live manifest distribution:

| Axis | High-signal counts |
| --- | --- |
| Top areas | `.habitat/blueprints`: 32; `.habitat/civ7/mapgen/pipeline`: 29; `.habitat/civ7/mapgen/domains`: 17; Studio: 7; workspace/global: 5; docs: 7; platform/resources/toolkit remainder: 17 |
| Owner projects | `mod-swooper-maps`: 79; `habitat`: 18; `mapgen-studio`: 7; everything else: 10 |
| Runners | `grit`: 71; `habitat:script`: 31; `habitat:structure`: 6; `habitat:file-layer`: 5; `nx`: 1 |
| Categories | boundary: 39; contract: 28; structure: 14; execution: 13; output: 9; quality: 8; policy: 3 |
| ID verbs | `prohibit`: 49; `require`: 32; `validate`: 7; `verify`: 6; `preserve`: 6; `block`: 5; `enforce`: 5; `ensure`: 3; `protect`: 1 |
| Rough assertion polarity | positive-ish verbs: 60; `prohibit`/`block` guards: 54 |

Interpretation:
this is not a pure garbage-collection pass. Roughly half the corpus is already
positive or preserving authority. The cleanup needs to separate durable positive
law, durable boundary rails, transitional negative guards, split-owner rules,
native-tool proof rails, and fossils.

## Likely Overlap Lanes To Review First

These are analytical hypotheses only. They seed review priority; they do not
settle any row disposition.

1. Domain topology and fossil guards:
   `require_domain_source_topology` likely overlaps with retired-domain-root,
   broad domain artifact module, and older domain topology guards.
2. Domain operation surfaces:
   `require_domain_ops_binding_surface`,
   `require_domain_ops_registry_surface`, and
   `require_domain_operation_contract_file_shape` likely overlap with
   config-bag, root config facade, contract-root, and operation-local negative
   guards.
3. Artifact owner surfaces:
   `require_artifact_file_shape` and
   `require_artifact_index_aggregate_shape` likely absorb some old artifact
   alias, tag, and validation-owner concerns, but generated recipe output
   parity/currentness remains a separate proof class.
4. Recipe-stage authoring:
   `require_recipe_stage_authoring_file_shape` likely overlaps with wrapper-only
   advanced config, stage config bag, sentinel passthrough, and standard public
   authoring-surface checks.
5. Runtime/build/generated-output rails:
   rules that mention runtime, adapter, generated output, `dist`, or currentness
   need proof-class review before any deletion; many likely belong in Nx,
   package-local validation, generated-output protection, or file-layer rails
   rather than semantic Habitat patterns.

## Non-Claims

- No rule disposition is final from this grounding pass.
- No old receipt is re-promoted to current authority by being referenced here.
- No rule is safe to retire merely because it is negative.
- No positive rule is permanent standing law until it has reusable-class proof
  in the Rule Authority Cleanup container.

## Reproduction Commands

```bash
find .habitat -path '*/rule.json' -print | sort
jq -r '.rules[]?.ruleId' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json | sort
comm -23 <(find .habitat -path '*/rule.json' -print | while read p; do jq -r '.id' "$p"; done | sort) <(jq -r '.rules[]?.ruleId' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json | sort)
comm -13 <(find .habitat -path '*/rule.json' -print | while read p; do jq -r '.id' "$p"; done | sort) <(jq -r '.rules[]?.ruleId' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json | sort)
```
