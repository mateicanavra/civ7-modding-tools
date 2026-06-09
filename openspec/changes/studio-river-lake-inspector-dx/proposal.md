## Why

Users need to understand why rivers are missing or hard to see. Generic Studio
layers do not expose the river/lake proof ladder: physical hydrology, planned
minor/major, selected navigable projection, engine terrain readback, metadata
divergence, lakes, floodplains, and mismatches.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/river-lake-proof-class-ledger/**`
- `apps/mapgen-studio/**`

## What Changes

- Add a River/Lake Inspector summary model and UI surface.
- Add count chips, status chips, one-click layer selection, and debug metadata
  lanes.
- Add stable colors/categories for river/lake/floodplain masks.
- Add Studio config migration for legacy `map-rivers.knobs.riverDensity` to
  `navigableRiverDensity` when safe.

## Requires

- Existing map-rivers and lake artifact emissions.
- Proof status vocabulary from `river-lake-proof-class-ledger`.

## Enables Parallel Work

- Runtime proof can link sampled tiles back to Studio layers.
- Product reviewers can diagnose missing rivers without reading raw JSON.

## Affected Owners

- `apps/mapgen-studio/**`
- `packages/mapgen-viz/**` if palette/data-type contracts need ownership
- Map config migration tests and docs

## Forbidden Owners

- No decorative tutorial text in place of tool controls.
- No screenshots as Studio data authority.
- No hidden debug-only default for primary planned/projected/engine terrain
  river layers.

## Stop Conditions

- A normal Studio run can show zero rivers without a specific diagnostic status.
- Planned minor/major, projected navigable, and engine terrain readback cannot
  be inspected from the normal UI.

## Verification Gates

- Inspector summary model tests.
- Viz metadata/palette tests.
- Config migration tests.
- Browser/Playwright screenshots after UI implementation.
- OpenSpec strict validation.
