## Why

`bun run lint:adapter-boundary` is red because
`packages/civ7-map-policy/src/river-type-metadata.source.ts` contains
`/base-standard/` path strings used as provenance metadata for Civ7 river type
enum values. The adapter-boundary script correctly bans runtime
`/base-standard/` ownership outside `@civ7/adapter`, but map-policy already has
an explicit provenance-string exception class for generated/static Civ7 policy
sources.

This file belongs to that existing exception class. Leaving it unallowlisted
makes the strict architecture gate fail on a non-runtime string and blocks the
Habitat workstream's baseline burn-down path.

## What Changes

- Add `packages/civ7-map-policy/src/river-type-metadata.source.ts` to the
  adapter-boundary allowlist under the existing map-policy provenance rationale.
- Record the provenance-string interpretation and verification evidence in this
  OpenSpec slice.

## What Does Not Change

- No adapter-boundary weakening: runtime `/base-standard/` imports remain owned
  by `packages/civ7-adapter`.
- No generated table edits and no map-policy behavior change.
- No Habitat ratchet-baseline edit in this slice; the existing
  `tools/habitat-harness/baselines/adapter-boundary.json` entry becomes
  prunable by the later shrink-only ratchet path.

## Affected Owners

- `scripts/lint/lint-adapter-boundary.sh`
- `packages/civ7-map-policy/src/river-type-metadata.source.ts` as evidence only
- Habitat workstream baseline records as downstream context only

## Verification Gates

- `bun run lint:adapter-boundary`
- `bun run openspec -- validate adapter-boundary-river-metadata-provenance --strict`
- `git diff --check`

## Stop Conditions

- The path strings are used as runtime imports or direct engine access rather
  than provenance metadata.
- The fix requires changing the adapter-boundary scanner semantics.
