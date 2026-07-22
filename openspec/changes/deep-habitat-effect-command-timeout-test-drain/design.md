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

## Compiler Distribution And Publication State

The compiler manifest separates three facts that the earlier schema collapsed:

1. Bun's embedded name, version, and full source revision own compiler identity.
2. The rolling `oven-sh/bun` canary release and its original asset IDs are
   captured upstream observations. Its observed release name is explicitly not
   trusted for identity because it names a different revision.
3. The byte source is immutable release
   `habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4` in
   `mateicanavra/civ7-modding-tools`. Provisioning uses only that release's API
   asset URL and verifies both archive and executable digests.

Artifact provenance schema version 2 carries the upstream release observation,
immutable distribution identity, and both asset IDs. The moved-binary proof
uses `BUN_BE_BUN=1`, Bun's native version and revision outputs, and internal
feature data on Darwin arm64 to require the exact name, version, full revision,
and canary flag before behavior acceptance. The release target builds one
candidate, fingerprints its executable and metadata, runs distribution and
publication fixtures serially, and makes moved-binary acceptance the final
candidate-owning command before upload. No proof step rebuilds or overwrites
the candidate.

This Darwin arm64 distribution is a temporary bridge for the current Magic
consumer and developer host. It does not advertise platform portability or
define the long-term SDK shape. Its replacement boundary is a platform-neutral
Habitat SDK/Node package.

SDK publication has one state transition. For an absent release, the owner
workflow creates a draft without assets, attaches the three already-proven
files, and admits the draft only when GitHub reports the exact local SHA-256 and
byte size for every attachment and `SHA256SUMS` covers every payload exactly
once. The workflow then publishes, requires GitHub's release record to be
immutable, and downloads the assets for checksum verification. If the tag
already has an exact immutable release, the workflow performs only metadata,
downloaded-byte, and source-binding verification. Any draft, mutable
publication, duplicate tag record, extra/missing asset, or byte mismatch
refuses the retry. Published releases are never edited or uploaded with
clobber semantics.

Publication receives the proven source commit explicitly from the workflow.
Before draft creation and again immediately before publication, that commit
must equal the candidate provenance commit, checked-out `HEAD`, checked-out tag
commit, and a fresh commit resolution for the remote repository tag. The same
binding brackets verification of an existing immutable release. GitHub and
compiler downloads have explicit command deadlines rather than inheriting the
workflow's multi-hour job ceiling. Publication wraps GitHub CLI operations in a
portable Perl-backed TERM/KILL watchdog available on the Darwin and Linux owner
runners, avoiding a GNU `timeout` dependency and any expansion of the temporary
platform lane.

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
- Manifest tests prove upstream observation and immutable distribution
  separation. Release-script fixtures prove draft-before-attachment ordering,
  prepublication digest/size admission, source binding, verification-only
  immutable retries, bounded GitHub commands without GNU `timeout`, and refusal
  of draft or mutable retries.
- The moved Darwin artifact reports the selected compiler feature identity
  before its existing behavior, provenance, and checksum proofs run. Its final
  fingerprint assertion proves those checks leave the accepted candidate
  untouched. A structural release-lane test makes moved acceptance last and
  forbids a post-proof rebuild.

## Risks And Residuals

- A privileged writer can still move a not-yet-immutable tag in the interval
  between the final remote resolution and draft publication. The second source
  check minimizes but cannot eliminate that micro-race; repository writer
  policy owns the interval, and immutable-release tag locking owns the state
  after publication.
- GitHub's immutable-release enablement endpoint requires repository
  administration-read authority, which the contents-scoped publication token
  does not have. The workflow therefore cannot perform that settings preflight;
  it fails closed if the published release record is not immutable. The owner
  repository's immutable-release policy remains a release prerequisite.
- The temporary Darwin bridge deliberately does not prove or advertise
  platform-neutral distribution. That portability belongs to the replacement
  Habitat SDK/Node package boundary.

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
