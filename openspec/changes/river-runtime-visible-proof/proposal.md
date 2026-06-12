## Why

Current runtime proof can show live `TERRAIN_NAVIGABLE_RIVER` terrain rows, but
users still may not see rivers in the rendered Civ camera. Visible product proof
requires a same-run packet that includes camera targeting and screenshots for
sampled live river tiles.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/studio-civ7-exact-authorship-proof/**`
- `openspec/changes/earthlike-visible-river-acceptance/**`
- `packages/civ7-direct-control/AGENTS.md`

## What Changes

- Add direct-control primitives or wrappers for selecting sampled river tiles,
  centering the camera, recording camera/zoom/visibility state, and capturing
  screenshots.
- Add a river visible-proof runner that composes exact-authored run, final
  surface parity, live river tile sampling, native `MapRivers` plot membership,
  camera targeting, screenshots, and explicit visual verdict.
- Add positive and negative controls so stale/off-target screenshots cannot
  pass.

## Requires

- Exact-authorship proof.
- Live terrain readback, sampled river coordinates, and native `MapRivers`
  object plot readback for the same run.
- A currently running Civ session for visual proof.

## Enables Parallel Work

- Product acceptance can finally distinguish rendered visibility from terrain
  readback.
- Studio River Inspector can link sampled tiles to proof artifacts.

## Affected Owners

- `packages/civ7-direct-control/**`
- `scripts/civ7-direct-control/**`
- `apps/mapgen-studio/src/server/runInGame/**`
- Product proof ledgers

## Forbidden Owners

- No caller-local runtime transports.
- No macOS-only screenshot claim unless labeled as fallback.
- No visual proof from screenshots that are not tied to the exact request and
  sampled live river tiles.

## Stop Conditions

- Camera cannot be centered on sampled river tiles.
- Screenshot cannot be tied to request id, seed, dimensions, camera state,
  sampled coordinates, and native river object membership.
- Visual verdict is missing or based only on terrain readback.

## Verification Gates

- Direct-control unit/fixture tests for proof-packet shape.
- Manual or automated live proof run with screenshot hashes.
- Negative controls for wrong seed/map, no-river map, off-target screenshot, and
  hidden/unrevealed tiles.
- OpenSpec strict validation.
