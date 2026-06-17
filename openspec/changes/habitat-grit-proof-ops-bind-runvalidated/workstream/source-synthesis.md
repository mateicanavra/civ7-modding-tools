# Source Synthesis - Ops Bind RunValidated

| Source | Row fact | Boundary |
| --- | --- | --- |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Recovery candidate asks for `ops.bind` / `runValidated` runtime orchestration proof. | Candidate row only; exact predicate must come from source evidence. |
| `scripts/lint/lint-domain-refactor-guardrails.sh` | Retired full-profile guardrail scans each domain `ops` root with `-g "**/index.ts"` for `\bops\.bind\(` or `\brunValidated\(`. | Proving lineage; not retired parity closure. |
| `grit-runtime-run-validated` | Existing active row owns runtime recipe step and domain strategy `runValidated` calls. | This row must avoid duplicating that proof. |
| `grit-op-calls-op` | Existing active row owns sibling op runtime imports and domain ops barrel imports in domain op runtime entrypoints. | This row owns the neighboring call-orchestration subset. |
| `taxonomy.md` | Runtime-purity family keeps runtime layers away from `runValidated`. | Policy family only; not row proof. |

## Current Predicate

The row is scoped to Swooper domain op runtime entrypoints:

`mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/index.ts`

It reports direct `ops.bind(...)`, optional-chain `ops?.bind(...)` as a native
parser fact of the same pattern, and direct `runValidated(...)`. Recipe-step
and domain-strategy `runValidated` calls remain owned by
`grit-runtime-run-validated`.
