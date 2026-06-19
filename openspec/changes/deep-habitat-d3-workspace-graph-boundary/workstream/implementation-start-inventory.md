# D3 Implementation Start Inventory

## Status

D3 source implementation may start on `agent-DRA-d3-workspace-graph-boundary`.
The worktree is clean, the stack is linear above the submitted D2 layer, and the
live prerequisites named by D3 now exist:

- D0 concrete public-surface rows exist in
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- D2 graph projection implementation facts exist in source and are submitted in
  PR #1837.

This inventory is a source-start record, not product closure evidence. D3 still
must implement, validate, review, repair, and close the packet before D4.

## Current-Source Alignment

D3 design text was written before the D1 command-module split and still names
`tools/habitat-harness/src/lib/command-engine.ts` in several rows. Current
source deleted that monolith. D3 implementation must consume and update the
current D1 module shape instead:

| Former D3 reference | Current source surface | D3 handling |
| --- | --- | --- |
| `command-engine.ts` classify target construction | `tools/habitat-harness/src/lib/classify.ts` | Migrate target facts to the Workspace Graph service without recreating a monolith. |
| `command-engine.ts` verify affected targets | `tools/habitat-harness/src/lib/verify-receipt.ts` | Derive the target list from D3 graph facts while preserving D12 receipt ownership. |
| `command-engine.ts` package export rows | `tools/habitat-harness/src/index.ts` exports from focused modules | Preserve exported symbol compatibility unless a D0 row and packet explicitly allow a change. |

The D0 matrix also contains legacy physical paths and field wording for some
classify DTO rows. D3 cites stable `surface_id` keys and preserves current
runtime behavior; it does not reopen D0 from this layer.

## D0 Public Surface Citations

| D3-touched plane | Required surfaces | D0 `surface_id` rows |
| --- | --- | --- |
| Classify CLI | `habitat classify`, path/diff input | `D0-cli-cmd-classify`, `D0-cli-cmd-classify-arg-path` |
| Classify JSON | classification result, classified target, unavailable target, legacy target-source/proof compatibility field | `D0-command-json-type-classification`, `D0-command-json-type-classifiedtarget`, `D0-command-json-type-unavailableclassifiedtarget`, `D0-command-json-field-classifiedtarget-proof` |
| Verify target planning | `habitat verify --base`, affected verification helper, legacy verify output compatibility | `D0-cli-cmd-verify-flag-base`, `D0-package-export-symbol-runaffectedverification`, `D0-command-json-type-verifyproof` |
| Nx inferred targets | harness targets, aggregate targets, per-rule `habitat:rule:*` aliases | `D0-nx-target-target-boundaries`, `D0-nx-target-target-biome-format`, `D0-nx-target-target-biome-check`, `D0-nx-target-target-biome-ci`, `D0-nx-target-target-grit-check`, `D0-nx-target-target-generated-check`, `D0-nx-target-target-habitat-check-all`, `D0-nx-target-target-habitat-rule-workspace-entrypoints`, and the generated `D0-nx-target-target-habitat-rule-*` family for rule-specific aliases. |
| Root scripts | scripts inheriting graph-owned target behavior | `D0-root-script-script-habitat-check`, `D0-root-script-script-check`, `D0-root-script-script-verify` |
| Package exports | plugin export and focused helper/type exports | `D0-package-export-subpath-plugin`, `D0-package-export-symbol-classification`, `D0-package-export-symbol-classifiedtarget`, `D0-package-export-symbol-unavailableclassifiedtarget`, `D0-package-export-symbol-classifypath`, `D0-package-export-symbol-runaffectedverification` |
| Docs/examples | classify, check, graph/verify examples if touched | `D0-docs-example-doc-agents-tooling-defaults-classify-before-editing-example`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-classify-a-path-before-editing-path-classify-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-classify-a-diff-or-patch-patch-classify-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-the-full-habitat-rule-pack-root-check-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-graph-owned-repo-proof-root-verify-check-examples`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-diagnostic-habitat-verify-base-forwarding-example` |

## D2 Live Graph Facts

| Fact | Current implementation evidence | D3 use |
| --- | --- | --- |
| Canonical registry parse before graph projection | `tools/habitat-harness/src/plugin.js` calls `parseRuleRegistryText` before graph target inference. | D3 can rely on registry rows being TypeBox-validated before graph projection. |
| Graph projection exists | `tools/habitat-harness/src/plugin/rule-graph.ts` exports `ruleGraphFacts`. | D3 consumes rule graph intent from the D2 projection boundary rather than raw registry rows. |
| Owner-root fallback removed from plugin authority | `plugin.js` builds owner roots from `rulesJson.ownerRoots` and graph facts. | D3 owns graph-read resolution and target availability; it does not recreate D2 owner/root fallback. |
| Biome alias points at the real Habitat project | `ruleGraphFacts` maps `biome-ci` to `@internal/habitat-harness:biome:ci`. | D3 still must prove Nx resolved dependency execution and no false-green wrapper path. |
| Wrapped-test graph targets stay structured | `ruleGraphFacts` requires `graphTarget` for wrapped-test rows. | D3 normalizes/validates those dependencies against current Nx graph state. |

## Source Start Boundaries

- Keep D3 source edits within the approved D3 write set, translated to the
  current D1 module shape.
- Do not edit `tools/habitat-harness/src/rules/rules.json`.
- Do not edit D4, D7, or D12 packets except for explicit downstream/index notes
  at D3 closure.
- Do not add tests whose only purpose is to memorialize architecture movement;
  structural invariants belong in module boundaries, lint, or GritQL checks.
- Use TypeBox-first schemas for schema-shaped graph states or externalized
  graph DTOs; do not hand-roll shape parsers or use `Type.Unsafe` for ordinary
  Habitat product schemas.
- Preserve current classify and verify public shapes unless D0 rows and the D3
  packet explicitly authorize an additive/versioned change.

## Immediate Implementation Plan

1. Add the Workspace Graph contract/service in small modules rather than a new
   monolith.
2. Move plugin target names, owner-root access, aggregate declarations, and rule
   dependency declarations into the contract boundary.
3. Validate every dependency declaration against the current graph before
   emitting alias wrappers.
4. Project classify targets and verify target lists from graph facts while
   preserving current D0-compatible output.
5. Run D3 falsifiers and focused tests after each source slice.
