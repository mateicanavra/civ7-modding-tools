# Domino 092: Reopen Local-Proxy Authority Rows

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 92: Reopen Local-Proxy Authority Rows

Status: closed on `codex/habitat-local-proxy-authority-rereview`.

Purpose: correct the Layer 1 / Layer 2 decision record after the user
identified the missing rule: a specially owned boundary in one repeated niche
instance is usually a design smell and should be checked against architecture
docs before being admitted locally.

Disposition receipt:

| Corpus | Action | Receipt |
| --- | --- | --- |
| Previously settled local/context rows that looked like repeated-kind special cases | Reopened 26 rows as packet-needed and repopulated the canonical Layer 2 queue. No rule packets were moved or deleted. | Recorded directly in `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`; this domino is the narrative receipt. |

Canonical queue repair:

- The queue is operational only in `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`.
- Query queued Layer 2 work from `slices[] | select(.status == "queued")`.
- Do not copy the queue, counts, or packet-needed rows into domino receipts.

Moves it forward:

- Reopens the Foundation helper decision from Domino 91: the row is now paired
  with `prohibit_runtime_helper_redeclarations` for broader MapGen
  helper-surface authority consolidation.
- Reopens additional local proxy clusters around domain-operation surfaces,
  standard stage-kind truth/projection authority, dependency/effect tag family
  authority, generated-zone/resource package authority, and Studio/platform
  mixed-owner rails.
- Updates the canonical remediation JSON instead of creating a second matrix.

Closure note:

- Fresh review lanes inspected actual rule packets, source, and architecture
  docs.
- The re-review evidence was consolidated into the canonical JSON and this
  domino; no separate workstream matrix/receipt document is retained.
- The next deterministic move is Layer 2 decision-packet work for the reopened
  broader-authority slices, not Layer 3 mutation from the previous empty queue.
