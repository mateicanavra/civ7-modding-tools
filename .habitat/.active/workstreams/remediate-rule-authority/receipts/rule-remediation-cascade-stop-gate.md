# Rule Remediation: Cascade Stop Gate

Status: superseded historical receipt.

Superseded by the canonical operational ledger:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`.

This file records a past stop gate only. Do not use it for current counts,
queues, blockers, or next actions.

## Boundary

The Layer 3 cascade closed all clean high-confidence runtime/source validation
retentions and Grit/source-rail repairs that were available at the time.
Current queue state is defined only by the canonical JSON ledger.

## Historical Packet-Needed Counts

Historical packet-needed counts from this receipt are superseded. Use
`counts`, `rules[]`, and `slices[]` in the canonical JSON ledger for current
state.

## Runtime/Source Residuals

| Rule | Reason not continued |
| --- | --- |
| `enforce_formatting_and_import_hygiene` | Valid workspace gate, but currently red from broad workspace formatting/import drift; not a clean rule-remediation slice. |
| `prohibit_runtime_local_config_default_merging` | Broad `_remainder` Grit proxy; needs handler-scope narrowing or positive config authority before admission/deletion. |

## Stop Condition

At the time, the next work was not another opportunistic Layer 3 mutation. It
needed one of these explicit scopes:

- semantic split packets and implementation,
- positive authority/deletion-pair design and implementation,
- boundary inversion decision work,
- or a separately scoped workspace hygiene/config-defaulting remediation.
