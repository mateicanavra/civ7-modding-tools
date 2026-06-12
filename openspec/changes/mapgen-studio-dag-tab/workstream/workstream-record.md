# Systematic Workstream Record

## Frame

- Objective: Re-express the merged recipe-DAG visualization as a
  first-class Pipeline stage view native to the redesigned Studio —
  design-system idioms, decomposed-shell mounting, client-data-layer
  fetching — per the handoff's execution mandate (§6).
- Future state: a map author flips the stage between Map and Pipeline; the
  pipeline renders the selected recipe's authored artifact-dependency
  structure with the same layout, domain, label, and interaction semantics
  the merged feature shipped, now themed by the token system in both modes.
- Non-goals (binding, handoff §5): projection/oRPC schema changes; runtime
  execution overlays; rewrites of the preserved headless modules.
- Hard core: handoff §2 invariants verbatim — projection contract
  (`buildRecipeDag`), server boundary (`STUDIO_RECIPE_DAG_ORPC_PATH`, client
  never imports recipe modules), layout semantics (dependency rank ×
  phase-lane waterfall, bundled trunks, deterministic label fanning),
  domain taxonomy + one icon contract, per-artifact label projection,
  interaction semantics (selection vs expansion, label selection, focus
  dimming, context-aware placement, diagnostics). Behavior parity of the
  surrounding shell (run/poll/persistence) is this lane's standing hard
  core.
- Exterior: engine-side conventions, placement-stack resources vertical,
  the integration lane's stack.

## Authority

- `docs/projects/graphite-stack-integration/DAG-STUDIO-REDESIGN-HANDOFF.md`
  (operator-granted mandate; §1 disposition table, §2 invariants)
- `openspec/changes/mapgen-recipe-dag-visualization/` (the merged feature's
  workstream — committed semantics + prior-art record format)
- `apps/mapgen-studio/.interface-design/system.md` (design decisions of
  record for this lane)
- `docs/projects/mapgen-studio-redesign/00-GOAL.md` (lane ledger)

## Plan

- Phase 1 (`design/dag-tab-frame`): this record + proposal/design/tasks +
  spec deltas, `--strict` valid.
- Phase 2 (`design/dag-tab-stage`): implementation per design.md, test pins
  ported in the same change, gates green (tsc; studio vitest incl.
  recipeDag suites; mapgen-core; build + worker bundle), visual
  verification dark + light, system.md + ledger amendments.

## Status

- Started: 2026-06-12 (post-restack onto main @ 6adfc9ec3; restack absorbed
  the merged feature with the §4 resolutions — chrome trio taken from this
  lane, vite middleware + headless/server modules preserved, dep union)
- Current: Phase 2 complete (`design/dag-tab-stage`). Gates: strict
  validation; tsc clean; 193 studio tests (recipeDag suites incl. the
  ported `PipelineStage` pins); mapgen-core 103; build + worker bundle.
  Visual evidence (dark + light, :5173): Map|Pipeline switcher; 17-stage
  standard-recipe pipeline with console strip (6 phases / 17 stages /
  157 edges / 21 issues, warn tone); stage selection + dimming + active
  edges; expansion shelf (10 foundation steps); click-again unselect;
  label selection focusing to its branches; Explore dock absent in
  pipeline view and restored on return; a full generation run completed
  WHILE the pipeline view was active (no reload, footer → Ready); map
  view returned with the run's layers live.
