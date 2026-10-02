# Native Navigation Qualification

This investigation belongs to [the basin integration](basin-integration.md)
and [the river lane](rivers.md). Native class parity passes; a normal
Exploration-age Cog now qualifies entry, bidirectional interior travel and exit
on one authored corridor. A separate normally granted Cog also qualifies
marine-to-NAV-to-lake-to-NAV travel through one four-cell body. True-cliff vessel
traversal remains unqualified. Class retention alone is not a successful movement test.

Those earlier routes qualify their recorded pre-C3 builds. The
[current C3 lake-passage milestone](#october-2-current-c3-lake-passage) adds
normally acquired human Cog arrivals across marine, river and lake connections.
The separately observed true-cliff edge remains unqualified.

## Observations

Moving the certified branch's single cliff-generation call after river
finalization, validation and coast restoration preserves all 656 intended
source classes: 362 MINOR and 294 NAV. Complete source/class rows remain equal
through subsequent observed phases, with zero missing, extra, wrong-class or
NAV-terrain mismatches. The late cliff call changes neither those rows nor
the measured height deltas. Receipt:
`/tmp/civ7-certified-late-cliffs-analysis.json`.

Cliffs were not disabled: 159 of 1,980 observed directed dry-to-water edges
report a cliff. The three formerly demoted mouths still report cliffs at
native drops 428, 548 and 388. This is not a derived movement threshold.
Receipt: `/tmp/civ7-certified-late-cliffs-edge-receipt.json`.

Galley entry failed at six Swooper mouths: those three cliff mouths and three
non-cliff controls, including a drop of only 138. Path previews were empty.
Each entry request was sent once after native command admission; readbacks
retained the coast position and three movement points. The scripted "outlet"
checks did not test river exit because entry had never occurred. Revealing
the complete map did not change the empty previews.

The same Galley moved between adjacent coast cells and returned, consuming
one movement point each way. The tested command path can execute coastal
movement; this does not prove river entry. Receipts:
`/tmp/civ7-cliff-mouth-movement-diagnostic.json`,
`/tmp/civ7-cliff-coast-positive-control.json`,
`/tmp/civ7-low-mouth-control.json`, and
`/tmp/civ7-river-movement-explored-preview.json`.

A cold official Earth/Huge control reproduced the failure at the Mississippi
mouth: correct Galley, actual requested coast location, empty entry path,
one admitted request, no arrival, and three movement points remaining.
The native mouth is NAV at height 201; its coast edge has no cliff in either
direction. Tuner and AppUI surface observations agree. Attempted NAV
`Units.setLocation` also left the unit unchanged; administrative placement
refusal is not traversal proof. Receipts:
`/tmp/civ7-stock-earth-cold-mississippi-movement.json`,
`/tmp/civ7-stock-native-mouth-facts-current.json`, and
`/tmp/civ7-stock-mouth-cliff-context.json`.

Cold procedural Continents/Huge/1018 then reproduced the same failure,
independently of hand-authored river construction. Galley at coast (82,6)
could not enter native-generated NAV (81,6), height 201, cliff-free and without
a feature. Validated creation at empty, feature-free NAV (80,6), height 205,
returned success but actually placed the ship at coast (80,4). Thirty AppUI
readbacks confirmed the relocation; no NAV-interior movement was attempted
under that false starting assumption. Founding the player's first capital
and re-reading the original ship's path still returned an empty entry path.
Receipts: `/tmp/civ7-stock-procedural-control.json`,
`/tmp/civ7-stock-procedural-surface.json`,
`/tmp/civ7-stock-procedural-candidates.json`,
`/tmp/civ7-stock-procedural-movement.json`, and
`/tmp/civ7-procedural-after-capital-preview.json`.

These shared failures establish neither a Swooper-specific defect nor a
specific engine bug. They leave the unit/testing conditions unresolved.
Do not distort physical terrain or river classes to fit this failed oracle.

## Expected Game Rules

Paths are relative to `.civ7/outputs/resources/Base/modules/`.

- `age-antiquity/data/units.xml:132` defines Galley as `DOMAIN_SEA` with naval movement.
- `base-standard/text/en_us/Civilopedia_Concepts_Text.xml:1058,1064,1232`
  supports naval movement and occupation on navigable rivers.
- `age-antiquity/data/progression-trees-tech.xml:80` unlocks Galley production
  through Sailing. The movement modifier in
  `progression-trees-tech-gameeffects.xml:36-44` is land-only; no separate
  Galley river unlock is evidenced by these rules.
- `base-standard/ui/world-input/world-input.js:505-517` uses the tested
  movement flags. `ui/interface-modes/interface-mode-move-to.js:14-20` also
  calls `canStart` without a destination: success alone is not a route or
  arrival guarantee.

## Remaining Boundary

Use an era-appropriate, normally granted or produced vessel, followed by an
equivalent stock witness where the tested failure needs an independent control.
Actual arrival and movement expenditure are required, not forced placement.
General cliff navigation remains unqualified. Do not fit a height cutoff,
clear cliffs, grant broad unlocks, or waive intended classes to obtain green
receipts. The physical and native-category integration may be reviewed and
committed separately from this explicitly open gameplay qualification.

A warm Earth-to-Continents setup crashed in MainWorker5 with null address
0x110 (`CivilizationVII-2026-09-28-081213.ips`); cold recovery succeeded.
An earlier immediate post-spawn stock preview crashed AppHost at 0x278
(`CivilizationVII-2026-09-28-075959.ips`). Later tests first observed the unit
in AppUI before previewing it. Neither crash is river-path proof or a
demonstrated generator defect. Final user-facing maps use the normal saved
Huge Swooper configuration, not these stock controls or diagnostic fixtures.

## Exploration-Age Control And Command Realm

The normal V3 Huge Earthlike map (106 by 66, map/game seed 1018, twelve players,
saved `ToT_NoModsExceptMaps` configuration, stock lake cutoff 10) was freshly
generated in Exploration Age. Selecting the normal Cogs Advanced Start legacy
granted the vessels; no administrative placement or broad technology grant was
used. Cartography was selected through normal setup, not assumed to unlock
naval river movement.

The existing unit-target observe/check/send path incorrectly ran the stock
right-click atoms in Tuner, where `GameContext` is absent. Those unchanged atoms
now run through the existing App UI executor. This preservation repair adds no
fallback, retry, facade, or new operation. A state-aware socket fixture withholds
`GameContext` from Tuner and requires all three atoms to select App UI with
exactly one native send. The full owner graph passed: 480 direct-control tests,
432 service tests, types, builds, and owner checks (26 tasks).

Actual native controls then succeeded through public `game play unit target`:

- Cog 196610 moved from (73,48) to ordinary water (74,48). Arrival was confirmed;
  all three movement points were spent. The destination is native ocean terrain,
  not coast, so this is not a one-point coastal-cost claim.
- Cog 983054 moved from coast (72,47) through (73,48) to coast (73,49), spending
  two of its three movement points.
- The same Cog then entered authored NAV (73,50), native elevation 138, spending
  its last point. Native readback confirmed (73,50).
- One bounded autoplay turn advanced turn 1/400 CE to turn 2/410 CE, stopped
  autoplay and returned local control. Only then was the same Cog moved from
  NAV (73,50) to NAV (72,51), native elevation 168, spending one point; back to
  NAV (73,50), spending one point; then to coast (73,49), spending its last
  point. Every request was sent once and reconciled against actual arrival.
- A read-only preview for adjacent MINOR (72,50) was empty. No forced movement
  was sent to make this negative control pass.

Receipts are in the durable `Civ7Tools/VisualAtlas/huge-1018/earth-calibration`
user-data directory: `target-appui-owner-proof-20261001.log`,
`v3-cog-coastal-control-{send,arrival}-20261001.json`,
`v3-cog-2-mouth-approach-{send,arrival}-20261001.json`, and
`v3-cog-2-nav-mouth-{preview,send,arrival}-20261001.json`.
Interior, return and exit are retained as
`v3-cog-2-nav-{interior,return,exit}-{send,arrival}-20261001.json`; the autoplay
receipts are `v3-navigation-one-turn-autoplay-{start,status,status2,status3}-20261001.json`.
The bounded 108-plot fleet grid records the receiving terrain independently.
This is a complete one-corridor traversal witness, not a cliff-mouth or
through-lake witness. Do not infer either from native height or render appearance.

## Four-Cell Lake Traversal

The V23 finite17 saved Huge/1018 Exploration game supplied a second normal
Cogs Advanced Start vessel, `{owner: 0, id: 131073, type: 26}`. Public
`game play unit target` checks and single sends confirmed these arrivals:

- Turn 1: coast (70,46) to NAV mouth (68,48), spending all three points.
- Turn 2: NAV (68,48) through previewed NAV (68,49) into lake (68,50),
  spending two points; then lake (67,51), spending the remaining point.
- Turn 3: lake (67,51) through previewed lake (66,51) onto NAV (66,50),
  spending two points and retaining one.

Two bounded one-turn autoplay runs stopped and returned local player zero.
The first interior read was too early and still showed (68,50); it is retained,
not counted as arrival. The next turn-ready read independently confirms
(67,51). Intermediate route cells are requested-path evidence, not separate
arrival reads. The sealed native grid confirms lake head 80 and the receiving
NAV classes. This qualifies one real through-water route; it does not establish
cliff traversal, a lake-size policy, or a universal head threshold.

Durable receipts use `v23-cog-lake-*` and
`v23-finite17-navigation-grid2-20261001.json` in the existing Earth-calibration
user-data directory. `native-water-v23-20261001/cog-through-lake.png` is the
native visual supplement. No administrative placement, broad unlock, raw
movement JavaScript or forced successful route was used.

## First-Meet Read Preservation

A subsequent normal-map route inspection exposed two defects in the existing
generated notification read. The shipped diplomacy panel calls
`getFirstMeetResponseCostAndRelDelta(greetingType, GameContext.localPlayerID)`;
our read omitted the local-player argument and admitted missing enum values
through `Number(null)`. The bounded preservation repair supplies both actual
finite numeric arguments. Legitimate zero values remain valid, while missing,
coercible and nonfinite values retain nullable response metadata without
entering native code. No API, fallback, service owner or gameplay decision was
introduced into the frozen correct-then-retire corpus.

The real generated-command VM seam now records native argument arrays outside
its exception-catching probe. All 31 focused notification tests pass, including
the original parse/quoted-hint cases and the 25 new signature/unavailable-input
cases. The complete owner graph passes 505 direct-control and 432 service tests,
types and builds; the final root check passes 187 tasks after formatting the
new fixture with the existing formatter. A fresh native notification read also
succeeds in App UI, but its eight returned rows contain no first-meet decision,
so that read is not a live signature-execution witness.

The preceding native AppHost crash and binder errors are retained separately
under `earth-calibration/native-appui-crash-20261001/`. The malformed signature
is a proven source defect, not conclusively the cause of the SIGSEGV and not
evidence that a ship was refused at a cliff. Owner/focused/live receipts use
`native-firstmeet-signature-*`; the normal explicit-Exploration recovery uses
`ocean-coordinate-normal-live-recovery3-20261001.log`. Empty previews and
unverified sends remain unqualified movement, not failed river experiments.

The later `recovery3-route-notifications-20261001.json` read contains an actual
first-meet decision for player 10 with costs/deltas `20/20`, `0/0`, and
`20/-20`. This is a positive live execution witness for the corrected native
binder. It does not prove the earlier crash's cause. A public response check
returned unavailable before the dialog was foregrounded; the retained send
was correctly refused before dispatch. A normal neutral greeting was then
clicked through the visible stock UI, not forced through a refused operation.
The subsequent priority read became unavailable and the native AppHost crashed
at `2026-10-01T21:24:21-04:00`; no completed greeting, next turn or vessel result
is claimed. The native crash report and exact action/read order remain a
separate session-recovery observation, not evidence of cliff refusal or a
physical generator defect.

## Current True-Cliff Route Discriminator

The retained current 6,996-cell native grid contains seven actual directed
NAV-to-water cliff edges at `(91,16)`, `(93,18)`, and `(100,20)`.
The apparent `(81,34)` and `(81,36)` coastal controls are not native cliffs.
Independent graph reconstruction agrees with all 259 recorded NAV-to-water
adjacencies, including the native direction enum, X wrapping and bounded Y.

Even generously admitting every ordinary-water and NAV plot, the last-confirmed
pre-crash Cog at `(73,45)` belongs to a 4,089-cell component; all seven cliff
approaches belong to a separate 436-cell component. The shortest connection
crosses two dry, non-NAV cells. Empty previews to those approaches therefore
do not demonstrate cliff refusal or a broken movement command. The remaining
gameplay discriminator requires a normally acquired vessel in that separate
water body, followed by fresh public checks, single sends and actual arrival
readbacks. No teleport, administrative spawn, broad unlock or terrain carving
is an admissible substitute.

Grid identity: `536518a0d58fe62f49e5cb6a5819d05c3c8d865347bb4cb675c5b56baf04fd2f`;
receipts are `ocean-normal-native-grid-20261001/` and `recovery3-cliff-*`
under the existing Earth-calibration user-data directory. A partial bounded
actor census is not evidence that the component has no normally granted ship.

## Fresh Current Normal Navigation

The merged normal script `90b05e8f906fc64fe9d9bc2d27c45c9b070275e03f23cf3edb6b04a5ed3f3f47`
has a fresh saved Huge1018/1018, twelve-player Exploration witness. Ordinary
Cogs and Cartography Advanced Start effects granted Cog
`{owner: 0, id: 983054, type: 26}`. Each public target check, single send and
independent unit read agrees on actual arrival:

| Movement | Actual destination | Moves remaining |
| --- | --- | --- |
| Coast entry via the public preview | NAV `(73,50)` | 0 |
| Interior upstream after one normal turn | NAV `(72,51)` | 2 |
| Interior return downstream | NAV `(73,50)` | 1 |
| Exit to ordinary marine water | `(73,49)` | 0 |

The bounded autoplay advances turn one to two, stops and returns local player
zero. The immutable receipt pins all eighteen check/send/arrival, path and
session files: `earth-calibration/current-normal-navigation-receipt-20261001.json`,
SHA256 `dbf8407cb3d145193a4e35c9b286a439de0f7389b83a06470728c8fef68cd1b8`.
This does not retroactively qualify the older through-lake build or genuine
cliff mouths.

A complete current actor census covers the separate 436-cell cliff component
with 52 disjoint bounded reads and zero probe errors, all at turn two. It finds
a normally granted player-five Cog. One public move succeeds, but successive
bounded autoplay returns leave the AI moving that vessel; the twelve-turn
approach budget ends without reaching the cliff. Root stops autoplay and
returns local player zero. This is an uncompleted approach, not cliff refusal,
missing technology or permission to force actor ownership. Receipts are
`recovery4-cliff-census-20261001/`, `recovery4-player5-cliff-route-20261001/` and
`recovery4-player5-bounded-stop-return0-20261001.json`.

## Bounded Gameplay Inspection Repair

The October 2 recovery reached a normal twelve-player Huge Exploration map
and completed ordinary City, Town, Cogs, Gold, Capital Upgrade and Cartography
Advanced Start effects. Two subsequent aggregate priority reads coincided with
native AppHost crashes at 00:15:03 and 00:30:30 local time. Their 41 image-offset
frames match, including the native binder/V8 execution chain. These reports do
not identify the individual JavaScript call or establish a generator failure,
cliff refusal or excessive Tuner payload as the cause.

Source comparison independently establishes a concrete defect: ready-unit and
ready-city enumerated arbitrary native operation identities with empty
arguments and retried different signatures. JavaScript exception handling does
not make such native probes safe. The bounded repair stays in the existing
correct-then-retire owners; it does not implement the accepted future controller
platform or introduce another transport/API.

- Units use the shipped UI's `VisibleInUI` database candidates and exact
  argument-bearing four-argument calls, including sentinel coordinates, ability
  variants and the WMD-specific type. There are no arbitrary enum scans or
  signature retries.
- Cities summarize already-read named production, town-focus and expansion
  evidence without a second discovery pass. Operation summaries explicitly
  remain partial, not exhaustive native availability.
- Unresolved actor identities stay present, while native action queries are
  suppressed. Missing support, truncation and query errors remain explicit;
  an empty operation list does not clear actor readiness.
- Executed generated-script VM tests discriminate actual native call arguments,
  dangerous enum access, constructible type names and independent map bounds.
  All 29 focused unit tests, nine focused city tests and four adjacent CLI
  tests pass; source/test types and focused formatting checks pass. The final
  root-owned graph passes 541 direct-control, 432 control service and 190 CLI
  tests, alongside checks and builds (34 tasks).

Nearby unit reads use independently admitted stock grid dimensions, never
coordinates beyond a known bound. Unavailable dimensions permit only the live
actor's own plot; clipped edges disclose omitted across-wrap neighbors. Radius
zero needs no grid query. City turn/cost queries use the shipped definition's
type string; numeric BUILD operation arguments retain their stock contract.
Failed growth-mode queries remain failed evidence, not fabricated readiness.

Live qualification must refresh generated clients, then read each actor and
decision surface independently before returning to aggregate priorities. A
normal post-placement save, `codex-navigation-952990105.Civ7Save`, preserves
the recovered session without replaying setup. Its map/game seeds are
952990105/952990036, not the older 1018 or Huge-2 witnesses. It is still the
pre-activation terrain build, so successful reads there cannot qualify C3
generation or movement. Native crash attribution remains bounded until fresh
isolated receipts exist.

The adopted terrain freshly completes saved Huge1018/1018 generation with
twelve players in Exploration. Two bounded autoplay turns advance 400 CE to
420 CE, then fresh status confirms autoplay inactive, zero remaining turns and
local/observer player zero. Both repaired ready views return normally, but
there is no selected or ready local actor in that session. These receipts
qualify the no-actor branch, not argument-bearing native action queries or
vessel movement. The independent source review closes all known findings; it
does not attribute or declare either historical native crash fixed. Evidence:
`c3-adopted-huge1018-live-20261002.log`,
`ready-native-bounded-final-graph-20261002.log`, and
`c3-adopted-ready-{unit,city}-native-20261002.json` in Earth-calibration user data.

## October 2 Adopted C3 Native Evidence

The C3 adoption/retirement and bounded readiness continuations are merged
through PRs #2242 and #2243; main is
`e124d8feec24e30c45786358158cd1913f7dc402` after the latter's
`2026-10-02T05:46:37Z` merge. The final readiness graph passes 541 direct-control,
432 control-oRPC and 190 game-CLI tests with checks/builds. This closes the
bounded inspection repair, not exhaustive gameplay admission or a demonstrated
fix for either historical native crash.

The adopted terrain freshly passes normal saved `ToT_NoModsExceptMaps`
generation: Huge 106x66, map/game seeds 1018/1018, twelve major players,
Exploration. Two bounded autoplay turns advance turn one/400 CE to turn
three/420 CE. The initial stop timeout remains recorded; fresh final status
reconciles it with autoplay inactive, zero remaining turns, and local/observer
player zero. Human Advanced Start is not completed. The failed Explore attempt
and unfinished human gameplay prerequisite are not river/cliff refusals.

The [current native gallery](https://mateis-macbook-pro.taild8da1c.ts.net/civ/certified-terrain-native-1018-20261002/index.html)
contains fourteen actual photographs: twelve widest views at zoom `1`, then
two details at `.4`. All PNG/receipt copies are byte-exact, generated thumbnails
are nonblank, and `320/390/1440` Playwright layout checks pass. The linked
[adopted portable comparison](https://mateis-macbook-pro.taild8da1c.ts.net/civ/certified-terrain-adopted-20261002/index.html)
uses ten-player Huge captures, not identical native placements. The original
capture-plan hash and later schema-annotation hash remain explicitly distinct.

### Directed Shore Observation

The shipped app-owned read-only helper observes six actual native directions
from current Huge1018 NAV `(94,19)`. Its ordinary marine receiver `(95,18)` has
an available true cliff flag:

| Fact | Native Observation |
| --- | --- |
| Source | NAV `(94,19)`, elevation `678` |
| Receiver | Ordinary marine `(95,18)`, elevation `0`, water true, lake false |
| Direction | `DIRECTION_SOUTHEAST`, native value `2` |
| `GameplayMap.isCliffCrossing` | Available, `true` |

Wide photo 12 and detail photo 14 frame this edge. Elevations are native/display
coordinates, not metres. The flag and photographs prove neither vessel passage
nor refusal, and no movement threshold follows from their height contrast.
Receipt: `earth-calibration/c3-adopted-shore-cliff-native-20261002.json`.

### Actor-Bearing Inspection

After the earlier no-local-actor receipts, bounded public ready reads also
return normally for actual AI actors: owner-seven Tercio and city, and
owner-eight Cog. The additional Tercio read retains a real actor with movement
remaining, so the witness is not restricted to the empty/no-actor branch.
Operation summaries remain partial; these are selected actor cases, not an
exhaustive census or a local-player vessel acquisition. Receipts:

- `c3-adopted-ready-unit-actor-native-20261002.json`
- `c3-adopted-ready-unit-131073-native-20261002.json`
- `c3-adopted-ready-city-actor-native-20261002.json`
- `c3-adopted-ready-unit-458758-native-20261002.json`

All are in the existing Earth-calibration user-data directory, alongside
`c3-adopted-huge1018-live-20261002.log`,
`c3-adopted-huge1018-autoplay-final-20261002.json`, and
`c3-adopted-native-gallery-20261002/RECEIPT.json`. The remaining normal-play
discriminator still requires a suitably acquired vessel in the relevant water
component, one admitted command and actual arrival readback. Continuing UI
restart/navigation work has no anticipated outcome in this closure.

## October 2 Current C3 Lake Passage

The normal saved Huge1018/1018 twelve-player Exploration setup completes
Advanced Start using ordinary City, Town, Cogs, Cartography, Gold and Capital
Upgrade effects. This is the adopted C3 build, not an administrative unit grant
or relocation. Its installed script SHA-256 is
`0aa89183ed6d5c2b3b09cce3eb7f702fd81410ece2db8868f5f8c8e13a9cf792`;
these arrivals precede the separate major-support classifier repair. Human Cog
`65536` first confirms NAV `(52,60)` to marine
`(52,59)`, back to NAV `(52,60)` and along NAV `(51,60)`, with independent
arrival reads and remaining movement `2/1/0`.

Human Cog `131073` then completes the following distinct lake connection:

| Turn | Confirmed Arrival Edge | Destination | Movement Remaining |
| --- | --- | --- | ---: |
| 16 | `(79,36)` to `(80,36)` | Marine | 2 |
| 16 | `(80,36)` to `(81,36)` | Navigable river | 1 |
| 16 | `(81,36)` to `(81,37)` | Lake | 0 |
| 17 | `(81,37)` to `(82,37)` | Lake | 2 |
| 17 | `(82,37)` to `(82,36)` | Different navigable river | 1 |
| 17 | `(82,36)` to `(81,36)` | Navigable river | 0 |
| 18 | `(81,36)` to `(80,36)` | Marine | 2 |

Every edge has one checked send, confirmed `target-reached`, and an independent
fresh unit read. Native classification and thirty-six directed observations
are retained separately; these connections have `cliff=false`. Fourteen actual
turns advance from T4 to T18, within the thirty-turn bound. Final status is
T18/570 CE, local/observer zero, autoplay inactive, zero remaining autoplay
turns, and no queued unit destination. Damage changes across turn transitions
from `4` to `16` to `36`; their cause is not assigned by this experiment.

The [three-photo passage gallery](https://mateis-macbook-pro.taild8da1c.ts.net/civ/native-lake-passage-20261002/index.html)
retains two widest views and one mouth detail, natural units, original
3456x2168 PNGs, and checked movement/camera evidence. Local/phone bytes and
`320/390/1440` browser checks pass. The earlier fourteen-photo survey is not
overwritten. Evidence under Earth-calibration user data:
`c3-normal-lake-navigation-20261002.md`,
`c3-normal-lake-navigation-proof-20261002.json`, and
`../native-lake-passage-20261002/PUBLICATION.json`.

The failed distant approach to `(95,18)` is not a cliff refusal: a complete
6996-plot native-grid census places that receiver and NAV `(94,19)` in a
different water component, even admitting all ocean cells. The actual cliff
there remains a separate test. Stock Advanced Start is already closed at T18;
coastal hill `(96,19)` is only a prospective normal-placement site, with region
and Cog-spawn eligibility unproven. Do not reopen setup, force a player, move a
unit administratively or lower the cliff to turn this into a positive result.

An independent coordinate join reproduces all 6,996 terrain and ordinary-water
facts and all 320 NAV sources from the portable C3 capture. No water/NAV
connector is lost in projection. The receiver `(95,18)` is prescribed external
water at the model sea head `11`, not a finite lake incorrectly classified by
Civ. Its external component reaches the clipped northern boundary; shared
hydrological external-body identity is not a promise of one navigable ocean.
Sixteen cells of finite body `1643` separately report native `isLake=false`,
consistent with stock Huge cutoff `10`; all are in the Cog's component and
therefore do not explain the unreachable cliff approach. Report and exact
coordinates: `c3-cliff-component-attribution-20261002/{REPORT.md,RECEIPT.json}`.

The subsequent supported-classifier capture holds ground, lake footprints and
hydraulic surfaces exactly. Candidate `(84,23)` to `(83,23)` is a nearer
connected NAV/lake endpoint with physical receiving-head drop `47-32=15`.
The old grid provides no directed cliff flag there. Fresh current-build flags
and actual movement must qualify this candidate; a head drop is not proof of
a native cliff or passability.
