# Change: Deep Habitat Effect Fast Check Architecture

## Why

Habitat pre-push currently asks Nx to run Habitat's structural harness and then
also names the vendor lanes that Habitat already wraps (`biome:ci`,
`boundaries`, and `grit:check`). That makes the hook topology longer than the
product boundary requires: Nx should select affected work, while Habitat should
own the composition of structural rules and vendor-backed checks.

This slice removes the duplicated pre-push target vocabulary so local hook
checks are closer to the intended architecture: one Habitat structural harness
entrypoint plus the project test/validation targets that remain outside that
harness.

## What Changes

- Move the pre-push target list into the Nx target-name provider.
- Keep `habitat:check` as the hook's structural harness entrypoint.
- Stop naming `biome:ci`, `boundaries`, and `grit:check` separately in
  pre-push affected execution.
- Route the pre-push service path through `NxProvider.affected` instead of raw
  hook command assembly.
- Preserve project tests and existing validation targets in pre-push.

## Non-Goals

- Do not route root `check` through Nx in this slice.
- Do not add topology tests for hook structure.
- Do not change Biome, Grit, or boundary rule semantics.
- Do not claim this resolves Nx daemon/project-graph startup overhead.
- Do not delete the legacy synchronous hook helper in this slice; it remains a
  follow-up cleanup target for callers that still import it directly.

## Validation

- Existing hook behavior tests should show the shorter affected target list.
- Package TypeScript and OpenSpec validation should pass.
- A local pre-push target-plan inspection should show no duplicate top-level
  vendor lanes beside `habitat:check`.
