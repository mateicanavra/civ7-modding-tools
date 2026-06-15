# Design - Runtime Run Validated Proof

## Frame

### Objective

Make `grit-runtime-run-validated` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat enforce runtime purity before agents modify recipe steps
or domain strategies: runtime execution avoids validation entrypoints after
compile-time normalization.

### Selection

- Rule id: `grit-runtime-run-validated`
- Grit pattern: `runtime_run_validated`
- Pattern file: `.grit/patterns/habitat/checks/runtime_run_validated.md`
- Owner layer: `grit-check`
- Registry scope: runtime recipe steps and domain strategies
- Current wrapper roots that can exercise this row:
  `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain`
- Current Grit predicate scope:
  `mods/<mod>/src/recipes/**/stages/**/steps/**/*.ts` and
  `mods/<mod>/src/domain/**/ops/**/strategies/**/*.ts`
- Forbidden current call classes: direct `runValidated(...)` and member
  `$target.runValidated(...)` calls.

### Hard Core

1. This is a check proof, not an apply proof.
2. `scope:runtime-purity` is the policy family; this row covers call syntax
   only.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Contract/config/test paths are controls unless they match the current
   runtime predicate.
5. Current parser inventory is not Habitat wrapper enforcement proof.

### Exterior

- Runtime refactoring.
- Operation validation implementation or execution semantics.
- Runtime validation import proof, owned by
  `grit-runtime-validation-imports`.
- Helper redeclaration proof, owned by
  `grit-runtime-helper-redeclarations`.
- The candidate `ops.bind` combined row.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if a live runtime `runValidated` call is found but recorded as a pass
without owner disposition, if temporary inventory artifacts are cited as
durable proof, or if neighboring runtime-purity rows are treated as proven by
this call-syntax row.

## Source Synthesis

`rules.json` registers `grit-runtime-run-validated` as an enforced
`grit-check` with runtime recipe step/domain strategy scope, message
"Runtime layers must not call runValidated.", and no remediation.

`taxonomy.md` records `scope:runtime-purity` as the row family for runtime
steps/strategies avoiding TypeBox runtime helpers, `runValidated`, helper
redeclarations, and config merges.

`invariant-corpus.md` records the retired `eslint-runtime-typebox-ban`
invariant and assigns it to `grit-check`.

`lint-domain-refactor-guardrails.sh` includes full-profile scans for
`runValidated` orchestration in domain op `index.ts` files and ecology
inner-config `runValidated` calls in stage roots. Those scans are proving
sources for lineage and parser inventory only in this checkpoint, not retired
parity closure.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Runtime recipe step direct `runValidated(...)` call | Reports |
| Runtime recipe step member `.runValidated(...)` call | Reports |
| Domain strategy member `.runValidated(...)` call | Reports |
| Runtime recipe step nested/callback direct call | Reports as a current-predicate fact |
| Runtime recipe step awaited member call | Reports as a current-predicate fact |
| Optional-chain member call | Reports as a current-predicate fact |
| Runtime recipe step `contract.ts` member call | Reports as a current-predicate fact |
| Runtime recipe step test-like filename direct call | Reports as a current-predicate fact |
| Other-mod runtime path call | Current behavior to classify as raw predicate fact |
| Helper names such as `runValidatedLater(...)` | Do not report |
| Import-only or property-reference-without-call shapes | Do not report |
| Config/test/map/package/non-runtime/`.tsx` paths | Do not report under current predicate |
| Dynamic property call such as `target["runValidated"](...)` | Does not report under current predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live zero-candidate evidence over current Swooper recipe and
  domain roots;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Current proof ids:

- `RRV-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for 9
  current-predicate positive classes and the recorded controls.
- `RRV-RUNTIME-INVENTORY-2026-06-15`: parser inventory/live zero-candidate
  evidence over the current Swooper recipe and domain roots.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- retired parity;
- neighboring runtime-purity row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's current checkpoint after evidence is gathered. Recovery ledger,
taxonomy, invariant corpus, and command docs remain unchanged because the
implementation does not change policy, diagnostics, or user-facing behavior.
