# Browser-Originated Live Check

This packet's rendered-browser admission row uses a direct Studio daemon,
the real Vite app, Playwright, and the public `/rpc` oRPC mount. It is a
workstream harness protocol, not a root script and not a second authority tree.

## Preconditions

- Work from this packet worktree.
- Ports `5198` and `5299` are free.
- Playwright's Chromium binary is installed for the automation environment.
- Civ7 availability is not required for this packet's admission/status oracle;
  later remediation packets own generated setup/start success.

## Server Commands

From `apps/mapgen-studio`:

```sh
bun --conditions bun-source src/server/daemon/daemon.ts \
  --port 5198 \
  --repo-root $WORKTREE
```

From a second shell in `apps/mapgen-studio`:

```sh
STUDIO_DEV_PORT=5299 \
STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5198 \
bunx vite --host 127.0.0.1
```

## Browser Actions

1. Open `http://127.0.0.1:5299/`.
2. Select visible `Saved config` value `ToT_BasicModsEnabled`.
3. Set visible `Generation seed` to `1538316415`.
4. Set visible `World size` to `Huge`.
5. Set visible `Players` to `10`.
6. Leave resources at the default visible state for this packet row:
   `balanced`.
7. Click the rendered Run in Game control. If a previous terminal run exists,
   the accessible action may be `Retry Run`; this is still the same rendered
   Run in Game control and must admit a fresh request id.

## Public `/rpc` Reads

Record the browser network request count for `/rpc/runInGame/start`. Retain the
redacted public input shape so the row shows the selected setup config, seed,
map size, and player count without retaining local private paths.

Record the admitted request id from `studio.operations.current({})`, then read:

- `runInGame.status({ requestId })`;
- `studio.operations.current({})`;
- `studio.events.watch({})`, retaining at least the hello event and the
  matching `operation` events with `kind: "run-in-game"`;
- `runInGame.diagnostics({ diagnosticsId })`, recording only that explicit
  lookup succeeds unless private diagnostics are needed for the active repair.

Scan only public status/current/event payloads for private markers:

- local home-directory paths;
- `sourcePath`;
- `generatedModRoot`;
- `attribution`;
- `rawOutput`;
- `command`;
- `launchEnvelope`;
- `sourceSnapshot`.

## Retained Artifacts

Retain a bounded JSON row in this workstream directory and an optional browser
screenshot under `output/playwright/`. The JSON row is the operational evidence;
the screenshot is only a visual companion.
