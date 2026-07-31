# Earthlike circulation-structure studies

**Executable authority:** [`earthlike-wind-structure.study.ts`](earthlike-wind-structure.study.ts)
**Target IDs:** `swooper-earthlike/wind-structure` and
`swooper-earthlike/pressure-structure`

## Question and design

Do shipped Earthlike and Latest Juicy retain recognizable large-scale
atmospheric circulation and its published pressure-anomaly evidence without
collapsing into quantizer saturation or small-scale texture?
Each cohort runs three `MAPSIZE_STANDARD` scenarios
(84 x 54, 8 players) using map/game seed pairs `1018/1018`, `1/1`, and `42/42`.
The configurations share the authored wind posture while Latest Juicy supplies
the drier, more mountainous live-feel oracle.

The study reads the durable published `windU`, `windV`, and `pressure` grids.
It measures aggregate structure rather than reproducing either operation:
broad zonal wind-band signs, tropical equatorward flow, hemispheric mean-curl
mirroring, row-mean directional signal, within-row zonal RMS, deviation
dominance, vector-magnitude saturation, pressure-belt means, pressure mirror
asymmetry, pressure/wind scaffold-frame agreement, and row-mean-removed
pressure-anomaly RMS.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. Across the cohort, no more than `0.02`
of tiles reach the signed-byte vector-magnitude ceiling; no more than `0.8` of
tiles let local deviation dominate the row-mean signal; at least `0.9` of
scored rows carry the expected broad zonal sign; within-row zonal RMS remains
at most `0.85` times mean zonal band strength; mean meridional row strength
remains at most `0.35` times mean zonal strength; northern-tropical mean `V` is
at least `+2`, southern-tropical mean `V` is at most `-1`, and temperate-band
mean curl has opposite hemispheric signs with normalized asymmetry at most
`0.35`.

**Expectation IDs:** `wind-saturation-bounded`,
`wind-deviation-dominance-bounded`, `wind-zonal-band-sign-floor`,
`wind-eddy-to-band-rms-ratio-bounded`, `wind-meridional-zonal-dominance`,
`wind-tropical-north-equatorward`, `wind-tropical-south-equatorward`, and
`wind-hemispheric-curl-mirror`.

Every pressure sample retains a subtropical ridge band mean above both the
equatorial trough and subpolar-low means in each hemisphere. The north/south
band profiles have normalized asymmetry at most `0.1`, and at least `0.8` of
scored extratropical rows in each hemisphere align pressure belts and
zonal-mean wind on the same coordinate and circulation frame. The latter is a
frame-consistency check, not independent causal reconstruction. Those are the
sealed pressure experiment's final ratchets from `0.35` and `0.7` respectively
(historical observations `0.0023` and `0.90`).
Row-mean-removed pressure anomalies retain at least `4 hPa` RMS, preventing a
latitude-only scaffold from satisfying the pressure contract. The floor is
about half the measured six-scenario minimum (`7.963 hPa`), leaving room for
calibration without turning the current pressure configuration into the oracle.

**Expectation IDs:** `pressure-belt-ridge-above-trough`,
`pressure-belt-ridge-above-subpolar`, `pressure-hemispheric-mirror`,
`pressure-wind-scaffold-frame-agreement`, and
`pressure-zonal-anomaly-rms-floor`.

The [hydrology family](../families/hydrology.md) owns the neutral measurement
and frame interpretation. These shared targets own only the shipped Earthlike
circulation-posture bounds. Controlled operation tests own the causal
pressure-response law: annual pressure and annually averaged, seasonally
quantized wind do not commute strongly enough for this product study to claim
causal reconstruction.

## Proof

```bash
nx run swooper-physics:metrics:report
nx run swooper-physics:test
```
