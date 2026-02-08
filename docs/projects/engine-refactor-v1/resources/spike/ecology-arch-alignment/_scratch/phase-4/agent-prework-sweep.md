# Agent 3 Scratch: Prework Sweep (M2 Issue Docs)

Status: completed (performed by ORCH due to agent spawn limits)

## Deliverable Checklist
- Scope: `docs/projects/pipeline-realism/issues/`
- Find all `## Prework Prompt (Agent Brief)` sections and resolve them (docs-only).
- Execution order (unblockers first):
  1. `LOCAL-TBD-PR-M2-001` viz-key inventory format decision
  2. `LOCAL-TBD-PR-M2-010` embellishment actual feature keys
  3. `LOCAL-TBD-PR-M2-015` external usages of legacy mega-ops
- For each prompt:
  - Append “Prework Results (Resolved)” into Implementation Details.
  - Tighten acceptance/testing/deps if needed.
  - Commit A (findings), then remove the prompt and commit B.
- Do not reindex Narsil MCP; use `rg`, `git show`, and direct file reads.

## Prompts Found

- `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M2-001-preflight-parity-baselines-viz-key-inventory-gate.md`
- `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M2-010-embellishments-split-multi-feature-embellishment-ops-into-atomic-per-feature-ops.md`
- `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M2-015-cleanup-delete-legacy-mega-op-runtime-paths-remove-transitional-shims-no-legacy-left.md`

## Resolutions (Summary)

1. `LOCAL-TBD-PR-M2-001` (viz-key inventory format)
   - Decision: generate a stable, diff-friendly inventory from the viz dump `manifest.json`.
   - Format: sorted lines `dataTypeKey|spaceId|kind` filtered to prefixes:
     - `ecology.`, `map.ecology.`, `debug.heightfield.`

2. `LOCAL-TBD-PR-M2-010` (embellishment feature-key subsets)
   - `ecology/features/vegetation-embellishments` places:
     - `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`
     - Evidence: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/strategies/default.ts`
   - `ecology/features/reef-embellishments` places:
     - `FEATURE_REEF`
     - Evidence: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/strategies/default.ts`

3. `LOCAL-TBD-PR-M2-015` (external usages of legacy mega-ops)
   - Result: no external runtime consumers were found outside standard recipe/test surfaces.
   - Evidence: `rg` searches for legacy op ids + `@mapgen/domain/ecology/ops` imports (see issue doc).

## Prompt Removal

All `## Prework Prompt (Agent Brief)` headings were removed from the M2 issue docs after resolution.
