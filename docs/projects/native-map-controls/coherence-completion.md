# Coherence Completion

**Goal:** realize the intended basin/river network with coherent native shore
joins, and make the landscape-shaping water network agree with the network we
ultimately project. Investigation completion is not product completion.
**Status:** Active. **Owner:** root. **Opened:** 2026-09-28.

This continues [Native Map Controls](WORKSTREAM.md) under the user's existing
design/implementation authority. The prior [comparison](network-coherence-investigation.md)
is a baseline and discriminator, not the finished solution.

## Request Accounting

| Request | What is actually complete | What remains |
| --- | --- | --- |
| Numeric elevation | Authored native elevation, live qualification and retained water/wonder exceptions | Preserve those guards during further changes |
| Climate banding | Convergence/precipitation and geographic temperature corrections; cohort and native checks | Regression protection, not another climate rewrite |
| Mountains, hills and coasts | Coherent relief, shelf repair, relief-supported landforms; old peak-chain proxy removed | Preserve relief support as terrain evolves |
| Basin-aware lakes and rivers | Certified static drainage, budgets, footprints, dry minor/NAV authorship | Wet shoreline projection and actual traversal |
| Time/erosion/network coherence | Same-seed causal comparisons identified weak incision and fixed preliminary routing | Final climate-fed basin network does not yet shape the terrain it drains |
| Density and scale | Land-area denominators, map-size cohorts and independent channel-class controls | Select and qualify a gameplay density policy; no invented km-per-tile calibration |
| Cliffs and navigation | Late cliff generation prevents observed NAV-to-MINOR demotions | Normally produced stock-unit positive control, then Swooper traversal |
| Lake junctions at (87,31) and larger lake | Physical directions, native terrain and cliff observations; wet-write candidate | Repeat visual effect, test large-lake interior, then generalize at the projection owner |
| Whole-map studies and images | Reusable comparison script, 28 native frames, diagnostic PNGs, flow arrows, phone viewer | Update with final accepted implementation, not just candidate captures |
| Domain operations / step size | Inventory completed; basin and erosion algorithms already have domain operations | Climate coupling, mountain noise and treeline computation remain extraction candidates |
| Glossary | Functional glossary with model owners and source links | Extend only for newly introduced concepts |
| Resource generator and CI | Current-resource compatibility and scoped integrated checks pass | Do not claim uncached whole-repository or remote CI without executing it |

Sources: [relief](relief-coherence.md), [climate](earthlike-climate.md),
[basin integration](basin-integration.md), [navigation](native-navigation.md),
[visual/ownership audit](visual-audit.md), [resources](resources.md), and
[water/relief glossary](../../system/libs/mapgen/reference/domains/water-and-relief-glossary.md).

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
| C2: generalize projection | Definition-owned directed wet-path/outlet policy, if C1 supports it; app remains mechanical | No coordinate exceptions, no second drainage solver, preserved lake terrain, deterministic tests, multiple native witnesses |
| C3: basin evolution | Review explicit terrain/routing/incision composition using certified network and fixed existing climate forcing | Causal process metrics and integrity before default changes; final network/terrain agreement across the held cohorts |
| C4: density and architecture | Calibrate visible minor/NAV projection after mechanisms; extract affected numerical code into domain operations | Class controls do not alter physical drainage; no arbitrary minimum lake size; focused identity-preserving extraction tests |
| C5: close the outcome | Full study bank, fresh Huge native generation, actual movement controls, gallery refresh, independent review | Every remaining claim is either verified or an explicit bounded product decision, not an unowned future task |

C1 and C3 design can proceed together. C2 must not wait on geological evolution
if the visual defect has an independent projection repair. C4 follows the
mechanism fixes so density cannot conceal broken joins or ineffective erosion.
The independently reviewed [basin evolution design](basin-evolution-design.md)
pins the initial/final artifact migration and contributing-area semantics;
it is not an implemented result.

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
- Movement qualification first needs a normally produced stock-map naval
  unit that actually traverses a stock navigable river. Debug-created Galley
  failures on stock maps are not a valid rejection oracle for Swooper.
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

## Closure

This continuation is not complete merely when another diagnostic passes. It
ends with an accepted production projection/evolution outcome, relevant
compensations removed, coherent cross-seed evidence, normal Huge Earthlike
restored for the user, updated phone-accessible images, and explicit remaining
engine limitations. No new tuning strategies are retained just because they
were useful experiments.
