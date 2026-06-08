# Phase Record: Swooper Stack Recovery Consolidation

## Status

Recovery consolidation is complete locally. The current accounting refresh is
committed and records durable-done, local-done, pending, and excluded branch
sets separately.

## Objective

Consolidate solved Swooper mapgen/Studio work onto the current stack, remove
stale duplicate paths, and keep unrelated stacks out of scope.

## Decisions

- Recover semantics, not commits.
- Keep MapGen as authoring authority and Civ7 policy as compliance/readback
  information.
- Remove unused policy code rather than preserve dead exports.
- Treat visible mountain-region failures and Studio deploy identity mismatches
  as open proof gaps even if current tests are green.
- Treat merged/represented branches as done, not parked. The parked set is only
  for actually pending or owner-held work.
- Keep PR/patch overlap diagnostics separate from sparse accounting moves.

## Accounting Refresh

- Merged aggregate PR `#1402` accounts for the resource/morphology/authoring
  predecessor train, including the local `resource-*` and `morphology-*`
  branches represented by closed shard PRs `#1414`-`#1419`.
- Merged PRs `#1407`-`#1413` account for the Studio/run-in-game range visible
  around `codex/live-play-online-context`; local `needs restack` there is stale
  metadata for this recovery accounting pass.
- The recovery stack locally accounts for the predecessor Swooper Earthlike,
  Studio setup/exact-authorship/final-surface, feature/resource, terrain-edge,
  natural-wonder proof, and final Earthlike floodplain source-boundary trains
  listed in `recovery-accounting-ledger.json`.
- `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` is now
  marked `done/adopt`; it is no longer parked or pending, though cleanup remains
  blocked until the recovery stack lands.
- The foundation architecture packet and systematic workstream skill support
  stacks are merged into `main` through PRs `#1422`-`#1425`; they are not parked
  and no longer need product-drain attention.
- The single-branch `agent-watch-civ7-live-play-reference-assembly` reference is
  patch-equivalent in `codex/local-catalog-enrichment`; it is superseded, not a
  separate merge target, and its local Graphite branch was deleted.
- The old source route's control/intelligence documentation train and hotseat
  leaf are now carried forward on the live-control stack, while the stale
  embedded oRPC architecture branch is explicitly superseded by
  `@civ7/control-orpc`.
- GT stack-inspect/toolkit is explicitly excluded from Swooper product recovery
  accounting.

## Verification Plan

- Focused package/stage tests for changed behavior.
- OpenSpec strict validation for each new changeset.
- `git diff --check`.
- Clean Graphite commit.

## Accounting Verification

- `recovery-accounting-ledger.json` validated against
  `AccountingMoveSchema`/`WorkSurfaceRowSchema` with 21 moves and 1 work row.
- `branch-accounting-composition.json`/`.md` now record the deterministic old
  source-route closure audit: 67 Graphite branches, 2 split points, 3 terminal
  leaves, 0 unaccounted branches, 0 stale anchor warnings, and branch-internal
  commit counts from recorded Graphite parent revisions.
- GT stack-inspect service-core tests passed after stack-slice label projection
  was added so branch/leaf labels are not hidden on aggregate endpoints.
- GT stack-inspect runner tests and TypeScript check passed for explicit
  `--accounting-ledger` ingestion.

## Local Cleanup Execution

- `gt sync` has no dry-run in the installed CLI and is not stack-scoped; global
  `gt sync --force` was not used.
- Confirmed PR `#1402` is merged and PRs `#1407`-`#1413` are merged through
  `gh pr view`.
- Deleted the local Graphite metadata/branches for the merged/represented
  resource train from `codex/resource-distribution-planning` through
  `codex/resource-runtime-proof`, plus
  `codex/morphology-live-readback-boundary`,
  `codex/morphology-peer-review-repairs`, and
  `codex/live-play-online-context`.
- `codex/local-catalog-enrichment` remains a live-play support branch needing
  restack after `codex/live-play-online-context` deletion. A narrow
  `gt restack --branch codex/local-catalog-enrichment --only` conflicted in
  live-play support docs and was aborted; resolving that belongs to the
  live-play/control lane, not Swooper cleanup.
- Removed the clean old Earthlike source worktree at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-civ7-map-policy-final-surface-parity`.
  The source branches remain cleanup-gated until the recovery sink lands.
- Deleted local Graphite metadata/branch
  `agent-watch-civ7-live-play-reference-assembly` after confirming its branch
  commit is patch-equivalent against `codex/local-catalog-enrichment`.
