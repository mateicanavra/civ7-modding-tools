# Rule Remediation: Recipe-DAG Split-Rail Reclassification

Status: closed on `codex/habitat-recipe-dag-split-rail-classification`

Canonical record:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Purpose

Repair a stale Layer 1 `consolidation/dedup` label for
`prohibit_recipe_dag_runtime_source_dependencies`.

## Decision

Do not consolidate or delete the Grit rule. The adjacent graph-aware
`require_recipe_dag_contract_metadata` rule explicitly owns import graph
traversal, while direct runtime-source and helper-token bans remain split to
Grit.

This is deliberate split-rail authority:

- `require_recipe_dag_contract_metadata`: graph-aware contract-only import
  traversal.
- `prohibit_recipe_dag_runtime_source_dependencies`: direct import/string/helper
  token relapse detection in the recipe-DAG service and studio contract source.

## Disposition Receipt

| Rule id | Action | Reason |
| --- | --- | --- |
| `prohibit_recipe_dag_runtime_source_dependencies` | reclassified to context admission | Source review proved it complements, rather than duplicates, `require_recipe_dag_contract_metadata`. |
| `require_recipe_dag_contract_metadata` | unchanged | Already admitted Recipe-DAG graph-aware contract metadata authority. |

## Proof Scope

Focused Habitat checks passed for both rules. No manifest, runner, source, test,
or generated output mutation was required.
