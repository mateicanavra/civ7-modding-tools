# Codex Local Environment Reference

This is the source-backed contract for the project-local [`.codex/environment.toml`](.codex/environment.toml). It describes the ChatGPT Desktop Local Environments feature, not a general Codex CLI configuration format.

## Authority and Scope

OpenAI's [Local Environments](https://learn.chatgpt.com/docs/environments/local-environment) and [Git Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) documentation is authoritative for lifecycle behavior. The installed ChatGPT Desktop application (`26.707.31123`, inspected on 2026-07-09) is the authority for the currently exposed TOML editor schema.

- Put shared configuration at `<repository-root>/.codex/environment.toml`.
- Desktop runs setup when it creates a managed worktree, and cleanup before it deletes one. Managed worktrees use shared Git metadata and normally begin detached.
- Toolbar actions run in the worktree's integrated terminal; an action is an intentionally invoked command, not lifecycle automation.
- `.worktreeinclude` is an opt-in list of ignored files to copy. It does not overwrite worktree files and skips source symlinks. This repository intentionally has no such file: secrets, local game files, and generated local state must stay local.
- The Desktop editor rewrites the complete file when saved. It does not preserve comments, formatting, or unknown keys. Keep this TOML deliberately small and do not put explanations in it.

Other tools may choose to consume this contract, but they are not assumed to execute it.

## Current TOML Contract

The Desktop editor emits `version = 1`, requires a nonblank `name`, always emits `[setup]`, and supports the following surface. A base script applies on every platform unless a platform script overrides it.

| TOML path | Shape | Required | Meaning |
| --- | --- | --- | --- |
| `version` | integer (`1`) | Yes | Current Local Environments format version. |
| `name` | nonempty string | Yes | Display name for the environment. |
| `[setup]` | table | Editor-emitted | Base worktree-creation script in `setup.script`. |
| `[setup.darwin]`, `[setup.linux]`, `[setup.win32]` | table | No | Platform-specific `script` that overrides the base setup script. |
| `[cleanup]` | table | No | Base pre-deletion script in `cleanup.script`. |
| `[cleanup.darwin]`, `[cleanup.linux]`, `[cleanup.win32]` | table | No | Platform-specific `script` that overrides the base cleanup script. |
| `[[actions]]` | repeated table | No | One toolbar action per table. |
| `[[actions]].name` | nonempty string | Yes, per action | Action label. |
| `[[actions]].command` | nonempty string | Yes, per action | Integrated-terminal command. |
| `[[actions]].icon` | string | No | One of `tool`, `run`, `debug`, or `test`; the editor defaults it to `tool`. |
| `[[actions]].platform` | string | No | `darwin`, `linux`, or `win32`; omitted means every platform. |

Scripts are TOML strings. Multiline literal strings are suitable for lifecycle scripts; single-line strings are suitable for actions. Platform values use Node platform names, not marketing names (`darwin`, not `macOS`).

## Repository Contract

The checked-in environment chooses a fully primed managed worktree:

1. `git submodule update --init --recursive -- .civ7/outputs/resources` initializes the tracked official-resources checkout, and `bun run resources:init` validates it through the repository's canonical recovery-aware command.
2. `bun install --frozen-lockfile` installs the locked workspace and runs the root Husky `prepare` hook.
3. `./node_modules/.bin/tsc -p tools/habitat/tsconfig.json` bootstraps the ignored runtime artifact for the source-configured Habitat Nx plugin. This is required before Nx can load the full workspace graph in a new worktree.
4. `bun run build` builds the Nx workspace.

This trades creation speed for a worktree that can immediately run owner workflows. It intentionally does not refresh game data, publish resources, deploy a mod, mutate a running game, or copy ignored machine state.

Cleanup calls the worktree-scoped Studio helper only. The helper records a worktree-specific tmux server socket, session, and unused frontend/daemon port pair beneath ignored `.mapgen-studio/`; it kills only that session and never kills listeners merely because they use a recorded port. See the [operational field guide](OPERATIONAL-FIELD-GUIDE.md) for the action contract and recovery paths.

## Change Rules

- Use the base lifecycle scripts for behavior common to every supported platform; add a platform override only when commands genuinely diverge.
- Keep action commands explicit about side effects. A command that publishes, deploys, or reaches a game must remain visibly named.
- Do not add routine lint/test/check chains, formatter writes, Graphite mutation, broad cleanup, direct game mutation, or package publication to the toolbar. They belong in the field guide.
- Parse the file after changes and verify it in the Desktop Local Environments editor before relying on a newly added schema feature.
