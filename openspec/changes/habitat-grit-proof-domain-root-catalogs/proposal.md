## Why

`grit-domain-root-catalogs` is an enforced Grit check for retiring legacy
domain-root `tags.ts` and `artifacts.ts` catalogs. Catalog ownership belongs to
owned public surfaces rather than domain-root catalog files.

This checkpoint opens the row packet before proof claims and limits the row to
the independent checkpoint class available in this stack: current-predicate
native fixture proof, parser inventory over the current Swooper domain root,
and record truth only.

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
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No Swooper domain source is changed.
- No pattern predicate repair is claimed.
- No broader domain-root facade coverage is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, generator/migration, neighboring row, or product
  proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-domain-root-catalogs`.

This workstream does not own Swooper domain source remediation, structural
catalog migration, baseline mutation, Habitat wrapper/adapter implementation,
or broader domain-root facade policy.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate domain-root catalog files.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate domain-root catalogs and no
  owner accepts remediation, migration, or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, broader facade, or
  product proof from native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_root_catalogs --json`
- Parser inventory over `mods/mod-swooper-maps/src/domain`
- `bun run openspec -- validate habitat-grit-proof-domain-root-catalogs --strict`
- `bun run openspec:validate`
- `git diff --check`
