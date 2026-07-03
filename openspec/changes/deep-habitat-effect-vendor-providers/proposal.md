# Change: Deep Habitat Effect Vendor Providers

## Why

Habitat currently treats vendors partly as executable names, partly as command
helpers, and partly as domain ownership labels. The refactor needs explicit
providers for Grit, Biome, Nx, Git, and Husky so vendor semantics stay bounded
and testable.

## What Changes

- Promote the existing Grit Effect island into `providers/grit`.
- Add `GitProvider`, `BiomeProvider`, `NxProvider`, and `HuskyProvider`.
- Define provider contracts for version/config discovery, command
  construction, resource/cache policy, typed failure tags, output parsing, and
  proof projection.
- Route provider commands through the shared `CommandRunner`.

## What Does Not Change

- No vendor semantics are reimplemented as Habitat semantics.
- No CheckReport v1 or hook public behavior changes.
- No Nx project graph or Biome/Grit config is changed unless a provider proof
  task requires a separately reviewed config edit.

## Affected Owners

- `tools/habitat-harness/src/adapters/grit/**`
- `tools/habitat-harness/src/lib/habitat-process.ts`
- `tools/habitat-harness/src/lib/workspace-tools.ts`
- `tools/habitat-harness/src/lib/git-state.ts`
- `tools/habitat-harness/src/lib/workspace-graph/**`
- `tools/habitat-harness/src/lib/hook-runtime/**`
- New `tools/habitat-harness/src/providers/**`

## Stop Conditions

- A provider claims behavior owned by another vendor.
- A provider command is a shell-interpolated string.
- A provider cannot be faked in unit tests.
- Nx target proof uses `targetDefaults` or tags instead of resolved Nx metadata.

## Verification

- Provider fake-layer tests.
- Real smoke tests for pinned Grit/Biome/Nx/Git behavior.
- Grit parser/scan-root/projection matrix.
- H8 classify target matrix for Nx provider consumption.
