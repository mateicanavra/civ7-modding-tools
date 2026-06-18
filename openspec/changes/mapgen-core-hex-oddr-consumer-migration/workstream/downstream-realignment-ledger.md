# Downstream realignment ledger — odd-R consumer migration

Verification on the fully-migrated build (worktree, branch
`agent-A-mapgen-oddr-consumer-migration`):

- BUILD `@swooper/mapgen-core` + `@civ7/adapter` + `mod-swooper-maps`: green.
- BIOME (changed files): 10/10 clean.
- TEST `@swooper/mapgen-core`: 103 pass / 0 fail.
- TEST `mod-swooper-maps`: 566 pass, 2 skip, 11 fail, 1 error.

## Failure triage

### Pre-existing / environmental (NOT caused by this change)
These fail because the disposable worktree lacks official game data and a built
dist subpath; they pass in the primary checkout / CI. Confirmed by their error
messages (file-not-found / module-not-found / unrelated discoveries code).

1. `official resource corpus contract` ×4 — `ENOENT .civ7/outputs/resources/.../resources.xml` (+ `.modinfo`).
2. error: `Cannot find module 'mod-swooper-maps/recipes/standard-artifacts'` (`standard-recipe-artifact-guards.test.ts`) — unbuilt dist subpath in the worktree.
3. `M3 no-fudging posture (static scan)` — flags `place-discoveries/contract.ts [legacy.generateDiscoveries]`; discoveries code, untouched by this slice.

### Adjacency-driven (caused by the corrected model)

| Test | Shift | Disposition |
|---|---|---|
| `hydrology/compute-ocean-thermal-state > shelfMask increases local mixing` | `Received: 0` | **Test fixture update.** Not a regression: the test uses a linear latitude gradient and probes the center tile; the corrected odd-R neighborhood is vertically symmetric (2 above / 2 below / 2 same-row) so the neighbor average equals the center → zero mixing delta. The old odd-Q neighborhood was vertically asymmetric (the artifact the test relied on). Rebuild the fixture to detect mixing without depending on neighbor asymmetry. |
| `surface delta context diagnostics > classifies coast/ocean terrain edge swaps` | neighbor classification changed | **Test expectation update** to the odd-R neighbor set. Diagnostics only. |
| `Ecology baseline fixtures > artifact fingerprints match baseline` | fingerprint hash changed | **Golden regenerate** against corrected climate→biome output. |
| `pipeline hydrology river-network metrics > visible-scale bands` | visible minor-river share 0.61 vs guard ≤0.55 | **USER DECISION** — earthlike design-intent guard. |
| `terrain relief balance > foothills/rough uplands broken` | largest rough-upland component 60 vs guard ≤40 | **USER DECISION** — earthlike design-intent guard. |

## Open decision (earthlike guards)

The corrected adjacency shifts two map-character metrics outside guards that were
calibrated to the buggy odd-Q model. The corrected model is right; the guards
(and/or the config tuning) are now mis-calibrated. Resolution is a map-aesthetic
call:
- (a) recalibrate the guards to the corrected-model values (accept the new
  character), or
- (b) keep the guards and re-tune the config (rough-land breaking / river-class
  parameters) on top of the corrected adjacency.

This is deferred to the user (map aesthetic owner) and may be informed by the live
in-game render.
