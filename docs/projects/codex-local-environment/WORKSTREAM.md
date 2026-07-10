# Codex Local Environment Workstream

## Authority

The project-local environment is governed by OpenAI's [Local Environments](https://learn.chatgpt.com/docs/environments/local-environment) and [Git Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) documentation. The installed Desktop editor was inspected to record the schema it currently exposes. Repository behavior is governed by `AGENTS.md`, `docs/process/resources-submodule.md`, Nx project metadata, and the existing Studio restart helper.

## Corpus

- `.codex/environments/environment.toml` is the executable Desktop configuration selected by the installed app.
- `CODEX-LOCAL-ENVIRONMENT-REFERENCE.md` is the stable configuration contract and compatibility record.
- `OPERATIONAL-FIELD-GUIDE.md` maps the owner workflows, effects, recovery, and proof boundaries.
- `scripts/codex/manage-mapgen-studio.sh` owns only Studio processes created for its current worktree.
- `studio-refactor-handoff.md` records the lifecycle and bootstrap contracts the active Studio stack must preserve or deliberately repoint.
- `docs/process/CONTRIBUTING.md` now defers to the explicit resource-publication workflow rather than claiming a hook publishes resources.

## Decisions

- Fully prime each managed worktree through the ordinary repository flow: initialize resources and the pinned Effect reference source, perform a frozen Bun install, build, and check.
- Keep the source-configured Habitat Nx plugin loadable in a clean checkout before ignored `tools/habitat/dist` exists. Codex setup must not need a separate Habitat prebuild.
- Do not introduce `.worktreeinclude`. Ignored secrets, local game files, ports, and Studio state must not cross worktrees.
- Keep the action bar owner-oriented. Builds, resource lifecycle, apps, isolated Studio lifecycle, MapGen evidence, deployment, and Tuner health are visible; routine validation chains, formatter writes, Graphite actions, broad cleanup, direct game mutations, and package publishing remain documented terminal workflows.
- Derive Studio identity from the worktree path and persist it beneath ignored `.mapgen-studio/`. Cleanup kills the recorded tmux session only, never arbitrary listeners.
- Keep resource publishing, mod deployment, and runtime control visibly intentional operations.

## Proof Ledger

| Proof | Command or evidence | Result |
| --- | --- | --- |
| TOML syntax | `python3 -c 'import tomllib; tomllib.load(open(".codex/environments/environment.toml", "rb"))'` | Required before handoff. |
| Clean-worktree bootstrap | Resource and Effect initialization, frozen install, workspace build, and workspace check with no pre-existing `tools/habitat/dist` | Required after changing setup or the Nx plugin bootstrap path. |
| Resource initialization regression | `nx run civ7-cli:test` | Passes with hermetic temp-Git coverage for initializing an empty configured resource gitlink from a linked worktree, refusing a nonempty non-submodule directory without changing its contents, and preserving a required global URL rewrite while bypassing a failing global post-checkout hook. |
| Desktop schema | Open the Local Environments editor and inspect the setup, cleanup, actions, and platform filters | Required on a Desktop session; the app editor is the final UI authority. |
| Helper safety | `bash -n scripts/codex/manage-mapgen-studio.sh`; isolated two-worktree start/stop exercise | Required before relying on lifecycle cleanup. |
| Owner actions | Resource status, Docs/Playground, Studio, MapGen visualization, and Tuner health where a game is available | Run only with their stated host prerequisites. |
| Documentation | Markdown link and relevant Nx/Habitat checks | Required before merge. |

## Deferrals

No ignored files are copied today. Add `.worktreeinclude` only when a specific ignored file is both safe to duplicate and required for managed-worktree operation; document its owner, sensitivity, and deletion behavior before adding it.

The Desktop editor is currently the supported executor. A future non-Desktop consumer must explicitly adopt this contract and own its own lifecycle semantics rather than assuming compatibility.
