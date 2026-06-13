# Adapter Boundary River Metadata Provenance Phase Record

## State

- Branch/Graphite stack:
  `agent-F-adapter-boundary-river-metadata` above
  `agent-F-sdk-mod-test-teardown`.
- Change id: `adapter-boundary-river-metadata-provenance`.
- Objective: restore the strict adapter-boundary gate by classifying
  `river-type-metadata.source.ts` as the same map-policy provenance-string
  exception class already used by generated/static policy sources.
- Status: implemented and verified.

## Authority And Inputs

- Direct user suggested task: fix red adapter-boundary lint on main by
  confirming river metadata references are provenance strings and adding the
  file to the script allowlist.
- Root `AGENTS.md`: update adjacent docs/tests when behavior or public
  contracts change; keep repo clean; use Graphite.
- `docs/projects/habitat-harness/invariant-corpus.md`: adapter-boundary is a
  wrapped rule with an allowlist/ratchet baseline.
- `scripts/lint/lint-adapter-boundary.sh`: map-policy generated/static Civ7
  policy provenance strings are not runtime imports or direct engine access.

## Findings

- `bun run lint:adapter-boundary` failed with one unapproved file:
  `packages/civ7-map-policy/src/river-type-metadata.source.ts`.
- The offending strings are array values under
  `CIV7_RIVER_TYPE_METADATA_SOURCE.source`, alongside a file header that says
  the file is hand-reviewed input for generated Civ7 browser tables.
- Existing allowlisted map-policy files contain the same source-path class,
  including `civ7-tables.gen.ts`, `river-constants.ts`, and
  `resource-constants.ts`.
- `tools/habitat-harness/baselines/adapter-boundary.json` currently contains
  the same file as a Habitat baseline entry. This slice intentionally does not
  edit that baseline; it becomes prunable through the later shrink-only ratchet
  flow after the legacy lint gate is green.

## Implementation Plan

1. Add `packages/civ7-map-policy/src/river-type-metadata.source.ts` to the
   existing map-policy provenance allowlist in
   `scripts/lint/lint-adapter-boundary.sh`.
2. Validate adapter-boundary, OpenSpec, and diff whitespace.
3. Commit as a narrow Graphite slice.

## Verification

- PASS: `bun run lint:adapter-boundary`
  - Result: `Adapter boundary check passed.`
  - Output now lists 7 allowlisted files, including
    `packages/civ7-map-policy/src/river-type-metadata.source.ts`.
- PASS: `bun run openspec -- validate
  adapter-boundary-river-metadata-provenance --strict`
  - Result: `Change 'adapter-boundary-river-metadata-provenance' is valid`.
- PASS: `git diff --check`

## Downstream Realignment

- Habitat baseline shrink: no patch in this slice. The baseline entry in
  `tools/habitat-harness/baselines/adapter-boundary.json` should be removed by
  the later ratchet/prune mechanism once that slice evaluates current
  findings.
- Taxonomy: no change. `kind:adapter` remains the only owner of runtime
  `/base-standard/` imports; map-policy provenance strings remain file-level
  exceptions.
