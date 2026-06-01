# Downstream Realignment Ledger

| Area | Required realignment | Status |
| --- | --- | --- |
| World-balance stats | Add non-volcano mountain separation, hill components, rough/flat budgets, volcano kind/regime counts, stage terrain deltas, and explicit expected-band comparison. | partial: stats/readback slice added terrain/volcano/hill/rough/flat diagnostics and rough-land owner shares; stage terrain deltas, coast-distance profiles, and production runtime tie-back remain required |
| Morphology ops | Add or reshape a dedicated rough-land operation for rolling uplands, old highlands, plateau rims, basin margins, escarpments, and craton relief. | implemented locally by `morphology/plan-rough-lands`; focused relief tests pass |
| Earthlike config | Defer tuning until stats prove the candidate deficit and rough-land op exists. Remove stale/noise-only knobs if the op supersedes them. | rough-land owner exists; config retuning still deferred until ecology/resource realignment and controlled target-map proof |
| Projection stages | Keep `plotMountains`/`plotVolcanoes` as projection/readback only; record planned-vs-final terrain drift. | required |
| Hydrology | Preserve lake and navigable-river terrain mutation as Hydrology-owned; compare lake/river terrain drift separately from Morphology roughness. | required |
| Ecology/features | Re-run feature legality and family-density gates after rough-land distribution changes; hill scarcity currently affects terrain-linked natural wonders. | measured; broad world-balance still fails Sagebrush habitat and Rainforest seed-presence gates |
| Resources | Re-run hill-dependent resource candidate/placement gates for mining, pastoral, upland agriculture, and geological resources. | required |
| Natural wonders | Re-evaluate hill/mountain/coast natural-wonder eligibility after terrain rebalancing; do not use natural wonders to satisfy terrain-band proof. | required |
| Direct control | Add first-class cliff-crossing map readback or use a bounded read-only approved probe before claiming cliff proof. | bounded read-only `GameplayMap.isCliffCrossing` probe captured live cliff/elevation readback; first-class map field remains a package polish item |
| Studio | Treat current setup/run-in-game design as non-proof-ready; runtime proof must use committed direct-control CLI/package paths. | `/api/civ7/status`, `/api/civ7/map-summary`, and `/api/civ7/gameinfo` returned live package-backed payloads; setup/restart of the target map remains unproved |
