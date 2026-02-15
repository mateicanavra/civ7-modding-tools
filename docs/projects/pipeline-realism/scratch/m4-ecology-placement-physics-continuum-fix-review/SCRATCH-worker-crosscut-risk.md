# Scratch — worker-crosscut-risk

- Session Start (ISO timestamp): 2026-02-15T03:05:57Z
- Owned scope: Cross-cutting audit across all `M4-T01..M4-T27` (PR comment coverage, runtime-vs-viz themes, supersedence chain consistency, architecture guardrail risks, triage proposals)
- Mini-plan (next 3-5 actions):
  1. Inventory all M4 task sections and branch/PR mappings from the review ledger.
  2. Verify PR comment coverage completeness and unresolved-thread signals across mapped PRs.
  3. Synthesize runtime-vs-viz mismatch themes and identify repeated risk patterns.
  4. Check supersedence chain consistency versus current Graphite branch ancestry.
  5. Produce guardrail-risk + triage recommendations and handoff summary.
- Open questions / blockers: Need to resolve whether any tasks are missing explicit PR mapping in the review doc; if absent, infer via adjacent review metadata and `gh pr list --head`.

## Live Notes
- Pending worker kickoff.
- Worktree confirmation:
  - `pwd -P` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git rev-parse --show-toplevel` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git branch --show-current` => `agent-TOMMY-m4-fix-bootstrap`

## Coverage Audit
- Task coverage is complete: `M4-T01..M4-T27` all have `## REVIEW <workBranch>` entries and review branch+review PR metadata.
- PR-context coverage is complete: `27/27` sections include `### PR Comment Context` and mapped upstream work PR (`#1223..#1267`).
- Live unresolved-thread checks are consistent with review statements for all `27/27` work PRs.
- Unresolved upstream PR threads currently present on `12/27` work PRs (`1223,1224,1225,1229,1230,1233,1235,1240,1258,1260,1261,1266`; `#1230` and `#1266` each have two unresolved threads).
- Human-vs-bot split: only `PR #1230` currently includes unresolved human-authored thread; remaining unresolved are `chatgpt-codex-connector`.
- Review-loop PRs (`#1268..#1294`) currently show `0` unresolved threads across the board.
- Coverage commands used:
  - `awk ... REVIEW-M4-ecology-placement-physics-continuum.md` (task/PR-context completeness).
  - `gh api graphql ... reviewThreads(first:100)` (live unresolved status per PR).

## Runtime-vs-Viz Themes
- Distribution across all tasks: `16/27 none observed`, `11/27 observed`.
- Recurrent observed themes:
  - **Lifecycle/cache parity drift** (`T16`, `T17`, `T19`, `T23`): stale area/water cache or post-stage ordering can desync runtime from projected truth.
  - **Viz metadata/category incompleteness** (`T08`, `T13`): runtime-valid placements/features can be absent from viz lookup/category surfaces.
  - **Score/occupancy semantic mismatch** (`T02`): scoring suitability and occupancy reservation can disagree.
  - **Fail-open invalid-state propagation** (`T18`): error logging without hard gate allows downstream generation on invalid state.
  - **Mitigation/observability without full elimination** (`T21`, `T24`, `T27`): mismatch channels are surfaced/contained but not fully eliminated.
- Cross-cut posture remains coherent with ADR language (“runtime truth authoritative”), but observed cases show where projection/diagnostic surfaces still need hard-gate enforcement.

## Supersedence Chain Notes
- Chain consistency is structurally intact: every reviewed work branch is an ancestor of `codex/prr-epp-s6-hardening-docs-tests` (`git merge-base --is-ancestor ...` true for all 27).
- Graphite stack ordering is contiguous from `codex/MAMBO-m3-002-...` up through `codex/prr-epp-s6-hardening-docs-tests` (`gt ls` inspection).
- Work-branch to upstream PR mapping is complete (`27/27` branches resolve with `gh pr list --head`).
- Risk to manage in fix phase: unresolved comments on lower branches persist even when descendants contain mitigation/fixes; supersedence proof is not automatically encoded in thread resolution.
- Highest attention unresolved clusters by count/severity signal:
  - `PR #1230` (2 unresolved; includes one human thread),
  - `PR #1266` (2 unresolved),
  - single unresolved threads on `#1223,#1224,#1225,#1229,#1233,#1235,#1240,#1258,#1260,#1261`.

## Architecture Guardrail Risks
- **Fail-hard boundary drift (highest risk):** ADR-003 requires fail-hard contract boundaries, but placement restamp failure path is still fail-open before resource stamping (`placement/apply.ts`).
- **Latent hydrology algorithm risk:** `plan-lakes` still mutates `lakeMask` in-pass for upstream expansion; default `maxUpstreamSteps=0` masks but does not remove nonzero-path risk.
- **Compatibility migration fragility:** unresolved review threads still flag map-ecology/plan-wonders key migration regressions and branch-local config drop risks.
- **Guardrail test gap:** strong static scans exist (`no-fudging`, `map-stamping contract guardrails`), but no dedicated invariant test currently enforces “restamp failure must halt/skip downstream placement.”
- **Runtime defaults coupling risk:** adapter discovery defaults remain hardcoded (`IMPROVEMENT_CAVE` + `BASIC`) and can diverge from active config semantics.
- **Viz robustness risk:** feature/viz category completeness and non-throwing lookup behavior remain a repeated regression vector in review feedback.
- Guardrail references:
  - `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`
  - `docs/system/mods/swooper-maps/architecture.md`
  - `docs/system/TESTING.md`
  - `mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts`
  - `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`

## Candidate Triage Items
- **P0:** Make landmass restamp failure fail-fast (or explicit downstream skip) in placement apply; add regression test forcing restamp throw and asserting no resource/start/discovery stamping.
- **P0:** Resolve nonzero upstream lake expansion semantics (frontier/snapshot pass) or hard-lock `maxUpstreamSteps` to sink-only mode until algorithm fix merges.
- **P1:** Add compatibility matrix tests for legacy/new config keys on map-ecology + plan-wonders surfaces; require explicit migration map or explicit hard error.
- **P1:** Replace hardcoded adapter discovery defaults with active-config/plan-driven mapping and add contract tests against placement plan payload.
- **P1:** Add a PR-thread supersedence ledger update pass: for each unresolved lower-branch thread, link exact downstream branch/PR/commit proving resolution and close thread (or mark deliberate defer).
- **P2:** Harden viz-category extraction to be runtime-safe/non-throwing for pre-existing engine features; add regression test for “runtime feature exists but viz category missing”.
- **P2:** Add a cross-cut audit check that reports unresolved thread counts split by `human` vs `automation` to avoid ambiguity in “no unresolved” statements.

## Handoff
- Audit status: complete for `M4-T01..M4-T27` on requested dimensions (coverage, runtime-vs-viz themes, supersedence chain, architecture guardrails, triage proposals).
- Immediate fix-phase hotspots: `T18` fail-open placement path, `T23/T24` upstream lake expansion semantics, `T26` compatibility/default-mapping regressions.
- No workflow blockers on read-only evidence collection; all checks run from dedicated TOMMY worktree.
- Validation caveat: this pass is evidence/audit-only and does not run full workspace tests (local workspace dependency linking remains required for full Bun test execution in this worktree).

## Continuation Start (2026-02-15T03:48:56Z)
- Session Start (ISO timestamp): 2026-02-15T03:48:56Z
- Owned scope: Remaining M4 fix-loop closure per frozen queue (19 tasks).
- Mini-plan (next 3-5 actions):
  1. Run absolute-path preflight and verify worktree/branch context.
  2. Re-check PR comments and classification for assigned remaining tasks.
  3. Execute assigned code-fix/disposition outcomes and capture evidence.
  4. Record runtime-vs-viz conclusion and recommended next action.
- Open questions / blockers: none at re-anchor.
- Guardrails: absolute paths only; no primary worktree edits; Graphite-only branch operations.
