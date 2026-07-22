# Change: Bound Habitat Check Execution

## Why

One aggregate Habitat check can select many Grit rules and large structure
authority trees. Running every selected Grit rule as an independent native
process multiplied process, memory, and Rayon-thread demand. Rewalking the same
structure roots for every rule multiplied filesystem work. At the same time,
CLI cancellation stopped at the JavaScript call boundary: the managed Effect
runtime and native provider descendants did not share one bounded release path.

The earlier hypothesis for this change was to replace live command-runner tests
with exported helper seams, fakes, `Effect.never`, and `TestClock`. Source review
rejected that direction. Those tests would have proved synthetic policy while
bypassing the process ownership behavior that must hold in production. The
accepted candidate instead keeps command policy internal and proves bounded
behavior with real, short-lived child-process fixtures.

## What Changes

- Run live provider commands as Darwin/Linux detached process groups acquired by
  an Effect scope, with bounded TERM, sampled liveness, conditional KILL, and an
  explicit incomplete-release defect.
- Carry SIGINT/SIGTERM through every CLI caller as an `AbortSignal`, dispose the
  managed runtime within a shorter deadline, then re-deliver the first native
  signal. A repeated signal forces immediate replay.
- Fix native Grit's worker pool at `RAYON_NUM_THREADS=2` and execute Grit plans
  sequentially.
- Batch eligible check rules only when they have the exact same ordered,
  canonical scan-root tuple and distinct pattern identities. Materialize rule
  assets before shared execution so one invalid asset cannot block valid peers.
- Attribute shared timing only to rules admitted into the shared native command;
  invalid assets retain zero duration and no shared timing.
- Reuse structure path-kind, directory-entry, and completed-walk observations
  within one `runStructureRulesEffect` invocation. Never retain observations
  across independent runs.
- Provision the Bun compiler archive only from an immutable owner distribution,
  while preserving rolling upstream release and asset observations as
  non-authoritative provenance. Carry both identities into the standalone
  artifact record and prove embedded native feature identity on the Darwin
  arm64 owner and consumer host.
- Publish an SDK version release only after a draft contains the complete
  already-proven asset set with matching server-reported digests and sizes and
  the remote tag remains bound to the candidate source commit. A retry verifies
  an exact immutable release or refuses the existing state; it never mutates an
  already-published release.
- Keep git-state capture, unavailable-error projection, and timeout
  transformation internal to the live command provider. Do not publish a test
  helper API.

## Ownership And Boundaries

- `tools/habitat` owns the command process, CLI lifecycle, Grit provider,
  structure traversal, compiler distribution manifest, tests, and standalone
  release behavior.
- A destination repository owns its `.habitat` rules and provider installation;
  it does not own or patch Habitat process lifecycle behavior.
- The standalone executable remains check-only. It does not acquire mutation,
  daemon, supervisor, or destination-script authority.
- The Darwin arm64 executable release is a temporary bridge for the current
  Magic consumer and developer host, not a platform-neutral SDK or a claim of
  multi-platform release support. Its replacement boundary is a
  platform-neutral Habitat SDK/Node package.
- The POSIX process-group identifier is a sampled numeric identity. An observed
  `ESRCH` is absorbing for that release attempt, but the current API cannot
  eliminate disappearance or identifier reuse between separate observations.

## Non-Goals

- Do not export command-runner implementation helpers for tests.
- Do not replace real process ownership proofs with fake commands or virtual
  clocks.
- Do not merge different ordered scan-root tuples, duplicate Grit pattern
  identities, or apply-dry-run acquisitions into one native check command.
- Do not retain structure traversal state across check invocations.
- Do not claim Windows process-tree support or absolute POSIX process-group
  identity continuity.
- Do not add consumer-local cancellation, batching, or scheduling workarounds.

## Dependencies And Effects

- **Requires:** the standalone check boundary and pinned destination-provided Grit
  provider already established by the Habitat SDK release line.
- **Enables:** a new Habitat SDK release that Magic and other consumers can
  provision without duplicating Grit lifecycle or batching logic.
- **Stops:** if bounded child fixtures leave descendants, a cancellation path
  omits runtime disposal or native signal replay, exact-root batching changes
  per-rule outcomes, or traversal reuse crosses invocation boundaries.

## Validation

- Habitat source, test, and tooling TypeScript lanes pass.
- Standalone behavior tests cover CLI cancellation, owned process release,
  exact-root Grit batching, current pinned-native execution, and traversal reuse.
- The active OpenSpec change validates strictly and the candidate diff has no
  whitespace errors.
- Fixed-artifact build, Darwin moved-binary acceptance, and release publication
  remain explicit owner gates after this source candidate is accepted.
