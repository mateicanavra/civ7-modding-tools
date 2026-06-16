# Design - Runtime Validation Imports Proof

## Frame

### Objective

Close `grit-runtime-validation-imports` as a row-owned active Habitat Grit
check with current native fixture, parser inventory, wrapper, baseline, injected,
and record-truth evidence.

### Product Movement

This row helps Habitat enforce runtime purity before agents modify recipe steps
or domain strategies: validation and normalization stay in compile-time
contract surfaces instead of leaking into runtime execution.

### Selection

- Rule id: `grit-runtime-validation-imports`
- Grit pattern: `runtime_validation_imports`
- Pattern file: `.grit/patterns/habitat/checks/runtime_validation_imports.md`
- Owner layer: `grit-check`
- Registry scope: runtime recipe steps and domain strategies
- Current wrapper roots that can exercise this row:
  `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain`
- Current Grit predicate scope:
  `mods/<mod>/src/recipes/**/stages/**/steps/**/*.ts` and
  `mods/<mod>/src/domain/**/ops/**/strategies/**/*.ts`
- Forbidden current source classes:
  `@sinclair/typebox/value`, `@sinclair/typebox/compiler`,
  `@swooper/mapgen-core/compiler/normalize`,
  `@swooper/mapgen-core/authoring/validation`, and
  `@swooper/mapgen-core/authoring/op/validation-surface`.

### Hard Core

1. This is a check proof, not an apply proof.
2. `scope:runtime-purity` is the policy family; this row covers import-source
   syntax only.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Contract/config/test paths are controls unless they match the current
   runtime predicate.
5. Current parser inventory, wrapper proof, baseline proof, and injected proof
   remain separate proof classes.

### Exterior

- Runtime refactoring.
- Compiler helper or validation helper implementation.
- `runValidated` call proof, which belongs to `grit-runtime-run-validated`.
- Helper redeclaration proof, which belongs to
  `grit-runtime-helper-redeclarations`.
- Baseline mutation beyond the explicit empty row baseline.
- Raw direct Grit acquisition or Effect adapter closure.
- Apply/codemod behavior.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures alone, if a live runtime forbidden import is found but recorded as a
pass without owner disposition, if temporary inventory artifacts are cited as
durable proof, if injected proof is conflated with aggregate injected-corpus
closure, or if neighboring runtime-purity rows are treated as proven by this
import-source row.

## Source Synthesis

`rules.json` registers `grit-runtime-validation-imports` as an enforced
`grit-check` with runtime recipe step/domain strategy scope, message
"Runtime layers must not import TypeBox runtime validation or compiler
normalization helpers.", and no remediation.

`taxonomy.md` records `scope:runtime-purity` as the row family for runtime
steps/strategies avoiding TypeBox runtime helpers, `runValidated`, helper
redeclarations, and config merges.

`invariant-corpus.md` records the retired `eslint-runtime-typebox-ban`
invariant and assigns it to `grit-check`.

`lint-domain-refactor-guardrails.sh` includes the full-profile source for
runtime typebox/value import scanning.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Runtime recipe step imports `@sinclair/typebox/value` | Reports |
| Runtime recipe step imports `@sinclair/typebox/compiler` | Reports |
| Runtime recipe step imports mapgen compiler normalize helper | Reports |
| Runtime recipe step imports authoring validation helper | Reports |
| Runtime recipe step imports validation-surface helper | Reports |
| Domain strategy imports forbidden validation source | Reports |
| Runtime recipe step `contract.ts` imports forbidden validation source | Reports as a current-predicate fact |
| Other-mod runtime path imports forbidden validation source | Reports as a raw current-predicate fact |
| Type-only import from forbidden source | Reports as a current-predicate fact |
| Side-effect import from forbidden source | Reports as a current-predicate fact |
| Config/test/domain op non-strategy/map/package/`.tsx` paths | Do not report under current predicate |
| Dynamic import or re-export from forbidden source | Does not report under current predicate |
| Allowed runtime import from mapgen core | Does not report |

## Proof Contract

This row closure may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live zero-candidate evidence over current Swooper recipe and
  domain roots;
- per-rule Habitat wrapper selector/current-tree proof;
- aggregate `grit-check` wrapper proof;
- explicit empty baseline ownership with `baseline-integrity`;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Current proof ids:

- `RVI-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for 10
  current-predicate positive classes and the recorded controls.
- `RVI-RUNTIME-INVENTORY-2026-06-15`: parser inventory/live zero-candidate
  evidence over the current Swooper recipe and domain roots.
- `RVI-NATIVE-FIXTURES-2026-06-16`: refreshed native fixture proof at the
  closure checkpoint.
- `RVI-NATIVE-CORPUS-REFRESH-2026-06-16`: full native pattern corpus proof with
  RVI included.
- `RVI-RUNTIME-INVENTORY-2026-06-16`: refreshed parser inventory/live
  zero-candidate evidence over current Swooper recipe and domain roots.
- `RVI-PER-RULE-SELECTOR-2026-06-16`: per-rule Habitat wrapper selector and
  current-tree proof.
- `RVI-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof with
  RVI included.
- `RVI-BASELINE-FILES-2026-06-16`: explicit empty baseline ownership.
- `RVI-INJECTED-PROBE-2026-06-16`: row-specific injected violation and
  path-control proof.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- apply safety;
- neighboring runtime-purity row closure;
- retired parity closure;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated for
this row's active-check closure evidence. Recovery ledger, taxonomy, invariant
corpus, and command docs remain unchanged because this checkpoint does not
change policy, diagnostics, source behavior, or user-facing command behavior.
