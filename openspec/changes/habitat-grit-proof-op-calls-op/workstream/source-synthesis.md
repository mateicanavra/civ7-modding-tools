# Source Synthesis - Op Calls Op

## Authority

The recovery corpus identifies `habitat-grit-op-calls-op` as a check-only
candidate for private sibling op composition. The engine-refactor modeling
reference states that ops are atomic and composition belongs in steps/stages.
The Foundation modeling spike applies that posture to the Foundation op
catalog.

The existing `no-op-calls-op-tectonics` test is narrower than the proposed Grit
row: it scans Foundation op runtime `index.ts` files and also checks
`ops.bind` / `runValidated` call classes. This row ports only the import-source
subset into Grit so the check stays syntax-owned and reviewable.

## Current Predicate

Current Grit path predicate:

`mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/index.ts`

Current source predicate:

- `../<sibling-op>/index.js`
- `@mapgen/domain/<domain>/ops`
- `@mapgen/domain/<domain>/ops/index.js`

## Parser Inventory

`OCO-DOMAIN-OPS-INVENTORY-2026-06-15` scanned
`mods/mod-swooper-maps/src/domain`, skipped `node_modules`, `dist`, and `mod`,
and found zero current candidates across 97 current-predicate runtime op
`index.ts` files with 305 import declarations.

Controls are visible in current source: same-op `./contract.js` and
`./strategies/index.js` imports are common and intentionally allowed. The
inventory counted 86 same-op `./strategies/index.js` imports, 2 same-op other
local imports, 11 parent `lib` imports, and 56 outside-current relative-index
lookalikes under strategy/rule/policy source. Those outside-current lookalikes
are context for the exact entrypoint predicate, not current-row candidates.
Export-from and dynamic import classes are counted separately and remain
non-claims for this row.

## Row Boundary

This row does not close the neighboring `ops.bind` / `runValidated` candidate.
The registered OCO injected probe is proven through
`OCO-INJECTED-PROBE-2026-06-15`; export-from and dynamic-import shapes remain
outside the current native predicate. This row also does not claim full retired
guardrail parity, source remediation, apply safety, classify/generator
behavior, or product/runtime behavior.
