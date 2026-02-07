# Ecology Domain Refactor — Phase 1 Current-State Spike (Pointer)

This “Phase 1 spike” is captured in the canonical Ecology spike directory. This file is a thin navigation pointer to avoid duplicating content.

References:
- Plan: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/ecology/ECOLOGY.md`
- Workflow: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
- Canonical spike directory: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`

## Current-State Outputs (Authoritative)

- Current-state narrative + mental map:
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CURRENT.md`
- Drift evidence (current vs target):
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DRIFT.md`
- Contract inventory and ids:
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACTS.md`
- Contract matrix (step↔op↔artifact↔tags↔viz):
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md`

## Phase 0 Baseline Gates (Status)

Baseline ecology tests pass, but require build-order for workspace packages that export `dist/*`:
- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd packages/mapgen-core build`
- `bun --cwd mods/mod-swooper-maps test test/ecology`

See also:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/feasibility/03-experiments.md`
