# Civ7 Official Resources (Submodule Workflow)

This repo treats `.civ7/outputs/resources` as a git submodule pointing at the public snapshot repo:

- `https://github.com/mateicanavra/civ7-official-resources`

The intended flow is:

- `civ7 data unzip` writes into `.civ7/outputs/resources`
- Those changes are committed and pushed to the public resources repo
- The monorepo commits the updated submodule pointer

## One-time setup (per clone)

1. Initialize the submodule:
   - `bun run resources:init`
   - Or: `git submodule update --init --recursive`

2. Install dependencies so Husky installs the repo hooks:
   - `bun install`

## Daily usage

- Refresh game data (zip then unzip):
  - `bun run refresh:data`
- Check whether the resources submodule is clean:
  - `bun run resources:status`
- Inspect diffs inside the resources repo:
  - `git -C .civ7/outputs/resources status`
  - `git -C .civ7/outputs/resources diff`

## Auto-publish behavior (source of truth = local)

When Husky is installed by `bun install`, every monorepo commit runs:

- `bun run habitat hook pre-commit`
- Inside that hook, `scripts/civ7-resources/publish-submodule.sh`

If `.civ7/outputs/resources` is dirty, it will:

1. Commit changes directly to `main` in the resources repo
2. Push `main` to `origin` (`mateicanavra/civ7-official-resources`)
3. Stage the updated submodule pointer in the monorepo (so the subsequent monorepo commit records it)

## Cloning and updating

- Clone including submodules:
  - `git clone --recurse-submodules <repo-url>`
- After pulling monorepo changes, update the checked-out submodule commit:
  - `bun run resources:init`
  - Or: `git submodule update --init --recursive`

## Temporarily disabling auto-publish (escape hatch)

- Bypass one commit:
  - `git commit --no-verify`
- Disable hook routing for the clone:
  - `git config --unset core.hooksPath`

Re-enable with:

- `bun run prepare`

## Notes / risks

- Publishing extracted game resources publicly may be subject to licensing/ToS constraints; verify before distributing.
- Large updates can generate large commits in the resources repo; this is expected for snapshot-style publishing.
