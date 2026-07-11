# Deferrals

> Intentionally deferred work and technical debt.

---

## Format

Each deferral follows this structure:

```
## DEF-XXX: Title

**Deferred:** YYYY-MM-DD
**Trigger:** When should this be revisited?
**Context:** Why was this deferred?
**Scope:** What work is involved?
**Impact:** What are we living with?
```

---

## Active Deferrals

## DEF-001: Engine Elevation vs. Physics Heightfield Alignment

**Deferred:** 2025-12-08
**Trigger:** Next major mapgen engine refactor or post–TS-migration remediation hardening
**Context:** The Civ7 engine derives elevation internally via `TerrainBuilder.buildElevation()` using its own fractal fields and terrain tags. Our plate/physics `WorldModel` maintains a richer heightfield that cannot be pushed 1:1 into the engine (no `setElevation` API). During TS migration remediation we adopted a conservative hybrid model: physics drives macro structure; Civ fractals + `buildElevation()` provide micro-variation.
**Scope:** 
- Explore a physics-first pipeline that maps our height buckets directly to terrain (land/ocean/mountain/hill) with minimal or no use of engine fractals, then calls `buildElevation()` once.
- Alternatively, more tightly couple fractal usage to our heightfield (e.g., derive fractal thresholds/grain from physics statistics) while keeping the adapter boundary clean.
- Compare aesthetics, performance, and complexity against the current hybrid approach; update contracts/docs if we standardize on a new pattern.
**Impact:** 
- Today, engine elevation and cliffs remain a lossy derivative of our terrain layout and engine-side fractals; our internal heightfield is used for physics/story only.
- There is conceptual divergence between “true” physics elevation and what the player sees in-game.
- Addressing this will likely require coordinated changes across `@swooper/mapgen-core`, the Civ7 adapter, and docs, so we are explicitly deferring it beyond the current remediation milestone.

---

The DEF-004…DEF-014 family is owned by the placement-realignment project
(`docs/projects/placement-realignment/`; slice evidence under `evidence/`,
live-proof runbook in `MILESTONE-PROOFS.md`).

## DEF-004: Retire the declared post-maintenance terrain readback in wonder planning

**Deferred:** 2026-06-10
**Trigger:** An artifact carrying the post-maintenance terrain surface exists (e.g. a features-apply boundary snapshot), OR Milestone B live parity shows drift inside the readback window.
**Context:** `validateAndFixTerrain` runs inside the features projection step with engine-only terrain side effects, so no artifact carries the post-maintenance terrain surface; `derive-placement-inputs` keeps one DECLARED engine terrain readback (ADR-009 declared-read clause). Owner: placement-realignment (S6 decision log, `openspec/changes/placement-realignment-s6-hygiene/proposal.md`).
**Scope:** Publish a post-maintenance terrain artifact at the features projection boundary; switch wonder planning to consume it; delete `readDeclaredEngineTerrainSurface`.
**Impact:** One declared engine-surface read remains in planning inputs; offline reconstruction of wonder plans depends on mock maintenance matching live maintenance (Milestone B measures the drift window).

## DEF-005: Route `resolveActiveResourceAge` GameInfo read through the adapter

**Deferred:** 2026-06-10
**Trigger:** The next adapter-surface change that touches `domain/resources` policy signatures, or any new direct GameInfo/Database read proposed in the domain layer.
**Context:** S6 removed `globalThis.GameInfo` from the recipe layer via `EngineAdapter.getResourceCatalog()`, but `resolveActiveResourceAge` (`domain/resources/policy/initial-map-authoring.ts`) still reads `globalThis.Game/GameInfo.Ages` with a safe offline default (AGE_ANTIQUITY); routing it would change a domain-policy signature chain beyond the cited S6 scope. Owner: placement-realignment (S6 decision log).
**Scope:** Add an adapter age-read surface; thread it through the resource planning entry points; delete the globalThis access.
**Impact:** One domain-layer engine global read remains; offline behavior is correct by default, but live age resolution bypasses the adapter boundary.

## DEF-006: First-class viz emitted-key registry

**Deferred:** 2026-06-10
**Trigger:** A second stage needs emitted-key coverage guarding, or a new placement step is added (the coverage test's step table is manual and a new step would otherwise rely on review to be noticed).
**Context:** S7's stretch goal — a `packages/mapgen-viz` registry asserting that emitted dataTypeKeys are declared — is cross-package API design beyond a slice; the shipped guard is `mods/mod-swooper-maps/test/placement/viz-coverage.test.ts` (per-step expected key sets). Owner: placement-realignment (S7 decision log).
**Scope:** Design a declaration surface for dataTypeKeys in `@swooper/mapgen-viz`; wire emit sites + studio overlay suggestions to it; generalize the coverage check across stages.
**Impact:** Viz coverage for stages other than placement can silently drift; placement itself is pinned by test.

## DEF-007: Upstream pedology fertility contrast (E1.4 ceiling)

**Deferred:** 2026-06-10
**Trigger:** Any pedology/ecology workstream that changes the land fertility distribution; re-derive the E1.4 fertility-oracle ceiling and revisit the amended gate then.
**Context:** The predeclared E1.4 start-fertility gate (1.3× land mean) exceeds the map family's carrying capacity — a fertility-ONLY oracle reaches only ≈1.29× mean — so the gate was amended to ≥1.05 with direction UP (S4 evidence, `evidence/s4-results-2026-06-10.md`). The widening lever (pedology fertility contrast) is outside the placement write set. Owner: placement-realignment.
**Scope:** Widen upstream fertility contrast; re-run the fertility oracle + the 20-seed E1.4 window; amend `expectations.md` upward by recorded evidence.
**Impact:** Start fertility discrimination is bounded by today's flat fertility field (achieved 1.136 vs the original 1.3 aspiration).

## DEF-008: Engine landMask layer default visibility

**Deferred:** 2026-06-10
**Trigger:** Milestone B interactive studio visual QA (browser review of the placement layer set).
**Context:** The audit flagged the terminal step's default-visible engine landMask layer as a plausible "doesn't belong" candidate; S7 kept it (it is the step's only product surface — engine parity evidence) with the new waterDrift grid debug-gated next to it. Demotion is a presentation call requiring eyes on the browser. Owner: placement-realignment (S7 decision log).
**Scope:** Decide keep/demote-to-debug during visual QA; adjust visibility metadata + viz-coverage expectations.
**Impact:** One arguably-redundant default-visible layer in the placement group.

## DEF-009: RESOURCE_SILVER tile budget (E2.7 structural exception)

**Deferred:** 2026-06-10
**Trigger:** Milestone A's E4.4 mock-vs-live legality measurement (live legality may admit more silver tiles than the mock emulation), or an upstream change to tundra biome coverage, or a corpus `expectedCountRange` amendment.
**Context:** Silver's `Resource_ValidPlacements` rows are tundra-bound and the standard mock map yields only 16 legal tiles against a [16,18,20] expected range with spacing floor 3 — a typed `spacing-floor-preserved` shortfall on 4 of 5 seeds (S3 evidence, recorded not faked). Owner: placement-realignment.
**Scope:** Choose among: upstream ecology tundra coverage, corpus range recalibration by amendment, or accepting live legality divergence once measured.
**Impact:** E2.7 sits at 33/34 types in range with a recorded shortfall instead of 100%.
**Trigger fired (2026-06-11):** Milestone A3 measured live-legal SILVER tiles full-grid: 112 (ignoreWeight=true) / 88 (=false) vs the mock's 16 — the E2.7 exception is a MOCK-EMULATION artifact, not a map shortage. Disposition: calibrate the mock silver (and marine — WHALES/CRABS were the other strict lanes) legality emulation against the A3 disagreement classes, then re-run the E2.7 gate. Evidence: `docs/projects/placement-realignment/evidence/live-legality-agreement.json` + `milestone-a-2026-06-11.md` A3.

## DEF-010: Hemisphere split derived from landmass capacity on single-continent maps

**Deferred:** 2026-06-10
**Trigger:** Milestone A's alive-major/seating probe (D3) results, or recurring `region-reassigned` degradations on single-continent seeds in evidence windows.
**Context:** Config-driven west/east seat splits degenerate when a map generates one continent (seed 1348: east region = 21 land tiles, zero candidates); seats are region-reassigned loudly today. Deriving the split from actual landmass capacity is a seating-policy change that should follow the live id-semantics probe. Owner: placement-realignment (S4 decision log).
**Scope:** Capacity-aware split policy in `plan-starts` seat identity/region assignment; expectations note for the E1.7 measurement frame.
**Impact:** Single-continent maps seat everyone on one region via recorded degradations rather than a planned split.
**Trigger evidence (2026-06-11):** Milestone A5/A7 — live alive-major ids are contiguous-from-zero, human first; live HUGE advertises 6/6 landmass slots while a 10-player game has 10 alive, so the pipeline seats 12 with 2 inert flagged `slot-index` surplus seats. Capacity/alive-aware seat count (`min(slots, alive)`) is the recorded correction; see `milestone-a-2026-06-11-a7-seat-parity.md`.

## DEF-011: Official resources submodule refresh (D4)

**Deferred:** 2026-06-10
**Trigger:** Access to a machine with the Civ7 game install (`bun run refresh:data`); rerun `nx run civ7-map-policy:verify -- --write` and `nx run civ7-map-policy:verify`, then re-prove byte-stability/diffs immediately after.
**Context:** The `.civ7/outputs/resources` snapshot dates to 2026-01-24; all S2 policy tables ground against it and say so in their generated headers. Refresh requires the game install, which the workstream environment lacks. Owner: placement-realignment (refactor-plan D4, user dependency).
**Scope:** Refresh submodule; regenerate tables; disposition any new/changed rows (the generator fails loudly on new DLC resource types); rerun placement gates.
**Impact:** Policy data may lag official patches; any balance changes since 2026-01-24 are invisible to planning.
**Resolved (2026-07-15):** The resources gitlink is now `c9f612ba19242a4add63acf9e5a344178898b725`; `civ7-map-policy:verify -- --write` adopted its four new Heian/Sengoku start-bias rows, and the subsequent verify, typecheck, test, and build graph passed. Generated provenance now records the exact submodule commit rather than a redundant snapshot date.

## DEF-012: DLC resource balancing

**Deferred:** 2026-06-10
**Trigger:** A submodule refresh introducing DLC `<Resources>` rows (the S2 generator halts loudly on them), or an explicit scope decision to balance DLC-specific resources.
**Context:** Today's DLC files add no new resource types (only 7 required-leader rows, which ARE tabled); declared OUT of the placement-realignment workstream by refactor-plan D5 so absence is a decision, not a gap. Owner: placement-realignment.
**Scope:** Index assignment for new DLC resources, corpus `expectedCountRange` rows, habitat-lane assignments, policy-table extension.
**Impact:** None today; future DLC data halts table generation until decided.

## DEF-013: Independent peoples / minor placements

**Deferred:** 2026-06-10
**Trigger:** A feature request or workstream covering independent-peoples/minor-civ placement, or live evidence that major-start quality is degraded by engine-side minor placement interacting with our seats.
**Context:** Declared OUT of the placement-realignment workstream by refactor-plan D5; the placement stage neither plans nor constrains minor placements (the engine's own pass runs untouched). Owner: placement-realignment.
**Scope:** Decide whether minors become a planned product step (plan + typed stamp like majors) or stay engine-owned with declared evidence readbacks.
**Impact:** Minor placements are invisible to the placement plan and to studio viz.

## DEF-014: Map-size scaling curves for placement knobs

**Deferred:** 2026-06-10
**Trigger:** Supporting a non-standard map size with verified expectation gates (the 20-seed windows currently run at standard 84x54 only).
**Context:** Declared OUT by refactor-plan D5. Official start buffers (6/12) are FIXED constants with no official map-size scaling (review finding P2); any scaling is a repo extension that needs its own recorded knob, and resource counts already scale via `MapResourceMinimumAmountModifier` per-size rows. Owner: placement-realignment.
**Scope:** Decide which knobs scale with map area (spacing, support radius, density), add declared scaling knobs, predeclare per-size expectation ranges, extend the metrics harness windows.
**Impact:** Non-standard sizes run with standard-tuned defaults and unverified gate behavior.

## DEF-015: Studio Civ7 restart recovery affordance

**Deferred:** 2026-06-13
**Trigger:** The next MapGen Studio recovery/UX slice that surfaces daemon health or tuner wedge state to the operator.
**Context:** The runtime simplification program made tuner wedge state observable through the daemon's shared `Civ7TunerSession` health (`wedgeSuspected`, gate state, consecutive response timeouts). S4.1 closed the ownership invariant by keeping Studio session construction restricted to the shared daemon service and the direct-control package per-flow wrapper; adding a "Restart Civ7" UI/action affordance is a product interaction decision, not part of the runtime ownership closeout. Owner: MapGen Studio product/runtime.
**Scope:** Design the operator-facing recovery surface, decide whether restart is a button, guided action, or linked run flow, wire it to the existing direct-control restart capability, and prove it against tuner-wedged and game-not-running states.
**Impact:** Studio can report wedge suspicion, but it does not yet give the operator a first-class one-click recovery affordance from that health signal.

## DEF-016: Nx parallel task race around shared build outputs

**Deferred:** 2026-06-25
**Trigger:** Before relying on broad `nx run-many -t habitat:check` or other multi-project Habitat/Nx proof commands as authoritative CI gates; also before expanding Habitat owner targets that share build dependencies.
**Context:** During the embedded authority migration proof, broad and parallel Nx runs repeatedly surfaced flaky behavior around shared build/output-producing tasks, including `control-direct:build-bundle` being reported as flaky and earlier Habitat CLI build/output races. The slice-specific owner graph passed when run as one focused target set, but the broader graph still showed concurrency-sensitive behavior. This is not the primary embedded-authority concern, but it is a real task-graph correctness issue.
**Scope:**
- Audit tasks with shared mutable outputs, clean steps, generated manifests, and bundle outputs used by multiple downstream targets.
- Ensure output ownership is single-writer, and that dependent targets consume outputs through Nx dependencies rather than concurrent shell-level invocations.
- Revisit Habitat CLI build/manifest generation and direct-control bundle tasks for cache/output isolation.
- Add a targeted proof command that demonstrates the broad Habitat/Nx graph is stable without relying on incidental serial execution.
**Impact:**
- Broad multi-project Nx proofs can produce flaky failures unrelated to the authority being tested.
- Reviewers cannot treat full-suite `habitat:check` graph failures as clean signal until this is resolved.
- For now, use focused owner-target proof commands for Habitat migration slices and record broad-run failures separately when they hit known graph debt.

## Project-scoped deferrals

Some deferrals are intentionally scoped to a specific project/milestone (e.g., Engine Refactor v1) rather than the whole system. Keep those in the project’s deferrals doc:

- Engine Refactor v1: `docs/projects/engine-refactor-v1/deferrals.md`

## Resolved Deferrals

*Move resolved deferrals here with resolution notes.*

## DEF-002: Runtime-loadable recipes in the browser (no rebuild required)

**Deferred:** 2026-01-31
**Trigger:** When we need “drop in a recipe” workflows (OPFS/drag-and-drop), third-party recipe distribution, or we have enough recipes that bundling them all becomes a startup/bundle-size problem.
**Context:** V0.x runner intentionally bundles recipes as TS/ESM modules in the worker. This is the simplest, most reliable posture while we harden the worker protocol, viz ingest/store, and deck rendering. True runtime-loadable recipes require a different architecture (serialized recipe IR + interpreter, or dynamic module loading with tricky deployment constraints).
**Scope:**
- Define a serialized “recipe IR” that can be loaded from bytes/JSON.
- Implement a worker-side interpreter/runtime for that IR.
- Provide import UX (OPFS, drag-and-drop, URL import) and a trust/sandbox story.
**Impact:**
- Today, adding a recipe requires rebuilding the worker bundle.
- Studio remains “agnostic” at the API level, but not yet “runtime pluggable” without rebuild.

## DEF-003: SharedArrayBuffer + buffer pooling for zero-copy streaming

**Deferred:** 2026-01-31
**Trigger:** If baseline perf shows buffer copying/transfer and GC are primary bottlenecks, and we can deploy Studio with cross-origin isolation (COOP/COEP) reliably.
**Context:** Transferables already give no-copy handoff per message, but we still allocate and/or clone buffers in several places to avoid detaching producer-owned memory. A pooled SAB-backed ring buffer could reduce allocations and latency, but it introduces deployment constraints and concurrency complexity.
**Scope:**
- Ensure cross-origin isolation in deployment (COOP/COEP), plus diagnostics.
- Introduce SAB-backed buffer pools (or ring buffers) for high-volume layer streams.
- Redesign message protocol to pass offsets/lengths instead of full buffers.
**Impact:**
- Today, large payloads may incur extra copies and allocation churn (worker clone + main upload), especially for frequently updated layers.
- We retain maximum browser compatibility and simplest deployment posture for now.

## DEF-017: Upstream design-sync token classifier over-captures Tailwind v4 internals

> Numbering note: this is the ROOT ledger's DEF-017. The engine-refactor-v1
> project ledger (`docs/projects/engine-refactor-v1/deferrals.md`) has its own,
> unrelated DEF-017 — qualify the ledger when citing this entry.

**Deferred:** 2026-07-08
**Trigger:** A new Claude Code / design-sync skill version (binary-grep for `@kind` or a token-classification/metadata surface); any claude.ai/design changelog touching `check_design_system` token classification. (A third trigger — the post-upload `tokenKinds` falsifier for Step A of the value-form migration — FIRED CONFIRMED 2026-07-08; see the outcome note in Context.)
**Context:** `check_design_system` in the MapGen Studio DS project permanently reports ~80 "unclassified tokens" and 33 "selector-scoped custom properties" — all Tailwind v4 engine internals in the compiled bundle. The classifier is app-side (the claude.ai/design self-check that regenerates `_adherence.oxlintrc.json`); no repo-side surface exists to fix or suppress it (verified: no token classifier in the bundled converter, no `@kind` annotation support anywhere in CC v2.1.197). Feedback packet: `openspec/changes/archive/2026-07-08-studio-ui-token-noise-disposition/workstream/upstream-feedback.md`. **Value-form update (2026-07-08):** the sibling change `studio-ui-token-value-form` modernizes the authored token dialect to full color-function values consumed as `var(--token)` (full `hsl(…)` in that Step A change; re-authored to oklch by the follow-on `studio-ui-token-oklch` Step B — an exact pixel-preserving conversion, still a full color function), which **moots upstream-feedback item 2** (recognize the shadcn HSL-triplet color pattern) — there are no more triplets to recognize, and the classifier already handles full color functions (`#000` classifies today). Findings #1 (unclassified `--tw-*`/`@theme` defaults) and #2 (selector-scoped custom properties), plus feedback items 1/3/4, are **unchanged** — still app-side framework noise this deferral covers; only item 2 retires. **Step A falsifier outcome (2026-07-08, post-HSL-upload check run):** CONFIRMED — sampled authored semantic tokens (`--background`, `--primary`, `--accent`, `--destructive`, `--border`) classify `"color"` in the regenerated `x-omelette.tokenKinds` (all were `"other"` before Step A); the full-HSL value-form hypothesis holds. **Step B falsifier outcome (2026-07-10, post-OKLCH-upload check run):** CONFIRMED — the same authored semantic surface continues to classify `"color"`; the `hsl(…)` to `oklch(…)` value-form conversion is classifier-neutral. Residual `tokenKinds` mislabels are confined to `--tw-*` utility internals (e.g. `--tw-translate-y`, `--tw-rotate-*`, `--tw-backdrop-*` tagged `"color"`) — in-scope of this deferral's framework-noise disposition; no separate action.
**Scope:** Deliver the feedback packet to the design-sync/claude.ai-design maintainers; when a classifier fix or a project-supplied classification input ships, re-sync and confirm the findings clear, then retire the noise-disposition sections in `packages/mapgen-studio-ui/docs/design-tokens.md` and `.design-sync/NOTES.md`.
**Impact:** Design agents see two known-noise findings per check (dispositioned in the synced guidelines); the repo-owned token guard (`packages/mapgen-studio-ui/test/designTokens.test.ts`) carries the real signal meanwhile.
