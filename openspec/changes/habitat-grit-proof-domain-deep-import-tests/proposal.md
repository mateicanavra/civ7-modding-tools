## Why

`grit-domain-deep-import-tests` locks the test-side half of the domain public
surface rule. Mod and package tests should use `@mapgen/domain/<domain>`,
`/ops`, or `/config.js` instead of deep domain internals unless a future
architecture decision explicitly owns an exception.

This checkpoint owns the row-specific Grit pattern, native fixture proof,
current parser inventory, source import remediation for live test deep imports,
explicit empty baseline, injected-probe metadata, and record truth for
`habitat-grit-proof-domain-deep-import-tests`.

## Target Authority Refs

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/03-authoring-patterns.md`
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/06-enforcement.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `openspec/changes/habitat-grit-proof-domain-deep-import/design.md`
- GritQL pattern documentation and examples: structural import/export snippets,
  `$filename`, `where`, regex predicates, negative conditions, and Markdown
  fixture blocks.

## What Changes

- Add `.grit/patterns/habitat/checks/domain_deep_import_tests.md`.
- Register `grit-domain-deep-import-tests` metadata for mod and package test
  files.
- Add explicit empty baseline
  `tools/habitat-harness/baselines/grit-domain-deep-import-tests.json`.
- Add injected-probe metadata for the intended DDIT probe surface.
- Expose narrow narrative story helpers through the narrative domain root and
  update current tests to use public domain surfaces.
- Record deterministic parser inventory over mod and package test roots.
- Update aggregate corpus, proof matrix, and command proof records for this
  row.

## What Does Not Change

- No generated output is edited.
- No apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No Habitat wrapper/current-tree or injected cleanup closure is claimed until a
  narrow adapter scan-root/ignore activation repair can project the owned test
  roots and injected mirrors.
- No dynamic import closure, source-string closure, package-export-map closure,
  classify/generator behavior, broader domain-refactor closure, or
  product/runtime proof is claimed.

## Owner Boundary

This workstream owns row-specific Grit check proof for
`grit-domain-deep-import-tests` and the minimal public-surface source repairs
needed to make the current source tree compatible with an explicit empty
baseline once wrapper scan activation is repaired.

This workstream does not own broad narrative/gameplay domain redesign, package
publish surface changes, generator behavior, shared Grit scan policy, safe
writes, or product runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_deep_import_tests --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/test` and `packages/*/test`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-domain-deep-import-tests`
- `bun run habitat:check -- --json --tool grit-check`
- Narrow adapter scan-root/ignore activation proof for mod/package test roots
  and injected mirrors
- Deterministic baseline inventory over Grit rules and baselines
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- Source remediation type/build or targeted check proof
- `bun run openspec -- validate habitat-grit-proof-domain-deep-import-tests --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
