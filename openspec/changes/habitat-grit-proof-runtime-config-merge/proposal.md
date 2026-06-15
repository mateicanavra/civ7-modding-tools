## Why

Runtime handlers should consume already-canonical config. The runtime-purity
family names `?? {}` and `Value.Default(` as config-merge/defaulting shapes
that do not belong in runtime steps or domain-op runtime paths.

This checkpoint records the candidate state for
`habitat-grit-runtime-config-merge`: a draft native predicate can detect the
intended syntax in the intended runtime subset, but current source still has
five live `?? {}` candidates. The candidate is therefore not registered as an
active Habitat rule in this checkpoint.

## Target Authority Refs

- `docs/projects/habitat-harness/taxonomy.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`

## What Changes

- Add a per-candidate OpenSpec packet for
  `habitat-grit-proof-runtime-config-merge`.
- Record draft native predicate evidence for `?? {}` and `Value.Default(...)`
  in runtime step and domain-op paths.
- Record deterministic parser inventory over Swooper recipe/domain roots with
  five live current-predicate candidates.
- Update the corpus ledger and command proof log with the blocker disposition.

## What Does Not Change

- No `.grit` pattern is registered for this candidate.
- No `rules.json` entry, baseline file, or injected probe is added.
- No runtime/domain source is changed.
- No Habitat wrapper/current-tree proof, raw Grit acquisition, baseline,
  injected cleanup/path-control, source remediation, apply safety,
  classify/generator behavior, retired parity, broader runtime-purity closure,
  or product/runtime proof is claimed.

## Owner Boundary

This workstream owns row-candidate record truth for
`habitat-grit-runtime-config-merge`.

This workstream does not own source remediation for the five live runtime
config merge candidates, a baseline-debt decision, or HR classify/generator
behavior.

## Requires

- Supervisor/source-owner disposition for the five live current-predicate
  candidates before active rule registration.
- A separate baseline decision if the row is registered before remediation.
- Supervisor review before treating this blocker checkpoint as accepted.

## Stop Conditions

- Do not add an active rule, baseline, or injected probe for this candidate
  while live candidates lack source-owner/baseline disposition.
- Do not treat the broader retired stage-root scan as exact runtime-handler
  closure.
- Do not claim wrapper, baseline, injected, apply, or product proof from draft
  native fixtures or parser inventory.

## Verification Gates

- Draft native predicate proof for `runtime_config_merge`
- Deterministic TypeScript parser inventory over Swooper recipe/domain roots
- `bun run openspec -- validate habitat-grit-proof-runtime-config-merge --strict`
- `bun run openspec:validate`
- `git diff --check`
