# Resource Evidence

Date: 2026-06-09

## Resource Sync

Commands:

```sh
bun run resources:init
bun run resources:status
bun run refresh:data
git -C .civ7/outputs/resources status --short --branch
git -C .civ7/outputs/resources log -1 --oneline --decorate
```

Result:

- `resources:status` reported `.civ7/outputs/resources` clean at `fbc38ef`.
- `refresh:data` zipped from the installed Steam app resource root and unpacked
  into `.civ7/outputs/resources`.
- The resources submodule remained clean after refresh.
- Snapshot: `fbc38ef (HEAD -> main, origin/main, origin/HEAD) Update snapshot 2026-06-03T01:59:59Z`.

## Installed App Parity

Installed app resource root:

```text
/Users/mateicanavra/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VII/CivilizationVII.app/Contents/Resources
```

Checksum spot-check command compared the installed app against
`.civ7/outputs/resources` for:

- `Base/modules/base-standard/maps/continents.js`
- `Base/modules/base-standard/maps/archipelago.js`
- `Base/modules/base-standard/ui-next/tooltips/plot-tooltip/helpers.js`
- `Base/modules/base-standard/data/terrain.xml`
- `Base/modules/base-standard/data/unit-movement.xml`

Result: all checked file pairs had identical SHA-256 hashes.

## River Callsite Search

Search roots:

- `.civ7/outputs/resources/Base/modules/base-standard/maps`
- `.civ7/outputs/resources/Base/modules/base-standard/scripts`
- `.civ7/outputs/resources/Base/modules/base-standard/ui-next/tooltips`
- `.civ7/outputs/resources/Base/modules/base-standard/data/unit-movement.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/diplomacy-actions.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`
- Matching installed app paths under the Steam app resource root.

Search pattern:

```text
modelRivers|defineNamedRivers|storeWaterData|setRiverValidationValues|getRiverType|RiverTypes|RIVER_MINOR|RIVER_NAVIGABLE|TERRAIN_NAVIGABLE_RIVER
```

Findings:

- Official map scripts call `TerrainBuilder.modelRivers(...)`, then
  `TerrainBuilder.defineNamedRivers()`, then `TerrainBuilder.storeWaterData()`.
- `terrain.xml` defines `TERRAIN_NAVIGABLE_RIVER` and its navigable floodplain
  feature legality rows.
- `unit-movement.xml` and `diplomacy-actions.xml` reference both `RIVER_MINOR`
  and `RIVER_NAVIGABLE`.
- Tooltip helpers read `GameplayMap.getRiverType(...)` and branch on
  `RiverTypes.NO_RIVER`, `RiverTypes.RIVER_MINOR`, and
  `RiverTypes.RIVER_NAVIGABLE`.
- No official JS/XML callsite for `TerrainBuilder.setRiverValidationValues`
  was found in the searched resource roots.

## Narsil Index Cross-Check

Narsil code-intel was consulted as a supporting search rail, with the caveat
that it indexes the primary worktree, not this isolated rivers branch.

Indexed repo:

```text
civ7-modding-tools#2fa31857
```

Targeted Narsil dependency and search queries for the river API cluster
confirmed a useful caveat: the available index is for the primary checkout, not
this isolated rivers worktree, and did not provide branch-authoritative
callsite proof. The branch therefore does not use Narsil semantic results as
proof for this claim.

The authoritative follow-up was exact text search on the primary indexed
resource tree and the synced official resources:

```sh
rg -n "TerrainBuilder\\.(modelRivers|defineNamedRivers|storeWaterData|setRiverValidationValues)|GameplayMap\\.(getRiverType|isRiver|isNavigableRiver)|RiverTypes\\.(NO_RIVER|RIVER_MINOR|RIVER_NAVIGABLE)|TERRAIN_NAVIGABLE_RIVER" \
  .civ7/outputs/resources/Base/modules/base-standard/maps \
  .civ7/outputs/resources/Base/modules/base-standard/scripts \
  .civ7/outputs/resources/Base/modules/base-standard/ui-next/tooltips \
  .civ7/outputs/resources/Base/modules/base-standard/data/{unit-movement.xml,diplomacy-actions.xml,terrain.xml}
```

That exact search confirmed the same evidence as the resource audit: official
map scripts call `TerrainBuilder.modelRivers(...)`,
`TerrainBuilder.defineNamedRivers()`, and `TerrainBuilder.storeWaterData()`;
tooltip and utility code read river metadata via `GameplayMap.getRiverType`,
`GameplayMap.isRiver`, `GameplayMap.isNavigableRiver`, and `RiverTypes`;
`terrain.xml` defines `TERRAIN_NAVIGABLE_RIVER`; and no official
`TerrainBuilder.setRiverValidationValues` callsite was found.

Conclusion: current official resources and the installed app both support Civ's
bulk river generator and river metadata readback, but do not expose a proven
public per-tile minor-river writer. MapGen-owned major-river stamping is
therefore bounded to `TERRAIN_NAVIGABLE_RIVER` terrain projection unless a
separate metadata writer is discovered and proven.
