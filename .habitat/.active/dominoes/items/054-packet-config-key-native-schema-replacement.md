# Domino 054: Packet Config-Key Native Schema Replacement

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### 54. Packet Config-Key Native Schema Replacement

Purpose: complete the Layer 2 decision packet for the stale map-config key
guards without mutating the authority tree.

Status: superseded by Domino 55. The owner diagnosis remains useful evidence,
but the package negative-test proof strategy is no longer accepted.

Disposition:

| Rule | Decision | Reason | Layer 3 requirement |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | replace/narrow by source schema authority, not broad deletion | The Grit predicate overmatches: `lakes` is current public config under `hydrology-hydrography`, while stale stage/internal forms belong to canonical recipe/map config validation. | Superseded: do not add package negative tests as the replacement rail. Domino 55 returns this to Layer 2 for source-owned schema/key authority. |
| `prohibit_legacy_morphology_config_keys` | replace by source schema authority | `landmass` and `oceanSeparation` are stale lexical cleanup against old TS surfaces; current Morphology public schemas and canonical map config validation own rejection. | Superseded: do not add package negative tests as the replacement rail. Domino 55 returns this to Layer 2 for source-owned schema/key authority. |

Moves it forward:

- Records the packet outcome in
  `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`.
- Initially moved the config-key slice into the implementation-ready queue;
  Domino 55 corrected this and returned the slice to Layer 2.

Closure note:

- No rule packets, manifests, runners, support files, tests, or source files
  changed in this packet-only slice.
- This packet is no longer implementation-ready. The corrected next move is
  named in Domino 55.
