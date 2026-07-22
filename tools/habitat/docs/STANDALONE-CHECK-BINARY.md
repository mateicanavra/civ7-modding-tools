# Standalone Check Binary

The Habitat owner temporarily publishes one Darwin arm64, check-only executable
for the current Magic consumer and developer host. Repositories carry their own
`.habitat` authority tree but do not own Habitat source. The destination
repository is data and rule authority; this Civ7 repository owns the executable
implementation and release provenance.

This executable distribution is a narrow bridge, not the platform-neutral SDK
boundary and not a claim of multi-platform release support. Its replacement
boundary is a platform-neutral Habitat SDK/Node package.

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
during cleanup forces immediate replay of that first signal instead of waiting
behind a stuck finalizer. The temporary distribution publishes only the Darwin
arm64 artifact. That release constraint does not narrow the runtime's existing
Darwin/Linux process behavior; unsupported runtime platforms remain refused
before spawn rather than inheriting an unproven tree-ownership guarantee.

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
- `provenance.json`
- `SHA256SUMS`

`provenance.json` records the source commit, `tools/habitat` tree, exact Bun
name and full revision, the observed upstream release, the immutable owner
distribution, the upstream and distribution asset IDs, archive/executable
SHA-256 digests, bundle boundary, target, byte size, artifact digest, and
bundled-input count. Build-host observations are deliberately excluded so the
published record remains stable across repeated owner proofs. `SHA256SUMS`
covers the Darwin executable and the provenance record.

## Owner Proof And Release

```bash
export HABITAT_STANDALONE_BUN_TOOLCHAIN="$(
  bun run --cwd tools/habitat provision:standalone:compiler \
    --output "${TMPDIR:-/tmp}/habitat-standalone-bun-5b98630ac045"
)"
bunx nx run habitat:release:standalone
```

The release target makes workspace hygiene, exhaustive Effect lint over the
standalone/CLI ownership directories, focused lifecycle/process/CLI/provider
batching/traversal behavior, and typecheck mandatory before its clean-tree
candidate build. It builds that candidate once, runs compiler-distribution and
publication fixtures serially, and makes moved-binary acceptance the final
candidate-owning command before upload. The repository continues to use Bun
`1.3.14` for workspace installation and task execution. The standalone
artifacts are compiled by the separately provisioned Bun
`1.4.0-canary.1+5b98630ac` toolchain at full revision
`5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4`.

The compiler manifest records the Darwin upstream Bun asset ID as provenance but
downloads only its byte-identical copy from immutable release
`habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4` in
`mateicanavra/civ7-modding-tools`. It verifies the downloaded archive and
extracted executable, then verifies the full revision embedded in the Darwin
compiler. It never resolves `latest`, a moving `canary` download URL, or a
mutable release asset. An unavailable asset or identity mismatch fails the
build and requires an explicit manifest update. Bun's
`--compile-executable-path` binds the fixed `darwin-arm64` output to its pinned
target executable; unresolved imports remain rejected.

The upstream rolling release was captured at `2026-07-22T06:40:33Z` with the
observed name `Canary (dbd320ccfa909053f95be9e1643d80d73286751f)`. That name
does not match the selected compiler revision and is evidence only. The
verified source commit plus Bun's embedded feature data own compiler identity.

The black-box test fingerprints the three-file candidate, moves the Darwin
binary outside the checkout, uses `BUN_BE_BUN=1` and Bun's internal feature
data to prove the native artifact embeds the exact name, version, full revision,
and canary identity, then proves structure and destination-provided Grit
pass/fail behavior, missing-provider and script refusal, semantic repeatability,
destination non-mutation, and build-host-independent provenance and checksum
identity. Its final assertion requires the executable, provenance, and
checksum fingerprints to remain unchanged; no acceptance step rebuilds the
candidate.

The owner workflow at `.github/workflows/habitat-standalone-release.yml`
provisions and verifies the same pinned toolchain for the release build and
moved-binary proof on macOS arm64. Manual runs build and upload the candidate
without publishing it. The publication job is positively gated to a pushed
`habitat-sdk-v*` tag. It creates a draft without assets, attaches the
already-proven three-file candidate without rebuilding it, and confirms the
complete attachment set. Before publication, every GitHub-reported asset digest
and byte size must match the local candidate and `SHA256SUMS` must cover each
payload exactly once. The workflow publishes only after that admission, then
requires GitHub to report the release immutable. A retry may only verify an
existing exact immutable release, its server metadata, source binding, and
downloaded bytes; an existing draft or mutable published release is refused
rather than modified.

The publication job passes its expected source commit explicitly. Candidate
provenance, checked-out `HEAD`, the checked-out tag, and a fresh remote-tag
resolution must all match before draft creation and again immediately before
publication. A privileged writer can still move a mutable tag between the last
resolution and publication; repository writer policy owns that bounded
micro-race, while immutable-release tag locking owns the published state. The
contents-scoped workflow token cannot read GitHub's administration-scoped
immutable-release setting, so the owner setting remains a prerequisite and the
post-publication immutable field is the fail-closed runtime proof. Creating or
pushing the release tag remains a separate owner decision. GitHub CLI calls use
a portable TERM/KILL deadline watchdog available on the Darwin and Linux owner
runners rather than GNU `timeout`.
