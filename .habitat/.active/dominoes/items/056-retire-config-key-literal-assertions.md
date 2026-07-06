# Domino 056: Retire Config-Key Literal Assertions

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### 56. Retire Config-Key Literal Assertions

Purpose: apply the state-collapse correction for retired config keys.

Disposition:

| Rule | Action | Reason | Record |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | deleted without replacement | Retired hydrology config-key literals do not need live negative assertions. The one live collision, `hydrology-hydrography.lakes`, proves the broad lexical rule is actively misleading. Valid key-space belongs to source schemas, TypeScript types, and config compilation. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-config-key-retirement-slice.md` |
| `prohibit_legacy_morphology_config_keys` | deleted without replacement | `landmass` and `oceanSeparation` are retired public-config names, not likely recurrence risks that deserve Habitat law or package-test blacklists. Current Morphology config shape is structurally owned by closed public schemas and compilation. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-config-key-retirement-slice.md` |

Moves it forward:

- Deletes two `_remainder` rule packets instead of replacing them with package
  negative tests or new Habitat negative assertions.
- Updates the canonical JSON row counts and retired-history records.
- Updates the rule remediation method frames so future agents treat retired
  literals as state-collapse candidates before inventing replacement rails.

Closure note:

- No package tests or source config behavior changed.
- The proof claim is authority-tree cleanup: retired literal assertions are
  gone, no replacement junk was added, and the config pipeline remains owned by
  source schemas, TypeScript types, and compilation.
