# Graphite Integration — Stack Adjudication & Domino Plan

- **Status:** APPROVED by operator (2026-06-12). Mutation gate passed; execution begins with dominos 1–2.
- **DRA:** Claude (integration agent). Method: `graphite-stack-drain` skill (mechanics authority) + `civ7-systematic-workstream` gates + cognition `investigation-design`/`framing-design`.
- **Evidence base:** deterministic census (`.agents/skills/graphite-stack-drain/scripts/graphite-stack-census.mjs`, 2026-06-12T02:17Z) + five read-only per-stack investigations (branch-by-branch adjudication; all git plumbing, zero mutations).
- **Prime constraint:** protect good core semantic progress; never import dead/superseded code; the studio redesign lane (`design/mapgen-studio-redesign`, 36 branches) is the operator's LIVE owner lane — sequence around it, never adjudicate or restack it.

## 1. Census snapshot (at adjudication time)

203 tracked branches, 8 roots, 10 worktrees, 4 needsRestack, 2 branches outside the root model.

| Root | Size | Verdict (this plan) |
|---|---|---|
| `placement-realignment-s0-metrics-baseline` → s11 | 12 | DRAIN FIRST (protect) |
| `direct-control-cinematic-dismissal` → `test-tmp-hygiene` (taxonomy) | 8 | DRAIN (parallel with placement; PRs #1576–#1586 await review) |
| `codex/mapgen-recipe-dag-visualization` → `codex/mapgen-dag-icon-taxonomy` | 5 | RESTACK + DRAIN (before studio redesign lands); re-expression spec handed to studio agent |
| `codex/mapgen-physical-rivers` → `codex/river-native-materialization-doc-realignment` | 64 | FOLD 64→6 survivors, strip superseded, DRAIN LAST |
| `design/mapgen-studio-redesign` → `design/grid-icon` | 36 | OWNER LANE — untouched by this plan |
| `codex/stack-lineage-audit-reference` chain | 73 | DROP WHOLESALE (visualizer-only, verified) |
| `codex/graphite-stack-drain-skill` | 1 | PRUNE (0 ahead of main; merged as #1581) |
| `restore-civ7-orpc-skill` | 1 | DRAIN (1 commit, 491-line unique skill restoration; not on main) |
| outside model: `placement-realignment` | 1 | RETIRE NOW (redundant pre-split ancestor) |
| outside model: `placement-live-integration` | 1 | KEEP until rivers drain consumes it (conflict oracle) |

**Main drift:** since the common merge-base `4feff5c63` main gained only the graphite-stack-drain skill (15 files under `.agents/skills/graphite-stack-drain/`). Conflict risk is therefore **between stacks**, not against main.

## 2. Approved domino order

Restack-onto target = **main**, freshly, per stack, immediately before its drain. No global restacks (`gt sync --no-restack` default). Strategy = Option B (drain in order) for the coherent stacks; rivers alone gets a fold-first mini-Option-A treatment.

1. **Trivia** — ✅ EXECUTED 2026-06-12: `codex/graphite-stack-drain-skill` worktree+branch retired (PR #1581 was already merged); `restore-civ7-orpc-skill` restacked + merged as **#1583**; `codex/sieve-engine-reference` was discovered stacked on the design lane (parent `design/a11y-fixes`, not main) — re-parented onto main via `gt move` (clean, docs-only) and merged as **#1594**.
2. **Placement s0–s11** — ✅ EXECUTED 2026-06-12: restacked onto main conflict-free, all 12 PRs (**#1565–#1575, #1580**) published and merged bottom-up. Gates: typecheck 34/34, mod-swooper-maps 511/511, civ7-map-policy 12/12, mapgen-studio 162/162 (placement intentionally removes 2 legacy-Studio-defaults tests). Lab branch `placement-realignment` retired (Graphite-untracked, local-only, 19/20 patch-equivalent). `placement-live-integration` oracle branch KEPT (its worktree removed; branch suffices for domino 5).
3. **Taxonomy stack (#1576–#1586)** — zero overlap with placement; merges on operator review. May run parallel with 2.
4. **Dag-viz** — ✅ EXECUTED 2026-06-12 (ahead of 1–3 by operator re-prioritization): restacked + drained as **#1587–#1591**; handoff spec merged as **#1592/#1593**. See §6.
5. **Rivers** — fold 64 → 6 survivors top-down, strip superseded clusters during the fold, restack onto post-placement/post-taxonomy main using `placement-live-integration` to resolve the 46-file placement overlap, re-point kept studio glue to taxonomy endpoints. Then retire the oracle (after salvaging its two unique bits, §5.3). ⚠️ Open item for this domino: `wt-agent-mapgen-physical-rivers` has 2 uncommitted tracked modifications (`mods/mod-swooper-maps/src/maps/configs/mountain-rivers-patch.config.json` + its generated map) — adjudicate commit-vs-discard before the fold; the dirty-worktrees gate blocks until then.
6. **Drop lineage-audit stack** wholesale; record disposition; delete branches.

## 3. Per-stack findings (evidence summaries)

### 3.1 Placement (`placement-realignment-s0…s11`) — PROTECT, DRAIN FIRST

Core mapgen verticals: placement/resources/starts domain ops in `mods/mod-swooper-maps`, `packages/civ7-map-policy` policy tables, `packages/civ7-adapter`, per-artifact contracts/validators, viz knobs, live proof closure. Each slice pairs code + tests + OpenSpec + evidence.

- Overlap vs main drift: **0 files**. Overlap vs taxonomy stack: **0 files**. Restack risk LOW (only s0 flagged needsRestack; main moved 2 doc-only commits).
- Overlap vs rivers: **46 files** (placement ops, placement steps, 4 map configs + generated maps, adapter, policy tables, shared tests, ADR/reference docs). **Placement wins on placement domain**: rivers' river-tile resource exclusion was written against the *deleted* old `plan-resources` op; the oracle re-expresses it through the new demand pipeline (mask ANDed into legality). Landing rivers first would replay the same conflicts up to 11 times — hence placement-first.
- s11's `INTEGRATION-PLAN.md` records the accepted four-party order (placement → taxonomy parallel → orpc → rivers last) and the oracle retirement gate.
- Lab branch `placement-realignment`: 19/20 commits patch-equivalent to s0–s8 (`git cherry`); the 20th differs only by rebase context. **Redundant — retire.**

### 3.2 Rivers (`codex/mapgen-physical-rivers`, 64 branches) — FOLD 64→6, DRAIN LAST

MB `4feff5c63e82`; every branch is a single commit (one has 3). Nothing superseded by main; all supersessions come from the taxonomy stack (D8–D13 in `docs/projects/cli-command-taxonomy/workstream-record.md`) and **every one was verified to hold**.

**Segments:** S1 hydrology/mapgen core (25 branches) · S2 studio platform/glue (7) · S3 direct-control kept capabilities (3) · S4 superseded camera/capture/visibility/explore (9) · S5 proof harness scripts (7) · S6 docs/openspec (12).

**Disposition table** (chain order; KEEP / SUPERSEDED / PROOF-ONLY / DOCS-ONLY):

| # | Branch | Disposition | Evidence (one line) |
|---|---|---|---|
| 1 | mapgen-physical-rivers | KEEP | River metadata readback guardrails + river-type metadata gen (94 files; core algorithm + adapter surface) |
| 2 | mapgen-river-recovery-workstreams | DOCS-ONLY | openspec planning for work since executed in-stack |
| 3 | mapgen-river-contract-hardening | KEEP | River catalog adapter contract hardening |
| 4 | mapgen-river-proof-claims | KEEP | Claim labeling in live-parity diagnostics that later KEEP branches build on |
| 5 | mapgen-upstream-drainage-routing | KEEP | New hydrology op `compute-drainage-routing` + tests |
| 6 | mapgen-river-visible-proof-sampler | PROOF-ONLY | Proof runner script (later versions bind to superseded capture APIs) |
| 7 | river-mock-metadata-adjacency | KEEP | Mock adapter river-adjacency correctness fix |
| 8 | river-effect-tag-contract | KEEP | Removes stale engine river effect tag from recipe contract |
| 9 | river-recovery-execution-plan | DOCS-ONLY | Plan realignment only |
| 10 | map-rivers-hydrology-selector | KEEP | New op `select-navigable-river-terrain` (ownership fix) |
| 11 | river-trunk-coherence | KEEP | Trunk-following major-river truth; Earthlike seed regressions |
| 12 | river-lake-recovery-redesign-goal | DOCS-ONLY | Goal framing |
| 13 | hydrology-river-network-metrics | KEEP | New op `compute-river-network-metrics` + tests |
| 14 | river-lake-earth-benchmark-goal | DOCS-ONLY | Goal refresh |
| 15 | map-rivers-navigable-coherence | KEEP | Projection signal diagnostics in kept op |
| 16 | river-lake-adversarial-synthesis | DOCS-ONLY | Adversarial review record |
| 17 | river-visible-proof-closure-hardening | PROOF-ONLY | Hardens proof script only |
| 18 | map-rivers-knob-contract | KEEP | Retires legacy `riverDensity` alias; knob contract cleanup |
| 19 | river-second-wave-synthesis | DOCS-ONLY | Synthesis record |
| 20 | river-engine-modeling-probe | PROOF-ONLY | Probe; findings recorded in docs (#48) |
| 21 | river-authoring-boundary-correction | KEEP | Corrects river writer boundary assumptions in adapter |
| 22 | map-rivers-bulk-writer-materialization | KEEP | Keeps bulk river modeling internal to projection boundary |
| 23 | studio-orpc-river-materialization-cleanup | KEEP | **Restores `packages/studio-server`** (20 files; absent from main, MB, and taxonomy) + studio /rpc + deploy plumbing |
| 24 | studio-run-in-game-rpc-mount | KEEP | Run-in-game RPC mount; depends on #23 |
| 25 | direct-control-ui-input-context | KEEP | `activeInputContext(Name)` probe in `runtime/app-ui-snapshot.ts`; not in taxonomy |
| 26 | studio-reveal-map-control | SUPERSEDED (flow) | D9: explore/reveal is taxonomy-owned; studio button glue needs rewiring |
| 27 | river-lake-expedition-frame | DOCS-ONLY | Expedition frame + temporary AGENTS.md notice (remove at fold) |
| 28 | map-rivers-endpoint-floor | KEEP | Navigable endpoint floor enforcement |
| 29 | hydrology-river-benchmark-summary | KEEP | Benchmark summary in metrics op |
| 30 | hydrology-summary-diagnostics | KEEP | Earth-metrics diagnostics exposure |
| 31 | hydrology-benchmark-contract-docs | DOCS-ONLY (keep) | Documents kept metrics work |
| 32 | studio-river-lake-proof-inspector | KEEP | New Studio river/lake/floodplain inspector + riverDensity config migration |
| 33 | map-rivers-native-modeling-policy | KEEP | Adapter-owned `TerrainBuilder.modelRivers` (the settled design) |
| 34 | river-native-object-proof | KEEP | `getCiv7NativeRiverObjects` native readback (+134 lines `play/map/reads.ts`); not in taxonomy |
| 35 | studio-river-materialization-proof | KEEP | Run-in-Game gating on materialization content proof |
| 36 | native-river-plot-binding-proof | KEEP (capability) | Bounded plot membership in native readback; proof-script part droppable |
| 37 | river-visible-camera-capture-proof | SUPERSEDED | D13: camera atom ported verbatim to taxonomy `play/view/camera.ts` + `view.camera.focus` |
| 38 | river-visible-run-identity-disposition | PROOF-ONLY | Run-identity binding in proof script |
| 39 | studio-stage-step-shutters | DOCS-ONLY | Spec text only |
| 40 | direct-control-native-screenshot-capture | SUPERSEDED | D12/D13: dead `XR.World.takeScreenshot`; replaced by SCK `view.appshot.capture` |
| 41 | river-visible-direct-control-runner | PROOF-ONLY | Runs proof through superseded capture path |
| 42 | 06-10-test_rivers_block_stale_swooper_live_verification | PROOF-ONLY (lean keep) | `verify-studio-run-in-game-live.*` staleness guard; no superseded imports detected |
| 43 | 06-10-fix_mapgen_protect_river_tiles_from_resource_placement | KEEP | River tiles protected from resource placement (pure mapgen fix; oracle re-expresses it post-placement) |
| 44 | 06-10-fix_rivers_follow_terminal-anchored_hydrology_trunks | KEEP | Terminal-anchored trunk selection fix |
| 45 | rivers-authored-materialization | KEEP | Preserves authored river materialization (native-writer decision recorded) |
| 46 | studio-explore-map-visibility | SUPERSEDED (flow) | D9: rivers explore "leaks visibility refcounts"; D5 moved `game visibility` → `game map visibility` |
| 47 | map-rivers-native-modeling-restored | KEEP | Final restore of native modelRivers boundary |
| 48 | river-modeling-proof-ledger | DOCS-ONLY (keep) | Documents kept native-modeling decision taxonomy |
| 49 | native-minor-river-parity-proof | KEEP | Minor-river parity diagnostics in live-parity |
| 50 | camera-proof-center-match | SUPERSEDED | D13 names `centerMatchesTarget` as ported into `view.camera.focus` |
| 51 | civ-appshot-proof-capture | SUPERSEDED | D12: whole-display `screencapture -x` appshot "superseded outright" |
| 52 | map-proof-capture-procedures | SUPERSEDED | D12/D13: CLI `game camera/screenshot/appshot` → `game view camera/appshot` |
| 53 | hydrology-benchmark-seed-rows | KEEP | Seed-row regression tests for kept metrics op |
| 54 | studio-water-proof-availability | KEEP | Inspector correctness (water layers ≠ proof) |
| 55 | studio-lake-floodplain-proof-rows | KEEP | Lake/floodplain proof rows + ecology step counters |
| 56 | floodplain-active-proof-gate | KEEP | Floodplain-active readback gate in diagnostics |
| 57 | lake-exact-proof-counters | KEEP | Exact lake counters from placement boundary into run-in-game proof |
| 58 | river-visible-negative-controls | PROOF-ONLY | Negative controls in proof script |
| 59 | world-visual-proof-endpoints | SUPERSEDED | D10/D12/D13: orchestration homed in taxonomy `view`/`display` oRPC modules |
| 60 | studio-visual-proof-orpc-coverage | SUPERSEDED | Tests for superseded world visual endpoints |
| 61 | live-river-debug-evidence-ledger | DOCS-ONLY (drop) | Records evidence from superseded proof runs |
| 62 | studio-water-mask-presentation | KEEP | Water-mask presentation metadata in kept inspector |
| 63 | river-metadata-readback-capability | KEEP | Adapter river-metadata readback capability hardening |
| 64 | river-native-materialization-doc-realignment | DOCS-ONLY (keep) | Realigns canonical mapgen docs with kept end-state |

**KEEP inventory (unique surviving value):**
1. Hydrology river/lake algorithm recovery (crown jewels): `compute-drainage-routing`, `select-navigable-river-terrain`, `compute-river-network-metrics`, trunk coherence, terminal-anchored selection, endpoint floor, knob cleanup, river-tile resource protection, lake/floodplain counters — `mods/mod-swooper-maps/src/domain/hydrology/ops/*`, `src/recipes/standard/stages/{hydrology-hydrography,map-rivers,placement,ecology-features}/*`, regenerated map configs.
2. Native river materialization boundary: adapter-owned `TerrainBuilder.modelRivers`, writer-boundary corrections, metadata readback — `packages/civ7-adapter/*`, `packages/civ7-map-policy/src/river-constants.ts`, `river-type-metadata.source.ts`, `packages/civ7-types/generated/river-types.gen.d.ts`, `plotRivers.ts`.
3. Studio-server restoration: `packages/studio-server` (oRPC/Effect package, 20 files) + studio `/rpc` mount + deploy plumbing; run-in-game materialization/lake proof gating.
4. Studio river/lake proof inspector: `apps/mapgen-studio/src/features/viz/riverLakeInspector.ts`, `ui/components/ExplorePanel.tsx`, config migration.
5. Direct-control native readbacks: `getCiv7NativeRiverObjects` (+ plot membership), `activeInputContext`.
6. Live-parity diagnostics: minor-river parity, floodplain gate, lake counters in `mods/mod-swooper-maps/src/dev/diagnostics/`.

**Fold plan (64 → 6 survivors, top-down `gt branch fold`):**

| Survivor | Constituents | Strip during fold/restack |
|---|---|---|
| `rivers-hydrology-core` | #1–#22 | openspec planning + 2 proof scripts (optional one cleanup commit) |
| `studio-server-restoration` | #23–#26 | #26's reveal flow (D9) |
| `rivers-benchmarks-and-inspector` | #27–#33 | #27's temporary AGENTS.md notice |
| `native-river-proof-capability` | #34–#36 | proof-script halves |
| ~~superseded-capture-cluster~~ | #37–#42 | **DROP wholesale** except #42's small live-verification script (cherry-pick into survivor 6) |
| `rivers-final-fixes-and-closure` | #43–#64 | #46, #50–#52, #59–#60 (superseded), #61 |

**Conflict outlook:** vs main ≈ zero. Vs taxonomy (file-level, keep-set): `packages/civ7-direct-control/src/index.ts` (re-add native-readback exports to taxonomy's rewritten index), `test/map-and-visibility.test.ts`, `test/runtime-and-catalog.test.ts`. `.civ7/outputs/resources` gitlink is convergent (both leaves at `fbc38ef8`). **Semantic rewiring required:** kept `packages/studio-server/src/contract/live.ts` + `Civ7TunerClient.ts` + studio AppFooter currently call the superseded rivers flows — re-point to `display.explore.request` / `view.appshot.capture` / `view.camera.focus` or disable at restack.

### 3.3 Taxonomy stack (mine) — DRAIN ON REVIEW

8 branches, PRs #1576–#1586 (draft), restacked on main, gates green (424/345/234). Footprint: `packages/civ7-direct-control`, `packages/civ7-control-orpc`, `packages/cli` (72 files). Zero overlap with placement, studio, dag-viz.

### 3.4 Dag-viz (`codex/mapgen-recipe-dag-visualization`, 5 branches) — RESTACK + DRAIN (domino 4)

Recipe DAG visualization for MapGen Studio: full-screen DAG tab (phase lanes, dependency-ranked layout, stage nodes/step shelves, artifact edges + chips, domain icon taxonomy, diagnostics), authoring DAG projection exposed via a Studio-local effect-oRPC service. Paths: `apps/mapgen-studio/src/features/recipeDag/*` (5), `src/server/recipeDag/*` (6), `src/shared/recipeDagOrpc.ts`, chrome touches (`App.tsx` +105, `AppHeader.tsx`, `ViewControls.tsx`, `ui/constants/layout.ts`), `packages/mapgen-core/src/authoring/recipe-dag.ts` (public projection), 5 test files.

- Based on `4feff5c63` (current main minus the drain-skill commits). Self-contained, feature-complete, 5 linear commits.
- **Restack caveat:** the root branch carries its own copy of the 15 `.agents/skills/graphite-stack-drain/*` files that main has since merged (#1581) — expect those hunks to drop as patch-equivalent or conflict trivially (resolution: take main's version).
- Overlap with studio redesign: 7 files; the only structural one is `App.tsx` (redesign deletes the ~3,000-line monolith the DAG integration hooks into). **Approved ordering: dag-viz drains first**; the redesign lane reconciles by mounting the DAG client in its decomposed shell at its own restack (bounded work, see §6).

### 3.5 Studio redesign (`design/mapgen-studio-redesign`, 36) — OWNER LANE, UNTOUCHED

Base is at main HEAD (0 behind). 249-file footprint: 119 in `apps/mapgen-studio` + `packages/studio-server`, 130 outside (111 openspec, 16 docs, bun.lock, 2 config). External collisions: **bun.lock vs rivers only**; zero vs taxonomy, zero vs main drift. Side branch `codex/sieve-engine-reference` is docs-only (1 file) — merge in domino 1.

### 3.6 Lineage-audit (`codex/stack-lineage-audit-reference`, 73 branches) — DROP WHOLESALE

Verified visualizer-only: 17 commits, 89 files — 54 openspec `gt-stack-inspect-*`, 21 `tools/gt-stack-inspect/*`, 14 `docs/projects/graphite-stack-integration/*`; **zero** files under `packages/`, `apps/`, or `mods/`. Safe to discard as a unit. (Operator pre-approved dropping; investigation confirmed no semantic exceptions.)

### 3.7 Loose roots

- `codex/graphite-stack-drain-skill`: 0 ahead / 1 behind main (merged as #1581) → prune.
- `restore-civ7-orpc-skill`: 1 commit, restores `.agents/skills/civ7-orpc-control-architecture/` (7 files, 491 lines) — **not on main** (verified against main's skill tree) → drain in domino 1.

## 4. Defaults applied (operator's standing principles; flagged, not asked)

- `verify-river-visible-proof` harness (#6/#17/#38/#41/#58): binds to superseded capture APIs → **drop**; its proof design (run-identity binding, negative controls) is recorded here for the later cherry-pick pass. "Dead code is dead code."
- Executed openspec workstream records → **keep as history**.
- Rivers' Studio explore/reveal buttons (#26/#46) → drop the superseded implementation; rebuild on taxonomy endpoints later if the capability is wanted.

## 5. Salvage notes & open items

1. **Oracle unique bits** (`placement-live-integration`): (a) merged-tree conflict resolutions — river-tile resource exclusion re-expressed through the new `domain/resources` demand pipeline + policy-generator `riverTypes` extension + test re-pins; (b) 30s timeout bump to `hydrology-river-network-metrics.test.ts`. Consume both during the rivers restack (domino 5); only then retire the oracle + `wt-placement-live-proof`.
2. **`verify-studio-run-in-game-live.ts` (#42/#45):** imports look clean of superseded APIs, but verify every symbol survives the taxonomy `index.ts` rewrite before keeping.
3. **`probe-river-writer.*` / `verify-final-surface-parity.*`:** leans KEEP (consumes kept native readback); needs a line-level superseded-API check at rivers restack.
4. Post-merge: open OpenSpec records cite purged /tmp evidence — regenerate if challenged (producers are committed).
5. Later (operator-deferred): rivers cherry-pick evaluation after drain; taxonomy PR review/merge.

## 6. Dag-viz → Studio-redesign handoff (domino 4 — EXECUTED 2026-06-12)

The dag-viz stack restacked onto main conflict-free (the anticipated `.agents/skills/graphite-stack-drain/*` overlap turned out not to exist in the stack's diff — 5 commits, 38 files, all product code) and drained via the skill loop as PRs **#1587–#1591**. Gates at merge: typecheck 34/34, mapgen-core 103/103, mapgen-studio 164/164.

**Handoff spec: [`DAG-STUDIO-REDESIGN-HANDOFF.md`](./DAG-STUDIO-REDESIGN-HANDOFF.md)** (this directory). It gives the studio redesign agent: the merged footprint table with per-layer dispositions (preserve vs re-express), the six semantic invariants (projection contract, server boundary, layout, domain taxonomy, artifact labels, interaction semantics), what to rebuild in redesign language (the tab/chrome — not a port), and the mechanical restack guidance (7 colliding files, materially only `App.tsx`; re-mount the DAG client inside the decomposed shell; test-gate expectations).
