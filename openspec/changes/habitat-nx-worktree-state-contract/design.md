# Design - Habitat Nx Root Workflow Contract

## Problem Frame

The problem is root workflow ownership, not Nx socket placement. Nx is the
repository DAG, but several root scripts were still ordinary shell chains or
direct Habitat calls. In parallel worktrees, that left command routing split
between Nx and non-Nx script paths.

The system boundary for this change includes:

- root package scripts;
- package-owned Nx target metadata;
- ad hoc Nx commands used by agents;
- Habitat-spawned Nx commands;
- Bun as package manager and script runner;
- git worktree creation and fresh install verification.

The boundary excludes package dependency resolution, package-manager install
layout, and Nx internal state placement.

## Official Nx Facts That Matter

- The Nx daemon is enabled by default on local machines and disabled by default
  in CI/container-style environments.
- The daemon is one process per Nx workspace and uses a Unix socket on macOS and
  Linux.
- Nx docs say `NX_SOCKET_DIR` is an advanced override for socket placement,
  mainly useful for environments such as docker-compose.
- Nx 22.7 has worktree-aware cache behavior; Nx's `cacheDir` docs state that in
  a git worktree it resolves to the main repo's cache so all worktrees can
  share cache.
- `NX_WORKSPACE_DATA_DIRECTORY`, `NX_SOCKET_DIR`, `NX_DAEMON_SOCKET_DIR`, and
  `NX_ISOLATE_PLUGINS` exist, but using them here would be a local environment
  workaround rather than a root workflow design.

The consequence: the repo should not override Nx internals for normal local
worktree execution. The correct repo-owned layer is root workflow routing into
the DAG.

## Current Dynamics

### Reinforcing Loop

Loose root scripts -> inconsistent Nx entrypoints -> surprising worktree
behavior -> local repair attempts -> divergent local state -> harder fresh
worktree reproduction.

### Balancing Loop

Root scripts as thin entrypoints into owning package targets -> one DAG
entrypoint for reusable work -> normal Nx defaults -> reproducible
primary/worktree behavior -> fewer local repair attempts -> stable agent
workflow.

## Alternatives

### A. Package-Owned Targets Plus Standard Local Nx Installation

Keep root `package.json` as a thin command surface. Package-specific workflows
belong to the package that owns the implementation; root scripts call those
package targets through Nx. Verifier fanout is a single owning-package `verify`
script with mode flags. The root keeps `nx` in `devDependencies`; ad hoc
commands use the global `nx` command, which defers to the repo-local version.

Tradeoffs:

- Pros: workflow ownership follows project ownership; Nx caching and daemon
  behavior stay official; missing installs fail at the install layer; no custom
  socket or cache management; root `package.json` does not become a task
  registry.
- Costs: target names containing colons must use the `nx run <project>
  --target=<target>` form; command pass-through scripts with arbitrary user
  arguments need an explicit exception.
- Long-term effect: agents stop reasoning about task ordering and package
  ownership remains legible.

### B. Only Change Direct Nx Calls

Remove the root package-manager wrapper and repoint direct Nx calls, but leave
Habitat and other root workflows outside the graph.

Tradeoffs:

- Pros: narrower code change.
- Costs: root workflow ownership remains split; Habitat verification still
  enters the graph indirectly; future scripts can drift back into manual shell
  orchestration.
- Long-term effect: partial normalization, rejected.

### C. Override Nx State Placement

Set Nx cache, workspace-data, socket, or plugin-isolation env vars in a custom
runner.

Tradeoffs:

- Pros: can make one local failure mode disappear.
- Costs: contradicts official Nx defaults for normal local use; introduces new
  failure modes such as Unix socket path limits; obscures the fact that Nx
  already has worktree-aware cache behavior.
- Long-term effect: rejected.

### D. Repair Install Layout Or Directly Execute Binaries

Run a path under `node_modules` directly or repair package-manager links during
worktree setup.

Tradeoffs:

- Pros: can make one local checkout pass.
- Costs: violates the package-manager boundary and breaks future worktrees.
- Long-term effect: rejected.

## Chosen Path

Choose Alternative A.

Root scripts that build, check, lint, test, verify, deploy, publish, manage
resources, or run named repo maintenance route to the owning package targets
where ownership exists. Generic root command surfaces stay direct when routing
them through Nx would change their contract. There is no root `nx` wrapper:
ad hoc Nx execution uses the globally installed `nx` command, and Nx defers to
the repo-local root `devDependencies.nx` version.

Generic command pass-throughs and root-owned maintenance remain direct where
routing them through Nx would change their contract: `prepare`, `openspec`,
`habitat`, docs serving, resources submodule scripts, and Graphite import
helpers. Those are command surfaces or root-owned maintenance commands, not
package workflow DAG targets.

## Implementation Shape

### Root Command Surface

- Keep one root `verify` script that invokes Nx `verify` targets.
- Do not add per-verifier root scripts or a synthetic root target table.
- Use package project targets for package-owned workflows such as CLI, SDK,
  docs, mapgen, studio, Habitat, and Swooper.
- Leave explicit command pass-throughs direct when their purpose is to forward
  arbitrary arguments or run root-owned maintenance scripts.

### Local Nx Installation

- Keep `nx` in root `devDependencies`.
- Do not add a root package script named `nx`; it shadows the standard Nx CLI
  resolution path and adds an extra package-manager execution layer.
- Use `nx <args>` directly for ad hoc commands. The globally installed Nx CLI
  defers to the repo-local Nx version, matching the official installation
  model.
- Do not set `NX_SOCKET_DIR`, `NX_DAEMON_SOCKET_DIR`,
  `NX_WORKSPACE_DATA_DIRECTORY`, `NX_CACHE_DIRECTORY`, or
  `NX_ISOLATE_PLUGINS`.
- Let Nx apply its official local daemon, socket, workspace-data, and
  worktree-aware cache defaults.

### Package Verification

- `@civ7/map-policy` owns generated-table verification through
  `@civ7/map-policy:verify`; `--write` regenerates.
- `mod-swooper-maps` owns Swooper placement/live proof tools through
  `mod-swooper-maps:verify -- --mode <mode>`.
- The root script table does not expose each focused verifier as a separate
  top-level alias.

### Habitat-Spun Nx

- Replace Habitat-spawned `nx affected` and `nx graph` calls with
  `nx ...`.
- Update Habitat classification guidance and tests to print the same command
  surface.

### Docs

- Root `AGENTS.md`: root workflows are thin entrypoints into owning Nx targets;
  ad hoc terminal Nx commands use `nx <args>`; package scripts stay
  leaf-local and do not call Nx to hide dependency ordering.
- Active process/tooling docs: use direct `nx` examples that rely on the
  documented global-to-local handoff.

## Review Questions

1. Do package-specific workflows route through their owning package targets
   rather than a root task registry?
2. Does any Habitat-spawned Nx command bypass direct `nx` invocation and the
   documented global-to-local handoff?
3. Does the design avoid package-manager link repair, direct Nx binary paths,
   and custom Nx state overrides?
4. Does fresh-worktree verification exercise the branch through a real install?

## Failure Model

If fresh-worktree verification fails after this change, classify the failure by
layer:

- install layer: `bun install` did not produce a runnable dependency graph;
- command layer: global `nx` did not defer to the root dev dependency;
- target layer: Nx invoked correctly but the target itself failed.

Those are the layers this workstream owns.
