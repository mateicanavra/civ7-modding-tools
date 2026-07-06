# Domino 055: Correct Config-Key Proof Owner

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### 55. Correct Config-Key Proof Owner

Purpose: repair Domino 54's proof model before any Layer 3 mutation can move
retired config-key pressure back into package-owned tests.

Status: superseded by Domino 56. The package-test correction remains
normative; the later state-collapse decision deletes the retired literal
assertions without replacement instead of returning them to Layer 2.

Disposition:

| Surface | Correction | Reason | Next action |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | returned to Layer 2 packet repair | The prior packet correctly found that the broad lexical predicate overmatches live public `hydrology-hydrography.lakes`, but incorrectly used package negative tests as the replacement rail. | Re-packet as source-owned schema/key authority, optionally protected by Habitat schema-surface authority, before narrowing or retiring the lexical proxy. |
| `prohibit_legacy_morphology_config_keys` | returned to Layer 2 packet repair | `landmass` and `oceanSeparation` are stale public-config tokens, but package tests must not become a junk drawer for retired property blacklists. | Decide whether existing closed public schemas are sufficient source authority, whether source key management needs strengthening, or whether Habitat should assert the schema surface structurally. |

Moves it forward:

- Corrects `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`
  so `config-key native-schema replacement` is no longer marked
  implementation-ready.
- Initially added `config-key source schema authority replacement` back to the
  Layer 2 packet queue; Domino 56 superseded that by deleting the retired
  literals without replacement.
- Keeps the canonical JSON as the single operational source of truth; this
  receipt only explains the correction.

Authority basis:

- `.habitat/AUTHORITY.md` stops slices that use tests as structural gates
  without Habitat registration or explicit product-test classification.
- `.habitat/.active/frames/FRAME.md` separates Habitat structural authority from package
  behavior/API/validation tests and keeps proof classes separate.
- MapGen schema policy and config-compilation reference place unknown-key
  rejection in strict source schemas and compilation, not in per-token package
  test residue.

Closure note:

- No authority rule packets, runners, support files, package tests, or source
  files changed.
- The next config-key move is not Layer 3 deletion. It is a corrected Layer 2
  packet for source-owned schema/key authority or Habitat schema-surface
  authority.
