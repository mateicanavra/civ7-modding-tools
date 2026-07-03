# KNIP Dead-Code Evidence

Status: evidence artifact

## Commands

Configuration/availability checks:

```bash
find . -maxdepth 4 \( -name 'knip.json' -o -name 'knip.jsonc' -o -name 'knip.config.*' -o -name '.knip.*' \) -print
bunx knip --version
```

Scoped local command:

```bash
bunx knip --workspace mods/mod-swooper-maps --include files,exports,types --reporter compact --no-progress --no-exit-code --max-show-issues 500
```

Broader auditor command:

```bash
bunx knip --no-progress --no-exit-code --reporter compact --include files,exports,nsExports,types,nsTypes,enumMembers,namespaceMembers,duplicates --max-show-issues 10000
```

## Availability And Configuration

- No KNIP config file was found.
- `bunx knip --version` returned `6.23.0`.
- KNIP was run without fix mode.
- The scan is interpreted as suspicion evidence because this repo has Habitat
  rule entry surfaces and generated/derived surfaces outside KNIP's default
  model.

## Raw Relevant Findings

Scoped local report:

```text
Unused files (66)
Unused exports (68)
Unused exported types (101)
```

Narrative-specific scoped hits:

```text
Unused files:
mods/mod-swooper-maps/src/domain/narrative/ops.ts
mods/mod-swooper-maps/src/domain/narrative/ops/index.ts
mods/mod-swooper-maps/src/domain/narrative/tagging/hotspots.ts
mods/mod-swooper-maps/src/domain/narrative/tagging/index.ts
mods/mod-swooper-maps/src/domain/narrative/tagging/margins.ts
mods/mod-swooper-maps/src/domain/narrative/tagging/rifts.ts
mods/mod-swooper-maps/src/domain/narrative/tagging/types.ts
mods/mod-swooper-maps/src/domain/narrative/utils/latitude.ts

Unused exports:
mods/mod-swooper-maps/src/domain/narrative/config.ts: NarrativeConfigSchema, ContinentalMarginsConfigSchema, HotspotTunablesSchema, OrogenyTunablesSchema, RiftTunablesSchema
mods/mod-swooper-maps/src/domain/narrative/corridors/config.ts: SeaCorridorPolicySchema, IslandHopCorridorConfigSchema, LandCorridorConfigSchema
mods/mod-swooper-maps/src/domain/narrative/corridors/runtime.ts: isCoastalLand, isWaterAt
mods/mod-swooper-maps/src/domain/narrative/corridors/sea-lanes.ts: hasPerpWidth, longestWaterRunColumn, longestWaterRunRow, longestWaterRunDiagSum, longestWaterRunDiagDiff
mods/mod-swooper-maps/src/domain/narrative/corridors/style-cache.ts: fetchCorridorStylePrimitive
mods/mod-swooper-maps/src/domain/narrative/index.ts: default
mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts: contracts
mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts: zonalWindStep
mods/mod-swooper-maps/src/domain/narrative/overlays/index.ts: default

Unused exported types:
mods/mod-swooper-maps/src/domain/narrative/config.ts: NarrativeConfig, ContinentalMarginsConfig, CorridorsConfig, IslandHopCorridorConfig, LandCorridorConfig, NarrativeHotspotTunables, OrogenyTunables, RiftTunables, SeaCorridorPolicy
mods/mod-swooper-maps/src/domain/narrative/index.ts: StoryOverlayKey
mods/mod-swooper-maps/src/domain/narrative/models.ts: NarrativeMotifsMargins
mods/mod-swooper-maps/src/domain/narrative/orogeny/belts.ts: OrogenySummary
mods/mod-swooper-maps/src/domain/narrative/overlays/index.ts: StoryOverlayKey
```

Broader auditor report also found `domain/placement` and Habitat rule files as
unused. Those are recorded as KNIP model limitations because source recipe
binding and Habitat manifests provide entry surfaces KNIP did not model.

## Interpretation

KNIP supports these claims:

- narrative ops are not reached by the current workspace entry model;
- tagging helpers are especially stale because no current production or test
  caller reaches them;
- root narrative/default and config exports are public-surface collars, not
  production wiring;
- KNIP alone is insufficient deletion proof for Habitat rules, placement ops,
  or other repo-specific execution surfaces.

The strongest deletion candidates are:

- `domain/narrative/ops.ts`;
- `domain/narrative/ops/index.ts`;
- `domain/narrative/ops/contracts.ts`;
- `domain/narrative/tagging/**`;
- `domain/narrative/utils/latitude.ts` if tagging/rifts are deleted.

The broader narrative source network is test-live through story tests, but the
tests exercise legacy/story behavior rather than current standard recipe wiring.

## Limitations

KNIP is unconfigured. It does not understand:

- Habitat `rule.json` runner references;
- archived docs versus current source;
- generated or generated-adjacent package entry points;
- package-specific task entry points;
- semantic ownership decisions.

Therefore KNIP evidence is used as dead-code suspicion and must be paired with
Narsil/`rg` consumer proof before deletion.
