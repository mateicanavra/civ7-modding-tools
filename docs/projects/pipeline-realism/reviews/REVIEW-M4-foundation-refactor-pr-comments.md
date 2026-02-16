# REVIEW — M4 Foundation Refactor PR Comments Audit (Stack Snapshot: 2026-02-16)

Scope: all PRs surfaced by `gt log` on 2026-02-16 (top-of-stack PR: #1340).

Dispositions:
- `fix_now`: should be addressed before we proceed with the next milestone “leg”
- `defer`: real finding, but not required to unblock the next leg
- `superseded`: already addressed by later slices / current stack tip makes it irrelevant
- `needs_design_decision`: requires an explicit decision before proceeding

## Fix-now queue (ranked)

### P1
- PR #1336 — `c2810006397` — Seed-matrix stats should use realized engine lake mask (not sink candidates). **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1331 — `c2808726105` — Guardrails script glob `-g "*/index.ts"` misses nested op indexes. **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1338 — `c2810146061` — Placement should read discovery/natural-wonder catalogs from the active adapter. **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1263 — `c2808102562` — Lane split scan should include `artifact:foundation.tileToCellIndex`. **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1263 — `c2808102564` — `rg` “no legacy” verification should be a negative assertion (`! rg ...`). **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1242 — `c2808099193` — Run plan should not hardcode user-specific worktree paths. **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.
- PR #1242 — `c2808099194` — Scratch/supporting docs under `docs/` should use lowercase filenames. **Status:** fixed in `codex/agent-ORCH-m4-reanchor-docs`.

### P2
- PR #1250 — `c2808098488` — Plateau reseeding hash gate degenerates when stride is 32 (potential striping). **Disposition:** `defer`.
- PR #1252 — `c2808098485` / `c2808098500` — Fallback mountain fill should exclude `score===0` when `mountainThreshold===0`. **Disposition:** `defer`.

## Automation comment policy (noise control)

Most PRs in this stack contain:
- a standard Graphite “merge as stack” warning comment, and/or
- GitHub Actions bot status comments.

These are treated as automation noise and are not reproduced verbatim below unless they contain actionable information.

---

## PR 1340 — fix(placement): convert discovery ids to unsigned domain to fix placement failures (branch `codex/agent-E-placement-discoveries-wonders-fix`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1338 — feat(placement): replace runtime discovery defaults with adapter-owned catalog (branch `codex/agent-D-placement-discovery-owned-catalog`)

### Raw comments
#### c2810146057
**[chatgpt-codex-connector[bot]]** packages/civ7-adapter/src/mock-adapter.ts:225 — Allow signed discovery hashes in mock catalog sanitizer.

#### c2810146061
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts:80 — Read placement catalogs from the active adapter.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2810146057 | `superseded` | Current stack tip sanitizes discovery ids as unsigned in `sanitizeDiscoveryCatalog` (no longer drops signed hashes). |
| c2810146061 | `fix_now` | Updated `buildPlacementInputs()` to call `context.adapter.getNaturalWonderCatalog()` / `getDiscoveryCatalog()` in `codex/agent-ORCH-m4-reanchor-docs`. |

---

## PR 1336 — fix(baseline): repair ecology anchors and foundation schema expectations (branch `codex/agent-C-baseline-check-test-fixes`)

### Raw comments
#### c2810006397
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/test/pipeline/seed-matrix-stats.test.ts:54 — Feed computeEarthMetrics actual lake coverage mask.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2810006397 | `fix_now` | Updated test to read `hydrologyHydrographyArtifacts.engineProjectionLakes.lakeMask` instead of `hydrography.sinkMask` in `codex/agent-ORCH-m4-reanchor-docs`. |

---

## PR 1335 — feat(placement): implement full-stamp-or-fail semantics with runtime resource candidates (branch `codex/agent-B-placement-s2-verification-docs`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1334 — feat(placement): add runtime resource type discovery and robust error handling (branch `codex/agent-A-placement-s1-runtime-hardening`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1333 — feat(maps): update earthlike map configuration with detailed tectonics and terrain settings (branch `codex/prr-m4-s06e-earthlike-studio-typegen-fix`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1332 — docs(pipeline-realism): record foundation architecture remediation audit trail (branch `codex/prr-m4-s06d-foundation-scratch-audit-ledger`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1337 — docs(pipeline-realism): record foundation architecture remediation audit trail (branch `codex/spike-ecology-placement-regression`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1331 — test(foundation): enforce local rules and anti-shim guardrails (branch `codex/prr-m4-s06c-foundation-guardrails-hardening`)

### Raw comments
#### c2808726105
**[chatgpt-codex-connector[bot]]** scripts/lint/lint-domain-refactor-guardrails.sh:270 — Match op index files with recursive glob.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808726105 | `fix_now` | Updated `-g "*/index.ts"` to `-g "**/index.ts"` in `codex/agent-ORCH-m4-reanchor-docs`. |

---

## PR 1330 — refactor(foundation): localize decomposed tectonics ops with local rules (branch `codex/prr-m4-s06b-foundation-tectonics-local-rules`)

### Raw comments
#### c2808730176
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:18 — Keep compute-tectonic-history callable until migrations land.

#### c2808730177
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:336 — Sanitize non-finite polar cap fractions before use.

#### c2809801335
**[mateicanavra]** mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:336 — Acknowledge non-finite guard and propose a fix.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808730176 | `superseded` | Current stack tip has no remaining consumers of `computeTectonicHistory.run(...)` (guarded by contract + tests) and uses decomposed rollups. |
| c2808730177 | `superseded` | Current `compute-plate-graph` includes non-finite guards for derived Y bounds. |
| c2809801335 | `superseded` | Follow-up note; no additional action required beyond the resolved guardrail. |

---

## PR 1329 — refactor(foundation): simplify stage surface to knobs-only authoring (branch `codex/prr-m4-s06a-foundation-knobs-surface`)

### Raw comments
#### c2808726052
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:22 — Preserve compatibility for legacy foundation keys.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808726052 | `superseded` | Earthlike + dev/test entrypoints no longer rely on legacy `foundation.*` keys; current preset shape is knobs-only + decomposed subtrees. |

---

## PR 1328 — test(guardrails): add S06 architecture scan suite (branch `codex/prr-m4-s06-test-rewrite-architecture-scans`)

### Raw comments
#### c2808724481
**[chatgpt-codex-connector[bot]]** .github/workflows/ci.yml:104 — Build mapgen-core before running architecture cutover tests.

#### c2808724486
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts:14 — Update topology lock expectation to split ecology stages.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808724481 | `defer` | If CI ever fails on missing `packages/mapgen-core/dist`, add an explicit build step; current stack status shows the scan suite is running in practice. |
| c2808724486 | `superseded` | `EXPECTED_STAGE_IDS` now includes split ecology stages. |

---

## PR 1327 — feat(ci): add strict core architecture gate (branch `codex/prr-m4-s05-ci-strict-core-gates`)

### Raw comments
#### c2808723139
**[chatgpt-codex-connector[bot]]** .github/workflows/ci.yml:104 — Do not enforce strict guardrail command that currently fails.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808723139 | `superseded` | Stack is currently green/mergeable; strict guardrail gate is intentionally on and no longer “baseline-failing”. |

---

## PR 1326 — feat(foundation): decompose tectonics mega-op into focused chain (branch `codex/prr-m4-s03-tectonics-op-decomposition`)

### Raw comments
#### c2808732144
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:108 — Use configured plate-motion strategy in era replay.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808732144 | `superseded` | Era replay path now calls `ops.computePlateMotion(..., config.computePlateMotion)` at stack tip. |

---

## PR 1325 — feat(foundation): remove dead knobs and enforce no-op-calls-op in tectonics (branch `codex/prr-m4-s02-contract-freeze-dead-knobs`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1263 — docs(m4): harden foundation execution pack and reviewer gates (branch `codex/agent-ORCH-foundation-domain-axe-execution`)

### Raw comments
#### c2808102562
**[chatgpt-codex-connector[bot]]** docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md:34 — Add `tileToCellIndex` to legacy artifact scan.

#### c2808102564
**[chatgpt-codex-connector[bot]]** docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md:49 — Invert ripgrep-based no-legacy verification.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808102562 | `fix_now` | Added `tileToCellIndex` to the legacy artifact scan regex in `codex/agent-ORCH-m4-reanchor-docs`. |
| c2808102564 | `fix_now` | Converted the legacy scan to `! rg ...` in `codex/agent-ORCH-m4-reanchor-docs`. |

---

## PR 1262 — docs(spike): integrate foundation domain axe research (branch `codex/agent-ORCH-foundation-domain-axe-spike`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1257 — fix(diagnostics): make mountain summary optional when layers are absent (branch `agent-SWANKO-PRR-s124-c01-fix-diag-analyze-mountains-guard`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1256 — fix(foundation): recompute plateMotion per era in tectonic history (branch `agent-SWANKO-PRR-s120-c01-fix-era-plateMotion-recompute`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1255 — fix(foundation): update computeTectonicHistory call sites to pass plateMotion (branch `agent-SWANKO-PRR-s119-c01-fix-pass-plateMotion`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1254 — fix(preflight): expand studio recipe artifact checks to include all outputs (branch `agent-SWANKO-PRR-s118-c01-fix-studio-artifacts-preflight`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1253 — fix(morphology): floor hill cap to enforce max fraction (branch `agent-SWANKO-PRR-s115-c01-fix-hill-cap-floor`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1252 — fix(morphology): honor mountainThreshold in ridge planning (branch `agent-SWANKO-PRR-s113-c01-fix-mountainThreshold-candidates`)

### Raw comments
#### c2808098485
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/strategies/default.ts:242 — Exclude zero-score tiles from fallback mountain fill.

#### c2808098500
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/strategies/default.ts:242 — Duplicate of c2808098485.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808098485 | `defer` | Low-risk improvement; consider when we next touch ridge planning / threshold semantics. |
| c2808098500 | `superseded` | Duplicate comment. |

---

## PR 1251 — fix(mountains): restore proportional driverStrength scaling (branch `agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1250 — fix(morphology): add plateau seeding for flat belt regions (branch `agent-SWANKO-PRR-s108-c01-fix-plateau-seeding`)

### Raw comments
#### c2808098488
**[chatgpt-codex-connector[bot]]** mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts:86 — Use a non-degenerate hash gate for plateau reseeding.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808098488 | `defer` | Potential quality improvement; do as a dedicated morphology-tuning slice to avoid stealth map output changes. |

---

## PR 1249 — fix(foundation): implement crust thickness evolution based on maturity (branch `agent-SWANKO-PRR-s101-c01-fix-crust-thickness-evolution`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1248 — fix(tectonic-history): replace FIFO queue with Dijkstra for correct era field distances (branch `agent-SWANKO-PRR-s98-c01-fix-era-fields-dijkstra`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1247 — fix(foundation): restrict polarity bootstrap to oceanic-oceanic convergence (branch `agent-SWANKO-PRR-s97-c01-fix-polarity-bootstrap-oceanic-only`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1246 — fix(morphology): prioritize constraint satisfaction in sea level selection (branch `agent-SWANKO-PRR-s94-c01-fix-sea-level-constraints-first`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1245 — fix(plate-motion): round fractional knobs before clampInt to avoid silent truncation (branch `agent-SWANKO-PRR-s93-c01-fix-round-clampint-knobs`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1244 — docs(pipeline-realism): update belt influence distance contract description (branch `agent-SWANKO-PRR-s11-c01-fix-belt-influence-distance-contract`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1243 — fix(foundation): cap reset threshold to era max in tectonic history (branch `agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

---

## PR 1242 — docs(pipeline-realism): add full-chain revalidation of PR review threads (branch `agent-SWANKO-PRR-ledger-review-full-chain`)

### Raw comments
#### c2808099193
**[chatgpt-codex-connector[bot]]** docs/projects/pipeline-realism/scratch/agent-SWANKO-prr-fix-loop/PLAN-agent-SWANKO-prr-fix-loop-2026-02-14.md:27 — Parameterize worktree path in the run plan.

#### c2808099194
**[chatgpt-codex-connector[bot]]** docs/projects/pipeline-realism/scratch/agent-SWANKO-prr-fix-loop/PLAN-agent-SWANKO-prr-fix-loop-2026-02-14.md:1 — Rename scratch docs to lowercase filenames.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| c2808099193 | `fix_now` | Replaced hardcoded absolute worktree path with `$WORKTREES_ROOT` placeholders. |
| c2808099194 | `fix_now` | Renamed scratch docs to lowercase filenames and updated references. |

---

## PR 1201 — docs(pipeline-realism): capture PRR stack review comments (branch `codex/prr-stack-pr-comments-ledger`)

### Raw comments
- No inline review comments found.

### Disposition table
| Comment | Disposition | Notes |
|---|---|---|
| (none) | `superseded` | No reviewer feedback to action. |

