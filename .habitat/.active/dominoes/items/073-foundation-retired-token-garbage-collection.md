# Domino 073: Foundation Retired Token Garbage Collection

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 73: Foundation Retired Token Garbage Collection

Status: closed on `codex/habitat-foundation-retired-token-garbage-collection`.

Purpose: delete Foundation retired-literal assertions that no longer deserve
live Habitat or package-test enforcement.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_removed_foundation_profile_config_tokens` | Deleted without replacement; duplicate package-test blacklist assertions removed. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-foundation-retired-token-garbage-collection.md` |
| `prohibit_removed_foundation_wrap_polar_maturity_tokens` | Deleted without replacement; duplicate package-test blacklist assertions removed. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-foundation-retired-token-garbage-collection.md` |

Moves it forward:

- Applies retired-literal state collapse: old config/profile/wrap/polar token
  names are not live source authority.
- Keeps valid Foundation state owned by current schemas, contracts, artifacts,
  and compilation code.
- Removes package-test junk-drawer coverage for the deleted static assertions.

Closure note:

- `prohibit_legacy_compute_tectonics_token` remains as the separate accepted
  Habitat Grit recurrence guard for the retired monolithic tectonics token.
- No replacement negative assertion was created.
