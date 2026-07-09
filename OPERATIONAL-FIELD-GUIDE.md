# Operational Field Guide

This is the owner-facing operating manual for Civ7 Modding Tools. The toolbar is a short control surface; this guide holds the prerequisites, effects, proof, and recovery that make those controls safe.

## Operating Posture

Start in a clean, correctly targeted worktree:

```bash
git status --short --branch
gt log short
bun habitat classify <path-or-diff>
```

Use the targets Habitat reports with `nx run <project>:<target>`. Root `bun` scripts are reserved for repository-wide workflows and explicit operational commands. Generated `dist/`, `mod/`, map output, lockfiles, and `.civ7/outputs` are evidence surfaces: regenerate them rather than editing them.

Environment setup runs the same bootstrap expected in a fully provisioned clean worktree: initialize the resources submodule and pinned read-only Effect source reference, install the frozen Bun graph and Husky hooks, build the workspace, then run its static checks. It has no Codex-specific prebuild and does not copy ignored files because this repository has no `.worktreeinclude`.

The Effect checkout at `.repos/effect` is reference source, not a build input. `bun run effect:init` validates the recorded pin without updating it remotely or replacing a conflicting checkout; recovery belongs to [the Effect source-submodule runbook](docs/process/effect-source-submodule.md).

## Toolbar Actions

| Action | Prerequisites | Side effect and proof | Recovery |
| --- | --- | --- | --- |
| Rebuild workspace | Bun and dependencies | Rebuilds all Nx projects. Successful Nx exit is the proof boundary. | Read the first failed Nx target; run its reported project target after classification. |
| Sync resources snapshot | Git access to the submodule | Initializes or updates `.civ7/outputs/resources`; no resource content is changed. | Resolve a local directory that blocks checkout, then rerun `bun run resources:init`. |
| Inspect resources snapshot | Initialized submodule | Reports initialization, dirtiness, lock, and gitlink state; read-only. | Follow the emitted command, usually `git -C .civ7/outputs/resources status` or the explicit publish path. |
| Refresh game resources (macOS) | Local Civ7 data and initialized resources | Zips then unzips game data into the resource submodule. A dirty submodule is expected evidence, not publication. | Check `bun run resources:status`; inspect the submodule diff before publishing. |
| Publish resources snapshot | Reviewed resource diff and permission to push | Commits to the resources repo's `main`, pushes it, and stages the monorepo gitlink. Its output and a clean resource status are proof. | Do not retry blindly after a partial push; inspect both repositories, then retry the explicit command. |
| Serve Docs | Built workspace | Starts the Docs dev server in the action terminal. Its pre-dev code-fence normalizer can write documentation files; the printed local URL is proof. | Stop the terminal process, review any normalization diff, and use `nx run civ7-docs:fix:mdx-links` only when link repair is intended. |
| Build Playground | Built workspace | Builds the Playground's generated example output; the emitted artifact list is proof. This project has no long-lived local server target. | Inspect the build output and rerun after rebuilding its reported dependency. |
| Start isolated MapGen Studio (macOS) | Bun, Nx, tmux, curl, lsof, built dependencies | Allocates this worktree's tmux session and port pair, then waits for frontend HTTP 200. The URLs and session printed by the helper are proof. | Run the paired stop action; on startup failure inspect `tmux capture-pane -t <session>:daemon` and `:vite`. |
| Stop isolated MapGen Studio (macOS) | None | Kills only this worktree's recorded tmux session and removes its ignored state file. | It intentionally leaves unrelated listeners alone; stop those through their owning process. |
| Build standard MapGen visualization | Browser/WebGL-capable environment when viewing output | Regenerates the standard visualization output. The emitted artifact path is proof. | Rebuild the reported MapGen dependency and rerun with a fixed seed/dimensions when comparing results. |
| Build MapGen diagnostic dump | MapGen runtime dependencies | Writes a deterministic diagnostic dump beneath the Swooper Maps visualization output. | Use `nx run mod-swooper-maps:diag:list`, `:diag:analyze`, `:diag:diff`, or `:diag:trace` on the generated evidence. |
| Deploy Swooper Maps (macOS) | Reviewed mod build and local Civ7 mod destination | Copies the built mod using the canonical CLI. A deploy is a local game mutation. | Rebuild and redeploy deliberately; do not edit `mod/` output by hand. |
| Probe Civ7 Tuner (macOS) | Running game with Tuner reachable | Builds the CLI and asks `@civ7/direct-control` for JSON Tuner health. Successful JSON health is proof. | Check game/Tuner state and `CIV7_TUNER_HOSTS`, `CIV7_TUNER_HOST`, or `CIV7_TUNER_PORT`; default is `127.0.0.1:4318`. |

Platform-filtered actions are shown only where this repository's Civ7 and tmux workflow is supported. Docs, Playground, resource inspection, builds, and headless MapGen reports remain unfiltered.

## Resource Snapshot Flow

Initialize once per clone with `bun run resources:init`. Refreshing is deliberately separate:

```bash
bun run refresh:data
bun run resources:status
git -C .civ7/outputs/resources diff
bun run resources:publish
```

`resources:publish` is the sole resource commit/push path. Husky pre-commit validates resource state; it does not publish it. A dirty, uninitialized, locked, or unstaged gitlink is a stop signal. Use `bun run resources:unlock` only after understanding why the lock exists.

## Studio and MapGen Flow

The environment helper owns its process creation rather than delegating to the shared restart helper, whose default behavior tears down listeners. It hashes the current worktree path, selects a free pair in `15000-17999`, writes `.mapgen-studio/codex-environment/instance.env`, builds Studio through Nx, and starts a named daemon and Vite pair in a private tmux server socket. The resulting socket and session have the form `codex-mapgen-<hash>`.

```bash
bash scripts/codex/manage-mapgen-studio.sh start
bash scripts/codex/manage-mapgen-studio.sh status
bash scripts/codex/manage-mapgen-studio.sh stop
```

The cleanup hook calls only `stop`. It never invokes the shared default `mapgen-studio-runner` session or default ports `5173/5174`. If a recorded port has been reused after its session disappeared, the next start chooses a different pair; stop leaves that listener untouched.

For a browser run, use Studio's `mod-swooper-maps/standard` recipe with an explicit seed and dimensions, then inspect progress and visualization in the browser. For deterministic headless evidence, use `nx run mod-swooper-maps:diag:dump` and the `diag:*` readback commands above. Treat `nx run mod-swooper-maps:test`, `:check`, and `:build` as the normal architecture proof when changing MapGen code, not as toolbar defaults.

## Civ7 Runtime Control

All runtime operations must go through `@civ7/direct-control`; do not create local socket scripts or alternate transports. Health is the safe first move. Game restart, map reads, autoplay, and other mutations are terminal workflows, not toolbar buttons, because they affect a live game.

On macOS, live proof may use `CIV7_SCRIPTING_LOG` to override the default game scripting log. A valid run-in-game proof snapshots the log, requires fresh completion markers, and rejects failure markers. Treat existing game installation, save, and log paths as host configuration, not repository configuration.

## Release and Repository Changes

Use Graphite stacks rather than ad hoc branches. Keep deploy, package publication, and resource publication explicit and separately reviewed. For package release, follow `docs/process/CONTRIBUTING.md`; local `nx run civ7-sdk:publish:npm` and `nx run civ7-cli:publish:npm` are intentionally absent from the toolbar.

Routine `bun run lint`, `bun run test`, `bun run check`, `bun run biome:format`, broad `bun run clean`, Graphite mutation, and direct game control remain terminal commands. They are valuable but not frequent owner controls, and some write broadly enough to deserve a deliberate terminal invocation.

## Recovery Checklist

1. Inspect worktree and Graphite state: `git status --short --branch`, then `gt log short`.
2. Re-run `bun habitat classify <path-or-diff>` and use only reported project targets.
3. For resources, use `bun run resources:status`; do not hand-edit the submodule or remove a lock speculatively.
4. For Studio, use the helper's `status`; capture its named tmux panes before stopping it.
5. For a failed runtime probe, validate Civ7/Tuner availability before retrying; no environment action starts or changes a game.
6. For setup failure, fix [`.codex/environments/environment.toml`](.codex/environments/environment.toml) or the underlying repository prerequisite, not a single managed worktree, then create a fresh worktree to prove it.
