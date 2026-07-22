# Phase Record: Bounded Habitat Check Execution

## Frame

- Objective: bound native provider resources and collapse repeated Grit and
  structure work inside the Habitat-owned runtime.
- Hard core: cancellation must reach the exact active Effect call; scope release
  must own real provider descendants; batching and traversal reuse must preserve
  per-rule outcomes and authority boundaries.
- Exterior: no consumer-local runner workarounds, destination-script authority,
  mutation surface, cross-run traversal cache, Windows process claim, or stable
  POSIX process-group identity claim.
- Falsifier: a fixture descendant survives release, native signal identity is
  swallowed, one invalid rule blocks valid exact-root peers, shared timing names
  an unadmitted rule, or traversal observations leak across executions.

## Superseded Hypothesis

The opening packet proposed exported command helper seams and fake-only tests
using `Effect.never` and `TestClock`. That approach was not accepted into the
candidate. It would have optimized test mechanics while removing proof of the
live spawn and process-release edge. The current source keeps those helpers
internal and uses bounded real-child fixtures. The prior record's path and
timing claims are superseded history, not evidence for this candidate.

## Workstream State

- Integration branch: `codex/habitat-sdk-v0.1.2-integrated`
- Candidate base: `habitat-sdk-v0.1.1` (`177d08eafc`)
- Shared implementation layers incorporated:
  - `b2a8cb494a`: exact-root multi-pattern Grit batching
  - `deaa6b2431`: per-run structure traversal reuse
  - `c65723510e`: bounded Grit threads and CLI/process cancellation
  - `5cf415e5b9`: lazy CLI lifecycle proof boundary
- Current owners:
  - `tools/habitat/src/resources/command/**`
  - `tools/habitat/src/runtime/process-lifecycle.ts`
  - `tools/habitat/src/cli/base/command-lifecycle.ts`
  - `tools/habitat/src/resources/rule-diagnostics/providers/grit/**`
  - `tools/habitat/src/service/model/structure-check/policy/structure-check.policy.ts`
  - corresponding tests under `tools/habitat/test/**`

## Guarantee Boundary

Habitat creates and scopes a detached Darwin/Linux process group. Release treats
the first observed `ESRCH` from the initial probe, TERM delivery, or later
liveness sample as absorbing and sends no subsequent signal in that attempt.
SIGKILL is attempted only after every liveness sample through the TERM grace has
reported present.

Those are sampled observations against a numeric process-group id. The API does
not prove that the same group existed continuously between observations. A
group may disappear and its id may be reused between samples without an observed
`ESRCH`; a stable OS ownership handle or external supervisor would be required
to eliminate that residual. No candidate evidence claims continuing identity or
absolute ABA prevention.

## Candidate Evidence

- Standalone/source Effect lint scanned 272 authored files with 0 errors and 92
  informational findings.
- Uncached standalone behavior completed with 138 passed and 2 platform skips.
- The source-backed Habitat suite completed across 42 files with 481 passed and
  2 platform skips. The artifact-only moved-binary suite is intentionally held
  for the owner release gate.
- Focused owned-command process behavior passed 7 of 7.
- Service-context behavior passed 1 of 1.
- Installed pinned-native current-tree behavior, including one multi-pattern
  exact-root invocation, passed 13 of 13.
- Habitat source, test, and tool TypeScript lanes passed.
- Strict validation passed for
  `deep-habitat-effect-command-timeout-test-drain`.

## Pending Owner Evidence

- Build the fixed Darwin arm64 and Linux x64 baseline artifacts with the pinned
  compiler.
- Run moved-binary acceptance outside the checkout.
- Qualify a nonpublishing probe tag before publishing the next release tag.
