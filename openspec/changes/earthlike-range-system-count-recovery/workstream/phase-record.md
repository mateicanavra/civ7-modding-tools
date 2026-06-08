# Phase Record: Earthlike Range-System Count Recovery

## Status

Closed locally pending Graphite commit.

## Evidence

- Current shipped Swooper Earthlike used `rangeSystemSpacingTiles: 24`.
- `resolveTileAreaSpacingTarget({ width: 106, height: 66, spacingTiles: 24 })`
  targets roughly 12 systems.
- The existing area-scaling test documents the Huge baseline as
  `sqrt((106*66)/18) ~= 19.7`, targeting 18 systems.

## Verification

- `bun run --cwd mods/mod-swooper-maps gen:maps`
- `bun test mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts mods/mod-swooper-maps/test/pipeline/mountain-range-length.test.ts mods/mod-swooper-maps/test/pipeline/terrain-relief-balance.test.ts mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts`
