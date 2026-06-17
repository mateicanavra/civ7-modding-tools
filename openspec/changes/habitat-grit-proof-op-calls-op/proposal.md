## Why

`grit-op-calls-op` ports the current op atomicity invariant into an active
Habitat Grit check. Domain op runtime entrypoints should not compose sibling
ops or import the domain ops barrel; cross-op orchestration belongs in steps,
stages, or public domain composition surfaces.

This checkpoint owns the row-specific Grit pattern repair, fixture proof,
current parser inventory, explicit empty baseline, injected-probe metadata, and
record truth for `habitat-grit-proof-op-calls-op`.

## Target Authority Refs

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Repair `.grit/patterns/habitat/checks/op_calls_op.md` so the enforced row
  covers import declarations, named/star re-exports, and dynamic string-literal
  imports from sibling op runtimes or the domain ops barrel.
- Register `grit-op-calls-op` as an enforced Grit check scoped to
  `mods/mod-swooper-maps/src/domain/**/ops/*/index.ts`.
- Add explicit empty baseline
  `tools/habitat-harness/baselines/grit-op-calls-op.json`.
- Update injected-probe metadata to exercise the repaired dynamic import class
  with the existing rules-path control.
- Record deterministic parser inventory over Swooper domain source.
- Update aggregate corpus, proof matrix, and command proof records for this
  row.

## What Does Not Change

- No domain source is changed.
- No source remediation or apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No side-effect parity with the retired Foundation test is claimed beyond the
  current native predicate facts recorded here.
- No broader domain-refactor closure, classify/generator behavior, or
  product/runtime proof is claimed.

## Owner Boundary

This workstream owns row-specific Grit check proof for `grit-op-calls-op`.

This workstream does not own domain source remediation, step/stage
architecture changes, classify/generator behavior, broader domain-refactor
parity, safe writes, or product runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter op_calls_op --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `bun test mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts`
- `bun run openspec -- validate habitat-grit-proof-op-calls-op --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
