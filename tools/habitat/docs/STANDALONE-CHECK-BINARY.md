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

The executable exposes no mutation command. It refuses selected Nx-backed rules
instead of importing or invoking Nx. Its bundle excludes oclif, Nx, and
effect-orpc. It also does not bundle Grit: a destination that selects a Grit rule
must supply the pinned provider under
`node_modules/@getgrit/cli/node_modules/.bin_real/grit`. Repository paths locate
the destination authority; they do not become executable or release identity.

## Fixed Artifacts

Every build produces exactly these release assets under
`tools/habitat/dist/standalone/`:

- `habitat-sdk-darwin-arm64`
- `habitat-sdk-linux-x64-baseline`
- `provenance.json`
- `SHA256SUMS`

`provenance.json` records the source commit, `tools/habitat` tree, exact Bun
version and revision, bundle boundary, target, byte size, SHA-256 digest, and
bundled-input count. `SHA256SUMS` covers both executables and the provenance
record.

## Owner Proof And Release

```bash
bunx nx run habitat:typecheck
bunx nx run habitat:test:standalone
bun run --cwd tools/habitat release:standalone
```

`release:standalone` requires Bun `1.3.14` and a clean Git worktree. It compiles
only the fixed `darwin-arm64` and `linux-x64-baseline` targets with unresolved
imports rejected. The black-box test moves the host binary outside the checkout,
then proves structure and destination-provided Grit pass/fail behavior, missing
provider refusal, semantic repeatability, destination non-mutation, and
byte-identical rebuilds.

The owner workflow at `.github/workflows/habitat-standalone-release.yml` runs
the same proof. Manual runs upload workflow artifacts only. A pushed
`habitat-sdk-v*` tag publishes those four immutable assets as a GitHub release;
creating or pushing that tag is a separate owner decision.
