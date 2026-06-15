# Design - Domain Ops Root Config Proof

## Frame

### Objective

Make `grit-domain-ops-root-config` truthful as a row-owned Habitat proof
checkpoint for the domain-op root-config facade import boundary.

### Product Movement

This row helps Habitat enforce owner layering: domain ops consume normalized
config contracts instead of reaching back to domain-root config facades through
relative parent traversal.

### Selection

- Rule id: `grit-domain-ops-root-config`
- Grit pattern: `domain_ops_root_config`
- Pattern file:
  `.grit/patterns/habitat/checks/domain_ops_root_config.md`
- Owner layer: `grit-check`
- Registry scope: `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Current Grit predicate scope:
  `.*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$`
- Forbidden current syntax classes: import declarations whose source matches
  two-or-more parent traversals to `config.js`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, retired parity, classify or
   generator behavior, and product proof are separate proof classes.
3. Current row predicate is Swooper domain-op `.ts` only; `.tsx`, other mods,
   recipe paths, and non-op domain paths are controls.
4. Default, named, namespace, type-only, side-effect, and single-quoted imports
   are current native positives for the two-or-more parent source class.
5. Six-parent root-config imports are current native positives, proving the
   depth gap is repaired for import declarations.
6. Parser inventory is record-truth evidence, not Habitat wrapper current-tree
   proof.

### Exterior

- Domain source remediation.
- Broader config architecture closure.
- Broader domain-refactor full-profile parity.
- Raw direct Grit acquisition.
- Classify or generator behavior.
- Apply/codemod safety.
- Product/runtime Civ7 proof.

### Falsifier

This checkpoint fails if it records live current-predicate candidates as clean
closure, if local/one-parent config imports report, if inherited shared proof
is described as row-local proof, or if the row implies export-from, dynamic
import, retired parity, classify/generator, apply, broader config, or
product/runtime closure.

## Source Synthesis

`rules.json` registers this row as an enforced `grit-check`, owned by
`mod-swooper-maps`, scoped to
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`, and forbidding domain ops
from importing domain-root config facades via parent traversal.

The legacy boundary-profile shell guard checks domain op roots for
`from ["'](?:../){2,}config.js["']`. The current Grit pattern now binds the
import source and uses the same two-or-more parent traversal depth class for
import declarations, while keeping export-from and dynamic-import forms outside
this checkpoint.

`injected-probes.json` already has a row for this rule with the same
`rulesJsonScope` and a positive root-config import op probe plus non-op path
control. Current row-specific injected cleanup/path-control closure is not
claimed here; only the accepted shared injected-probe API id is cited.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Swooper domain-op `.ts` default import from `../../config.js` | Reports |
| Swooper domain-op `.ts` default imports from three, four, five, and six parent levels | Report |
| Swooper domain-op `.ts` named, namespace, type-only, side-effect, and single-quoted imports from supported root-config sources | Report |
| Local `./config.js` and one-parent `../config.js` imports | Do not report |
| Six-parent `../../../../../../config.js` import | Reports as part of two-or-more parent traversal |
| Non-op domain path with the same source | Does not report |
| Other mod, `.tsx`, and recipe paths | Do not report |
| Extensionless and JSON config paths | Do not report |
| Export-from, dynamic import, and source-string root-config lookalikes | Do not report in this current native predicate |

Export-from and dynamic-import root-config reaches remain current native
non-matches in this checkpoint. They are not claimed as full legacy parity or
architecture closure.

## Proof Contract

This row checkpoint may record:

- `DORC-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for the
  current predicate.
- `DORC-DOMAIN-OPS-INVENTORY-2026-06-15`: parser inventory/live
  zero-candidate record truth over current Swooper domain source.
- Aggregate record alignment for this row.

This row checkpoint must not record:

- raw direct Grit acquisition;
- neighboring-row proof;
- row-specific injected cleanup/path-control closure;
- baseline mutation;
- classify or generator behavior;
- export-from or dynamic import closure;
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
