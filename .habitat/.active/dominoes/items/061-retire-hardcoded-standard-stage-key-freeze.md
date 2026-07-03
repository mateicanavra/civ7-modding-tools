# Domino 061: Retire Hardcoded Standard Stage-Key Freeze

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 61: Retire Hardcoded Standard Stage-Key Freeze

Status: closed on `codex/habitat-retire-standard-stage-key-freeze`.

Purpose: remove duplicate hardcoded standard stage-key state after the standard
recipe topology rail became source-derived.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `verify_standard_recipe_declared_stage_keys` | retired/deleted | The rule hardcoded the accepted stage id list and parsed `recipe.ts`; stage ids are now compared from `recipe.ts` and `contract-manifest.ts` by the topology rail, while runtime/contract parity remains live for stage and step order. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-standard-stage-key-freeze-retirement-slice.md` |

Moves it forward:

- Removes one duplicate Habitat rule and one hardcoded stage-id list.
- Keeps the distinct topology, runtime/contract parity, generated artifact
  parity, and public authoring-surface checks intact.

Closure note:

- The proof claim is duplicate retirement only.
- This does not change the standard recipe stage set or generated outputs.
