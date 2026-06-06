## Why

The predecessor Earthlike tuning branch was created to increase the number of
distinct mountain range regions rather than producing a few massive mountain
walls. The current recovery stack already contains the area-scaled algorithm and
region-first tests, but the shipped Swooper Earthlike preset drifted to a
24-tile range-system spacing. On Huge maps that targets roughly 12 range
systems, while the test baseline documents an Earthlike Huge-map target of
about 18 systems.

## Target Authority Refs

- Direct product direction: mountain *regions* should be long and varied, with
  multiple ranges at Earthlike scale rather than two oversized clusters.
- `mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts`:
  the Earth-scaled helper baseline maps Huge `106x66` to 18 range systems.
- `codex/swooper-earthlike-post-foundation-tuning`: predecessor branch evidence
  that the Earthlike config work was intended to increase range-system count.

## What Changes

- Set Swooper Earthlike `rangeSystemSpacingTiles` to the Earth-scaled Huge-map
  18-system baseline (`19.7` tiles).
- Add an identity guard for the shipped Earthlike range-region spacing, length,
  and province radius knobs.
- Regenerate map artifacts through the existing generator.

## Forbidden Non-Goals

- Do not artificially increase mountain tiles per range.
- Do not bypass physical gating from tectonic/uplift drivers.
- Do not reintroduce retired internal mountain config keys from stale branches.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps gen:maps`
- `bun test mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts mods/mod-swooper-maps/test/pipeline/mountain-range-length.test.ts mods/mod-swooper-maps/test/pipeline/terrain-relief-balance.test.ts mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts`
