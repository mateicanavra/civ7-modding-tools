# Domino 086: Public Domain Test Imports Grit Falsifier

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 86: Public Domain Test Imports Grit Falsifier

Status: closed on `codex/habitat-public-domain-test-imports-falsifier`.

Purpose: test whether `require_public_domain_surfaces_in_tests` could become a
single packet-local Grit rule without moving the predicate into package-owned
tests or keeping unnecessary MJS.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `require_public_domain_surfaces_in_tests` | Retained as packet-needed blocker with current Habitat script runner. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-public-domain-test-imports-grit-falsifier.md` |

Moves it forward:

- Confirms the semantic predicate is static import/export source shape, but the
  current Habitat/Grit execution plane cannot prove it because `.gritignore`
  excludes `**/test/` and `**/*.test.ts`.
- Prevents a false green Grit conversion: a temporary forbidden deep import in
  a Swooper test file was ignored by Grit.
- Keeps the operational finding in the canonical remediation JSON and does not
  create a second Markdown matrix.

Closure note:

- The current Habitat script was restored and focused check passed.
- No package-owned tests were added, and Nx project-boundary policy was not
  changed.
