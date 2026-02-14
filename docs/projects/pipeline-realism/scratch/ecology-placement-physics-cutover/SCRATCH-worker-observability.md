# SCRATCH Worker D — Observability and Drift Parity

## Ownership
- Slice: S1
- Branch: `codex/prr-epp-s1-drift-observability`
- Focus: Add parity artifacts/effects and trace/viz drift layers at all boundary hooks.

## Working Checklist
- [x] Extend map/ecology/hydrology/placement artifacts for parity diagnostics.
- [x] Extend tags/effect ownership for parity capture points.
- [x] Add trace + viz emission at each risk hook.
- [x] Keep observe-first policy (no new fail-hard except existing hard errors).
- [x] Add parity tests for non-empty diagnostics outputs.

## Decision Log
- Write-once artifact constraint required per-step parity artifacts rather than a shared hydrology/map snapshot artifact.
- Placement parity publishers were made optional in `applyPlacementPlan` to avoid breaking pre-existing direct-test call sites while keeping stage wiring strict.
