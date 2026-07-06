# Foundation Retired Token Garbage Collection

Status: closed on `codex/habitat-foundation-retired-token-garbage-collection`

## Purpose

Delete two Foundation retired-literal Habitat rules and the matching
package-test blacklist blocks. These rows guarded old config/profile/wrap/polar
token names that no longer define live constructible state.

## Selected Rows

| Rule id | Outcome |
| --- | --- |
| `prohibit_removed_foundation_profile_config_tokens` | Deleted without replacement. |
| `prohibit_removed_foundation_wrap_polar_maturity_tokens` | Deleted without replacement. |

## Semantic Decision

The selected predicates were retired literal assertions. They did not name a
current public key, constructible schema, boundary surface, or likely recurrence
risk. Valid Foundation state is owned by current TypeScript schemas, contracts,
artifact definitions, and compilation code. Keeping old token strings alive as
Habitat law would preserve migration residue.

The duplicate package-test blacklist blocks in
`mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` were removed for
the same reason. Package tests remain for behavior and current contracts; they
do not store retired static token blacklists.

The retired monolithic `computeTectonics` token is excluded from this slice
because it has a separate accepted Habitat Grit recurrence guard:
`prohibit_legacy_compute_tectonics_token`.

## Verification

- pre-delete `bun habitat check --rule prohibit_removed_foundation_profile_config_tokens --json`
- pre-delete `bun habitat check --rule prohibit_removed_foundation_wrap_polar_maturity_tokens --json`
- `bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts`
- `bun habitat check --rule prohibit_legacy_compute_tectonics_token --json`
- deleted-id absence proof over `.habitat/**/rule.json`
- live manifest/current JSON coverage reconciliation
- `bun habitat classify .habitat`
- `bun run --cwd tools/habitat analyze:execution-surface`
- `git diff --check`

## Record

The canonical operational record is
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`; this receipt
does not duplicate the action matrix.
