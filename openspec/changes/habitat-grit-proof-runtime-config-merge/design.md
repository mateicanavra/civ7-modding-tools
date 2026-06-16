# Design - Runtime Config Merge Active Check

## Frame

### Objective

Make `grit-runtime-config-merge` an active, truthful Habitat Grit check after
source remediation removes the five live current-predicate candidates that
blocked the earlier candidate checkpoint.

### Product Movement

Runtime handlers should not hide config defaulting through local object
fallbacks. Plan compilation and compiler-owned policy helpers produce canonical
config; runtime step/op code consumes it.

### Selection

- Rule id: `grit-runtime-config-merge`
- Grit pattern: `runtime_config_merge`
- Owner layer: active `grit-check`
- Scan roots: Swooper recipe and domain source
- Current predicate:
  - `mods/mod-swooper-maps/src/recipes/**/stages/**/steps/**/*.ts`
  - `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Syntax classes:
  - `?? {}` nullish object fallback
  - `Value.Default(...)`

### Hard Core

1. Runtime config resolution/defaulting is not runtime-handler work.
2. Source remediation must remove the existing live candidates before active
   rule registration.
3. Native fixtures prove predicate/parser-edge behavior only.
4. Current-source parser inventory proves the remediated zero-candidate state
   only inside the current predicate.
5. Habitat wrapper, baseline, and injected proofs are separate proof classes.
6. The retired full-profile guard scans broader stage roots; those broader
   stage-root matches are contextual evidence, not exact runtime-handler
   closure.

### Exterior

- Raw direct Grit acquisition.
- Apply/codemod behavior.
- HR classify/generator behavior.
- Retired full-profile parity.
- Broader runtime-purity closure.
- Product/runtime behavior.

### Falsifier

This checkpoint fails if any original live current-predicate candidate remains,
if the rule reports outside its runtime step/domain-op predicate without an
explicit fixture/parser-edge disposition, or if row records conflate native
fixtures, parser inventory, wrapper proof, baseline proof, injected proof, raw
acquisition, apply safety, or product/runtime behavior.

## Source Synthesis

`taxonomy.md` names config merges (`?? {}`, `Value.Default(`) in the
runtime-purity family for steps and strategies.

The retired full-profile guard checks domain ops roots and configured standard
recipe stage roots for `?? {}` and `Value.Default(`. Its stage-root scan is
broader than the runtime-handler architecture boundary.

The recipe-compile fundamentals state that runtime handlers (`step.run`,
`strategy.run`) must not default, clean, or normalize configs. The config
normalization ADR records op-local `Value.Default(...)` and step-local
op-config construction/defaulting as migration smells that require consistent
compile-time ownership.

## Source Remediation

The earlier parser inventory found five live `?? {}` current-predicate
candidates:

- two mountain-family comparison call sites in
  `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts`;
- two natural-wonder policy helper call sites in
  `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts`;
- one natural-wonder materialization policy call site in
  `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-natural-wonders/materialize.ts`.

The remediation keeps default ownership out of runtime call sites:

- `packages/civ7-map-policy/src/natural-wonder-footprints.ts` now accepts an
  absent natural-wonder placement policy as the default anchor policy.
- Swooper placement runtime code passes the optional policy through instead of
  injecting `?? {}` at runtime call sites.
- the root mountain-family comparison path treats absent `ridges.config` or
  `foothills.config` as `{}` without changing recursive serializer behavior for
  nested `undefined` values.

Focused package and Swooper tests cover the moved behavior.

## Native Predicate Evidence

The active native predicate is:

```grit
or {
  `$value ?? {}` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops)/.*\.ts$"
  },
  `Value.Default($args)` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops)/.*\.ts$"
  }
}
```

Native Grit fixture proof passes with 4 positive matches and 0 ignore-sample
matches. Positive classes cover recipe step `?? {}`, domain op `?? {}`, domain
strategy `?? {}`, and `Value.Default(...)`. Controls cover stage config paths,
`.tsx`, other mods, non-empty object fallbacks, `|| {}`, qualified
`defaults.Value.Default(...)`, and source strings.

## Parser Inventory Contract

`RCM-RUNTIME-INVENTORY-2026-06-15` scans
`mods/mod-swooper-maps/src/recipes` and `mods/mod-swooper-maps/src/domain`,
excludes `node_modules`, `dist`, and `mod`, and parses `.ts`, `.tsx`, and
`.json` files with the TypeScript compiler API.

It records both:

- current-predicate runtime matches after source remediation; and
- broader retired stage-root context so future agents do not confuse
  compile-time stage shaping with exact runtime-handler closure.

The current post-remediation inventory records zero current-predicate
`?? {}`/`Value.Default(...)` candidates.

## Proof Contract

This checkpoint may record:

- source remediation for the five previous live candidates;
- native fixture behavior;
- parser inventory and live zero-candidate evidence;
- Habitat wrapper/current-tree selector proof;
- explicit empty baseline inventory and baseline-integrity proof;
- injected violation/path-control proof after clean-head execution;
- row packet and aggregate proof/corpus/command alignment.

This checkpoint must not record:

- raw direct Grit acquisition;
- broad retired stage-root parity;
- broad runtime-purity closure;
- apply safety;
- classify/generator behavior;
- product/runtime proof.

## Reopen Trigger

Reopen if future current-source inventory finds a runtime step/domain-op
`?? {}` or `Value.Default(...)` candidate, if the architecture owner narrows or
changes the runtime config merge boundary, or if a future row needs broader
retired parity or apply safety proof.

## Downstream Records

The corpus ledger, proof matrix, command proof log, and injected-probe metadata
are updated for the active RCM rule. The previous draft blocker evidence is
superseded by source remediation and active-check proof; it remains useful only
as historical context for why this closure row exists.
