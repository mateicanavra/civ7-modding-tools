# Design

## Scope

The row owns exact helper remediation for Swooper runtime recipe/domain helper
redeclarations. The applied source scope is the three files previously recorded
by `RHR-RUNTIME-INVENTORY-2026-06-15`:

- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/strategies/vector.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/ops/select-navigable-river-terrain/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-rough-lands/strategies/default.ts`

## Rewrite Classes

| Helper body | Replacement |
| --- | --- |
| `return Math.max(0, Math.min(1, value));` | Remove local helper and import canonical `clamp01` from `@swooper/mapgen-core`. Existing one-argument calls remain valid. |
| `if (!Number.isFinite(value)) return 0; return Math.max(0, Math.min(1, value));` | Remove local helper, import `clampPct`, and rewrite call sites to `clampPct(value, 0, 1, 0)`. |

The second class must not alias `clampPct` as `clamp01`: `clampPct` requires
explicit `min`, `max`, and fallback arguments to preserve the old one-argument
helper semantics.

## Controls

- Non-equivalent fallback values such as `0.5` do not rewrite.
- Out-of-scope paths do not rewrite.
- Files without an import anchor do not rewrite.
- The row does not remediate other helper names or helper declaration shapes.

## Habitat Integration Boundary

This row does not register the apply pattern in `tools/habitat-harness/src/lib/grit-apply.ts`.
The current adapter invocation passes a single Grit apply workflow plus roots;
adding a second workflow file is parsed by Grit as an input path. That shared
adapter behavior is outside this row. Direct Grit proof and source-owner review
are sufficient for this bounded remediation checkpoint.

## Non-Claims

- No Habitat `habitat fix` selector/current-tree proof for this apply pattern.
- No generic apply transaction, rollback, or multi-apply adapter proof.
- No generated-output edits.
- No product/runtime proof.
- No raw acquisition claim beyond the direct row-owned Grit commands recorded
  for this remediation.
