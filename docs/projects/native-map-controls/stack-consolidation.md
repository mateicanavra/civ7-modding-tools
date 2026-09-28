# Native Stack Consolidation

**Date:** 2026-09-28. **Disposition:** local consolidation and native draft
submission complete. This is a history-preserving publication repair for the
[native map-controls workstream](WORKSTREAM.md), not a code or acceptance change.

The preceding draft submission reached Graphite's 50-PR stack limit. Nineteen
native `gt fold --close` operations reduced 68 non-trunk branches to 49:
31 prerequisite branches unchanged, plus 18 owned map branches. No prerequisite
was merged, dropped, relabeled as a trunk, or moved out of the dependency chain.
The occupied `agent-root-civ7-capability-migration-frame` checkout was untouched.

## Fold Dispositions

Every name below has prefix `agent-root-civ7-`. Chains show the executed fold
order, from absorbed branch toward survivor. Commits and content were retained;
only branch/review boundaries were consolidated. The first row used `--keep` to
retain the C2 implementation name. No fold used `--stack`.

| Absorbed chain | Survivor | Folds | Superseded PRs closed by Graphite |
| --- | --- | ---: | --- |
| wet-outlet-proof | wet-river-continuity (`--keep`) | 1 | None |
| network-coherence-study -> private-gallery | visual-audit | 2 | None |
| basin-river-integration -> tagged-artifact-admission -> lake-navigation-proof | basin-integration-design | 3 | None |
| certified-open-network -> river-terrain-proof | basin-water-budget | 2 | None |
| juicy-climate-identity | baseline-water-demand | 1 | None |
| elevated-lake-proof -> coherent-relief-noise | basin-geometry | 2 | #2207 |
| relief-coherence-study -> basin-water-contract | physics-coherence-frame | 2 | #2205, #2204 |
| native-river-contract | river-contract-probe | 1 | #2202 |
| climate-live-proof -> resource-intensity | earthlike-climate | 2 | #2200, #2199 |
| elevation-live-proof | authored-elevation | 1 | #2197 |
| wonder-native-elevation -> elevation-native-qualification | native-elevation-contract | 2 | #2194, #2193 |

The seven other owned branches remain distinct: `native-map-controls-frame`,
`studio-startup-deps`, `materializer-stylesheets`, `150-source-compatibility`,
`saved-map-preset`, `relief-supported-landforms`, and `water-height-maintenance`.

The nine closed PRs retain their work in surviving PRs #2206, #2203, #2201,
#2198, #2196, and #2192. Closure was supersession through native
Graphite folding, not merging or manual PR reopening.

## Preserved Identity

The before/after fold receipts preserve these exact identities:

| Identity | Preserved value |
| --- | --- |
| HEAD commit | `050e3c06bc2557599f2e13c251da352f06aa3f70` |
| HEAD tree | `cd06185178304b5a25d7902d46d836ba35fd3a4f` |
| C2 wet-river-continuity tree | `436b74566e5031d951412e38ac9e8a3185f129c9` |
| Occupied capability-migration-frame commit | `10e6b74493bd5aae7d0016389dd09bd8f12d2512` |

The retained [C2 result](wet-river-continuity.md) and separate
[water-height investigation](water-height-maintenance.md) therefore keep their
implementation/proof boundary. No new runtime verification is claimed by this
topology change. `gt submit --stack --draft --no-edit --no-interactive` exited
successfully after the folds, reconciled the changed PR bases, and created the
remaining drafts #2208-2214. The current investigation is
[PR #2214](https://github.com/mateicanavra/civ7-modding-tools/pull/2214);
the bounded wet-outlet correction is
[PR #2213](https://github.com/mateicanavra/civ7-modding-tools/pull/2213).
All newly created PRs are attached to the task. No branch was merged as part of
this publication repair.
