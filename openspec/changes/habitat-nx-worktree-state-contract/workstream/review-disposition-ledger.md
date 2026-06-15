# Review Disposition Ledger - `habitat-nx-worktree-state-contract`

| ID | Lane | Severity | Finding | Disposition | Repair |
|---|---|---:|---|---|---|
| NWSC-REV-P1-001 | architecture | P1 | Root scripts should route package-owned work through Nx without turning root `package.json` into a task registry. | accepted | Package-owned workflows now call owning Nx targets; verifier aliases collapse into package `verify` modes. |
| NWSC-REV-P1-002 | architecture | P1 | Habitat-spawned `nx affected` and `nx graph` calls must not bypass the repo Nx entrypoint. | accepted | `command-engine.ts`, hook execution, classify guidance, and tests now use `nx ...`. |
| NWSC-REV-P1-003 | architecture | P1 | Custom socket placement created a Unix socket path failure and does not match official Nx local defaults. | accepted | Removed the custom runner and all Nx state env overrides; root scripts and Habitat-spawned Nx use direct `nx`, with `nx` retained as a root dev dependency. |
| NWSC-REV-P2-004 | verification | P2 | Colon-bearing target names need unambiguous invocation. | accepted | Root scripts use `nx run <owner> --target=<target>` when target names contain colons. |
| NWSC-REV-P2-005 | verification | P2 | Fresh-worktree verification must run from a committed branch, not only the dirty primary checkout. | accepted | Tasks require commit before fresh verification worktree checks. |
| NWSC-REV-P2-006 | shortcut-boundary | P2 | Nx launch must not depend on direct `node_modules` paths, package-manager execution wrappers, or auto-installing package caches. | accepted | The repo follows the official Nx install model: a global Nx command is acceptable, and the root dev dependency controls the local Nx version. |
| NWSC-REV-P2-007 | shortcut-boundary | P2 | Downstream docs should not keep active direct Nx examples. | accepted | Root router and active process/tooling docs were updated; historical project records are left as history. |
