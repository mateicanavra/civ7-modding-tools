## Why

`grit-domain-root-catalogs` is an enforced Grit check for retiring legacy
domain-root `tags.ts` and `artifacts.ts` catalogs. Catalog ownership belongs to
owned public surfaces rather than domain-root catalog files.

This checkpoint closes the row-owned active-check proof for the current DRC
predicate: native fixture proof, parser inventory over the current Swooper
domain root, Habitat wrapper/current-tree selector proof, explicit empty
baseline ownership, row-specific injected violation/path-control proof, and
record truth.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/domain_root_catalogs.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-domain-root-catalogs`.
- Expand the native fixture for current-predicate behavior:
  - domain-root `tags.ts` and `artifacts.ts` positives;
  - controls for domain index/config files, nested domain surfaces, recipe-stage
    artifact/tag files, generated-output-shaped paths, tests, packages, maps,
    `.tsx`, and other-mod paths.
- Record a parser inventory over current Swooper domain source with exact scan
  roots, exclusions, counts, row id, and proof-class labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's active-check checkpoint after evidence is gathered.

## What Does Not Change

- No Swooper domain source is changed.
- No pattern predicate repair is claimed.
- No broader domain-root facade coverage is claimed.
- No raw Grit acquisition, Effect adapter, apply safety, retired parity,
  generator/migration, neighboring row, broader facade closure, or product
  proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-domain-root-catalogs`.

This workstream does not own Swooper domain source remediation, structural
catalog migration, Habitat wrapper/adapter implementation, or broader
domain-root facade policy. Baseline ownership is limited to the explicit empty
Habitat baseline for this registered check.

## Requires

- Supervisor acceptance before treating this row as accepted closure.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate domain-root catalog files.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate domain-root catalogs and no
  owner accepts remediation, migration, or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply,
  generator/migration, neighboring row, broader facade, or product proof from
  native fixture/parser inventory, wrapper scans, baseline checks, or injected
  proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_root_catalogs --json`
- Parser inventory over `mods/mod-swooper-maps/src/domain`
- `bun run habitat:check -- --json --rule grit-domain-root-catalogs`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-domain-root-catalogs --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
