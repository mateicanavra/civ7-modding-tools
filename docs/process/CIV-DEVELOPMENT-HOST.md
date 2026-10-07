# Local Civ Development

Use this guide for the tooling platform on one development machine with an
existing Civilization VII installation. It covers workspace builds, Studio,
studies and local game diagnostics. One-time machine setup, migration and
recovery records are private operational material, not product documentation.

## Prepare The Workspace

Use the Bun version in `packageManager` and Node version in `engines.node`
from [package.json](../../package.json). Install Gitleaks 8.28.0 from its official
release or a trusted package manager for the existing privacy check.

From the repository root:

```sh
node --version
bun --version
git status --short --branch
git submodule update --init .civ7/outputs/resources
bun install --frozen-lockfile
```

The pinned resource mirror supplies the current game contracts. Initialize
optional reference submodules only when the selected work needs them. Follow
[Graphite](GRAPHITE.md) and preserve unrelated local changes.

Discover project targets, then let Nx build their dependency graph:

```sh
nx show project civ7-cli --json
nx show project swooper-physics-mod --json
nx show project mapgen-studio --json
nx run-many -t build -p civ7-cli,swooper-physics-mod,mapgen-studio
```

After building, use `bun apps/cli/bin/run.js <args>` from the repository root.
The optional `civ7-cli:link:global` target makes the `civ7` command available.
The launcher is Bun-owned, not a Node entrypoint. See the
[CLI execution matrix](../system/cli/OPERATIONS.md#execution-matrix).

## Studio And Studies

Inspect existing listeners before starting another Studio instance:

```sh
nx run mapgen-studio:dev
```

The frontend defaults to `http://127.0.0.1:5173` and its daemon to loopback port
`5174`. Generate a small case and check stage completion and a nonblank rendered
layer. An HTTP response alone does not verify browser generation. Run in Game
is a separate native check; use the existing Studio workflow rather than
constructing another deployment path. Stop the foreground server with Ctrl-C.

For a bounded physical-network comparison, select a new output directory outside
Git and run the definition-owned study:

```sh
: "${STUDY_OUTPUT:?Set STUDY_OUTPUT to a new output directory outside Git}"
/usr/bin/time -l bun plugins/mod/map/swooper-physics/scripts/compare-coherence.ts \
  --output "$STUDY_OUTPUT" --size huge --seed 1018 --variants baseline
```

Retain configuration, source/resource identity, completion status, timing,
memory and output digests with the study. Keep physical model results,
generated diagnostic views, native screenshots and gameplay witnesses distinct.
See [MapGen workstreams](../../.agents/skills/civ7-mapgen-workstream/SKILL.md)
for the existing owner and verification boundaries.

## Local Game Diagnostics

For CLI diagnostics, enable `EnableTuner 1` in the installed game's existing
`AppOptions.txt` `[Debug]` section while Civ is stopped, preserving unrelated
settings. Enable development modules or panels only when the selected workflow
needs them. See the
[operational debugging skill](../../.agents/skills/civ7-operational-debugging/SKILL.md)
for configuration and scripting-state selection.

Discover current flags with `civ7 game --help` and each leaf's `--help`.
Run local probes on the game machine, using its actual listener; `4318` is the
default, not authority for a changed configuration:

```sh
env -u CIV7_TUNER_HOST -u CIV7_TUNER_HOSTS -u CIV7_TUNER_PORT \
  civ7 game health --state "App UI" --host 127.0.0.1 --port 4318 --json
```

Require `ok: true` and the intended returned endpoint. Explicit `--host`
does not suppress inherited host fallback, so clear those variables before
local diagnostics and inspect dry-run targeting before mutations. The main
menu uses App UI; the gameplay Tuner state exists only during a game. Its
absence at the menu is not itself a hang. Keep diagnostic endpoints private.

In the English desktop menu, **Additional Content > Add-ons** owns mod
enable/disable choices. To load a saved map setup, open **New Game**, advance
to **Game Setup > Advanced Settings**, and use the **Load Configuration** icon
in **Advanced Options**, then **Local > Load**. The completed setup hub also
offers that icon. Inspect the map script, size and seeds before launching;
loading a configuration does not prove map generation.

## Deploy And Restart

Use the realization project's existing build/deploy or Studio Run in Game
workflow. Redeploying an already-registered, same-name mod normally needs only
an in-game map/session restart, not a full application quit.

For a newly registered mod or genuine application recovery, follow the
[graceful-exit contract](../system/cli/OPERATIONS.md#graceful-application-exit).
Obtain unsaved-progress authority, dispatch once and verify actual process exit;
do not treat Tuner disconnection as completion or automatically force-kill.

## Inspect Results

Use [Local Study Viewers](LOCAL-VIEWERS.md) for retained images, physical flow
views and milestone publication. Serve only the intended static artifact root,
not repository source, Studio RPC or game-control endpoints. Keep actual
addresses, service state and instance records outside Git.
