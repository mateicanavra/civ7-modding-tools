# Domino 064: Admit Recipe-DAG Split Rails

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 64: Admit Recipe-DAG Split Rails

Status: closed on `codex/habitat-recipe-dag-split-rail-classification`.

Purpose: repair a stale `consolidation/dedup` classification for the Studio
recipe-DAG runtime-source dependency guard.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `prohibit_recipe_dag_runtime_source_dependencies` | reclassified to context admission | It is the direct-token Grit complement to `require_recipe_dag_contract_metadata`, not a duplicate of it. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-recipe-dag-split-rail-reclassification.md` |
| `require_recipe_dag_contract_metadata` | unchanged | It remains graph-aware Recipe-DAG contract metadata authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-recipe-dag-split-rail-reclassification.md` |

Moves it forward:

- Removes one stale Layer 2 packet-needed row without deleting a live rule.
- Keeps source-string/helper-token checks in Grit and graph traversal in the
  existing Habitat script.
- Avoids forcing two different proof shapes into one rule.

Closure note:

- No manifest mutation was required.
- Focused Habitat checks passed for both split rails.
