## Why

`grit-adapter-base-standard-import` is an enforced Grit check for keeping
runtime `/base-standard/` imports inside `@civ7/adapter`. The adapter package
is the sole owner of Civ7 engine globals and base-standard APIs; other packages
must consume adapter abstractions or policy data rather than importing runtime
engine modules directly.

This checkpoint opens the row packet before fixture or proof claims and limits
the row to the independent checkpoint class available in this stack:
current-predicate native fixture proof, parser inventory over package source,
and record truth only.

## Target Authority Refs

- `packages/civ7-adapter/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `scripts/lint/lint-adapter-boundary.sh`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/adapter_base_standard_import.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-adapter-base-standard-import`.
- Expand the native fixture for current-predicate behavior:
  - direct value import positives;
  - direct side-effect import positives;
  - current-predicate type-only and `.d.ts` import facts if the native pattern
    reports them;
  - controls for adapter-owned imports, non-package paths, `.tsx`, source
    lookalikes, string lookalikes, export-from, and dynamic import shapes.
- Record a parser inventory over current `packages` source with exact scan
  roots, exclusions, counts, row id, proof-class labels, direct import counts,
  adapter-owned import counts, and string-lookalike counts in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No package source is changed.
- No pattern predicate repair is claimed.
- No source remediation, baseline, or apply behavior is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, wrapped-script parity, broader adapter policy closure,
  neighboring row, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-adapter-base-standard-import`.

This workstream does not own package source remediation, adapter API migration,
baseline mutation, legacy wrapped-script allowlist migration, Habitat
wrapper/adapter implementation, or product/runtime proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live direct
  `/base-standard/` import candidates outside `packages/civ7-adapter`.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate direct `/base-standard/`
  import candidates and no owner accepts remediation, migration, or baseline
  disposition.
- Closure would rely on stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity,
  wrapped-script parity, broader adapter policy, or product proof from native
  fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter adapter_base_standard_import --json`
- Parser inventory over `packages`
- `bun run openspec -- validate habitat-grit-proof-adapter-base-standard-import --strict`
- `bun run openspec:validate`
- `git diff --check`
