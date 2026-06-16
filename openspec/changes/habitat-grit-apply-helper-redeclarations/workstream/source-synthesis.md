# Source Synthesis

| Source | What It Says | Row Use |
| --- | --- | --- |
| `packages/mapgen-core/src/lib/math/clamp.ts` | `clamp01(value)` clamps finite values but does not handle non-finite fallback; `clampPct(value, min, max, fallback = min)` handles non-finite fallback when called with explicit bounds. | Plain helper rewrites may import `clamp01`; non-finite helper rewrites must use explicit `clampPct(value, 0, 1, 0)`. |
| `packages/mapgen-core/src/core/index.ts` | Publicly exports `clamp01` and `clampPct`. | Canonical helper import authority. |
| `mods/mod-swooper-maps/AGENTS.md` | Build `@swooper/mapgen-core` before Swooper type checks; use package scripts for build/check; generated `mod/` output is read-only. | Defines package-local verification and protected paths. |
| `mods/mod-swooper-maps/src/AGENTS.md` | `src` files are game-facing entrypoints; validate with package build/check. | Confirms source edits need Swooper validation. |
| GritQL docs and stdlib examples | Rewrites use `=>`; `contains bubble { ... }` traverses nested code while isolating metavariables. | Supports final multi-call rewrite shape in the apply fixture. |
| `RHR-RUNTIME-INVENTORY-2026-06-15` | Three live helper redeclarations block the active runtime-helper check. | Current remediation target set. |

## Boundary

This row resolves exact `clamp01` helper redeclarations in the live target set.
It does not own arbitrary helper synthesis, `clampChance`, `normalizeRange`,
`rollPercent`, exported helper declarations, or shared Habitat apply-adapter
registration.
