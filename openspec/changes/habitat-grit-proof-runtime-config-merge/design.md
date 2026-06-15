# Design - Runtime Config Merge Candidate Disposition

## Frame

### Objective

Make `habitat-grit-runtime-config-merge` truthful as a candidate blocker
checkpoint: the runtime-purity boundary is real, a safe draft predicate exists
for the intended syntax, current source has live candidates, and no active rule
is registered without disposition.

### Product Movement

Runtime handlers should not hide config defaulting through local object
fallbacks. Plan compilation and compiler-owned normalization produce canonical
config; runtime step/op code consumes it.

### Selection

- Candidate id: `habitat-grit-runtime-config-merge`
- Proposed Grit pattern: `runtime_config_merge`
- Owner layer: candidate `grit-check`
- Intended scan roots: Swooper recipe and domain source
- Intended current predicate:
  - `mods/mod-swooper-maps/src/recipes/**/stages/**/steps/**/*.ts`
  - `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Intended syntax classes:
  - `?? {}` nullish object fallback
  - `Value.Default(...)`

### Hard Core

1. Runtime config resolution/defaulting is not runtime-handler work.
2. Draft predicate proof is not active Habitat rule registration.
3. Current-source parser inventory is not wrapper/current-tree proof.
4. Live current-predicate candidates block clean registration until source-owner
   remediation or baseline disposition exists.
5. The retired full-profile guard scans broader stage roots; those broader
   stage-root matches are contextual evidence, not exact runtime-handler
   closure.

### Exterior

- Source remediation for live candidates.
- Baseline-debt introduction.
- Apply/codemod behavior.
- HR classify/generator behavior.
- Broader runtime-purity closure.
- Product/runtime behavior.

### Falsifier

This checkpoint fails if it registers an active rule without disposition for
the five live candidates, claims stage-root compile-time config shaping as
runtime-handler proof, or treats draft fixtures/parser inventory as wrapper,
baseline, injected, apply, or product proof.

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

The recovery reference says this candidate needs architecture decision and
examples before rule design. This checkpoint uses the accepted architecture
records above to separate intended runtime-handler evidence from broader
guardrail context.

## Draft Predicate Evidence

The draft native predicate used:

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

Native Grit fixture proof passed for the draft: 4 positive matches and 0
ignore-sample matches. Positive classes covered recipe step `?? {}`, domain op
`?? {}`, domain strategy `?? {}`, and `Value.Default(...)`. Controls covered
stage config paths, `.tsx`, other mods, non-empty object fallbacks, `|| {}`,
qualified `defaults.Value.Default(...)`, and source strings.

The draft pattern file was removed after proof because active registration is
blocked by live source candidates and absent baseline/source-owner disposition.

## Parser Inventory Contract

`RCM-RUNTIME-INVENTORY-2026-06-15` scans
`mods/mod-swooper-maps/src/recipes` and `mods/mod-swooper-maps/src/domain`,
excludes `node_modules`, `dist`, and `mod`, and parses `.ts`, `.tsx`, and
`.json` files with the TypeScript compiler API.

It records both:

- intended current-predicate runtime matches; and
- broader retired stage-root context so future agents do not confuse
  compile-time stage shaping with exact runtime-handler closure.

## Proof Contract

This checkpoint may record:

- draft native predicate behavior;
- parser inventory and live current-predicate candidates;
- non-registration and downstream blocker records.

This checkpoint must not record:

- active Grit rule registration;
- Habitat wrapper/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- source remediation;
- apply safety;
- classify/generator behavior;
- retired parity;
- broader runtime-purity closure;
- product/runtime proof.

## Reopen Trigger

Reopen for active rule registration when one of these is true:

- the five live candidates are remediated or explicitly accepted as baseline
  debt with row-level baseline proof; or
- the architecture owner narrows or changes the runtime config merge boundary;
  or
- a separate apply/source-owner row proves safe remediation for the live
  candidates.

## Downstream Records

The corpus ledger and command proof log are updated for this candidate blocker.
The aggregate proof matrix is not updated as a current check row because no
active `rules.json` entry, `.grit` pattern, baseline, or injected probe is
registered for this candidate.
