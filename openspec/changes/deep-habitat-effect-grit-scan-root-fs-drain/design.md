# Design: Grit Scan Root Filesystem Drain

## Frame

The Grit adapter has two different concerns in scan-root handling:

- policy classification: empty, outside repo, missing, protected, generated,
  not approved, accepted
- host existence: whether a repo-relative path exists in the current checkout

Those concerns were coupled through direct `existsSync` calls inside
`decidePatternScanRoots` and `discoverPatternScanRoots`. Live adapter execution
still needs the host check, but unit tests should be able to supply the
existence facts directly.

## Ownership

- `tools/habitat-harness/src/adapters/grit/scan-roots/index.ts` owns Grit
  scan-root decisions and discovery.
- `tools/habitat-harness/test/lib/grit-adapter.test.ts` owns fixture coverage
  for Grit adapter policy and diagnostic projection.

## Implementation

Extend `PatternScanRootValidationOptions` with `pathExists`. The option accepts
an absolute path and returns whether that path exists. Both scan-root discovery
and validation default to `existsSync`, preserving live adapter behavior.

The scan-root validation fixture passes a fake existence function keyed by
repo-relative roots. The test still exercises the same refusal messages and
accepted cases, but no longer depends on the actual worktree containing those
paths.

## Risks

- The fake existence function must stay local to tests; production callers
  should keep the default filesystem behavior until the adapter is fully backed
  by Effect filesystem resources.
- This does not solve Vitest cold transform time for the combined Grit adapter
  suite. That is a separate module-shape problem.
