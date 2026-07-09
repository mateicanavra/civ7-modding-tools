# Effect Source Submodule

This repository keeps the Effect source at `.repos/effect` as a read-only
reference checkout. It is source-only: Civ7 does not vendor or publish the
Effect skill. RAWR HQ supplies that skill globally.

The submodule uses the official repository:

- `https://github.com/Effect-TS/effect-smol.git`
- Current pin: `3f0ccc04711b0a187b973e20fc9c3010c2560da2`

## Clone and initialize

Clone a new checkout with all submodules:

```bash
git clone --recurse-submodules <repo-url>
```

For an existing checkout, or after pulling a reviewed gitlink change, run:

```bash
bun run effect:init
bun run effect:status
```

`effect:init` runs `git submodule update --init --recursive -- .repos/effect`
and verifies the resulting checkout. It does not use `--remote`, reset dirty
work, or replace a conflicting path. `effect:status` verifies that the checkout
is the configured submodule, clean, and at the commit recorded by the
superproject gitlink.

## Pin and update policy

Effect source moves only through a reviewed update to the `.repos/effect`
gitlink. There is no automatic remote update and no `effect:publish` command.
Do not use `git submodule update --remote`; select and review a specific commit,
then record that exact gitlink change in the superproject.

## Transitioning an ignored Studio checkout

Some Studio worktrees may already have a local `.repos/effect` clone hidden by
the shared repository's common `info/exclude`. Before a future restack that
adopts this gitlink, require that clone to be clean and checked out at
`3f0ccc04711b0a187b973e20fc9c3010c2560da2`.

After the worktree adopts and initializes the gitlink, remove
`/.repos/effect/` from the common `info/exclude`. Git may emit a non-fatal
`unable to rmdir` warning while adopting the path. The safest fallback is to
move the clean local clone aside, run `bun run effect:init`, compare the
initialized submodule with the backup, and remove the backup only after
verification. Do not use `git submodule absorbgitdirs` for this shared-worktree
transition.
