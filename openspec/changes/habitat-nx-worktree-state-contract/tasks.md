# Tasks - Habitat Nx Root Workflow Contract

## 1. Design And Review

- [x] 1.1 Record authority, current behavior, and official Nx behavior.
- [x] 1.2 Define alternatives and select package-owned targets plus local Nx
  script path.
- [x] 1.3 Run design review lanes: architecture, verification, and shortcut
  boundary.
- [x] 1.4 Reconcile the design with official Nx documentation and remove custom
  Nx state overrides.

## 2. DAG Implementation

- [x] 2.1 Remove the root `nx` wrapper and keep `nx` as a root dev dependency.
- [x] 2.2 Keep root `package.json` thin and avoid per-verifier root aliases.
- [x] 2.3 Move package-specific verifier ownership into owning package `verify`
  targets.
- [x] 2.4 Repoint root workflow scripts to owning package Nx targets where graph
  ownership exists.
- [x] 2.5 Avoid custom Nx socket, cache, workspace-data, and plugin-isolation
  environment overrides.

## 3. Habitat And Downstream Realignment

- [x] 3.1 Route Habitat-spawned Nx commands through direct `nx`, relying on the
  documented global-to-local handoff.
- [x] 3.2 Update root `AGENTS.md` Tooling Defaults.
- [x] 3.3 Update active process/tooling docs that instruct direct Nx invocation.
- [x] 3.4 Record downstream assumptions and no-patch decisions.

## 4. Verification

- [x] 4.1 Run `bun install`.
- [x] 4.2 Validate this OpenSpec change strictly.
- [x] 4.3 Validate package-owned verifier discovery through direct `nx`.
- [x] 4.4 Run focused Habitat harness build through direct `nx`.
- [x] 4.5 Run focused Habitat harness tests through direct `nx`.
- [x] 4.6 Run root workflow scripts through owning package Nx targets:
  `bun run build` and `bun run verify` pass; `bun run lint` reaches the
  graph-owned Habitat checks and currently fails only on locked Habitat/Grit
  architecture findings.
- [x] 4.7 Commit the branch, create a fresh verification worktree from the branch,
  install, and run focused Nx verification.
- [x] 4.8 Remove the fresh verification worktree and leave repo state clean.

## 5. Closure

- [x] 5.1 Complete review disposition ledger.
- [x] 5.2 Complete downstream realignment ledger.
- [x] 5.3 Commit via Graphite with focused conventional commits.
