# Civ7 Official Resources (Submodule Workflow)

This repo treats `.civ7/outputs/resources` as a git submodule pointing at the public snapshot repo:

- `https://github.com/mateicanavra/civ7-official-resources`

The authoritative flow is:

- `civ7-api-materializer` identifies the installed game and stages the exact
  admitted `Base`/`DLC` evidence, including source maps
- the materializer records deterministic application, Steam, profile, byte,
  and embedded-source provenance before replacing `.civ7/outputs/resources`
- Those changes are committed and pushed to the public resources repo
- The monorepo commits the updated submodule pointer

The generic `civ7 data zip` and `civ7 data unzip` commands remain useful data
operations. They are not official-API currentness proof and must not overwrite
the authoritative snapshot.

## One-time setup (per clone)

1. Initialize the submodule:
   - `bun run resources:init`
   - Or: `git submodule update --init --recursive`

2. Install dependencies so Husky installs the repo hooks:
   - `bun install`

## Daily usage

- Refresh official game evidence from the installed application:
  - `bun run refresh:data`
- Verify without changing the snapshot:
  - `nx run civ7-api-materializer:materialized:check`
- A refresh holds `.civ7/outputs/.resources.materializer.lock` for its complete
  transaction. If a terminated process leaves it behind, verify that no
  materializer is running before removing that one lock file; takeover is
  intentionally never automatic.
- Check whether the resources submodule is clean:
  - `bun run resources:status`
- Inspect diffs inside the resources repo:
  - `git -C .civ7/outputs/resources status`
  - `git -C .civ7/outputs/resources diff`

## Publishing Resources

Resource publishing is explicit:

- `bun run resources:publish`

When `.civ7/outputs/resources` is dirty, that command:

1. Commits changes directly to `main` in the resources repo
2. Pushes `main` to `origin` (`mateicanavra/civ7-official-resources`)
3. Stages the updated submodule pointer in the monorepo so the next monorepo
   commit records it

When Husky is installed by `bun install`, every monorepo commit runs:

- `bun habitat hook pre-commit`

That hook checks resources state but does not commit or push resources. If the
submodule is dirty, uninitialized, locked, or has an unstaged gitlink, the hook
fails with the explicit command to run before retrying the commit. A clean
staged gitlink is treated as an intentional pointer update.

## Cloning and updating

- Clone including submodules:
  - `git clone --recurse-submodules <repo-url>`
- After pulling monorepo changes, update the checked-out submodule commit:
  - `bun run resources:init`
  - Or: `git submodule update --init --recursive`

## Temporarily disabling hooks (escape hatch)

- Bypass one commit:
  - `git commit --no-verify`
- Disable hook routing for the clone:
  - `git config --unset core.hooksPath`

Re-enable with:

- `bun run prepare`

## Notes / risks

- Publishing extracted game resources publicly may be subject to licensing/ToS constraints; verify before distributing.
- Large updates can generate large commits in the resources repo; this is expected for snapshot-style publishing.
- The checked receipt proves equality with an identified installed source under
  one explicit profile. It does not claim that binary-injected APIs are
  available in every Civ7 realm or lifecycle state.
