# Design: Bounded Habitat Check Execution

## Frame

Habitat is a check runtime, not merely a policy projector. Its production
guarantee includes the native children, threads, temporary state, filesystem
observations, and Effect scopes created while a check runs. A deterministic
unit seam is valuable only where the unit owns pure policy; it cannot replace a
bounded real-child proof for process acquisition and release.

The candidate collapses four multiplicative states at their owning boundaries:

1. one scoped process owner for every live provider command;
2. one cancellation path from CLI signal through local oRPC and Effect release;
3. one native Grit command for each eligible exact-root check group; and
4. one traversal cache for each `runStructureRulesEffect` invocation.

## Ownership

- `tools/habitat/src/resources/command/runner.ts` owns live command
  materialization, observation, git-state capture, unavailable-error projection,
  and timeout transformation. These remain internal implementation functions.
- `tools/habitat/src/resources/command/process.ts` owns detached child creation
  and bounded Darwin/Linux process-group release.
- `tools/habitat/src/cli/base/command-lifecycle.ts` adapts one CLI command to the
  generic signal/disposal lifecycle in
  `tools/habitat/src/runtime/process-lifecycle.ts`.
- `tools/habitat/src/resources/rule-diagnostics/providers/grit/**` owns native
  Grit admission, hermetic environment, exact-root grouping, catalog
  materialization, execution, and per-rule result projection.
- `tools/habitat/src/service/model/structure-check/policy/structure-check.policy.ts`
  owns structure traversal reuse.
- `tools/habitat/test/lib/command-runner.test.ts` proves command result policy
  and the real live-runner edge. `command-process.test.ts` proves descendant
  ownership and bounded release. `command-lifecycle.test.ts` proves signal and
  runtime-disposal ordering.
- Grit provider, current-tree native, structure-check, CLI, and standalone tests
  prove their respective boundaries without creating a second runtime.

## Command Process State

The command runner spawns a detached Darwin/Linux child with piped output. The
acquired resource enters the Effect scope before `awaitStarted` can admit
provider startup. Scope interruption therefore owns release whether the direct
child is starting, running, terminating, completed, or failed.

Release uses the following sampled algorithm:

1. Probe the negative process-group id with signal `0`.
2. If that probe reports `ESRCH`, stop successfully and send no signal.
3. Otherwise attempt group SIGTERM. A non-`ESRCH` group-delivery failure may use
   direct-child SIGTERM as a fallback; an `ESRCH` result stops release.
4. Poll group liveness every 20ms for at most 250ms. The first observed `ESRCH`
   stops release and is absorbing.
5. Only when every liveness sample through that grace reports present, attempt
   SIGKILL through the same group-first/fallback edge.
6. Poll for at most 1,000ms. An observed `ESRCH` completes release. If every
   settlement sample reports present, fail release with
   `OwnedCommandProcessReleaseIncomplete` and both signal outcomes.

This is a bounded sampling guarantee, not a stable process-identity guarantee.
POSIX `kill(-pgid, 0)` and later signal delivery are separate observations of a
numeric identifier. A group can disappear and that identifier can be reused
between observations without producing a sampled `ESRCH`. Eliminating that
residual requires a stable OS ownership handle or an external supervisor; this
candidate does not claim continuous presence, continuing ownership identity, or
absolute ABA prevention.

## CLI Cancellation State

Every CLI command installs one lifecycle and passes its `AbortSignal` through
the local oRPC caller options. The first SIGINT/SIGTERM records native signal
identity and aborts the active service call. Scoped finalizers release provider
commands; `finish` then disposes the shared managed runtime with a 1,500ms
deadline and re-delivers the first signal. A 2,000ms outer deadline and any
repeated signal force replay if cleanup does not settle. Normal completion
disposes once, removes temporary listeners, and synthesizes no signal.

The lifecycle test imports its owner lazily so the proof does not eagerly load
the CLI graph before the fixture establishes its boundary.

## Grit Execution State

The provider environment fixes `RAYON_NUM_THREADS=2` and disables downloads,
telemetry, color, and shared caches. Execution units run sequentially.

Only `check` acquisitions participate in grouping. A selected pattern identity
that occurs more than once stays singleton. Remaining checks are grouped by the
exact ordered canonical root tuple; different roots, different order, apply
dry-runs, refused plans, failures, and not-applicable plans remain separate.

Within one eligible group, each pattern asset is canonicalized and materialized
before the shared catalog is acquired. Invalid assets become per-rule setup
failures and are excluded from the catalog. Valid peers share one immutable
catalog, one native command, and one captured report. Each rule still receives
its own projected outcome in selected order. Command, wire, path, or identity
failure is contained to that exact-root group. Shared timing names and counts
only the materialized rules admitted into the native command; excluded rules
receive zero duration and no shared timing.

## Structure Traversal State

One `runStructureRulesEffect` call creates one in-memory cache for path kinds,
directory entries, and completed walks keyed by literal glob base. Rules and
scopes in that call reuse those observations, including directory-entry kinds
already observed while walking. A separate evaluator or rule-run invocation
creates a fresh cache, so no filesystem fact outlives the check that observed
it.

## Verification Model

- Pure command formatting, result projection, output bounds, and fake-layer
  behavior remain ordinary unit tests.
- Real bounded fixtures prove live spawn failure, timeout interruption,
  descendant cleanup after direct-child completion, TERM exit, TERM-time
  absence, forced KILL, and incomplete release.
- Signal-target unit tests prove lifecycle ordering; a real POSIX child proves
  mixed-signal native exit identity.
- Fake-provider tests prove grouping and failure attribution; the installed
  pinned-native lane proves one multi-pattern invocation can project both clean
  and matching peers without mutation.
- Instrumented filesystem fixtures prove traversal reuse and per-invocation
  freshness.

## Risks And Residuals

- Process-group identity can disappear or be reused between separate POSIX
  observations. Only a stable OS handle or supervisor can close that residual.
- Real child fixtures depend on Darwin/Linux process semantics. They stay
  bounded and always perform fixture cleanup; unsupported production platforms
  are refused before spawn.
- Exact-root batching intentionally leaves additional commands when pattern
  identities repeat or root tuples differ. Expanding that state space requires
  new identity and attribution guarantees, not a looser grouping key.
- Traversal observations are snapshots within one run. Long-running mutation
  during a check is outside this reuse contract.
