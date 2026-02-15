# Worker E Scratch - 2026-02-15

## Start Marker
- Timestamp: 2026-02-15T18:30:00-08:00 (approx)
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-E-placement-discoveries-wonders-fix`
- Branch: `codex/agent-E-placement-discoveries-wonders-fix`
- Task: Fix blocking discovery placement failure; audit/fix wonders if analogous mismatch exists.

## Initial Plan
1. Confirm repo/worktree state and read routing docs (`AGENTS.md` in relevant subtrees).
2. Compare adapter-owned discovery constants/catalog with official Civ7 `discovery-generator.js` value domain/order/type assumptions.
3. Trace placement pipeline from derived inputs -> plan -> apply to find why `rejected=28` / `placed=0`.
4. Implement deterministic fix without runtime core constant pulls; keep full-stamp-or-fail posture and only deterministic rescue if strictly needed.
5. Audit natural wonders path for same category mismatch and patch only if concrete bug is found.
6. Add/update placement tests covering the regression and deterministic behavior.
7. Run required verification commands (`test/placement`, `check`) and any focused adapter tests if needed.
8. Commit with Graphite and submit draft stack update (`gt ss --draft --ai`).

## Ongoing Notes
- (pending)

- Progress: confirmed branch/worktree; only scratch dir changed.
- Loaded AGENTS routers (`/`, `packages/civ7-adapter`, `mods/mod-swooper-maps`, `mods/mod-swooper-maps/src`).
- Loaded placement and graphite skill references for workflow guardrails.
- Discovery investigation in progress; noted official discovery generator path exists in canonical repo path (not relative worktree `.civ7`).

## Findings (pre-implementation)
- Evidence: `Scripting.log` at 2026-02-15 18:25:15 shows `placement.discoveries` fail with `placed 0/28, rejected=28`.
- Discovery planner/apply pipeline is producing valid in-bounds plans; complete rejection points to value-domain mismatch at `MapConstructibles.addDiscovery(...)` inputs.
- Adapter currently ships signed manual discovery hash constants (negative numbers for several visual/activation ids).
- Adapter also has symbolic resolver (`resolvePlaceableDiscoveryCatalog`) that normalizes hashes via unsigned coercion (`>>> 0`), indicating engine-facing unsigned domain expectation.
- Root-cause hypothesis: signed catalog values are incompatible with engine addDiscovery expectations in this runtime; convert adapter-owned discovery catalog to canonical unsigned hash domain.
- Wonders audit: no parallel rejection evidence in log; natural wonder catalog aligns with current feature ordering in adapter/mock defaults, so no change planned unless tests indicate mismatch.

## Implementation Plan (active)
- Patch manual discovery catalog constants to canonical unsigned hash domain (`u32`) while keeping adapter-owned static constants.
- Ensure sanitization paths do not sign-coerce discovery ids (mock/apply test coverage).
- Add adapter tests proving unsigned + deterministic catalog/order and unsigned normalization behavior.
- Add placement regression asserting unsigned discovery ids survive apply stamping unchanged.
- Run required verification commands and capture snippets.

## Code Changes
- `packages/civ7-adapter/src/manual-catalogs/discoveries.ts`
  - Converted adapter-owned manual discovery hash constants from signed literals to canonical unsigned (`u32`) ids.
  - Preserved catalog ownership and deterministic ordering.
- `packages/civ7-adapter/src/mock-adapter.ts`
  - Updated discovery catalog sanitization to canonicalize via unsigned coercion (`>>> 0`) instead of signed coercion (`| 0`).
- `packages/civ7-adapter/test/discovery-constants.test.ts`
  - Added unsigned normalization test for signed hash inputs.
  - Added deterministic unsigned manual catalog assertions.
  - Added mock adapter sanitization regression to ensure unsigned ids are preserved.
- `mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts`
  - Added regression verifying unsigned discovery ids survive placement apply and are stamped unchanged.

## Wonders Audit
- Reviewed `packages/civ7-adapter/src/manual-catalogs/natural-wonders.ts` and wonder placement apply path.
- No analogous signed/unsigned catalog mismatch surfaced for natural wonders (feature ids are stable positive indices; existing wonder placement tests still pass).
- No wonders code change required for this fix scope.

## Verification Commands
- `bun run --cwd packages/civ7-adapter test`
  - Result: failed (`package.json` in `packages/civ7-adapter` has no `test` script).
- Fallback executed: `bun test packages/civ7-adapter/test`
  - Result: PASS (5/5).
- `bun run --cwd mods/mod-swooper-maps test -- test/placement`
  - Result: PASS (18/18).
- `bun run --cwd mods/mod-swooper-maps check`
  - Result: FAIL due pre-existing workspace type-resolution issue (`@swooper/mapgen-core` declaration resolution in this worktree environment).
  - Representative error: `TS7016: Could not find a declaration file for module '@swooper/mapgen-core/authoring'`.

## Root Cause (final)
- Discovery catalog ids were represented as signed hash literals in adapter-owned manual constants. This creates a value-domain mismatch risk at engine stamp boundaries and related sanitization paths.
- Fix normalizes adapter-owned discovery ids to canonical unsigned domain end-to-end and adds regression tests to lock deterministic behavior.
