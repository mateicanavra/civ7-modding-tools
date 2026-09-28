# Earthlike Visual And Composition Audit

Scope: the user's 2026-09-28 request for a broad screenshot atlas, full-map
exports, interpretable drainage, a Galley-test explanation, and a quick step
ownership scan. Baseline is `9284f30bbb`, Huge Earthlike, map/game seed 1018,
ten players, based on `ToT_NoModsExceptMaps`. This audit does not change map
algorithms or treat visual inspection as native connectivity proof.

## Visual Evidence

Local deliverables are retained under
`.civ7/outputs/visual-atlas/huge-1018/`, with the working copy at
`/tmp/civ7-visual-atlas/`. `gallery.html` contains 12 maximum-zoom-out survey
views and 16 closer views; every native screenshot is 3840 x 2500. Both capture
manifests verify the requested centers and restored HUD/queue state; all survey
captures read back zoom 1. The five diagnostic PNGs are 5200 pixels wide.
The reproducible data
capture and renderer are `capture.ts` and `render.mjs`; exported cell and body
tables accompany the PNGs. Ground elevation, physical water surfaces, native
numeric elevation, river classifications and directed receivers are distinct
quantities. A renderer must not invent native edges from source-class readback.

The atlas joins a fresh portable reproduction to the retained certified native
release snapshot, `/tmp/civ7-certified-release-native-surface.json`. The tour
screenshots are a later reload of the same deployed script and seeds, not a
fresh numeric readback of every native cell. Historical native numeric heights
must not be mistaken for measurements from that later screenshot session.

The same deployed script SHA-256
`56b0a9a7cb9b84528a21fb4efec846fb0ff8870be73ab0150ac416601b7a137e`
was reloaded for the tour, with fresh completion at
`2026-09-28T13:45:08.019Z`; `/tmp/civ7-atlas-native-reload.log` records the
24-task live-run graph. The previous idle session stopped answering both Tuner
and Escape. A three-second process sample found AppHost waiting for a Metal
command buffer throughout that sample. This supports a rendering-wait
observation, not a root-cause claim about map generation. Direct termination
and cold relaunch recovered the session; Steam Stop remains a fallback.

The linked CLI is this worktree's build, installed through
`nx run civ7-cli:link:global`. Its coordinate screenshot surface is:

```sh
civ7 game view appshot --target 42,7 --zoom 1 --hide-units \
  --settle-ms 6500 --output /tmp/civ7-visual-atlas/example.png --json
```

Zoom is normalized, with 1 the supported maximum zoom-out. Camera readback and
HUD restoration are part of each capture manifest. Discovery cinematics can
remain queued after Explore reports quiescence; dismiss them before trusting
the visual capture, and inspect images rather than trusting the receipt alone.

The 28 screenshots were collected by `capture-screenshots.ts`, with camera,
capture and restoration receipts in `screenshots.json` and
`wide-screenshots.json`. The survey completed at `2026-09-28T13:57:28.973Z`.
Full-map biomes use an explicitly idealized Civ-like palette, not sampled game
pixels. Drainage arrows and fluxes depict physical intent; the separate native
panel reports observed classes without inferring native directed edges.

## Distinguishing Disconnections

The native release's 203 physical wet cells/body IDs match the certified
Huge/1018 case. All 656 dry river source classes match, but that is not proof
that every shoreline edge renders or plays as intended.

| Candidate | Data-grounded interpretation |
| --- | --- |
| River (51,17), lake (52,17)/(52,16) | Ground 38 routes west to ground 18 at (50,17); adjacent body 67 has spill 34. Raw and final receivers agree: an actual modeled bypass. |
| River (98,33), lake (98,32) | Ground 66 follows an equal-height route east toward body 54 rather than neighboring body 69, spill 64. This exposes the one-exit plateau/BFS convention, not proof of a resolved physical divide. |
| River (97,35), adjacent bodies 69 and 60 | Routes west to (96,35), ground 63/body 69; the neighboring body 60 has spill 66. Proximity does not select the receiver. |
| Body 1 near (41-43,6-8) | NAV inlet (44,6) to (43,6); wet outlet (41,6) to dry NAV (40,6). Physical spill and first dry outlet ground are both 21; the wet outlet floor is 19. A direct physical connection witness. |
| Body 67 near (53-57,15-21) | NAV inlet (54,14) to (53,15), wet outlet (57,20) to NAV (57,21), physical spill 34. A useful native shoreline/leveling discriminator. |

Three distinct mechanisms must not be conflated:

1. **Physical receiver choice.** A river can pass beside a lake while draining
   elsewhere. Our plateau solver also chooses a single lowest outlet for an
   entire equal-height plateau, then BFS-routes its cells. That numerical
   convention deserves inspection when it bypasses an adjacent lower body.
2. **Visible-channel selection.** Low flow is still drainage without becoming
   a rendered river. Bodies 17, 23, 29, 38 and 49 have no classified inlet or
   first dry outlet; their outlet discharge is below the map's minor threshold
   of 240.4544. This is classification policy, not a lost native write.
3. **Native representation.** The writer authors classified dry sources only.
   Wet outlet-to-dry edges and wet interior paths are not directly written.
   Shoreline continuity depends on Civ's realization. Physical `waterSurface`
   is not passed to the elevation projector; lake leveling is native-owned.

The final native elevations of accepted inland COAST bodies also change:
body 67 is 230 after the setter and 0 at final observation; body 69 is 530 to
18; body 63 is 110 to 0. They remain water. These are representation changes,
not physical rerouting, and must not be excused as natural drainage without
testing their visual/edge consequences. Native height numbers are not directly
comparable to physical model units.

Real-world proximity alone likewise cannot establish a connection: drainage
divides separate catchments, and groundwater may connect water bodies without
a visible stream. That does not mean our model includes every such process.
See [USGS watershed guidance](https://www.usgs.gov/water-science-school/science/watersheds-and-drainage-basins)
and [USGS surface-water/groundwater interactions](https://pubs.usgs.gov/circ/circ1139/htdocs/natural_processes_of_ground.htm).
Do not invoke groundwater, erosion history, seasonal overflow or terminal-lake
behavior as explanations for a particular generated gap unless the owning
computation actually represents it. The selected current basin solver is an
open-spill model, not a general groundwater/lake evolution simulation.

## Galley Diagnostic

The Galley test is an agent-designed integration diagnostic, not an official
Civ7 acceptance test or a new gameplay rule. The expected ability comes from
the shipped Galley naval definition and Civilopedia's navigable-river rules.
The diagnostic creates a Galley, checks its actual location, previews a path,
issues an ordinary move and checks arrival/movement points. An admitted move
command alone does not count as a successful traversal.

Debug-created Galleys failed river entry on Swooper, official Earth and official
procedural Continents; coast-to-coast movement worked. Therefore this currently
does not isolate a Swooper defect. The nominal exit check did not qualify exit
because entry failed. A normally produced stock-map Galley remains the next
independent control. See [native-navigation.md](native-navigation.md) for exact
receipts and the limits of that claim.

## Step Ownership Scan

Physical line counts include comments and blanks. Helper counts are separate
so moving computation beside a step cannot make it disappear from the audit.
Paths are under the Standard recipe's `stages/` tree unless noted.

The full inventory is `step-lines.txt` beside the gallery: 53 Standard step
files, 8,591 physical lines. The focused ownership review below covers climate,
relief, ecology and water integration. Other notable counts outside that
ownership review are tectonics 545, landmass plates 377, foundation projection
377, shelf 313, geomorphology 175 and routing 141. Length alone does not establish
misplaced computation.

| Step | Lines | Substantive adjacent helpers | Assessment |
| --- | ---: | --- | --- |
| Climate baseline | 812 | Viz 450; climate-knob policy 110 | Physical seasonal/coupling computation is mixed into orchestration. |
| Plot rivers | 435 | Authored projection 73; legacy projection 262; viz 168 | Mostly native projection, legacy subset selection and observation. |
| Mountains | 347 | Mountain-range knob policy 162 | Mostly binding/normalization/viz; physical noise construction leaks. |
| Feature score layers | 293 | None | Composes typed domain scoring operations. |
| Build elevation | 280 | Elevation projection 61; shared water parity 329 | Native projection/readback/parity; 82 inline viz lines. |
| Climate refine | 241 | Viz 235; shared knob policy above | Normalization and domain-operation orchestration. |
| Project lakes | 233 | Shared water parity above | Projection admission and native observation. |
| Basin/network | 215 | Viz 164; stage knob policy 86 | Delegates actual runoff, geometry, basin solver and classification. |
| Biomes | 169 | Category-viz helper 39 | Mostly wiring/viz, with a small treeline rule. |
| Volcanoes | 125 | None | Domain planner owns computation. |
| Pedology | 69 | None | Input building, operation call and publication. |
| Project rainfall | 24 | None | Small projection step. |

### Extraction Priorities

1. **Climate baseline:** seasonal forcing (line 440), field means (476), nested
   seasonal atmosphere pipeline (507), SST coupling iteration (616) and annual
   reductions (741). These are physical algorithms, not context adaptation.
   Preserve the fine-grained domain operations; move actual algorithms and
   reductions behind domain contracts rather than simply into a recipe helper.
2. **Mountains:** Perlin sampling/quantization (line 22) and three noise-field
   seeds/grains (159) belong to a morphology compute operation or planner.
   Author-facing knob translation and small product assembly may remain local.
3. **Biomes:** `treeLine01 = clamp01(1 - permafrost)` (line 46) introduces an
   ecological semantic rule and should move into the classifier contract when
   that boundary is touched.

The network step's 215 lines are not a hidden basin solver: its certified-branch
domain calls begin at line 82 (legacy calls begin at 16), with exposed-land
input adaptation at 113, product assembly at 140 and complete pre-publication
validation at 178. Mountain noise and
treeline leakage predate the latest basin integration. No extraction is made
as part of this observational request.

Separately located metrics helpers are excluded from the table: elevation
projection 218 lines, river network 409, lake projection 110 and climate
structure 148. These measure outcomes rather than owning physical solvers.
