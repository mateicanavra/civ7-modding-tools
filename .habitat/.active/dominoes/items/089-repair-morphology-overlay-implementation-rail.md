# Domino 089: Repair Morphology Overlay Implementation Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 89: Repair Morphology Overlay Implementation Rail

Status: closed on `codex/habitat-morphology-overlay-implementation-rail`.

Purpose: close `prohibit_morphology_overlay_implementation_reads` as a live
Morphology no-overlay implementation rail instead of treating it as a user
semantic gate or converting the static assertion into package tests or an MJS
script.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_morphology_overlay_implementation_reads` | Retained in the standard recipe Morphology rules lane; repaired the Grit predicate to cover `morphology*` step files and exact `./overlays.js` imports. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-morphology-overlay-implementation-rail.md` |

Moves it forward:

- Removes one stale boundary-inversion packet-needed row from the canonical
  remediation JSON.
- Keeps the rule in Habitat/Grit, where intra-project static source-shape
  assertions belong.
- Avoids moving retired/static source-policy assertions into package-owned
  tests.

Closure note:

- A temporary `./overlays.js` import probe in
  `morphology-shelf/steps/computeShelf.ts` failed the repaired Habitat/Grit
  rule and was removed.
- Focused Habitat check passed after probe removal.
- Broader overlay/story ownership rows remain separate semantic gates.
