# Standalone Check Binary

The Habitat owner publishes one portable, check-only executable for repositories
that carry their own `.habitat` authority tree but do not own Habitat source.
The destination repository is data and rule authority; this Civ7 repository owns
the executable implementation and release provenance.

Related:

- [[../README|Habitat CLI]]
- [[../../../.habitat/AUTHORITY-TOOL-SEPARATION|Authority and tool separation]]

## Consumer Contract

```bash
./habitat-sdk-darwin-arm64 check --repo-root /path/to/repository --json
```

The edge accepts `--owner`, repeated `--rule`, `--runner grit|habitat`,
`--staged`, `--baseline-integrity`, and `--base`. It emits the normalized
`CheckReport`; exit `0` means the selected rules passed, exit `1` means the
report contains failures, and exit `2` means the invocation or runtime was
refused.

The executable exposes no mutation command. `--runner habitat` admits only
declarative structure rules; destination scripts, file-layer rules, and
Nx-backed rules are refused before provider construction. Its bundle excludes
Grit, oclif, Nx, and effect-orpc packages. A destination that selects a Grit
rule must supply the pinned provider under
`node_modules/@getgrit/cli/node_modules/.bin_real/grit`. Repository paths locate
the destination authority; they do not become executable or release identity.

SIGINT and SIGTERM interrupt the root scoped Effect. On Darwin and Linux,
Habitat owns each provider as a detached process group before provider startup
is admitted, gives the group a bounded TERM grace, and escalates to KILL only
when every sampled liveness observation through that grace reports present.
Habitat also bounds runtime disposal, then re-delivers the first recorded signal
so hosts observe native cancellation rather than exit `0`. A repeated signal
during cleanup forces
immediate replay of that first signal instead of waiting behind a stuck
finalizer. This release publishes only Darwin and Linux artifacts; the command
process capability refuses unsupported platforms before spawning rather than
claiming an unproven equivalent tree-ownership guarantee.

Runtime finishing has a deadline below the outer native-signal replay deadline.
That deadline bounds how long Habitat waits for a host disposal promise; it does
not claim that JavaScript can cancel an arbitrary promise after it has started.

Scope release first probes the detached process group, regardless of whether the
direct provider has already completed. An absent group is already released and
is not signaled. Group absence is absorbing: after the initial probe, TERM
delivery, or a later liveness sample observes `ESRCH`, release stops and never
sends a subsequent signal to that process-group identifier in the same attempt.
SIGKILL is attempted only if every sampled observation through the TERM grace
reports present, including when only descendants remain or the direct provider
exits during that grace.

These are bounded samples of a numeric POSIX process-group id, not proof of
continuous identity. A group can disappear and that id can be reused between
separate observations without Habitat seeing `ESRCH`. Eliminating that residual
requires a stable OS ownership handle or an external supervisor; this release
does not claim continuous presence, continuing ownership identity, or absolute
ABA prevention.

If group delivery and direct-child fallback both fail and the group remains
present in every settlement sample through the bounded deadline, release
surfaces an `OwnedCommandProcessReleaseIncomplete` defect with both signal
outcomes instead of reporting successful cleanup.

Native Grit execution is sequential and fixes `RAYON_NUM_THREADS=2`. Eligible
check rules share one command only when their ordered canonical scan-root tuples
are exactly equal and their pattern identities are distinct. Invalid rule assets
are excluded before the shared catalog is acquired; shared timing names only
the admitted peers. Different root tuples, duplicate identities, apply dry-runs,
and non-executable plans remain separate execution units.

Structure checks reuse path-kind, directory-entry, and completed-walk
observations within one check invocation. A later invocation starts with an
empty traversal cache and observes its destination again.

## Fixed Artifacts

Every build produces exactly these release assets under
`tools/habitat/dist/standalone/`:

- `habitat-sdk-darwin-arm64`
- `habitat-sdk-linux-x64-baseline`
- `provenance.json`
- `SHA256SUMS`

`provenance.json` records the source commit, `tools/habitat` tree, exact Bun
release name and full revision, both pinned compiler asset IDs and
archive/executable SHA-256 digests, bundle boundary, target, byte size, artifact
digest, and bundled-input count. Build-host observations are deliberately
excluded so the published record identifies the same candidate on every proof
host. `SHA256SUMS` covers both executables and the provenance record.

## Owner Proof And Release

```bash
export HABITAT_STANDALONE_BUN_TOOLCHAIN="$(
  bun run --cwd tools/habitat provision:standalone:compiler \
    --output "${TMPDIR:-/tmp}/habitat-standalone-bun-a215285063c9"
)"
bunx nx run habitat:typecheck
bunx nx run habitat:test:standalone:behavior
bunx nx run habitat:test:standalone
bunx nx run habitat:release:standalone
```

The release target makes workspace hygiene, exhaustive Effect lint over the
standalone/CLI ownership directories, focused lifecycle/process/CLI/provider
batching/traversal behavior, typecheck, and moved-binary acceptance mandatory
before its clean-tree build. The repository continues to use Bun `1.3.14` for
workspace installation and task execution. The standalone artifacts are
compiled by the separately provisioned Bun
`1.4.0-canary.1+a21528506` toolchain at full revision
`a215285063c9b7b0d4b3f87bd298d4fecfd93897`.

The compiler manifest addresses the two official GitHub release assets by
numeric asset ID, verifies each downloaded archive and extracted executable,
and verifies the full revision embedded in the host compiler. It never resolves
`latest` or a moving `canary` download URL. An unavailable asset or identity
mismatch fails the build and requires an explicit manifest update. Bun's
`--compile-executable-path` binds each fixed `darwin-arm64` and
`linux-x64-baseline` output to its pinned target executable; unresolved imports
remain rejected.

The black-box test moves the downloaded host binary outside the checkout before
any rebuild, then proves structure and destination-provided Grit pass/fail
behavior, missing-provider and script refusal, semantic repeatability,
destination non-mutation, and host-independent provenance and checksum
identity. It then rebuilds on the proof host and requires every executable,
provenance, and checksum byte to remain identical to the downloaded candidate.

The owner workflow at `.github/workflows/habitat-standalone-release.yml`
provisions and verifies the same pinned toolchain for the release build and for
the moved-binary proof on Linux x64 and macOS arm64. Manual runs and pushed
`habitat-sdk-probe-*` tags execute the full matrix and upload workflow artifacts
only. The publication job and release command are both positively gated to a
pushed `habitat-sdk-v*` tag; creating or pushing that release tag is a separate
owner decision.
