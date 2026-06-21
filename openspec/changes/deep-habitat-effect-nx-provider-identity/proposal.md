# Change: Deep Habitat Effect Nx Provider Identity

## Why

`NxProvider.affected` requested `nx`, but `graph`, `runMany`, and `runTarget`
requested the legacy `target-check` alias. That split the provider identity and
made callers reason about two names for the same vendor.

The provider should expose Nx as Nx. Repo-local execution policy belongs in
command materialization, not in a second vendor name.

## What Changes

- Add `nx` as a repo-local workspace tool policy.
- Make `NxProvider.graph`, `runMany`, and `runTarget` request `nx`.
- Change provider argv helpers to emit `nx ...` consistently.
- Keep `target-check` metadata vocabulary untouched for existing rule records.

## Non-Goals

- Do not rename `target-check` rule ownership in this slice.
- Do not change Nx target semantics.
- Do not remove the `target-check` workspace-tool alias yet.

## Validation

- Nx provider unit tests should expect `nx` argv for every provider operation.
- Graph service tests should report Nx provider failures as `nx` failures.
- Workspace tool materialization should route `nx` through the repo-local Bun
  command plane.
