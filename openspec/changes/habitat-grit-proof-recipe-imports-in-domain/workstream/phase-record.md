# Phase Record - Recipe Imports In Domain

## Current Gate

Gate 12/12: row checkpoint implemented, verified, record-aligned, and committed
for supervisor review. The row packet, pattern, registration, baseline,
injected-probe metadata, parser inventory, native proof, wrapper proof,
baseline inventory, injected proof, OpenSpec validation, and aggregate records
are present.

## Scope

- Row: `grit-recipe-imports-in-domain` / `recipe_imports_in_domain`.
- Owner: Habitat Grit check row.
- Scan root: `mods/mod-swooper-maps/src/domain`.
- Current predicate: Swooper domain `.ts` files importing or re-exporting recipe
  modules through explicit alias or relative `../recipes` source declarations,
  including dynamic import expressions.

## Non-Claims

No raw direct Grit acquisition, source remediation, apply safety,
classify/generator behavior, retired parity, broader domain-refactor closure,
or product/runtime proof is claimed.

## Next Actions

1. Await supervisor review of this row checkpoint.
2. Do not open the next Grit row until the checkpoint is accepted or a repair
   demand is issued.
