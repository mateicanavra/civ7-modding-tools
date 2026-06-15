# Design - Runtime Helper Redeclarations Proof

## Frame

### Objective

Make `grit-runtime-helper-redeclarations` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat enforce runtime purity before agents modify recipe steps
or domain strategies: runtime code should use shared deterministic helpers from
`@swooper/mapgen-core` instead of redefining local clamp/range/roll logic.

### Selection

- Rule id: `grit-runtime-helper-redeclarations`
- Grit pattern: `runtime_helper_redeclarations`
- Pattern file:
  `.grit/patterns/habitat/checks/runtime_helper_redeclarations.md`
- Owner layer: `grit-check`
- Registry scope: runtime recipe steps and domain strategies
- Current wrapper roots that can exercise this row:
  `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain`
- Current Grit predicate scope:
  `mods/<mod>/src/recipes/**/stages/**/steps/**/*.ts` and
  `mods/<mod>/src/domain/**/ops/**/strategies/**/*.ts`
- Forbidden current declaration classes: exact `const`, `let`, `var`, and
  function declarations for `clamp01`, `clampChance`, `normalizeRange`, and
  `rollPercent`.

### Hard Core

1. This is a check proof, not an apply proof.
2. `scope:runtime-purity` is the policy family; this row covers exact helper
   redeclaration syntax only.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Helper imports and helper calls are controls unless the current predicate
   reports a redeclaration.
5. Current parser inventory is not Habitat wrapper enforcement proof.

### Exterior

- Runtime helper migration or source refactoring.
- Exact-helper apply/codemod behavior, owned by the separate apply candidate.
- Runtime validation imports, owned by `grit-runtime-validation-imports`.
- Runtime `runValidated` calls, owned by `grit-runtime-run-validated`.
- Config merge/runtime-purity neighboring rows.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if a live runtime helper redeclaration is found but recorded as a
pass without owner disposition, if temporary inventory artifacts are cited as
durable proof, or if neighboring runtime-purity rows are treated as proven by
this helper-redeclaration row.

## Source Synthesis

`rules.json` registers `grit-runtime-helper-redeclarations` as an enforced
`grit-check` with runtime recipe step/domain strategy scope, message "Use
shared helpers from @swooper/mapgen-core instead of redeclaring them.", and no
remediation.

`taxonomy.md` records `scope:runtime-purity` as the row family for runtime
steps/strategies avoiding TypeBox runtime helpers, `runValidated`, helper
redeclarations, and config merges.

`invariant-corpus.md` records the retired `eslint-redefined-helpers` invariant
and assigns it to `grit-check`.

`lint-domain-refactor-guardrails.sh` includes full-profile scans for duplicate
math helper redefinitions, including `clamp01`, in runtime-relevant helper
contexts. Those scans are proving sources for lineage and parser inventory only
in this checkpoint, not retired parity closure.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Runtime recipe step `function clamp01(...)` | Reports |
| Runtime recipe step `const clampChance = ...` | Reports |
| Runtime recipe step `let normalizeRange = ...` | Reports |
| Runtime recipe step `var rollPercent = ...` | Reports |
| Domain strategy exact helper redeclaration | Reports |
| Runtime recipe step `contract.ts` exact helper redeclaration | Reports as a current-predicate fact |
| Function-expression and arrow-function initializers for exact helper names | Report as current-predicate facts |
| Other-mod runtime path redeclaration | Current behavior to classify as raw predicate fact |
| Imports/calls of canonical helpers without redeclaration | Do not report |
| Lookalike helper names such as `clamp010` or `rollPercentage` | Do not report |
| Property, method, class method, and destructuring shapes | Do not report under current predicate unless native proof shows otherwise |
| Config/test/map/package/non-runtime/`.tsx` paths | Do not report under current predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live zero-candidate evidence over current Swooper recipe and
  domain roots;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Planned proof ids:

- `RHR-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `RHR-RUNTIME-INVENTORY-2026-06-15`: parser inventory/live candidate
  evidence over the current Swooper recipe and domain roots. This evidence is
  not a clean enforcement closure because it found live current-predicate
  helper redeclarations.

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
