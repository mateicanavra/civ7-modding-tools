# Civ Development Host

The shared Mac Mini is the resource-heavy development host for Civ builds,
portable studies, Studio, and native game checks. The MacBook remains a source
checkout and a temporary viewer fallback during cutover. This is an operations
move, not a second climate implementation or a production candidate selection.

## Host And Ownership

| Surface | Location or rule |
| --- | --- |
| Host | `mateis-mac-mini.taild8da1c.ts.net`, user `mateicanavra-mac-mini` |
| Repository | `~/Documents/.nosync/DEV/civ7/civ7-modding-tools` |
| Tool installations | `~/Documents/.nosync/DEV/tools` |
| Game data | `~/Library/Application Support/Civilization VII` |
| Published atlas | `~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018` |
| Migration evidence | `~/Documents/Civ7Migration/20261006` outside Git |
| Git workflow | Existing Graphite `main` lineage; no parallel algorithm fork |
| Account ownership | Existing Mini Steam account and device settings remain native |

Use the repo's pinned Bun and Node versions, currently Bun `1.3.14` and Node
`22.22.0`. The host installs vendor runtimes outside the repository and exposes
them through `~/.local/bin` and `~/.bun/bin`. A CLI version banner running under
Bun can report Bun's emulated Node version; verify the actual Node binary with
`node --version`. Graphite is available through `gt`.

```sh
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"
cd "$HOME/Documents/.nosync/DEV/civ7/civ7-modding-tools"
hostname
node --version
bun --version
git status --short --branch
gt log short
git submodule status .civ7/outputs/resources
```

Keep this repository out of iCloud. A shared iCloud runtime tree is unnecessary
and introduces another writer to generated studies and live SQLite state.

## Build And Study

Initialize the resource mirror at the repository-pinned revision. The optional
`.repos/effect` checkout is not required for the standard build; initialize it
only for work that actually consumes that vendor source.

```sh
git submodule update --init .civ7/outputs/resources
bun install --frozen-lockfile
```

The October 6 clean isolated install needed two ignored dependency links already
present on the source Mac. RJSF's React declarations and an undeclared upstream
`@loaders.gl/schema-utils` import otherwise fail before Studio can build. Both
packages are already lock-pinned and installed; this is an explicit environment
workaround, not a source fix or a guarantee that a fresh install is sufficient.
Only create absent links; do not overwrite an existing dependency layout:

```sh
mkdir -p node_modules/@types node_modules/@math.gl
test -e node_modules/@types/react || \
  ln -s ../.bun/@types+react@19.2.17/node_modules/@types/react node_modules/@types/react
test -e node_modules/@math.gl/types || \
  ln -s ../.bun/@math.gl+types@4.1.0/node_modules/@math.gl/types node_modules/@math.gl/types
```

Then run the uncached build and focused test graph:

```sh
NX_DAEMON=false nx run-many -t build,link:global,test:studio-run-in-game \
  -p civ7-cli,swooper-physics-mod,mapgen-studio --skip-nx-cache --parallel=3
NX_DAEMON=false nx run civ7-cli:test --skip-nx-cache
```

The global `civ7` launcher is Bun-owned. Use `civ7` after linking, or
`bun apps/cli/bin/run.js`; do not invoke the entry point with Node.

A bounded real study uses the definition-owned harness, not copied result data:

```sh
/usr/bin/time -l bun plugins/mod/map/swooper-physics/scripts/compare-coherence.ts \
  --output "$HOME/Documents/Civ7Migration/20261006/study-huge-1018" \
  --size huge --seed 1018 --variants baseline
```

Choose a new output directory for a new experiment. Record host, source revision,
configuration, elapsed time, peak memory, completion status, and output hashes.
The migration baseline completed on the Mini in 3.41 seconds with about 526.5 MiB
peak RSS, one complete case and no failed cases. This proves host execution of
the shipped baseline, not candidate climate accuracy or native gameplay parity.

Studio uses the existing Nx targets. `nx run mapgen-studio:dev` owns its daemon
dependency. The frontend defaults to loopback port `5173`; the daemon defaults
to loopback `5174`. Inspect listeners before starting another copy. Do not
expose `/rpc`, Tuner, the remote debugger, or game-control services through the
public gallery route. A successful frontend HTTP response does not replace a
successful build/typecheck or a real browser run.

The migration smoke session is currently process-hosted with `nohup /bin/sh
~/Documents/Civ7Migration/20261006/start-studio.sh`. That wrapper exports the
pinned runtime paths, disables the Nx daemon, changes to this checkout and runs
the existing `mapgen-studio:dev` target. Its PID is recorded in the adjacent
`studio.pid`; output is under `~/Library/Application Support/Civ7Tools/logs/`
in `studio.log` and `studio-error.log`. It is not a persistent login or reboot
service: the attempted launchctl wrapper could not execute from Documents
because of macOS privacy controls, and that owned job was removed.

For a new interactive session, inspect the listeners and use:

```sh
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"
cd "$HOME/Documents/.nosync/DEV/civ7/civ7-modding-tools"
NX_DAEMON=false nx run mapgen-studio:dev
```

Open `http://127.0.0.1:5173` on the Mini and stop the foreground session with
Ctrl-C. For the current background session, inspect the saved PID, its children
and their command lines before sending TERM only to those verified Studio
processes; recheck both listeners afterward. Never kill an arbitrary port owner.

The frontend served from Mini passed a desktop browser generation smoke check
with Standard size, six players and seed 123: all 22 stages completed, state
returned to Ready and the elevation hex layer rendered without console errors.
The browser ran on the MacBook through an ephemeral loopback SSH tunnel, which
was closed afterward; this does not claim browser-worker CPU ran on the Mini.
This browser check preceded the game cutover; Studio's Live Civ/Run in Game
workflow was not retested afterward. Separate native App UI checks below passed.
At a 390-pixel viewport the existing Studio panels overlap and the layout
overflows; Studio is not phone-qualified. The separate private gallery passed
its desktop and phone rendering checks.

## Portable Game State

Quit Civ gracefully and verify its process is absent before applying or restoring
data. Do not force-kill the game to satisfy a migration gate. Snapshot source and
target separately; SQLite `.backup` owns coherent database snapshots, not live
file copying. Keep backups outside Git and outside the game data directory.

The migration's tested merge helper and receipts live in the dated evidence
directory. Its policy is deliberate:

- Merge `Saves`, saved `.Civ7Cfg` setups, `Mods`, and `ModUserData`; preserve
  target-only files and back up same-path conflicts before replacement.
- Merge explicit portable gameplay/audio/preferences by section and key.
  Preserve Mini graphics, screen scaling, audio routing, device identifiers,
  account, legal, Steam/network state, DNA caches, and achievements/history.
- Import only the approved development toggles in `AppOptions`: `EnableTuner`,
  `EnableDevModules`, `EnableDebugPanels`, and `ShowDebugTooltips`.
- Merge only the observed portable `fs://game` / `modSettings` LocalStorage JSON
  namespace, preserving unrelated target rows and target-only object keys.
- Never transplant `Mods.sqlite`, which contains absolute scanned source paths.
  Let the Mini game scan installed mods, stop it again, then reconcile explicit
  enabled/disabled choices by stable `ModId` with another backup and receipt.
- Do not copy game logs, crash dumps, Steam credentials, generated databases,
  or reproducible build caches merely because they exist.

All thirteen source saved setups are retained, including `The Swoop`,
`ToT Config`, and `ToT_NoModsExceptMaps`. `Huge Diety` is a different map setup,
not a substitute for Huge Swooper Earthlike. Hashes establish preservation of all
13 setups. Native shell load/readback qualified the three configurations listed
below; their map-script execution and gameplay were not tested.

After relaunch, use the existing operational surfaces:

```sh
civ7 game health --state "App UI" --host 127.0.0.1 --port 4318 --json
civ7 game status --json
civ7 game local-data --help
```

Main-menu readiness is the `App UI` Tuner state, not a post-Begin gameplay
canary. `game status` can correctly report no observable/mutable gameplay while
the shell and App UI are ready. See the repository's
`civ7-operational-debugging` and `civ7-play-game` skills for current APIs and
proof boundaries.

With confirmed no-unsaved-progress authorization, the existing raw command can
request the shipped graceful exit primitive:

```sh
civ7 game exec 'engine.call("exitToDesktop")' --state "App UI" \
  --host 127.0.0.1 --port 4318 --timeout-ms 5000 --json
pgrep -fl CivilizationVII
```

Dispatch once. This bypasses the confirmation dialog and does not save progress.
A fulfilled result or Tuner disconnect is not exit proof: require the independent
process check to find no game process before writing data. The first migration
exit used the same shipped primitive through the private Cohtml Console because
Tuner was not yet enabled; its temporary SSH tunnel was closed afterward. Native
window CUA was not repaired or required for this completed exit.

Relaunch through the Mini's retained universal Steam executable:

```sh
"$HOME/Library/Application Support/Steam/Steam.AppBundle/Steam/Contents/MacOS/steam_osx" \
  -applaunch 1295660
```

### October 7 Cutover Qualification

The actual stopped-game merge completed at `2026-10-07T04:35:57.041Z`: 475
source files were copied and hash-verified, all 13 saved configurations retained,
three preference files changed, and only the approved LocalStorage row merged.
Fresh stopped-target backup and conflict originals remain in the dated evidence
directory. Rehearsal's 478-file count is not the actual apply count.

The first relaunch performed the target-native mod scan. After another verified
graceful stop, reconciliation changed 47 explicit stable-ID choices and found one
already matching, with zero missing IDs. Fourteen source-null choices were left
unchanged in target-native state rather than guessed. The guarded transaction retained the
same protected-data fingerprint and passed integrity checks. The second launch
reported ready `App UI`; subsequent native mod readback matched all 48 explicit
source choices, including after the final saved-setup load. Account/DLC
entitlement equality is not implied.

Native configuration loading passed for `The Swoop`, `ToT Config`, and
`ToT_NoModsExceptMaps`. Each had two stable shell readbacks with changed setup
revision and matching Huge Swooper Earthlike map, 12 players, both saved seeds,
Standard speed, Custom difficulty, and selected leader/civilization. The first
The Swoop observation attempt timed out after accepted dispatch; fresh bounded
read-only observations reconciled it without repeating that request. Raw failed
and successful receipts are retained. No Host/Begin action or new gameplay was
started. The game was left in the shell with `ToT_NoModsExceptMaps` loaded.

## Evidence Retention

Transfer the actual viewer dependency closure, the current qualified study packet,
its exact external source dependencies, and scientific inputs still consumed.
The initial October 6 allowlist is 2,512 files / 3.544 GiB, including 47 reachable
HTML pages and 204 NetCDF inputs. A separately manifested supplement retains
3,790 files / 1.783 GiB: the nine consumed comparator curves, their normal/solar
support, compact qualification/component comparisons, and newly closed current
packet evidence. The combined transfer is about 5.327 GiB, not the entire 46 GiB
atlas. Both manifests, original relative paths and selection reasons are retained
in the migration evidence directory. All transferred files passed target SHA-256
checks. Separate HTTP checks cover 52 selected viewer responses on loopback and
52 through private HTTPS, not every scientific file or complete old campaign.

Do not retain giant historical trajectory banks just as a habit. Their numerical
owner must first distinguish active comparator/source inputs, compact proof, and
unconsumed generated history. Preserve evidence still used in comparisons; do
not delete it based solely on age or size. Immutable receipts keep their original
source paths and bytes. Do not rewrite old hashes or fabricate MacBook-path
aliases on the Mini. A new portable driver binds `CIV7_SOURCE_ROOT` and derives
the Mini's evidence root in a new manifest.

## Private Viewer

The canonical private entry point and restart/stop instructions are in
[Local And Private Viewers](./LOCAL-VIEWERS.md). Serve only the dedicated atlas
document root on `127.0.0.1:5181`, with the Mini's existing Tailscale Serve
`/civ` path. No public Funnel, custom identity, Opa service change or repository
document root is required. Verify hashes through both loopback and tailnet HTTPS,
then inspect desktop and mobile rendering. Leave the MacBook viewer intact until
the Mini checks pass.

## Recovery

The migration helpers do not delete or rewrite MacBook game data or source Git
checkouts. A separate owner-reviewed evidence retirement removed exactly 182
obsolete historical trajectories, retaining nine consumed curves and all compact
proof. Its immutable plan/result are in the current packet's
`historical-orbit-retirement/` directory. The original all-phase historical rerun
obligation is explicitly retired; do not imply those removed arrays remain
available for complete replay. The source owner reported 29,878,818,816 removed
logical bytes; APFS physical free space is a separate observation.

To restore Mini state, first stop Civ gracefully and snapshot the new target
state. Review the merge
receipt and restore only intended conflict originals, retaining newly created
target saves unless deliberately rolling them back. SQLite restores require the
game and every other writer to be stopped. Do not restore the whole Steam account.

To undo gallery hosting, remove only the Mini's `/civ` Serve route and its dedicated
origin job. Do not reset Serve globally, disable Tailscale, or affect unrelated
services. Installed toolchains and the clean Graphite checkout may remain; their
removal is not necessary for game or viewer rollback.
