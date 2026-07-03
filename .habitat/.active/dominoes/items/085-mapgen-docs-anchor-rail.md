# Domino 085: MapGen Docs Anchor Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 85: MapGen Docs Anchor Rail

Status: closed on `codex/habitat-mapgen-docs-anchor-rail`.

Purpose: resume the cascade for one deterministic split-by-owner row and repair
the concrete stale docs anchor that kept the MapGen canonical-docs validator
red.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `validate_mapgen_docs_anchors_and_references` | Repaired stale adapter rule anchor and retained existing MapGen canonical-docs validator; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-mapgen-docs-anchor-rail.md` |

Moves it forward:

- Fixes a real failing docs authority anchor.
- Keeps MapGen canonical-docs anchor/reference hardening in the native docs
  validator instead of splitting warning policy prematurely.
- Reduces the split-by-owner packet-needed count by one without making a
  product/architecture semantic decision.

Closure note:

- Focused Habitat check passed after the anchor repair.
