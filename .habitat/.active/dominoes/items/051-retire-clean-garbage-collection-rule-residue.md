# Domino 051: Retire Clean Garbage-Collection Rule Residue

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

Five dead or absorbed cleanup guards were deleted, dropping the live corpus from 127 to 122; the Studio devlive cleanup guard stayed live because its survivor authority is not sealed.

## Detail

#### 51. Retire Clean Garbage-Collection Rule Residue

Purpose: execute the first clean Layer 2/Layer 3 garbage-collection slice from
the closed rule-remediation matrix, deleting only rules with source-backed
retirement packets and excluding the Studio devops row that still needs
survivor-authority work.

Controlling records:

- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`
- `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-retirement-slice.md`

Decision matrix:

| Rule | Decision | Handling | Proof boundary | Residual follow-up |
| --- | --- | --- | --- | --- |
| `prohibit_domain_tag_artifact_shim_imports` | retire | deleted | source and consumer absence for retired `@mapgen/domain/tags` / `@mapgen/domain/artifacts` shim imports | Broader domain import/public-surface inversion remains separate. |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | retire | deleted | source absence plus stage topology/native no-shadow proof | No permanent cutover lane retained. |
| `prohibit_narrative_swatches_stage_token` | retire after absorption | deleted | standard recipe topology/manifest excludes retired `narrative-swatches` stage token | Standard topology inversion remains separate. |
| `require_full_profile_domain_stage_roots` | retire after absorption | deleted | standard recipe topology/manifest surfaces cover the stage-root set | Profile parameterization, if ever needed, is future authority work. |
| `prohibit_morphology_dual_read_tokens` | retire | deleted | source absence plus native no-shadow proof for completed dual-read cleanup | None. |
| `prohibit_retired_studio_devlive_daemon_file` | exclude | retained | file absence exists, but survivor authority is not sealed | Revisit in Studio devops topology repair/consolidation. |

Moves it forward:

- Removes five stale lexical, transitional, or absorbed cleanup guards from the
  live Habitat rule corpus.
- Drops the live rule count from 127 to 122.
- Keeps the blocked Studio devops cleanup rule visible instead of deleting it
  without a survivor authority.

Review disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| Five retirement rows had clean source-backed deletion packets. | P2 | accepted | Deleted the five rule packets and moved their ledger entries to stale/retired references. | Execution-surface docs regenerated because rule paths changed. |
| `prohibit_retired_studio_devlive_daemon_file` was not safely retire-able. | P2 | accepted | Retained the rule; the retirement-slice record marks Layer 1 direct-deletion readiness stale for this row. | Studio devops topology repair/consolidation must decide survivor authority. |

Closure note:

- No new blueprint, niche, or catch-all bucket was introduced.
- This slice intentionally stopped before hairy semantic splits and positive
  kind/deletion pairs.
- The current corpus is ready for the next action-class slice after verification
  and Graphite closure.
