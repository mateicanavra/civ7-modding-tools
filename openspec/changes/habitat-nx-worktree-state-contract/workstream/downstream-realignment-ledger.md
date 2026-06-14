# Downstream Realignment Ledger - `habitat-nx-worktree-state-contract`

| Surface | Prior Assumption | Impact | Disposition |
|---|---|---|---|
| Root `AGENTS.md` | Ad hoc Nx commands used `nx ...`, and package scripts could still hide dependency ordering. | Needed one explicit repo Nx entrypoint without synthetic root target sprawl. | Patched to `nx <args>`, package-owned workflow targets, Habitat-spawned Nx through the same entrypoint, and leaf-local package-script guidance. |
| Root package scripts | Several named workflows were loose shell chains or direct Habitat calls. | Workflows could bypass the graph or turn root `package.json` into a task registry. | Patched package-owned workflows to their owning Nx targets and collapsed verifier aliases into package `verify` modes. |
| Habitat command engine and hooks | `nx affected` and `nx graph` were spawned directly. | Habitat verification could bypass the repo command surface. | Patched to spawn `nx ...`. |
| Active process/tooling docs | Some examples used older direct Nx forms. | Agents could copy a command outside the contract. | Patched active docs and Habitat README examples. |
| Nx state placement | A custom runner tried to own socket/cache/workspace-data placement. | This contradicted official local Nx defaults and introduced a socket path failure. | Removed; Nx uses official defaults. |
| Historical OpenSpec/project records | Older records mention legacy command forms as historical evidence. | Patching history would obscure what happened at the time. | No patch; current contract is recorded in this change. |
