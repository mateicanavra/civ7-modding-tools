# Change: Deep Habitat Effect Owner Check Input Scope

## Why

Habitat owner targets (`<project>:habitat:check`) run one owner-scoped Habitat
check, but their Nx inputs still default to the whole workspace. That makes
owners with precise rule metadata look as broad as owners whose rules genuinely
scan the workspace.

Habitat's target graph should reflect the rule registry honestly: precise
metadata narrows invalidation; broad or unresolved metadata remains broad.

## What Changes

- Keep owner and full Habitat check targets as single-process Habitat commands.
- Derive owner `habitat:check` inputs from the owner's registered rules.
- Preserve broad inputs for an owner when any owned rule is `workspace-gate` or
  `unresolved-metadata`.
- Leave `habitat:check:all` as the single shared Habitat check command instead
  of fanning out into per-rule Nx processes.

## Non-Goals

- Do not route root `check` through Nx in this slice; current Nx invocation
  overhead is still too high for the full check path.
- Do not split owner checks into per-rule subprocesses.
- Do not tighten broad rule metadata in this slice.
- Do not add topology tests for generated Nx target shape.

## Validation

- `nx show project <owner> --json` should show narrow owner inputs only for
  owners whose rules are all precise.
- Broad/unresolved owners should keep broad Habitat inputs.
- Owner and full Habitat targets should still run one Habitat command.
