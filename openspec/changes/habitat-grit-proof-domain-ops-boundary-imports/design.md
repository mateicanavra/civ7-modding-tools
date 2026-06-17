# Design - Domain Ops Boundary Imports Proof

## Frame

### Objective

Make `grit-domain-ops-boundary-imports` truthful as a row-owned Habitat proof
checkpoint for the domain-op adapter/context boundary.

### Product Movement

This row helps Habitat enforce the owner layer where domain ops remain pure
implementation units and do not reach into Civ7 adapter or map-context
surfaces.

### Selection

- Rule id: `grit-domain-ops-boundary-imports`
- Grit pattern: `domain_ops_boundary_imports`
- Pattern file:
  `.grit/patterns/habitat/checks/domain_ops_boundary_imports.md`
- Owner layer: `grit-check`
- Registry scope: `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Current Grit predicate scope:
  `.*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$`
- Forbidden current syntax classes: adapter import/re-export source forms,
  `ExtendedMapContext` identifiers, and `.adapter` property accesses.

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, retired parity, and product
   proof are separate proof classes.
3. Current row predicate is Swooper domain-op `.ts` only; `.tsx`, other mods,
   and non-op domain paths are controls.
4. Adapter source lookalikes such as `@civ7/adapterish/...` must not report.
5. Parser inventory is record-truth evidence, not Habitat wrapper current-tree
   proof.

### Exterior

- Domain source remediation.
- Dynamic import and element-access closure.
- Broader domain-refactor full-profile parity.
- Raw direct Grit acquisition.
- Apply/codemod safety.
- Product/runtime Civ7 proof.

### Falsifier

This checkpoint fails if it records live current-predicate candidates as clean
closure, if adapter lookalikes report, if inherited shared proof is described
as row-local proof, or if the row implies dynamic import, element-access,
retired parity, or product/runtime closure.

## Source Synthesis

`rules.json` registers this row as an enforced `grit-check`, owned by
`mod-swooper-maps`, scoped to
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`, and forbidding
adapter/context crossing constructs.

`lint-domain-refactor-guardrails.sh` boundary profile scans each domain
`ops_root` for `ExtendedMapContext`, `context.adapter`, and `@civ7/adapter`.
The Grit row ports that boundary into row-owned syntax classes while explicitly
recording where Grit behavior is broader or narrower than the legacy text
guard.

`invariant-corpus.md` records `domain-refactor-guardrails` as the source
invariant for boundary-profile ops purity. `taxonomy.md` records
`@civ7/adapter` as the adapter owner layer.

`injected-probes.json` has a row for this rule with the same `rulesJsonScope`
and a positive `context.adapter.run()` op probe plus non-op path control.
`DOBI-INJECTED-PROBE-2026-06-16` records the current row-specific injected
violation and path-control proof; aggregate injected-corpus closure remains
unclaimed while DDIT is blocked.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Swooper domain-op `.ts` value import from `@civ7/adapter/...` | Reports |
| Swooper domain-op `.ts` type-only import from `@civ7/adapter/...` | Reports |
| Swooper domain-op `.ts` side-effect import from `@civ7/adapter/...` | Reports |
| Swooper domain-op `.ts` named or star re-export from `@civ7/adapter/...` | Reports |
| Swooper domain-op `.ts` `ExtendedMapContext` identifier | Reports |
| Swooper domain-op `.ts` `.adapter` property access | Reports |
| Non-op domain path with the same source/text | Does not report |
| Other mod, `.tsx`, source string, adapter source lookalike, element access, and dynamic import | Do not report in this current native predicate |

Dynamic imports and element accesses are native non-matches in this checkpoint.
They remain parser-edge non-claims unless a later row repairs and proves them.

## Proof Contract

This row checkpoint may record:

- `DOBI-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for the
  repaired current predicate.
- `DOBI-DOMAIN-OPS-INVENTORY-2026-06-15`: parser inventory/live zero-candidate
  record truth over current Swooper domain source.
- `DOBI-NATIVE-CORPUS-REFRESH-2026-06-16`: full native Grit corpus health with
  DOBI included.
- `DOBI-PER-RULE-SELECTOR-2026-06-16` and
  `DOBI-HABITAT-GRIT-TOOL-2026-06-16`: Habitat per-rule and aggregate
  wrapper/current-tree proof.
- `DOBI-BASELINE-FILES-2026-06-16`: explicit empty baseline ownership and
  baseline-integrity support.
- `DOBI-INJECTED-PROBE-2026-06-16`: row-specific injected violation and
  path-control proof.
- Aggregate record alignment for this row.

This row checkpoint must not record:

- raw direct Grit acquisition;
- DDI or neighboring-row proof;
- aggregate injected-corpus closure while DDIT remains blocked;
- baseline mutation;
- apply/codemod safety;
- retired wrapped-script parity or broader domain-refactor closure;
- product/runtime proof.

Raw direct acquisition remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.

## Downstream Records

The aggregate corpus ledger, proof matrix, and command proof log are updated
with row-specific native fixture/corpus, parser inventory, wrapper, baseline,
and injected proof. Recovery claim ledger, taxonomy, invariant corpus,
discrepancy log, and user-facing command docs remain unchanged because this
checkpoint does not change source architecture, diagnostics text, or product
behavior.
