# Acceptance Seed Matrix

This matrix records stable proof inputs for product acceptance rows. Rows are
not interchangeable: a seed that proves river terrain stamping can still be a
no-signal input for floodplain feature-family acceptance.

| Row Scope | Map Config | Seed | Size | Local Evidence | Live Evidence | Disposition |
| --- | --- | ---: | --- | --- | --- | --- |
| River terrain materialization | `swooper-earthlike` | `24681357` | `84x54` | Planned minor rivers `212`, planned major rivers `149`, projected navigable terrain `6`. | Same-run proof `studio-run-in-game-mq6c38rf-n2p` reports live `TERRAIN_NAVIGABLE_RIVER=6` and projected-vs-live terrain mismatch count `0`. | Stable river terrain proof input. Not a floodplain-producing input. |
| Floodplain feature-family acceptance | `swooper-earthlike` | `1018` | `84x54` | Local `collectWorldBalanceStats` run produced `11` floodplain-family attempts with zero soft rejections: `FEATURE_GRASSLAND_FLOODPLAIN_MINOR=3`, `FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE=3`, `FEATURE_TROPICAL_FLOODPLAIN_MINOR=4`, `FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE=1`. Guarded by `test/pipeline/world-balance-stats.test.ts` and `test/ecology/floodplain-feature-product-row.test.ts`. | Same-run proof `studio-run-in-game-mq6dx234-1wx4` rerun after verifier latitude repair reports exact-authorship `complete`, verifier `proofHash` `8289a63388373198982a7b6ef400569951eaa27bd163950b60dd26de50273917`, local/exact/live floodplain-family feature ids `11`: `FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE=1`, `FEATURE_TROPICAL_FLOODPLAIN_MINOR=7`, `FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE=3`. River terrain for this seed also matches: projected navigable `21`, live `21`, mismatch `0`. Broader surface parity remains `unresolved` for terrain/feature/resource/resource-placement residuals. | Floodplain live visibility and hydrology/rivers replay proof input. Not a deterministic full-surface parity pass. |

## Next Use

- Use seed `1018` at `84x54` for floodplain-producing live visibility
  regression checks. Do not use it as a full-surface deterministic parity pass
  until the broader local-vs-live surface divergence is repaired.
- Keep seed `24681357` as the current river terrain proof record until a broader
  acceptance matrix supersedes it.
