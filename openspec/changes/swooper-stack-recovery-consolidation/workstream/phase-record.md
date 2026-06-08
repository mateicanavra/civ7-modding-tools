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
  and natural-wonder proof trains listed in `recovery-accounting-ledger.json`.
- `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` remains the
  only Swooper product source adoption still planned for this accounting pass.
- The systematic workstream skill slice remains planned as a separate support
  adoption to main, not as Swooper product work.
- Live-control and GT stack-inspect/toolkit lanes are explicitly excluded from
  Swooper product recovery accounting.

## Verification Plan

- Focused package/stage tests for changed behavior.
- OpenSpec strict validation for each new changeset.
- `git diff --check`.
- Clean Graphite commit.

## Accounting Verification

- `recovery-accounting-ledger.json` validated against
  `AccountingMoveSchema`/`WorkSurfaceRowSchema` with 18 moves and 5 work rows.
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
