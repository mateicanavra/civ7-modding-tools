# Design - Domain Ops Projection Effects Proof

## Frame

### Objective

Make `grit-domain-ops-projection-effects` truthful as a row-owned Habitat proof
checkpoint for the domain-op map projection/effect dependency-key boundary.

### Product Movement

This row helps Habitat enforce owner layering: domain ops produce domain truth
and should not depend on `artifact:map.*` or `effect:map.*` composition keys
owned by map projection/runtime stages.

### Selection

- Rule id: `grit-domain-ops-projection-effects`
- Grit pattern: `domain_ops_projection_effects`
- Pattern file:
  `.grit/patterns/habitat/checks/domain_ops_projection_effects.md`
- Owner layer: `grit-check`
- Registry scope: `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Current Grit predicate scope:
  `.*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$`
- Forbidden current syntax classes: string literals matching
  `artifact:map.<suffix>` or `effect:map.<suffix>`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, retired parity, classify or
   generator behavior, and product proof are separate proof classes.
3. Current row predicate is Swooper domain-op `.ts` only; `.tsx`, other mods,
   recipe paths, and non-op domain paths are controls.
4. Domain-owned keys such as `artifact:ecology.*` and map-key lookalikes such
   as `artifact:mapper.*` must not report.
5. Parser inventory is record-truth evidence, not Habitat wrapper current-tree
   proof.

### Exterior

- Domain source remediation.
- Broader map projection architecture closure.
- Broader domain-refactor full-profile parity.
- Raw direct Grit acquisition.
- Classify or generator behavior.
- Apply/codemod safety.
- Product/runtime Civ7 proof.

### Falsifier

This checkpoint fails if it records live current-predicate candidates as clean
closure, if domain-owned or lookalike keys report, if inherited shared proof is
described as row-local proof, or if the row implies retired parity,
classify/generator, apply, broader map projection, or product/runtime closure.

## Source Synthesis

`rules.json` registers this row as an enforced `grit-check`, owned by
`mod-swooper-maps`, scoped to
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`, and forbidding domain ops
from depending on map projection/effect artifact keys.

`invariant-corpus.md` records `domain-refactor-guardrails` as the wrapped
source invariant for domain-op purity. The boundary profile includes map
projection ownership with adapter/context and root-config boundaries.

`architecture-normalization-packet.md` records that normalized domains should
produce typed domain truth and avoid leaking engine-facing fields/effects or
`artifact:map.*` style handoffs into domain internals.

`injected-probes.json` already has a row for this rule with the same
`rulesJsonScope` and a positive `artifact:map.foo` op probe plus non-op path
control. Current row-specific injected cleanup/path-control closure is not
claimed here; only the accepted shared injected-probe API id is cited.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Swooper domain-op `.ts` string literal `artifact:map.*` | Reports |
| Swooper domain-op `.ts` string literal `effect:map.*` | Reports |
| Swooper domain-op `.ts` array element or property-name map key | Reports |
| Swooper domain-op `.ts` import/export/dynamic import source map key | Reports as string-literal current predicate |
| Domain-owned artifact/effect key | Does not report |
| Map-key lookalike without exact `map.` segment | Does not report |
| Non-op domain path with the same key | Does not report |
| Other mod, `.tsx`, recipe path, and template literal | Do not report in this current native predicate |

Template-literal map keys are native non-matches in this checkpoint. They
remain parser-edge non-claims unless a later row repairs and proves them.

## Proof Contract

This row checkpoint may record:

- `DOPE-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for the
  current predicate.
- `DOPE-DOMAIN-OPS-INVENTORY-2026-06-15`: parser inventory/live
  zero-candidate record truth over current Swooper domain source.
- Aggregate record alignment for this row.

This row checkpoint must not record:

- raw direct Grit acquisition;
- neighboring-row proof;
- row-specific injected cleanup/path-control closure;
- baseline mutation;
- classify or generator behavior;
- apply/codemod safety;
- retired wrapped-script parity or broader domain-refactor closure;
- product/runtime proof.

Current restacked shared proof ids may be cited only as inherited shared proof:
`HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
`HGPR-PER-RULE-SELECTORS-2026-06-15`,
`HGPR-BASELINE-FILES-2026-06-15`,
`HGPR-BASELINE-INTEGRITY-2026-06-15`, and
`HGPR-INJECTED-GRIT-ROWS-2026-06-15`. Raw direct acquisition remains
`HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.

## Downstream Records

The aggregate corpus ledger, proof matrix, and command proof log are updated
with row-specific native fixture and parser inventory evidence. Recovery claim
ledger, taxonomy, invariant corpus, discrepancy log, classify/generator
records, and user-facing command docs remain unchanged because this checkpoint
does not change source architecture, diagnostics text, generator behavior, or
product behavior.
