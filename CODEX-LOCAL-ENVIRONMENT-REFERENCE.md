# Codex Local Environment Reference

This is the source-backed contract for the project-local [`.codex/environments/environment.toml`](.codex/environments/environment.toml). It describes the ChatGPT Desktop Local Environments feature, not a general Codex CLI configuration format.

## Authority and Scope

OpenAI's [Local Environments](https://learn.chatgpt.com/docs/environments/local-environment) and [Git Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) documentation is authoritative for lifecycle behavior. The installed ChatGPT Desktop application (`26.707.31123`, inspected on 2026-07-09) is the authority for the currently exposed TOML editor schema.

- The installed Desktop application creates and selects shared configuration at `<repository-root>/.codex/environments/environment.toml`. Keep one executable environment authority; a sibling `.codex/environment.toml` is not selected by the current app.
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

Automatic setup follows the repository's ordinary clean-worktree bootstrap:

1. `bun run resources:init` initializes and validates the official-resources submodule.
2. `bun run effect:init` initializes and validates the pinned, read-only Effect source reference. The workspace build uses its installed package dependency rather than this checkout.
3. `bun install --frozen-lockfile` installs the locked workspace and runs the root Husky `prepare` hook.
4. `bun run build` builds the Nx workspace.
5. `bun run check` verifies the workspace's static checks.

There is no environment-specific build path. In particular, setup does not copy generated output or prebuild Habitat. The source-configured Habitat Nx plugin must be able to load before `tools/habitat/dist` exists, just like every clean checkout.

This trades creation speed for a fully primed worktree. `bun run check` includes
project typechecking and Habitat policy through one Nx graph. Lint and tests
remain outside setup; tests run in the `bun run ci` graph and lint remains an
explicit root workflow. Game-data refresh, publication, deployment, live-game
operations, and ignored machine state remain outside setup.

Studio development is an explicit foreground action backed by one Nx continuous
graph. The action terminal owns that graph, and interrupting it stops both the
frontend and daemon. See the [operational field guide](OPERATIONAL-FIELD-GUIDE.md)
for the action contract and recovery paths.

## Change Rules

- Use the base lifecycle scripts for behavior common to every supported platform; add a platform override only when commands genuinely diverge.
- Keep setup equivalent to the documented clean-worktree bootstrap. Do not add environment-only bootstrap commands or depend on generated artifacts from another checkout.
- Keep action commands explicit about side effects. A command that publishes, deploys, or reaches a game must remain visibly named.
- Do not add routine lint/test/check chains, formatter writes, Graphite mutation, broad cleanup, direct game mutation, or package publication to the toolbar. They belong in the field guide.
- Parse the file after changes and verify it in the Desktop Local Environments editor before relying on a newly added schema feature.
