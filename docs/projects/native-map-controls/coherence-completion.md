# Coherence Completion

**Goal:** realize the intended basin/river network with coherent native shore
joins, and make the landscape-shaping water network agree with the network we
ultimately project. Investigation completion is not product completion.
**Status:** Active. **Owner:** root. **Opened:** 2026-09-28.

## Current Outcome Boundary

The qualified owner, C3, coherent-reach and native movement milestones are
merged through PR #2248 at main
`cec8991c6fb34885cbd9fcf4ced462d897731981`. The
[delivery inventory](delivery-inventory.md) owns current build and proof
identities; dated investigations below retain their historical scope.
Completed investigation is not completion of the remaining physical outcomes.
The active physical owners are thermal source-boundary and dimensional relief
calibration. C3 climate-fed terrain/network evolution is implemented; normal
vessel arrivals qualify the tested cliff mouth in both directions without
carving. Its apparent visual join remains distinct from gameplay passage.
Dimensional Earth
calibration remains required before claiming empirical area/time/flux or relief
agreement; it does not block the explicitly model-unit first C3 treatment.
Neither a density quota nor a new climate integrator is a prerequisite.

This continues [Native Map Controls](WORKSTREAM.md) under the user's existing
design/implementation authority. The prior [comparison](network-coherence-investigation.md)
is a baseline and discriminator, not the finished solution.

## Request Accounting

| Request | What is actually complete | What remains |
| --- | --- | --- |
| Numeric elevation | Authored native elevation, live qualification and retained water/wonder exceptions | Preserve those guards during further changes |
| Climate banding | Consolidated causal thermal artifacts, forcing/coordinate and moisture corrections; cohort and native checks | The unchanged within-row thermal gate still fails; repair at the actual source owner, without noise or fitted gain |
| Mountains, hills and coasts | Coherent relief, shelf repair, relief-supported landforms; old peak-chain proxy removed | Preserve relief support as terrain evolves |
| Basin-aware lakes and rivers | Certified drainage, budgets, footprints, dry minor/NAV authorship and generalized wet NAV outlet declarations; actual ordinary, lake and cliff passage witnesses | Preserve physical heads and separate apparent joins from bounded passage and native lake taxonomy |
| Time/erosion/network coherence | Certified climate-fed incision, fresh basin/network resolution and retired preliminary channel path across all three products | Physical area/time/flux calibration; no unsupported geological age claim |
| Density and scale | Selected Huge1018: 320 dry NAV cells on 2,556 exposed land cells (12.52%); coherent-reach policy retained after the tile-level candidate fails native realization | Scientific area/time/flux and relief admission; no Firaxis quota or invented km-per-tile calibration |
| Cliffs and navigation | Final-height cliff generation; matched cliff-free and true-cliff mouths crossed both ways by the same normal Cog; ten further normal autoplay turns complete | Bounded routes do not prove universal navigation or repair every apparent shoreline join |
| Lake junctions at (87,31) and larger lake | Wet outlet writes and final-height preservation implemented; normal finite/external heads qualified; V25 discriminates arbitrary under-rim heads | Respect the bounded native capability limit for any actual under-rim/below-sea product case; no blanket cutoff increase or terrain carving |
| Whole-map studies and images | Diagnostic PNGs, flow arrows, phone viewer, eighteen selected-build views and two actual cliff-arrival photographs | Refresh after the next accepted physical change; keep each image's build and turn explicit |
| Domain operations / step size | Basin and erosion algorithms have domain operations; treeline derivation belongs to the existing biome classifier | Mountain noise remains a bounded extraction candidate; climate coupling is recipe orchestration of existing domain operations |
| Glossary | Functional glossary with model owners and source links | Extend only for newly introduced concepts |
| Resource generator and CI | Current-resource compatibility and scoped integrated checks pass | Do not claim uncached whole-repository or remote CI without executing it |

Sources: [relief](relief-coherence.md), [climate](earthlike-climate.md),
[basin integration](basin-integration.md), [navigation](native-navigation.md),
[visual/ownership audit](visual-audit.md), [resources](resources.md), and
[water/relief glossary](../../system/libs/mapgen/reference/domains/water-and-relief-glossary.md).

The existing `ecology/biomes/classify` operation admits cryosphere
`permafrost01` and returns `treeLine01`. Its existing strategy computes
`Float32(clamp01(1 - permafrost01))` for every cell, including water; the biome
step forwards that result to the existing observation and artifact without a
second computation or publication. Climate, biome thresholds, vegetation,
Gaussian refinement and cryosphere vintage remain unchanged. This ownership
move does not add a thermal law or require a climate orchestration framework.

Its independent SDK review is ALIGNED. The final owner check/build graph passes
all 32 tasks, including source/test/tool types and Habitat; realization tests
pass all 371 tests. Definition tests report 1,178 passes and the existing science
aggregate failure. The earlier publication-test typing refusal is repaired by
removing a gratuitous wrapper, not by adding casts or another type envelope.
Fresh serial capture of all 57 cases reproduces the five retained input,
study, field-digest, measurement and evaluation files byte-for-byte. All 4,430
expectations are unchanged, including the remaining temperature-variation and
savanna failures. `treeLine01` is not retained by `StandardMapCapture`; its
direct identity comes from the classifier/publication tests instead. Evidence:
`earth-calibration/treeline-owner-bank-20261002/TREELINE-IDENTITY.json` and
`treeline-owner-check-build-20261002.log`. This is source/owner qualification,
not a new deployment, native generation or scientific calibration claim.

## Selected Path

Two independent failures must not be collapsed into one remedy:

1. **Native projection:** correct physical edges may be incompletely declared
   across wet tiles. Fix that at authored river projection, not by carving the
   physical map to fit an unqualified engine readback.
2. **Landscape evolution:** erosion currently uses preliminary routing before
   final climate and certified basin routing. Resolve that dependency with a
   basin-aware evolution design, not more smoothing or a cosmetic lake filter.

Treat river/lake, waterbody/waterbody and river/coast/cliff joins as one
water-transition projection family unless a discriminator proves different
causes. Actual movement is a separate acceptance claim. The user's suggested
Exploration-era stock control is now the preferred gameplay qualification:
verify era-appropriate naval unit and unlock state before interpreting failures.

The user's second photo matches the retained B detail capture from the two
singleton outlet-write experiment. It shows promising visual continuity. No
separate elevation, terrain, geometry or erosion change was made in B. The
temporary ocean-cache flag cannot veto that visual result, and the visual
result cannot certify naval movement. Record these as separate acceptance
claims. The previous report understated this distinction.

## Sequencing And Parallelization

One existing worktree and one linear Graphite stack; parallel design/review,
serial committed implementations and a single coordinated live-game operator.

| Domino | Owner and change | Acceptance / next decision |
| --- | --- | --- |
| C0: restore execution | Native Graphite cleanup; explicit open-work accounting | Empty branch removed without commit/tree loss; no operational gate masquerades as a map defect |
| C1: qualify wet joins | App-owned full-map probe, repeated singleton arm and body42 outlet-only versus complete wet spine | Same dry writes, heights, lake masks and finalizer; reproducible visual join improvement with unaffected controls |
| C2: generalize projection | Wet outlet policy and final-height lifecycle repair implemented, reviewed and merged; normal-map heads and V25 capability discriminator complete | Preserve ordinary-map heads and native dry/wonder edits; keep arbitrary under-rim projection limits separate from movement |
| C3: basin evolution | Implemented and merged: certified network drives incision, geometry/network are recomputed and the earlier channel path is retired | Preserve accepted process/cohort guards while calibrating physical units separately |
| C4: density and architecture | Existing classification arms compared independently: baseline retained; candidate class changes do not repair drainage | Keep numerical evolution in domain operations; revisit density only after a new physical/calibration result, not another count-fitting sweep |
| C5: close the outcome | Full study bank, fresh Huge native generation, actual movement controls, gallery refresh, independent review | Every remaining claim is either verified or an explicit bounded product decision, not an unowned future task |

C1 and C3 design can proceed together. C2 must not wait on geological evolution
if the visual defect has an independent projection repair. C4 follows the
mechanism fixes so density cannot conceal broken joins or ineffective erosion.
The independently reviewed [basin evolution design](basin-evolution-design.md)
pins the initial/final artifact migration and contributing-area semantics;
its dated implementation and retirement qualification now close C3.
The [Earth calibration design](earth-calibration.md) now separates a frozen
physical surface with reference forcing from that same surface with predicted
climate. Build this baseline before tuning C3 evolution and C4 class density;
the independent C2 native height repair need not wait. Firaxis's Earth provides
a measured gameplay reference, not physical truth. The initial hot/high
configuration was corrected. Pinned fixed-geography and scientific reference
fixtures, public study discriminators and held-surface comparisons are now
implemented; coupled empirical units and complete physical calibration are not
yet admitted. Runoff remains index-valued. The benchmark stays separate from
the procedural recipe and does not establish literal Earth replay.
The accepted [wet outlet implementation](wet-river-continuity.md) preserves all
physical fields and dry sources across three cohorts. Production native evidence
separates the repaired lake joins from the remaining cliff-transition case.
The [native maintenance investigation](water-height-maintenance.md) identifies
repeated height loss in exactly the accepted inland bodies above Huge's native
ten-cell lake cutoff. V11's cutoff20 treatment changes only those 48 cells and
repairs the artificial cliffs visually without terrain grading. V12 rejects
an unlimited cutoff: all 4,276 original-marine cells become native lakes, with
collateral height, feature and resource changes. Normal Earthlike is restored
and its actual cutoff10 verified. The cutoff20 treatment had no measured
overfill or collateral surface defect. Unlimited classification failure does
not establish that late reapplication is preferable. That cutoff decision is
historical, not the current next action. The later water-owner repair,
final-height lifecycle preservation and independently qualified normal-map
heads supersede it. V25 establishes a bounded engine limit for independently
declared under-rim water levels; it does not identify an ordinary procedural-map
failure. Preserve stock classification, physical heads and native dry/wonder
edits rather than selecting a seed-specific cutoff or grading physical terrain.
Navigation remains separate; the maintenance packet records successor evidence.

Refreshing strict-descent receivers between early erosion eras is not the next
main fix: shipped Earthlike uses one era, so that change cannot alter its
current result. Fractional scratch elevation already persists between eras.
Do not implement either as a purported answer to the user's current map.

## Verification And Decisions

- Use Huge/1018 as the visible reference, with Huge/42 and Standard/1018 as
  independent physical cohorts. Whole maps remain the comparison unit.
- Preserve physical elevation versus lake surface versus native height as
  distinct fields. The recurring native offset of 128 is not a license to
  lower terrain by 128.
- Wet-source class -1 and separate native river membership are compatible
  with lake terrain; neither is a failed visual continuity test.
- Repeat the promising wet-write arm. A control also gets repeated framing:
  native mesh changes outside the interventions prevent attribution from one
  different screenshot alone.
- If wet paths fail to fix the specific visual join, stop adding writes and
  compare the shoreline contract with a verified shipped lake. Do not pile
  on cliff removal, repeated finalization or a minimum lake-area threshold.
- Normal Exploration Cogs and ordinary Advanced Start effects now provide
  actual NAV entry/interior/exit witnesses. The current build has a fresh
  bidirectional route; the older lake crossing retains its own build identity.
  Only genuine cliff-mouth passage remains unqualified. Debug-created Galley
  failures, disconnected previews and AI-controlled approach budgets are not
  cliff rejection oracles.
- Study the actual per-process incision and published terrain change, not
  only lake counts or a net erosion correlation. Fewer lakes is not a general
  correctness criterion; genuine divides and closed basins remain valid.
- Numerical evolution stays in domain operations. Recipe steps compose
  domains and publish artifacts. Extract coupled seasonal/climate computation
  when the evolution composition requires it, without a wholesale unrelated
  step rewrite as prerequisite.
- Review each implementation independently, run its owning checks and wider
  guards, and commit the complete slice before the next depends on it.

## Graphite Repair

The user explicitly authorized removal of unnecessary empty branches.
`agent-root-civ7-control-service-rewrite` had zero commits beyond
`agent-root-civ7-window-capture-resource`, the same tree, no remote branch,
no PR and no occupied worktree. Native `gt delete ... --force` removed only
that branch and reparented `agent-root-civ7-platform-model-seal`. The current
HEAD and tree stayed exactly `dc62f1fd7c` / `1de05c7dc8f0de125003e3ad27cf0187ce54a541`.
No generated or authored file changed in the repair.

Closed associations from the previous accidental draft submission are separate
publishing metadata, not a reason to stop map work. Use Graphite's documented
unlink/submit flow rather than editing its SQLite database. The installed CLI
now uses SQLite; the old JSON-cache census alone misses this stack and must not
be used as deletion authority. References:
[command reference](https://graphite.com/docs/command-reference),
[SQLite migration](https://graphite.com/docs/cli-changelog).

Repair outcome: native `gt unlink` alone did not prevent rediscovery of the
closed prerequisite PRs. The ten accidentally closed drafts were reopened
(not recreated), then `gt submit --stack --dry-run --no-interactive --no-edit`
completed successfully. This manual PR action repaired the earlier mistake;
normal stack publication remains Graphite-owned. There is no remaining
Graphite gate on this continuation. No merge was performed.

Actual submission then exposed the 50-PR stack limit. The subsequent
[native consolidation](stack-consolidation.md) folded nineteen owned review
boundaries into their associated feature branches, preserved all commits and
the final tree, and left prerequisites untouched. Native stack submission now
passes, including the remaining draft PRs. No further manual PR reopening was
used.

## Closure

This continuation is not complete merely when another diagnostic passes. It
ends with an accepted production projection/evolution outcome, relevant
compensations removed, coherent cross-seed evidence, normal Huge Earthlike
restored for the user, updated phone-accessible images, and explicit remaining
engine limitations. No new tuning strategies are retained just because they
were useful experiments.
