# Design - Adapter Base Standard Import Proof

## Frame

### Objective

Make `grit-adapter-base-standard-import` truthful as a row-owned Habitat active
check closure for the current Grit predicate.

### Product Movement

This row helps Habitat keep Civ7 runtime module imports behind the adapter
owner layer. Other packages must not take a direct dependency on
`/base-standard/` runtime modules.

### Selection

- Rule id: `grit-adapter-base-standard-import`
- Grit pattern: `adapter_base_standard_import`
- Pattern file:
  `.grit/patterns/habitat/checks/adapter_base_standard_import.md`
- Owner layer: `grit-check`
- Registry scope: `packages/**/*.ts` outside `packages/civ7-adapter`
- Current Grit predicate scope: filename regex `.*packages/.*\.ts$`, excluding
  paths containing `packages/civ7-adapter/`
- Forbidden current syntax class: import declarations whose source matches
  `.*/base-standard/.+`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers import declarations in package `.ts` files
   outside `packages/civ7-adapter`.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, wrapped-script parity, and
   product proof are separate proof classes.
4. Adapter-owned `/base-standard/` imports are allowed controls for this row.
5. Broad provenance strings and test harness module strings are legacy
   wrapped-rule/baseline context, not current-row runtime import candidates.
6. Current parser inventory is not Habitat wrapper enforcement proof or
   product/runtime proof.

### Exterior

- Package source remediation.
- Predicate repair for import forms outside the current native predicate.
- Legacy wrapped-script allowlist migration.
- Baseline mutation beyond the explicit empty row baseline.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures alone, if live current-predicate `/base-standard/` import candidates
are found but recorded as a clean pass without owner disposition, if broad
provenance strings are mislabeled as current-row imports, or if product/runtime
proof is treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-adapter-base-standard-import` as an enforced
`grit-check`, scoped to `packages/**/*.ts` outside `packages/civ7-adapter`, and
forbids runtime `/base-standard/` imports outside `@civ7/adapter`.

`packages/civ7-adapter/AGENTS.md` records that `packages/civ7-adapter/**` is the
sole boundary for importing Civ7 engine globals and `base-standard` APIs.

`taxonomy.md` records `kind:adapter` as the sole owner of Civ7 engine globals
and `/base-standard/` imports. `invariant-corpus.md` records the legacy
adapter-boundary wrapped script and says H5's Grit runtime-import rule starts
empty while the wrapped script keeps broad provenance-string scan context until
H6 disposition.

`discrepancy-log.md` records DL-9 for the adapter-boundary allowlist living only
inside the script, with H5/H6 follow-up needed.

`grit-pattern-corpus-ledger.md` requests positive non-adapter base-standard
imports, negative adapter-owned imports, current package scan, existing adapter
baseline reconciliation, and non-apply disposition.

`grit-proof-matrix.md` now records the current ABSI closure proof classes while
keeping raw acquisition, retired parity, wrapped-script parity, broader adapter
policy closure, and product/runtime proof separate.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Direct value import from `/base-standard/...` outside adapter | Reports |
| Direct side-effect import from `/base-standard/...` outside adapter | Reports |
| Type-only import from `/base-standard/...` outside adapter | Current-predicate behavior to record |
| `.d.ts` import from `/base-standard/...` outside adapter | Current-predicate behavior to record |
| Adapter-owned `/base-standard/...` import | Does not report |
| Non-package path, `.tsx`, source lookalike, string lookalike, export-from, and dynamic import | Do not report in this current native predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current package source;
- Habitat wrapper current-tree and per-rule selector proof;
- explicit empty baseline integrity proof;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `ABSI-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `ABSI-NATIVE-CORPUS-REFRESH-2026-06-16`: current native corpus health with
  ABSI included.
- `ABSI-PACKAGE-INVENTORY-2026-06-16`: parser inventory/live evidence over
  current package source.
- `ABSI-PER-RULE-SELECTOR-2026-06-16`: Habitat per-rule selector and wrapper
  proof for ABSI plus `baseline-integrity`.
- `ABSI-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof
  with ABSI included.
- `ABSI-BASELINE-FILES-2026-06-16`: explicit empty row baseline plus
  `baseline-integrity`.
- `ABSI-INJECTED-PROBE-2026-06-16`: row-specific injected finding and path
  control proof.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity or wrapped-script parity;
- broader adapter policy closure;
- neighboring row proof;
- aggregate injected-corpus closure while DDIT is blocked;
- product/runtime proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be
updated for this row's current checkpoint after evidence is gathered. Recovery
ledger, taxonomy, invariant corpus, discrepancy log, and command docs remain
unchanged unless implementation changes policy, diagnostics, or user-facing
behavior.
