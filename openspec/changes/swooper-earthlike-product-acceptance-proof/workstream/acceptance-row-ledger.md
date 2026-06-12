# Acceptance Row Ledger

This ledger records product acceptance dispositions only when the row cites
same-run proof inputs. A row can pass, fail, block, or be reclassified; partial
proof classes stay separate instead of being collapsed into one product verdict.
Rows marked `technical pass` prove their named runtime/materialization proof
class, but remain short of full product/visual acceptance until Studio visible
state and reviewer disposition are captured.

## River Same-Run Proof Input

- Request: `studio-run-in-game-mq6c38rf-n2p`
- Proof artifact:
  `/tmp/civ7-river-parity/studio-run-in-game-mq6c38rf-n2p-final-surface.json`
- Verifier `proofHash`:
  `72a521da3e6bc410a44da551f7fc20304a4eec7ea3114b4b55d91d468f283293`
- Exact-authorship summary: status `complete`, seed `24681357`,
  `MAPSIZE_STANDARD`, dimensions `84x54`, runtime plot count `4536`, turn `1`,
  game hash `0`, source snapshot `status:1:b45bf719`, snapshot hash
  `b45bf719`, config hash
  `1fc12b546705f96d39a4ae07dae201624a689477fe248efea245dac3cd0c0ee0`,
  envelope hash `82b6cf9733f762bce547a1bb7e46b045df54a25213362ecbe7a4a87e8e281676`.
- Overall final-surface parity status: `unresolved` because non-river terrain,
  biome, feature, resource, natural-wonder-plan, and resource-placement proof
  links still diverge.

## Floodplain Same-Run Proof Input

- Request: `studio-run-in-game-mq6dx234-1wx4`
- Proof artifact:
  `/tmp/civ7-river-parity/studio-run-in-game-mq6dx234-1wx4-final-surface-latitude-fixed.json`
- Proof hash:
  `8289a63388373198982a7b6ef400569951eaa27bd163950b60dd26de50273917`
- Exact-authorship summary: status `complete`, seed `1018`,
  `MAPSIZE_STANDARD`, dimensions `84x54`, runtime plot count `4536`, turn `1`,
  game hash `0`, source snapshot `status:1:dd9eb739`, snapshot hash
  `dd9eb739`, config hash
  `1fc12b546705f96d39a4ae07dae201624a689477fe248efea245dac3cd0c0ee0`,
  envelope hash `82b6cf9733f762bce547a1bb7e46b045df54a25213362ecbe7a4a87e8e281676`.
- Live full-grid floodplain-family feature ids: `11` total:
  `FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE=1`,
  `FEATURE_TROPICAL_FLOODPLAIN_MINOR=7`,
  `FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE=3`.
- Local replay floodplain-family feature intents now match exact runtime:
  `FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE=1`,
  `FEATURE_TROPICAL_FLOODPLAIN_MINOR=7`,
  `FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE=3`.
- River terrain parity for this seed is also clean after the verifier latitude
  orientation repair: projected navigable terrain `21`, live
  `TERRAIN_NAVIGABLE_RIVER=21`, projected-vs-live terrain mismatch count `0`.
- Overall final-surface parity status: `unresolved`. Remaining unresolved links
  are `surface.terrain.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `resource-placement-coordinate-proof.placed`.
  This proof establishes live floodplain visibility and hydrology/rivers replay
  alignment, not deterministic full-surface parity.

## Rows

New final-surface parity packets publish explicit `proofClaims`. Product rows
must consume those labels rather than treating top-level `proof.status` as a
river/lake/floodplain product verdict. Legacy saved proof artifacts listed above
predate `proofClaims`; their row mapping is:

- Rivers terrain row: `terrain-readback=pass`, `metadata-readback=fail`,
  `civ-rendered=unresolved`, `studio-visible=unresolved`,
  `product-acceptance=unresolved`.
- Rivers metadata row: `metadata-readback=fail` until a real metadata writer is
  discovered and proven, or the product row explicitly scopes metadata out.
- Floodplain row: `floodplain-active=technical pass` for the active feature-grid
  proof, with `civ-rendered=unresolved`, `studio-visible=unresolved`, and
  `product-acceptance=unresolved` until visible-state evidence and reviewer
  disposition are captured.
- Lake rows must require `lake-final=pass`; `missing-exact-log` maps to
  `lake-final=unresolved`, not product acceptance.

| Row | Disposition | Proof Class | Evidence | Remaining Action |
| --- | --- | --- | --- | --- |
| Rivers: selected major/navigable river trunks are visible in Civ terrain readback | technical pass | terrain-row materialization | `riverMetadataParity.status=terrain-match-metadata-divergent`; planned minor river tiles `212`; planned major river tiles `149`; projected navigable terrain tiles `6`; live `TERRAIN_NAVIGABLE_RIVER` tiles `6`; projected-vs-live terrain mismatch count `0`. | Keep this as the technical acceptance basis for visible major/navigable rivers. Do not require Civ `GameplayMap.isRiver` metadata to pass the terrain visibility row. Full product/visual review remains open until Studio visible-state evidence and reviewer disposition are captured. |
| Rivers: Civ river metadata matches MapGen projected navigable terrain | reclassified | runtime metadata authoring capability gap | Same proof reports live `river=0`, live `navigableRiver=0`, live `minorRiver=0`, projected-vs-live metadata mismatch count `6`, and live terrain-vs-metadata mismatch count `6`. The disposable writer probe for `TerrainBuilder.setRiverValidationValues()` returned `undefined` but left full-grid river metadata unchanged. | Keep `minorRiverStampingSupported=false`. Open a new repair only if a stable per-tile river metadata writer is discovered and proven in a disposable session. |
| Floodplains: floodplain-family feature placement is visible in Civ feature readback | technical pass | live feature-grid materialization | River proof `studio-run-in-game-mq6c38rf-n2p` is an inactive no-signal floodplain row (`localFloodplainFamily=0`, `liveFloodplainFamily=0`). Floodplain proof `studio-run-in-game-mq6dx234-1wx4` is an active row: exact telemetry applied `11` floodplain-family features, local replay now plans those same `11` floodplain-family features after the verifier latitude-orientation repair, and live feature-grid readback contains those `11` floodplain-family ids. | Keep this as the live visibility basis for floodplains. Do not claim deterministic Studio/Civ full-surface parity from this seed; residual final grid deltas remain on terrain, feature, resource, and resource placement. Full product/visual review remains open until Studio visible-state evidence and reviewer disposition are captured. |

## Interpretation

- The visible river product failure is technically repaired for the proven
  terrain-stamping proof class; product/visual acceptance remains open until
  Studio visible-state evidence and reviewer disposition are captured.
- Minor-river metadata remains an explicitly unsupported adapter capability, not
  a hidden mock/runtime mismatch.
- Floodplain live visibility is now proven by the separate floodplain-producing
  seed. The older river proof remains useful because it prevents a false
  floodplain failure on a no-signal input.
- The previous floodplain local replay mismatch was caused by diagnostics-only
  latitude orientation drift: local replay used south-at-top bounds while Civ
  runtime used `MapInfo.MaxLatitude` as top and `MapInfo.MinLatitude` as bottom.
  The repaired proof now aligns hydrology, biome, river, floodplain, and natural
  wonder input rows with exact runtime.
- Deterministic Studio/local-vs-Civ full-surface parity is still not closed by
  these rows. Keep that as a separate product acceptance target instead of
  folding it into river or floodplain stamping.

## Residual Owner Classification

The saved proof artifacts keep residual final-surface deltas separate from the
river terrain proof class:

| Proof | River terrain residual | Other unresolved links | Current owner classification |
| --- | ---: | --- | --- |
| `studio-run-in-game-mq6c38rf-n2p` | `0` projected-vs-live navigable terrain mismatches (`6/6`) | `surface.terrain.mismatch` (`50`), `surface.biome.mismatch` (`562`), `surface.feature.mismatch` (`229`), `surface.resource.mismatch` (`211`), `natural-wonder-plan-coordinate-proof.planned`, `resource-placement-coordinate-proof.placed` | Not river/lake-owned. Residuals cross terrain/materialization, climate/biome, ecology feature, resource, natural-wonder planning, and placement proof boundaries. |
| `studio-run-in-game-mq6dx234-1wx4` | `0` projected-vs-live navigable terrain mismatches (`21/21`) | `surface.terrain.mismatch` (`24`), `surface.feature.mismatch` (`7`), `surface.resource.mismatch` (`49`), `resource-placement-coordinate-proof.placed` | Not river/lake-owned. This proof is the stronger floodplain/rivers replay row: biome and natural-wonder coordinate rows match, while remaining deltas are terrain/feature/resource/placement residuals. |

Both rows still classify Civ river metadata as
`terrain-match-metadata-divergent`, which is the known runtime metadata writer
gap and not a terrain visibility failure.
