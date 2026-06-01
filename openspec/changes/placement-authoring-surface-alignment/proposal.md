# Placement Authoring Surface Alignment

## Why

The standard recipe `placement` stage still exposes the default
internal-step-config authoring shape. Authors currently see raw
`derive-placement-inputs` op envelopes, empty product/effect step keys, an
adapter/resource candidate list that runtime planning ignores, and start-sector
overrides that belong to runtime map-size settings rather than shipped map
configuration.

That surface is inconsistent with the authoring-surface workstream target:
public fields should be semantic, documented, bounded, gameplay meaningful, and
compiled into internal executable config. Placement already has real
product/effect step boundaries; this change cleans up the authored controls
without changing those runtime contracts.

## What Changes

- Add an explicit semantic public schema for the `placement` stage.
- Keep the flat stage shape `{ knobs?, [publicKey]?: publicConfig }`.
- Expose only product-facing placement controls:
  - `naturalWonders.minSpacingTiles`
  - `discoveries.densityPer100Tiles`
  - `discoveries.minSpacingTiles`
  - `floodplains.minLength`
  - `floodplains.maxLength`
  - `resources.densityPer100Tiles`
  - `resources.minSpacingTiles`
  - `resources.maxPlacementsPerResourceShare`
- Compile those public controls into the existing internal placement step/op
  configs:
  - `derive-placement-inputs.wonders`
  - `derive-placement-inputs.naturalWonders`
  - `derive-placement-inputs.discoveries`
  - `derive-placement-inputs.floodplains`
  - `derive-placement-inputs.resources`
  - `derive-placement-inputs.starts`
  - empty placement product/effect step configs.
- Migrate first-party shipped map configs away from raw placement step/op keys.
- Regenerate generated Studio/map artifacts through existing scripts.
- Add schema, compile, unknown-key, Studio, and stable compiled-config proof.

## What Does Not Change

- No placement runtime algorithm is changed.
- No placement product/effect step is merged, split, or reordered.
- No persisted `advanced` wrapper, compatibility shim, dual shape, or broad
  public export is added.
- `candidateResourceTypes` remains adapter-owned runtime input, not authored
  map config.
- start player counts, start-sector dimensions, and `startSectors` remain
  runtime map-size settings/derived inputs, not shipped map authoring controls.
- No direct Civ7 runtime proof is claimed unless implementation changes
  generated placement behavior.

## Impact

Map authors tune late placement as semantic product controls instead of
editing raw op envelopes. Shipped maps compile to the same internal placement
config after migration, while Studio sees only intended placement controls.

