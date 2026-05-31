# Morphology Terrain Stats Readback

## Why

The morphology authorship workstream found that Swooper Earthlike maps can pass
existing checks while planned and final hills remain near zero. Current local
stats also blend ridge mountains with volcano-stamped mountains, making final
mountain share look healthier than the Morphology ridge surface really is.

## What Changes

- Extend `collectWorldBalanceStats` with measurement-only terrain relief
  diagnostics:
  - planned and final hill component structure
  - planned and final rough terrain shares
  - final non-volcano mountain and non-volcano rough shares
  - planned volcano counts by tectonic kind
  - final volcano-feature and volcano-mountain counts
  - flat-to-rough ratios
- Add a focused diagnostic test that validates accounting invariants without
  asserting the future Earthlike success bands against the currently failing
  output.

## What Does Not Change

- No map generation behavior.
- No shipped map config.
- No runtime Civ7 control transport.
- No claim of engine elevation or cliff proof.
