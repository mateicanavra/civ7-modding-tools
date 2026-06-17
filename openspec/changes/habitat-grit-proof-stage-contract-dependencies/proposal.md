## Why

`grit-stage-contract-dependencies` locks a narrow stage-contract dependency
surface: standard recipe step contracts should use typed dependency tag
constants in top-level `requires` and `provides`, not string literal dependency
keys. Literal dependency strings drift from the owning tag surfaces and hide
contract typos from TypeScript.

This checkpoint owns the row-specific Grit pattern, native fixture proof,
current parser inventory, explicit empty baseline, injected-probe metadata, and
record truth for `habitat-grit-proof-stage-contract-dependencies`.

## Target Authority Refs

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `packages/mapgen-core/src/authoring/step/contract.ts`
- `mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Add `.grit/patterns/habitat/checks/stage_contract_dependencies.md`.
- Register `grit-stage-contract-dependencies` as an enforced Grit check scoped
  to standard recipe stage contract files.
- Add explicit empty baseline
  `tools/habitat-harness/baselines/grit-stage-contract-dependencies.json`.
- Add injected-probe metadata for the active check.
- Record deterministic parser inventory over standard recipe stage contracts.
- Update aggregate corpus, proof matrix, and command proof records for this
  row.

## What Does Not Change

- No stage, recipe, domain, or generated source is changed.
- No source remediation or apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No artifact dependency enforcement, generated artifact parity, semantic DAG
  validation, dynamic source class, classify/generator behavior, broader recipe
  architecture closure, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns row-specific Grit check proof for
`grit-stage-contract-dependencies`.

This workstream does not own artifact dependency enforcement, generated artifact
regeneration, stage DAG semantics, source remediation, classify/generator
behavior, safe writes, or product runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter stage_contract_dependencies --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-stage-contract-dependencies`
- `bun run habitat:check -- --json --tool grit-check`
- Deterministic baseline inventory over Grit rules and baselines
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-stage-contract-dependencies --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
