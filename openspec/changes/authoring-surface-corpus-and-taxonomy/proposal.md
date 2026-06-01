# Proposal: Standard Recipe Authoring Surface Corpus And Taxonomy

## Summary

Establish the diagnostic foundation for the standard recipe authoring-surface
cleanup train before editing stage behavior. This slice adds a repeatable
ledger generator, project docs, issue taxonomy, slice gates, and proof records
for all standard recipe stage schemas and consumers.

This slice is intentionally behavior-neutral. It does not rename fields, migrate
configs, regenerate map outputs, or change compile output.

## Authority

- Current user objective for a systematic standard recipe authoring-surface
  cleanup workstream.
- `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-STANDARD-RECIPE-AUTHORING-SURFACE.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
  Target Shape and D1 flat config surface.
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `openspec/changes/mapgen-public-config-boundary/`
- `openspec/changes/morphology-public-config-surface/`
- `openspec/changes/studio-public-config-contract/`

## Requires

- Current standard recipe source and generator scripts.
- Existing public config boundary proof in MapGen core.
- Existing Morphology public surface proof as the known-good example.
- Narsil/code-intelligence evidence for hotspots and references, excluding
  unstable hybrid search.

## Enables

- `foundation-authoring-surface-alignment`
- `morphology-authoring-surface-alignment`
- `hydrology-authoring-surface-alignment`
- `ecology-authoring-surface-alignment`
- `projection-authoring-surface-audit`
- `placement-authoring-surface-alignment`
- Per-slice shipped config/preset/generated artifact migration and Studio proof
  for every behavior-changing cleanup branch.
- `studio-sdk-guard-hardening`

## Affected Owners

- `mods/mod-swooper-maps/scripts/`
- `docs/projects/standard-recipe-authoring-surface/`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`

## Forbidden Owners

- Standard stage behavior and compile code.
- Shipped map configs and presets.
- Generated map artifacts.
- Studio runtime code.
- SDK runtime code.

## Write Set

- Add a standard-recipe authoring surface ledger generator.
- Add project docs for corpus, taxonomy, slices, and proof records.
- Add this OpenSpec change.

## Consumer Impact

None in runtime behavior. The only consumer impact is a new diagnostic command
for authors/reviewers:

```sh
cd mods/mod-swooper-maps
bun run scripts/report-standard-authoring-surface.ts --format=summary
```

## Stop Conditions

- The ledger cannot enumerate all standard stages from live `STANDARD_STAGES`.
- The ledger cannot distinguish public, knobs, internal-as-public, and raw
  envelope rows.
- OpenSpec validation fails.
- Peer review finds a P1/P2 taxonomy gap that would misdirect the next slice.

## Verification Gates

- Run the ledger generator in summary mode.
- Run OpenSpec validation for this change.
- Run `git diff --check`.
- Run framed peer-agent review over taxonomy, ledger, and OpenSpec records.
