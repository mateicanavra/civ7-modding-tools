# Downstream Realignment Ledger

| Area | Required realignment | Status |
| --- | --- | --- |
| Coast classification | Consolidate the coast-ring safety net onto canonical odd-R adjacency; remove the Moore-8 widening; confirm zero coastless land. | planned (Task 4) |
| Connected components / landmask | Confirm island/lake/landmass segmentation shifts only via adjacency, with no per-tile land/water reclassification. | planned (Task 7.1) |
| Distance fields | Accept bounded ±1 frontier shifts; no structural inversion. | planned (Task 7.1) |
| Flow / drainage routing | Highest-risk consumer: confirm receivers are engine-adjacent and river products stay coherent (no fragmentation regression). | planned (Task 5.2 + 7.1) |
| Climate vector fields | Re-derive divergence/curl from corrected projection; confirm fixtures and physical coherence. | planned (Task 3.3 + 5.1) |
| Resources / starts | Re-run spacing/legality gates; hex distances change by ≤1 on affected pairs. | planned (Task 7.1) |
| Golden / stat baselines | Update baselines that legitimately shift to the engine-aligned values; record rationale; do not update shipped-map config hashes (config untouched). | planned (Task 5.5) |
| PR #1811 (`agent-A-fix-island-coast-ring`) | Superseded — coast-ring step re-authored here; Moore-8 dropped. Close PR; do not merge. User to drop the locally-stacked branch in the primary checkout (carries `latest-juicy` edits). | planned (Task 4.3 + next-packet) |
| Memory `civ7-engine-hex-adjacency-oddr` / `civ7-mapgen-coast-ring-invariant` | Update once landed: model corrected, supersets no longer needed. | planned (post-closure) |
| Hex-convention audit doc | Update disposition: engine-side migration no longer open. | planned (Task 7.2) |
| Studio renderer | Already odd-R (Pass-5 X6); confirm it stays consistent with the corrected model (no double-correction). | verify (Task 7.1) |
