# Design - Wrapper Advanced Stage Config Proof

## Frame

### Objective

Make `grit-wrapper-advanced-stage-config` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat keep the normalized Swooper config surface reviewable
before agents author recipe/map config: standard recipe and map config source
should use supported step/domain config paths, not the retired wrapper-only
`advanced` stage wrapper.

### Selection

- Rule id: `grit-wrapper-advanced-stage-config`
- Grit pattern: `wrapper_advanced_stage_config`
- Pattern file:
  `.grit/patterns/habitat/checks/wrapper_advanced_stage_config.md`
- Owner layer: `grit-check`
- Registry scope: standard recipe and map config source
- Current Grit predicate scope: path regex
  `.*mods/mod-swooper-maps/src/(?:recipes/standard|maps)/.*\.(?:ts|json)$`
- Forbidden current syntax class: TypeScript/JSON-like object property syntax
  with exact key `advanced` or exact string-literal key `"advanced"`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers only files under
   `mods/mod-swooper-maps/src/recipes/standard` and
   `mods/mod-swooper-maps/src/maps` with `.ts` or `.json` extensions.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Supported step-id config, ordinary advanced words, non-standard recipes,
   packages, domain source, generated output, `.tsx` / `.test.tsx`, and
   other-mod paths are controls under this row.
5. In-scope `.test.ts` files under the current path regex are current-predicate
   files. An exact `advanced` key there reports unless future predicate/owner
   work deliberately changes the rule.
6. Broader config-surface closure and retired parity remain separate
   non-claims until their proof classes are available.
7. Current parser inventory is not Habitat wrapper enforcement proof; wrapper,
   baseline, and injected proof are recorded through their own commands.

### Exterior

- Swooper recipe/map source remediation or config migration.
- Predicate repair for syntax or path classes outside the current predicate.
- Generator or migration behavior for config normalization.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims raw acquisition or product/runtime proof
from native fixtures, if live current-predicate `advanced` config candidates
are found but recorded as a clean pass without owner disposition, if ordinary
`advanced` words are mislabeled as exact config-key candidates, or if broader
config normalization closure is treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-wrapper-advanced-stage-config` as an enforced
`grit-check` for `mod-swooper-maps`, scoped to standard recipe and map config
source, forbidding wrapper-only `advanced` stage config surfaces.

The engine refactor normalization packet and MapGen guardrail docs record that
SDK-native nested `advanced` wrappers were retired in favor of flat step/domain
config paths. Older docs may mention `advanced` as drift context; this row does
not close documentation discrepancy or retired parity.

`grit-pattern-corpus-ledger.md` requests positive wrapper advanced config,
negative current step-id config, ordinary advanced-word false positives, a
current recipe/map config scan, an empty locked baseline unless findings prove
otherwise, and non-apply disposition.

Current aggregate records cite the WASC native fixture, parser inventory,
wrapper selector, aggregate `grit-check`, baseline, and injected proof ids as
the active proof boundary for this row.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Exact `advanced` object property in map source | Reports |
| Exact `"advanced"` string-literal property in map source | Reports |
| Exact `advanced` object property in standard recipe source | Reports |
| Exact `"advanced"` string-literal property in standard recipe source | Reports |
| Exact `advanced` or `"advanced"` key in in-scope `.test.ts` map/standard recipe source | Reports as a current-predicate fact |
| Supported step-id or domain config keys | Do not report |
| Ordinary advanced words or identifiers | Do not report |
| Non-standard recipe, domain, package, `.tsx` / `.test.tsx`, other-mod, and generated-output-shaped paths | Do not report |
| Broader config normalization examples outside the current predicate | Do not report in this row and remain broader config-surface non-claims |

## Proof Contract

This row checkpoint records:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current Swooper standard recipe
  and map source;
- Habitat per-rule wrapper selector/current-tree proof;
- aggregate Habitat `grit-check` wrapper proof with WASC included;
- explicit empty baseline ownership through `baseline-integrity`;
- row-specific injected violation and path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `WASC-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `WASC-NATIVE-CORPUS-REFRESH-2026-06-16`: full native Grit corpus proof with
  WASC included.
- `WASC-CONFIG-INVENTORY-2026-06-16`: parser inventory/live evidence over
  current Swooper standard recipe and map source.
- `WASC-PER-RULE-SELECTOR-2026-06-16`: Habitat per-rule selector/current-tree
  proof.
- `WASC-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` proof with WASC
  included.
- `WASC-BASELINE-FILES-2026-06-16`: explicit empty baseline plus
  `baseline-integrity` proof.
- `WASC-INJECTED-PROBE-2026-06-16`: row-specific injected finding and path
  control proof.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- broader config-surface closure;
- neighboring row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be
updated for this row's current checkpoint after evidence is gathered. Recovery
ledger, taxonomy, invariant corpus, discrepancy log, and command docs remain
unchanged unless implementation changes policy, diagnostics, or user-facing
behavior.
