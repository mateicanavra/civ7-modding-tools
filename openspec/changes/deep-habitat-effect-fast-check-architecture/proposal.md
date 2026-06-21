# Change: Deep Habitat Effect Fast Check Architecture

## Why

Habitat is supposed to make repository structure cheap to understand and cheap
to enforce. When routine checks take minutes, the toolkit is pushing ambiguity
and orchestration cost back onto humans and agents instead of absorbing it.
The current slow path is architectural: Nx graph creation loads live Habitat
TypeScript, target inputs are broader than the work being checked, and local
verification lanes repeat Biome, Nx, and Habitat work through different owners.

## What Changes

- Make Nx graph creation depend on cheap Habitat metadata rather than live
  domain/runtime imports.
- Scope source-rule and owner-check Nx inputs from rule path coverage instead
  of broad workspace globs.
- Give local, staged, owner, affected, and full checks distinct purposes and
  avoid running the same vendor work through multiple lanes.
- Keep structural enforcement in Habitat/Grit/Biome/Nx guard surfaces, not
  topology tests.

## Non-Goals

- Do not weaken checks to make them appear faster.
- Do not add Vitest topology tests.
- Do not add compatibility aliases for retired target names.
- Do not hide slow work behind larger timeouts.

## Validation

- Nx project graph inspection for Habitat should complete quickly enough for
  ordinary local use.
- Source-check and owner-check targets should cache against scoped inputs.
- Root and hook scripts should have a single clear owner for each verification
  lane.
- Existing behavior must remain equivalent for callers of Habitat commands,
  hooks, and checks.
