# Hook Effect Substrate Decision

**Change:** `habitat-git-hook-hardening`
**Status:** supervisor-accepted substrate decision; consumed by packet closure
**Decision:** Do not adopt Effect for the current hook-hardening scope.

## Decision Boundary

Current hook hardening does not introduce a hook-owned asynchronous runtime,
long-lived command lifecycle, temporary workspace, staged snapshot restore,
automatic resource publishing, remote push transaction, or cleanup-managed
resource. The current implementation instead removes the hidden resource
publisher from default pre-commit and keeps hook behavior synchronous,
local-feedback-only, and explicit.

Within that narrowed product boundary, the existing TypeScript hook owner layer
now supplies the required equivalent proof shape:

- typed pre-commit and pre-push outcomes;
- typed pre/post repo snapshots for branch, HEAD, staged paths, unstaged paths,
  and resource state;
- command provenance for Git, Bun/Habitat, Biome, Grit, Nx, and explicit
  resource publishing;
- deterministic clock injection for trace timing;
- service substitution for command execution, filesystem/path existence, file
  hashing, reporter output, and resource publisher command policy;
- fail-closed resource, file-layer, partial-staging, Biome, Grit command,
  Grit parse, Grit finding, and Nx affected outcomes covered by focused tests.

## Reopen Triggers

This non-adoption decision is bounded to the current hook-hardening packet.
Effect or an equivalent runtime substrate must be reconsidered before any hook
change adds one of these surfaces:

- automatic pre-commit resource publishing;
- remote resource push from a hook path;
- staged snapshot/stash restore or rollback ownership;
- hook-owned temporary directories, cache lifetimes, locks, or cleanup scopes;
- parallel command orchestration;
- hook retry/recovery workflows;
- registered pattern promotion, baseline mutation, or hook-scope rule
  activation tied to hook execution.

## Non-Claims

This decision record does not itself prove Effect package adoption, dependency
versions, lockfile changes, runtime-edge discipline for `Effect.run*`, CI
execution, broad Nx affected coverage, current-tree staged hook probes,
implicit hook publishing, Grit row semantics, baseline semantics, packet
closure, or product/runtime behavior. Those hook behavior and packet closure
claims require their own packet evidence.
