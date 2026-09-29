# Fixed Earth Reference

## Scope And Evidence

This first implementation of [Earth calibration](earth-calibration.md) is a
test-owned source fixture and two deliberately separate diagnostics. It changes
no production algorithm, authored default, runtime entry point, or study engine.
It is not a physical DEM, empirical climate calibration, full Standard run,
native parity result, or navigability test.

The fixture owner is
`plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth/`;
the integration test is `stages/hydrology/earth-reference.test.ts` beside it.
The small checked-in JSON keeps ordinary CI independent of the official-resource
submodule. The extractor uses read-only SQLite and TypeScript AST literals,
never executes the engine script, and rejects a changed source hash.

| Source | Admission |
| --- | --- |
| Resource commit | `89cee44d5ae7192f126e8ae09484c04400df9146` |
| `Earth_Huge.Civ7Map` | SHA-256 `46841392de74b18a034e311fb13c5f7bbbd5e03f2b54a26030d586431a4f332d` |
| `Earth_Huge.js` | SHA-256 `47b2e527757dd3984ec02c718bc5bc111d8be41b321ea703b67030a05b286054` |
| Elevation | 6,996 literal native indices from `paintEarthHugeElevation`; DB elevation is all zero |
| Water | Independently from `Plots.TerrainType`, not a native-height threshold |
| Rivers | 396 literal authored declarations; reference evidence only, never routing inputs |

The grid is 106 by 66, X-periodic and Y-bounded, odd-row-offset, indexed
`y * width + x`. Native Y increases northward, also visible in the source's
`paintEarthHugeSnow` top-row loop. Native-index routing retains this ordering.
Baseline climate maps row zero to its top latitude, so the climate-only fixture
reflects `y' = 65 - y` and applies `x' = (x + (y & 1)) % 106`. The X correction
preserves hex neighbors after the even-height reflection changes row parity.
Tests prove bijection and every edge, including the wrapped seam. No relief
resampling or height conversion occurs. In particular, neither inverse Swooper
encoding `(index - 128) / 10` nor a claim of metres is admitted; small authored
channel drops survive.

## Diagnostic Contracts

**Native-index routing under controlled supply.** The actual drainage-basin,
local-runoff, certified open-basin-network, river-projection and body-aware
classification operations consume unchanged native indices and the independent
source water mask. Rainfall 100, humidity 128 and demand 10 are controlled
indices, with the runoff operation's explicit default infiltration/humidity
policy. Area is one model tile, not spherical Earth area. Discharge is an
index flux, not cubic metres per second; demand is not measured evaporation.
Native-index slopes and basin volumes have no physical calibration.

All source water is an external sink **for this diagnostic only**. The solver's
`marineExits` field therefore means exits to admitted source water here, not
proof of marine destination. The 3,767-cell largest water component is retained
separately from 34 enclosed coast components totaling 71 cells. Their lake beds,
native classifications, marine exchange and water budgets are unsupported
reference questions; the fixture neither treats their surface as a bed nor
silently recategorizes them as land. Predicted wet bodies on source land are
distinct from these pre-existing wet references. This arm cannot score accurate
Earth terminal destinations or closed-lake reconstruction.

The rain-zero control must retain a dry unsupported certificate. Raising demand
to 100 at rainfall 100 must retain a closed unsupported certificate and no
partial plan. The supported case checks receiver adjacency, downhill water
surface, conservation within the operation's numerical bound, exact
repeatability, and unchanged supplied terrain/forcing. A class-only percentile
change must change classes without changing the physical network. No river
count is fitted to Firaxis or promoted to an empirical acceptance threshold.

**Earth-coast, flat-relief climate.** The actual `ClimateBaselineStep` runs with
all actual domain operation implementations and validated test artifact
publication. Standard's public compile supplies normalized canonical Earthlike
forcing, including 23.44-degree tilt; the test setup explicitly uses the
source's +90/-90 latitude bounds rather than the preset's +80/-80 crop. The
existing climate implementation clamps polar samples just inside +/-90.
Elevation, sea level and bathymetry are deliberately zero everywhere: this is
an orography/bathymetry ablation, not converted native relief.

The shelf mask is the source `TERRAIN_COAST` reference, not a fabricated
Foundation crust or a recomputed physical shelf. Actual Morphology operations
derive coastal adjacency and distance from the admitted mask. Every supplied
artifact has its ordinary schema/cardinality validation. No private artifact
store writes, Foundation history or upstream producer evidence is invented.

An aquaplanet control removes the continents and authored shelf while holding
grid, latitudes, seed, normalized forcing and flat relief fixed. Pressure, wind
and rainfall must respond to that geography change, repeat exactly for fixed
inputs, and remain finite/in-domain. These are causal and interface checks,
not observed-Earth accuracy scores. This climate arm is not fed into the native
relief drainage arm; combining their incompatible relief conventions would
pretend to prove a coupled Earth reconstruction.

## Reproduction And Limits

From the Swooper definition directory, after normal dependency preparation:

```sh
bun test test/recipes/swooper-physics-standard/stages/hydrology/earth-reference.test.ts
bun test/recipes/swooper-physics-standard/fixtures/earth/extract.ts
```

The second command requires the pinned local source checkout and compares the
extraction to the checked-in fixture. An explicit source directory is supported
as the first argument; adding `--write` regenerates the JSON from admitted
sources. The test separately pins its complete canonical payload digest and
rejects executable/nonliteral AST data. Updating the source is an intentional
provenance review, not an automatic download or a silent snapshot refresh.

Next empirical work still needs physical relief/area/flux admission, independent
forcing, inland-water semantics and complete producer dependencies for a coupled
Standard benchmark. None is inferred from a green bounded fixture test.
