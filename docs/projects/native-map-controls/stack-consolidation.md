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

## September 29 Continuation

Continuing beyond the thermal handoff requires space for the next meaningful
implementation layer. A second independent semantic review selected the
small workstream-enablement pair, not the already substantive basin integration
branch: native `gt fold --keep --close` absorbed `native-map-controls-frame`
into `studio-startup-deps`, retaining the latter name and PR #2189. Graphite
closed superseded #2188. The five frame documents and the four-line Studio
dependency/lockfile prerequisite retain both original commits.

The operation left every descendant commit unchanged. The thermal tip remains
`cacc0f7c1ccc7caa7c7e14b1795576b41cb5c3a2`, tree
`2f42174f1e7d557325a4fcb83e14bf3d4a87656c`, before this receipt. The survivor
remains `d5a9377f9fc0fa11ad7aa1077f1b37be3e3e8429`; the occupied prerequisite
remains `10e6b74493bd5aae7d0016389dd09bd8f12d2512`. No physics, contract or
native-proof boundary was collapsed. The owned chain is now 49 non-trunk
branches including its 31 unchanged prerequisites, before the next layer.

## Basin Coordinator Publication

The Earth response reference and completed basin coordinator brought the chain
to 52 non-trunk branches. Two further native `gt fold --keep --close` operations
consolidated the completed elevation implementation and its launch prerequisite
into `authored-elevation`, retaining PR #2196. Graphite closed superseded
`saved-map-preset` #2195 and `native-elevation-contract` #2192. All six original
commits remain available inside the retained elevation story, including native
probe and production qualification evidence. This intentionally combines the
adapter/definition review boundary of the already completed elevation feature;
it does not combine later rivers, climate or basin mechanisms.

The basin tip before/after both folds remained
`00af8b22d7328287a7ff02bc0fac8942e8158c59`, with tree
`dab029d80373adb46b2b025e162c3df95ed42a3c`; the occupied prerequisite remains
`10e6b74493bd5aae7d0016389dd09bd8f12d2512`. Descendants required no content
restack. The chain is back within the 50-PR bound. No prerequisite worktree,
main edits, merge state or repository policy was changed.

## Periodic Thermal Publication

Native `gt fold --keep --close` consolidated `materializer-stylesheets` into
`150-source-compatibility`, retaining PR #2191 and both original commits
(`8611850b8d`, `6d8c463db3`). Graphite closed superseded #2190. Independent review
identified one installed-source compatibility story: the stylesheet provenance
support is a direct prerequisite of the adopted 1.5 corpus and its loader
dispositions. Startup dependencies and native elevation remain separate.

The new periodic implementation tip remained
`d1265684a51b404c2a391ed3c37704e28b3645e0`, tree
`8cfb5312665fe7f777ab176fee955624c845b887`, through the fold. All descendants
required no content restack. The 31 prerequisites and occupied migration
worktree are unchanged; the resulting chain has 50 non-trunk branches.

Subsequent updates hit the server's 50-branch limit even though GitHub received
the committed tip. Native `submit --update-only --always` did not resolve it.
A further independently reviewed `fold --keep --close` absorbed
`physics-coherence-frame` into `basin-geometry`, retaining PR #2206 and closing
#2203 through Graphite. This is the six-commit investigation-to-geometry group
from `9848e4bc16` through `d0cbb06615`: framing, native lake constraints, joint
measurements, depression geometry, coherent relief/shelves and elevated-lake
qualification. Their original commit-level reviews and proof distinctions
remain intact. No basin-routing or water-conservation acceptance is inferred
from geometry, and neither the preceding native capability layer nor the
following climate publication layer was absorbed.

The ocean-correction tip/tree stayed
`7567769f6c66883b7b22b3993bbe263b1eb5eb25` /
`aeb35fcffd96b69485d331ebe5b1dffc9a5eab05`. No descendant needed a content
restack. At 49 non-trunk branches, native `submit --stack --draft --no-edit
--no-interactive --always` completed and reconciled all existing PRs. No PR was
manually reopened and no occupied prerequisite, main edit or source was changed.

## Qualified Pipeline Admission

On October 1, the remaining 35 map-control branches were reconciled into the
existing `agent-root-civ7-ocean-coordinate-rotation` admission, PR #2238. This
is a semantic admission boundary, not cosmetic consolidation: the original
elevation prefix still aborts on enclosed wet plots, while the corrected
verification depends on the later external-water and resolved-exposure owners.
Landing that prefix independently would knowingly put a broken generator on
main. Backporting it would duplicate owner contracts or recreate a legacy lane.

An independent topology review qualified the installed Graphite 1.8.6 behavior.
Exactly 34 guarded `gt fold --keep --close --no-interactive` operations kept the
current branch and closed each discarded parent's PR natively. Every operation
preserved HEAD `52f466adabee4f56616e13a631d1a05ba5cfcb9b` and tree
`8fc85dcf8049c4eb284c04aa6cad8a424e49adf0`. All 129 original commits and their
individual source/review mappings remain; all 102 refs outside the discarded
parent set remain unchanged. The survivor now has `main` as its native parent.

The clean lower proof worktree was parked at its exact detached commit to
release occupancy, not removed. The fourteen protected files in the primary
main checkout retained their hashes. No global restack, raw rebase, squash,
manual PR reopening or unrelated branch retirement was used.

The discarded PRs are #2196, #2198, #2201, #2206, #2208 through #2237 excluding
#2207. Earlier native folds already account for the omitted review boundaries.
Their original branch, parent, SHA, PR and review metadata are recorded in
`earth-calibration/mapgen-admission-prefold-accounting-20261001.json`; the
execution receipt is `mapgen-admission-fold-execution-20261001.json` under the
durable Civ atlas. The final receipt reports 34 folds, 129 commits and 102
preserved outside refs. The generic census's old Graphite cache is not authority
for this topology; native CLI facts and the current metadata database are.

This closes local topology convergence, not publication, merge, scientific
thermal calibration or cliff-mouth gameplay. The admission retains the original
scientific comparator failure and the separate native qualification boundaries.
