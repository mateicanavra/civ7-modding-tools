# Native Navigation Qualification

This investigation belongs to [the basin integration](basin-integration.md)
and [the river lane](rivers.md). Native class parity passes for the late-cliff
candidate; actual naval traversal remains unqualified. Class retention alone
is not a successful movement test.

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
Actual arrival and movement expenditure are required, not forced placement. Through-lake navigation and
exact directed-edge parity are also unqualified. Do not fit a height cutoff,
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
  its last point. Native readback confirmed (73,50); this qualifies river entry,
  not cliff admission, river exit, or through-lake movement.

Receipts are in the durable `Civ7Tools/VisualAtlas/huge-1018/earth-calibration`
user-data directory: `target-appui-owner-proof-20261001.log`,
`v3-cog-coastal-control-{send,arrival}-20261001.json`,
`v3-cog-2-mouth-approach-{send,arrival}-20261001.json`, and
`v3-cog-2-nav-mouth-{preview,send,arrival}-20261001.json`.
The bounded 108-plot fleet grid records the receiving terrain independently.
Current directional cliff flags and additional traversal remain separate proof;
do not infer them from native height, render appearance, or this successful entry.
