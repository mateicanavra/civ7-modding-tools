# deep-habitat-effect-husky-provider-drain

## Why

Habitat should not keep provider scaffolding for a tool that no service, domain,
host, or runtime layer consumes. Husky is still part of the product surface as
the repository's Git-hook delegator, but the delegator files are static `.husky`
entrypoints that invoke `habitat hook`. Modeling that as a provider created a
false capability and extra fake-layer surface.

## What Changes

- Delete the unused Husky provider module.
- Remove the fake Husky provider export from service test layers.
- Remove the provider-only Husky unit test.
- Realign the vendor-provider packet so it describes consumed providers only.

## Non-Goals

- Do not change `.husky/pre-commit`, `.husky/pre-push`, `habitat hook`, hook
  command output, hook trace behavior, or hook service execution.
- Do not add a replacement compatibility shim or fallback provider.
