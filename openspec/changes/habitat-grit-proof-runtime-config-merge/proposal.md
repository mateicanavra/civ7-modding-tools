## Why

Runtime handlers should consume already-canonical config. The runtime-purity
family names `?? {}` and `Value.Default(` as config-merge/defaulting shapes
that do not belong in runtime steps or domain-op runtime paths.

This checkpoint closes the previous `runtime_config_merge` blocker by moving
the five live empty-object fallback candidates to their owning compile/policy
boundaries, then registering `grit-runtime-config-merge` as an active Habitat
Grit rule with native fixture, parser inventory, wrapper, baseline, and
injected-probe proof kept as separate proof classes.

## Target Authority Refs

- `docs/projects/habitat-harness/taxonomy.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`

## What Changes

- Add the active `.grit` pattern for `runtime_config_merge`.
- Register `grit-runtime-config-merge` in Habitat `rules.json`.
- Add an explicit empty baseline for the registered Grit rule.
- Add an injected probe for a runtime-step `?? {}` finding and stage-root
  control path.
- Move the five live source candidates out of runtime call sites:
  map-policy helpers now accept absent natural-wonder placement policy as the
  default policy, and mountain-family comparison treats absent config as empty
  inside the comparison helper.
- Update the RCM packet, corpus ledger, proof matrix, command proof log, and
  injected-probe metadata with the active-check proof boundary.

## What Does Not Change

- No raw direct Grit acquisition is claimed.
- No broad retired stage-root parity or full runtime-purity closure is claimed.
- No apply/codemod safety, classify/generator behavior, or product/runtime
  proof is claimed.
- No generated output is edited by hand.
- `Value.Default(...)` remains a predicate class with no live current-source
  candidates in this checkpoint.

## Owner Boundary

This workstream owns the HG Grit row for `grit-runtime-config-merge`: source
remediation for the five live candidates, native fixtures, current-source
parser inventory, Habitat wrapper selector proof, explicit empty baseline
ownership, injected probe registration, and row/aggregate record truth.

This workstream does not own broad runtime behavior proof, retired guard parity,
generic apply safety, raw Grit acquisition, HR classify/generator behavior, or
future source remediation outside the current candidate set.

## Requires

- Source-remediation proof for the five live current-predicate candidates.
- Native Grit fixture and corpus proof for the active pattern.
- Current-source parser inventory showing zero live current-predicate
  candidates after remediation.
- Habitat per-rule and aggregate wrapper proof.
- Explicit empty baseline proof.
- Clean-start injected probe proof before full row acceptance.
- Supervisor review before treating this active check checkpoint as accepted.

## Stop Conditions

- Do not claim broad product/runtime behavior from structural source checks.
- Do not treat broader retired stage-root scan context as exact
  runtime-handler closure.
- Do not claim raw direct Grit acquisition, apply safety, classify/generator
  behavior, or retired parity from the active check proof.
- Do not proceed to another HG row until the clean committed RCM checkpoint is
  available for supervisor review.

## Verification Gates

- Focused map-policy and Swooper runtime tests for the source remediation
- Native Grit proof for `runtime_config_merge`
- Full native Grit corpus refresh
- Deterministic TypeScript parser inventory over Swooper recipe/domain roots
- Habitat per-rule proof for `grit-runtime-config-merge`
- Habitat aggregate Grit proof
- Explicit Grit baseline inventory
- Clean-start injected probe proof
- `bun run openspec -- validate habitat-grit-proof-runtime-config-merge --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
