# Civ7 CLI Operating Contract

## Scope

The Civ7 CLI is an oclif application executed by Bun. oclif owns command and
plugin discovery; Bun owns the process; Nx owns build ordering and workspace
dependency freshness. This contract covers local development, built workspace
execution, linking, manifests, and the current distribution boundary.

oclif remains Node-first upstream, but its templates explicitly support Bun
launchers and `@oclif/core` detects Bun at runtime. We use that supported path
deliberately rather than maintaining parallel Node and Bun entrypoints.

## Execution Matrix

| Use | Supported command | Entrypoint |
| --- | --- | --- |
| Development composition | `nx run civ7-cli:run -- <args>` | `apps/cli/civ7.ts` with freshly built topic plugins |
| Built workspace CLI | `bun apps/cli/bin/run.js <args>` | production shell and compiled topic plugins |
| Linked CLI | `nx run civ7-cli:link:global`, then `civ7 <args>` | Bun shebang in `bin/run.js` |
| Topic manifest | `bun run --bun oclif manifest` through its Nx target | compiled topic package |
| Shell manifest | `bun run --bun oclif manifest` through `civ7-cli:build` | assembled CLI shell |
| npm-style archive | `bun pm pack` | validation only; not a standalone executable |
| Standalone executable | unsupported | deferred distribution design |

Do not invoke `node apps/cli/bin/run.js`. Do not use `civ7.ts` for a deployment
or other production-shaped execution. Do not hand-edit topic `dist` output or
an `oclif.manifest.json` file.

## Build Order

Nx builds workspace dependencies before the CLI. Each topic plugin then:

1. emits TypeScript to `dist`;
2. generates its oclif manifest from that compiled command tree;
3. exposes no independent binary or global hook.

The shell builds after its topic plugins, generates its root-plugin manifest,
and makes `bin/run.js` executable. Topic manifests own their commands; the root
manifest does not aggregate those command rows. Application deploy targets
depend on the shell build and call the production launcher with Bun.

## Plugin Assembly

The application shell lives at `apps/cli`; cohesive command topics live at
`plugins/cli/topics/<topic>`. Every topic package must appear exactly once in
the shell's `oclif.plugins` list and must be backed by a `workspace:*`
dependency. The shell owns startup and assembly, not topic commands. The shell
behavior test derives the topic corpus from the filesystem and proves the
production launcher exposes it.

## Topic Plugin Interior

Under oclif's pattern discovery, a command module's path below `src/commands`
is its canonical colon-delimited command id; an `index.ts` module represents
the command at its containing topic path. Command trees therefore contain only
executable command modules and nested topic directories. A helper placed there
would become another command candidate.

Each command module default-exports one concrete command class, declares no
`static id`, exposes no second runtime value, and imports no other command
module. The generic topic law rejects path-derived collisions and local edges
outside the topic adapter interior. The assembled shell separately requires an
exact source-to-manifest bijection, rejects canonical and alias collisions
across registered topics, and proves every identity resolves to its owning
plugin.

CLI-specific flag, output, and capability translation belongs under the
topic's optional `src/adapters` surface. Reusable behavior remains in its named
package owner. Topic projects keep both interiors closed and lower-kebab, then
regenerate their manifest after any command move. Product-owned surface tests
pin exact public ids, compatibility aliases, and explicit topic metadata where
an accidental path move would be a breaking change.

## Distribution Boundary

Workspace and linked execution are supported. The CLI package is private;
`bun pm pack` exists only to inspect its npm-style archive. Publishing that
archive or a standalone executable is not yet a supported delivery contract.
The archive does not bundle private runtime dependencies, while stock `oclif pack`
downloads and embeds Node. A future standalone Bun executable must prove
dynamic plugin discovery, manifest access, and all private dependency closure
outside the workspace. That work remains governed by DEF-020 in
[`docs/system/DEFERRALS.md`](../DEFERRALS.md).

## Proof

For shell changes, run the Nx-owned `civ7-cli` check, test, and build graph. The
shell test must execute `bin/run.js` with Bun and observe all registered topics.
For deployment callers, verify their owning project graph and use a non-mutating
CLI command such as `mod manage deploy --help`; do not use a real deploy as a
build-time smoke test.

## Graceful Application Exit

An already-registered, same-name mod normally needs only an in-game map/session
restart after deployment. A full application quit is for newly registered mods
or genuine application recovery, not ordinary redeployment or the expected
loss of the gameplay Tuner state at the main menu.

For authorized maintainer recovery, discover `game exec --help`, confirm the
host and App UI state, and use Civ's own shipped exit primitive:

```bash
env -u CIV7_TUNER_HOST -u CIV7_TUNER_HOSTS -u CIV7_TUNER_PORT \
  civ7 game exec 'engine.call("exitToDesktop")' --host 127.0.0.1 --port 4318 \
  --state 'App UI' --timeout-ms 10000 --json
```

Use the execution matrix above when the CLI is not linked. Inspect `--dry-run`
before dispatch. This existing explicit diagnostic is not a dedicated typed
quit command; it does not justify adding new behavior to frozen legacy control
code or creating a command-local transport.

Run this on the intended game host with its discovered local port. Explicit
`--host` does not suppress inherited host fallback or the loopback default;
clear inherited Tuner variables, verify the health response's endpoint and
inspect the dry-run host list. Remote recovery should execute on the game host,
not assume this diagnostic offers exclusive remote targeting.

Dispatch once with authorization to lose unsaved progress, then independently
verify the original Civ process exited on the same host. A successful command,
fulfilled `undefined`, lost Tuner connection or timeout alone is not the exit
postcondition. Reconcile uncertain outcomes before retrying; never automatically
fall back to force-kill. Only confirmed exit admits live settings/database
replacement and the owning operation's later relaunch.

If Tuner is unavailable, the existing private Cohtml inspector can issue the
same primitive through documented browser Console UI, or use Civ's own Quit
control and its confirmation. See the operational debugging skill's
[graceful-exit procedure](../../../.agents/skills/civ7-operational-debugging/references/graceful-exit.md)
for state selection, process evidence and ownership boundaries.

## Upstream References

- [oclif templates and runtime hashbangs](https://oclif.io/docs/templates/)
- [oclif plugin model](https://oclif.io/docs/plugins)
- [oclif plugin loading and manifests](https://oclif.io/docs/plugin_loading/)
- [Bun runtime](https://bun.sh/docs/runtime)
- [`bunx` runtime selection](https://bun.sh/docs/pm/bunx)
- [Bun publishing](https://bun.sh/docs/pm/cli/publish)
- [Bun standalone executables](https://bun.sh/docs/bundler/executables)
