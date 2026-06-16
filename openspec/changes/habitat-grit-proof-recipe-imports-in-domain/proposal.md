## Why

`grit-recipe-imports-in-domain` locks the domain-to-recipe direction boundary:
domain source defines reusable public surfaces, while recipes compose those
surfaces. Domain code importing recipe modules would invert that ownership and
make recipe topology a domain dependency.

This checkpoint owns the row-specific Grit pattern, native fixture proof,
current parser inventory, explicit empty baseline, injected-probe metadata, and
record truth for `habitat-grit-proof-recipe-imports-in-domain`.

## Target Authority Refs

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Add `.grit/patterns/habitat/checks/recipe_imports_in_domain.md`.
- Repair the predicate/fixture boundary so dynamic imports from recipe modules
  in domain `.ts` source are recurrence violations, with source-string and
  lookalike controls preserved.
- Register `grit-recipe-imports-in-domain` as an enforced Grit check scoped to
  `mods/mod-swooper-maps/src/domain/**/*.ts`.
- Add explicit empty baseline
  `tools/habitat-harness/baselines/grit-recipe-imports-in-domain.json`.
- Add injected-probe metadata for the active check.
- Record deterministic parser inventory over Swooper domain source.
- Update aggregate corpus, proof matrix, and command proof records for this
  row.

## What Does Not Change

- No domain or recipe source is changed.
- No source remediation or apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No classify/generator behavior, broader domain-refactor closure, or
  product/runtime proof is claimed.

## Owner Boundary

This workstream owns row-specific Grit check proof for
`grit-recipe-imports-in-domain`.

This workstream does not own recipe/domain architecture migration, source
remediation, classify/generator behavior, safe writes, or product runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_imports_in_domain --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `bun run habitat:check -- --json --rule grit-recipe-imports-in-domain`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-recipe-imports-in-domain --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
