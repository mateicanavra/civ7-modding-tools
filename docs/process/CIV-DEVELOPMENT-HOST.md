# Civ Development Host

Use this guide to prepare a macOS host for Civ VII builds, studies, Studio and
native game checks, or to move that work between computers without losing user
data. It describes reusable procedures, not a particular machine's deployment.
Keep hostnames, usernames, private URLs, credentials, local checkout paths and
machine-specific deployment/migration receipts in a private operator inventory
outside the repository. Useful non-identifying procedures and qualification
results belong in public documentation.

| Task | Start here |
| --- | --- |
| Build on a fresh host | [Prepare the host](#prepare-the-host) |
| Run a study or Studio | [Run studies and Studio](#run-studies-and-studio) |
| Move saves, settings and mods | [Move game state safely](#move-game-state-safely) |
| Recover from a game-state change | [Roll back game-state changes](#roll-back-game-state-changes) |
| Publish a viewer or reduce retained data | [Share results and retain evidence](#share-results-and-retain-evidence) |

For an ordinary redeploy of an already-registered, same-name mod, restart the
map/session rather than quitting the entire application. A newly registered mod,
application recovery, or stopped-game data replacement may require a full exit.
The [CLI's graceful-exit contract](../system/cli/OPERATIONS.md#graceful-application-exit)
owns the exact exit procedure and its unsaved-progress authorization requirements.

## Prepare The Host

Work from a local checkout of the existing repository lineage. Do not create a
second algorithm fork to move workloads, and do not use a cloud-synced directory
for live SQLite databases, dependency trees or generated study output. Record the
selected code revision and resource revision privately before transferring work.

### Install And Build The Pinned Workspace

Use the Bun version in `packageManager` and Node version in `engines.node` from
[`package.json`](../../package.json). Install from official vendor distributions
or a trusted package manager. Confirm the actual binaries, not a Node-compatible
version banner emitted by Bun. Install Gitleaks 8.28.0 from its official release
or a trusted package manager for the repository's privacy check:

```sh
# Run from the repository root.
node --version
bun --version
git status --short --branch
git submodule update --init .civ7/outputs/resources
bun install --frozen-lockfile
```

The pinned resource mirror is required. Initialize optional vendor submodules
only when the selected work consumes them. Preserve existing local changes and
follow [the repository's Graphite workflow](./GRAPHITE.md).

Discover the current targets before building; Nx owns dependency freshness:

```sh
nx show project civ7-cli --json
nx show project swooper-physics-mod --json
nx show project mapgen-studio --json
NX_DAEMON=false nx run-many -t build,link:global,test:studio-run-in-game \
  -p civ7-cli,swooper-physics-mod,mapgen-studio --skip-nx-cache --parallel=3
NX_DAEMON=false nx run civ7-cli:test --skip-nx-cache
```

The linked `civ7` launcher is Bun-owned. Before linking, use
`bun apps/cli/bin/run.js <args>` after the build. Do not invoke that entry point
with Node. The [CLI execution matrix](../system/cli/OPERATIONS.md#execution-matrix)
distinguishes development composition from built and linked execution.

<details>
<summary>Clean-install errors resolving React declarations or math.gl types</summary>

A clean isolated Bun install can expose missing root links for RJSF's React
declarations or the upstream `@loaders.gl/schema-utils` import of
`@math.gl/types`. First confirm the error and the installed, lock-pinned package
versions. For the currently qualified dependency layout, these links repair the
environment without changing source or lockfile:

```sh
mkdir -p node_modules/@types node_modules/@math.gl
test -e node_modules/@types/react || \
  ln -s ../.bun/@types+react@19.2.17/node_modules/@types/react node_modules/@types/react
test -e node_modules/@math.gl/types || \
  ln -s ../.bun/@math.gl+types@4.1.0/node_modules/@math.gl/types node_modules/@math.gl/types
```

Apply only when those pinned package directories exist; do not overwrite a
different dependency layout or install arbitrary versions. Repeat the uncached
build afterward. This is a version-specific workaround, not a claim that every
fresh install succeeds unassisted.

</details>

## Run Studies And Studio

### Execute A Bounded Study On The Intended Host

Run the definition-owned harness on the development host rather than copying an
old result and treating it as fresh execution. Set `STUDY_OUTPUT` to a new private
output directory before running this example:

```sh
/usr/bin/time -l bun plugins/mod/map/swooper-physics/scripts/compare-coherence.ts \
  --output "$STUDY_OUTPUT" --size huge --seed 1018 --variants baseline
```

Record source/resource revisions, configuration, elapsed time, peak memory,
completion status and output digests in the run receipt. Keep host execution
identity and actual paths private; publish sanitized scientific qualification
when useful. Check case completion and harness verification, not just process
exit. A passing portable baseline establishes that workload on the tested host; it
does not qualify candidate physics, installation, native map generation or
gameplay. Keep numerical source/configuration fixed while a comparison family
is running.

### Start And Verify Studio

Inspect existing listeners before starting another instance, then run the
existing target in the foreground:

```sh
NX_DAEMON=false nx run mapgen-studio:dev
```

Studio's default frontend is `http://127.0.0.1:5173`; its daemon defaults to
loopback port `5174`. Open the frontend on the host, generate a small case and
verify stage completion plus a nonblank rendered layer. An HTTP response alone
is not a browser or build check. When viewing through an authenticated remote
tunnel, distinguish the host serving Studio from the computer executing its
browser worker. Verify Live Civ/Run in Game separately from portable generation.

Stop a foreground session with Ctrl-C. A background service needs its own
verified lifecycle and logs; a detached process is not a login/reboot service.
If macOS privacy controls prevent a service from executing its wrapper, use the
supported foreground workflow rather than weakening those controls. Before
stopping a background process, verify its saved PID and command identity; never
kill an arbitrary port owner.

## Move Game State Safely

Keep the source intact until the target passes both preservation and native-use
checks. The normal macOS user-data root is
`~/Library/Application Support/Civilization VII`; resolve the actual local root
on each host rather than carrying an absolute path from another computer.
The public procedure below preserves files and reconciles choices through native
UI. It does not promise complete mod-preference portability: when a mod has no
settings UI or reviewed migration procedure, retain target LocalStorage, keep
the source backup and record that preference transfer as unresolved.

### Stop, Snapshot And Classify Before Writing

1. Stop Civ on both source and target. Confirm whether unsaved progress may be
   lost on each. Request Civ's graceful exit
   through its own UI or the existing authorized diagnostic, then independently
   verify the game process is absent on that same host. A successful command,
   disconnected Tuner or timeout is not the exit postcondition. Reconcile an
   uncertain dispatch before retrying; do not automatically force-kill.
2. Snapshot source and target separately into private backup directories
   outside Git and outside the live game tree. Use SQLite's backup API for
   coherent database snapshots, not live database/WAL file copies. Keep other
   writers stopped throughout an apply; a process-list check is not a launch lock.
3. Inventory portable files, target-only data and conflicts. Record source
   digests, backup digests and intended changes before applying a reviewed merge.

| Data | Portable treatment |
| --- | --- |
| Saves, saved `.Civ7Cfg` configurations, user mod files and mod user data | Merge regular files, preserve target-only files and back up every overwritten conflict. |
| Gameplay/audio preferences and development toggles | Reconcile explicit allowed choices; preserve target graphics, display scaling, audio routing, device and identity values. |
| Account, Steam/network, legal/consent, DNA, achievements/history and generated databases | Keep target-owned; do not transplant whole source files or credentials. |
| Mod scan metadata and LocalStorage | Keep the native scan database; reconcile explicit mod choices by stable identity and preferences through the owning UI. No blanket database copy. |

### Make Recoverable Snapshots

On each computer, set `GAME_DATA` to its actual user-data root and `BACKUP` to a
new private absolute directory outside that root and outside Git. Run the
read-only inventory and list SQLite files, including databases in subdirectories:

```sh
GAME_DATA="$HOME/Library/Application Support/Civilization VII"
: "${BACKUP:?Set BACKUP to a new private absolute backup directory}"
test -d "$GAME_DATA" || exit 1
test ! -e "$BACKUP" || exit 1
mkdir -p "$BACKUP/game"
civ7 game local-data inspect --app-support-dir "$GAME_DATA" --json
find "$GAME_DATA" -type f -name '*.sqlite'
```

Copy non-database files and directories into `BACKUP/game`, preserving their
relative paths. Do not treat SQLite databases or their `-wal`/`-shm` companions as
ordinary files. For each database, create the matching parent directory in the
backup, open the original with `sqlite3 -readonly`, and use its interactive
`.backup` command. For example, after opening `Mods.sqlite`:

```text
.timeout 5000
.backup "/absolute/private/backup/game/Mods.sqlite"
.quit
```

Replace that example destination with the actual `BACKUP/game` path; shell
variables do not expand inside the SQLite prompt. Open each resulting backup
with `sqlite3 -readonly` and run `PRAGMA integrity_check;`; require `ok`.
Hash the completed backup's regular files with `shasum -a 256` and retain a
manifest of relative paths and digests outside `BACKUP/game`. Check it again
after transfer. Keep the source and target snapshots clearly labeled; a partial
copy or a database failing integrity is not a completed recovery snapshot.

### Merge Files Without Replacing The Target Tree

Transfer the source snapshot to a separate staging directory on the target and
verify its manifest there. Work only from that snapshot, not a changing source
game directory. For each regular file under `Saves`, `Mods` and `ModUserData`:

1. If the relative path is absent on the target, create its parent directories
   and copy the file; record the path as newly imported with its digest.
2. If its digest already matches, leave it alone.
3. If its digest differs, locate and verify the original in the target snapshot
   before replacing it. Review the conflict, then record the relative path,
   original digest and imported digest. Keep both versions until acceptance.

Preserve every target-only file. Do not replace a whole existing directory in
Finder; merge its contents. Stop on symlinks, special files or file/directory
conflicts rather than following or overwriting them. Use the change record to
rehash each applied file and its original backup before relaunch.

The approved development toggles are `EnableTuner`, `EnableDevModules`,
`EnableDebugPanels` and `ShowDebugTooltips`, not the entirety of `AppOptions.txt`.
A commented source default is not an explicit setting. For mod choices, preserve
both enabled and disabled states; leave null/conflicting intent unresolved rather
than guessing. Never transplant `Mods.sqlite` with source-machine scanned paths.
For normal preference transfer, compare explicit source choices with the
target's native Options screens and change only the reviewed gameplay/audio
choices. Recreate mod preferences through the owning mod's settings UI; do not
copy the whole LocalStorage database. File-level preference editing requires a
stopped game, a verified original backup, matching format versions and an
explicit section/key allowlist, not a whole-file replacement.

### Enable Local Diagnostics When Needed

Native UI migration does not require Tuner. For the CLI checks below, gracefully
stop the game, retain the target `AppOptions.txt` backup, and set the existing
`EnableTuner` key to `1` in its `[Debug]` section before relaunch. Development
work may also require `EnableDevModules 1` and `EnableDebugPanels 1` in `[Debug]`,
or `ShowDebugTooltips 1` in `[UI]`; enable only what the selected workflow needs.
Edit the matching key in its existing section, avoiding duplicate active keys
and preserving every unrelated value. Do not copy another computer's options
file or change firewall/privacy policy to obtain a diagnostic socket.

After relaunch, use `civ7 game --help`, `civ7 game health --help` and
`civ7 game status --help` to confirm the installed leaves/flags. Inspect the
actual local listener and selected provider configuration; `4318` below is the
default, not authority for a changed endpoint. Keep the socket private.

### Relaunch, Scan And Reconcile Native State

Relaunch through the installed Steam client on the target, keeping its existing
account and library. If automating the launch, identify the active Steam
executable and verify its architecture rather than assuming an old app stub is
usable; Steam's application ID for Civ VII is `1295660`.

Allow Civ to scan the migrated mod files. In the English desktop menu, open
**Additional Content > Add-ons**, select each intended mod and use its
**Enable** or **Disable** control. Avoid bulk enable/disable controls when
preserving mixed choices. Match the mod's identity, not its row position or an
old machine's scanned path. Leave ambiguous source intent unresolved. If a
maintainer instead uses a reviewed database migration, stop gracefully again,
take another backup, change only explicit stable-ID choices, and verify protected
native data plus integrity before relaunch. No migration step should create
account entitlements or import credentials.

At the main menu, check the App UI scripting state:

```sh
env -u CIV7_TUNER_HOST -u CIV7_TUNER_HOSTS -u CIV7_TUNER_PORT \
  civ7 game health --state "App UI" --host 127.0.0.1 --port 4318 --json
env -u CIV7_TUNER_HOST -u CIV7_TUNER_HOSTS -u CIV7_TUNER_PORT \
  civ7 game status --host 127.0.0.1 --port 4318 --json
```

Run these on the target itself. The current CLI adds inherited host candidates
even with an explicit `--host`; clearing them prevents fallback to another
computer's game. Require health's `ok: true` and the intended returned host/port,
not just exit code zero. Apply the same endpoint discipline before any diagnostic
mutation. Ready App UI and an inactive gameplay state are compatible; status's
playability result is not a shell-readiness assertion. A post-Begin
gameplay canary is not a main-menu readiness requirement. Keep Tuner and the
inspector private; the
[operational debugging skill](../../.agents/skills/civ7-operational-debugging/SKILL.md)
owns deeper state selection and proof boundaries.

### Verify Preservation And Native Use Separately

Rehash copied files and checked backups, including saved configurations, and
confirm target-only saves remain. Compare backups to their own recorded hashes;
two separately created SQLite snapshots need not be byte-identical to be
logically equivalent. Native writers may change live preferences or database
bytes after relaunch, so keep that evidence window separate from stopped-game
apply receipts.

In the English desktop menu, choose **New Game**, advance through initial
leader/civilization selection to **Game Setup**, then open **Advanced Settings**.
In **Advanced Options**, activate the icon with the **Load Configuration**
tooltip. The completed setup hub also offers that icon directly. In the **Local**
list, select one saved `.Civ7Cfg` configuration and choose **Load** once. Resolve
missing/unowned-content warnings rather than bypassing them. After returning to
setup, do not press **Launch Game**, **Host** or **Begin Game**. Labels are from
the shipped English desktop UI; localization or later builds may differ.
Verify the displayed selections, including advanced fields, for the intended
map script, size, player count, both seeds, speed/difficulty and selected
leader/civilization. Repeat for each configuration chosen for acceptance. If
using maintainer diagnostics for readback and observation times out after an
accepted dispatch, reconcile with fresh bounded reads rather than repeating the
mutation. Recheck installed
and enabled mods after each load because saved configurations can change them.
File preservation does not prove native loading; native shell readback does not
prove map-script execution or gameplay. State exactly which configurations and
which proof class were exercised in the private acceptance receipt.

### Roll Back Game-State Changes

Stop gracefully and make another snapshot of the current target before recovery.
Use the recorded change list, not a whole-tree overwrite:

1. For overwritten files, verify the original target backup's digest, restore
   that file to its original relative path and rehash the restored copy.
2. Newly imported files have no overwritten original. Remove only recorded imports
   deliberately selected for rollback, and only if their current digest still
   matches the import; preserve changed files for review.
3. Keep target-only saves and saves created after migration unless intentionally
   rolling those back too. Undo native preference/mod choices through their UI.
4. If rolling back an edited SQLite database, stop all its writers, retain the
   current snapshot, restore the coherent pre-edit backup and verify integrity
   before relaunch. Do not combine it with newer `-wal`/`-shm` companions; retain
   those with the current snapshot rather than beside the restored database.

Relaunch and repeat the relevant native acceptance check. Never restore the
entire Steam account or treat a successful copy as proof of recovery.

## Share Results And Retain Evidence

Use [Local Study Viewers](./LOCAL-VIEWERS.md) for static viewer hosting.
Serve only the intended artifact root on loopback and expose only the selected
static route through an authenticated private network. Do not publish the repo
root, Studio RPC, Tuner or inspector. Keep actual node addresses, service labels
and process receipts in the private inventory. Test response hashes and image
loading/layout separately; serving bytes does not prove usable rendering.

Transfer the active viewer dependency closure, current qualified study packet,
exact external source dependencies and comparator inputs still consumed. Large
raw NOAA or similar scientific inputs can be justified by actual use; unused
generated history is a different retention decision. Have the numerical owner
identify still-consumed curves and compact proof before retiring trajectory
banks. Record what replay obligation is retired, preserve original receipt
bytes, and do not imply removed arrays remain available for a complete rerun.
Remove redundant transfer bundles once both Git stores retain the required
commits, but keep useful recovery before-images and active comparison evidence.
