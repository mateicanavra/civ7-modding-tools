# Design - Runtime Helper Redeclarations Proof

## Frame

### Objective

Close `grit-runtime-helper-redeclarations` as a row-owned active Habitat check
after the accepted AHR source-owner remediation removed the former live helper
redeclarations.

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
   acquisition, injected proof, baseline behavior, apply/source remediation,
   and product proof are separate proof classes.
4. Helper imports and helper calls are controls unless the current predicate
   reports a redeclaration.
5. Current parser inventory is not Habitat wrapper enforcement proof, and AHR
   source remediation is not generic Habitat apply safety.

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
fixtures, if a live runtime helper redeclaration remains after AHR remediation,
if temporary inventory artifacts are cited as durable proof, if AHR's bounded
source remediation is broadened into generic apply safety, or if neighboring
runtime-purity rows are treated as proven by this helper-redeclaration row.

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

This row checkpoint records:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory zero-candidate evidence over current Swooper recipe and
  domain roots after AHR remediation;
- Habitat per-rule and aggregate `grit-check` wrapper/current-tree proof;
- explicit empty baseline and `baseline-integrity` proof;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Planned proof ids:

- `RHR-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `RHR-RUNTIME-INVENTORY-2026-06-15`: historical parser inventory/live
  candidate evidence over the current Swooper recipe and domain roots.
- `RHR-CLOSURE-INVENTORY-2026-06-16`: current parser inventory proving zero
  helper redeclaration candidates after AHR remediation.
- `RHR-NATIVE-CORPUS-REFRESH-2026-06-16`: full native Grit corpus health with
  RHR included.
- `RHR-PER-RULE-SELECTOR-2026-06-16`: per-rule Habitat wrapper/current-tree
  proof.
- `RHR-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof.
- `RHR-BASELINE-FILES-2026-06-16`: explicit empty baseline and
  `baseline-integrity` proof.
- `RHR-INJECTED-PROBE-2026-06-16`: row-specific injected violation/path-control
  proof.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- source remediation or generic apply safety;
- retired parity;
- neighboring runtime-purity row proof;
- aggregate injected-corpus closure while DDIT remains blocked;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this active-check closure checkpoint. Recovery ledger, taxonomy, invariant
corpus, and command docs remain unchanged because the implementation does not
change policy, diagnostics, or user-facing behavior.
