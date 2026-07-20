# Studio Refactor Handoff

## Intent

The Codex local-environment workstream adds an operator control surface around
MapGen Studio. It does not change the Studio product, runtime protocol, default
ports, or the existing shared restart helper. The isolated lifecycle helper is
deliberately separate so deleting a Codex-managed worktree cannot terminate a
developer's normal Studio process.

## What The Studio Stack Must Preserve Or Repoint

- `.codex/environments/environment.toml` invokes `scripts/codex/manage-mapgen-studio.sh`
  for explicit start/stop and cleanup. Keep that contract as the one
  worktree-owned lifecycle entrypoint.
- The helper first runs `nx run mapgen-studio:build`. During Studio lifecycle
  composition, repoint its daemon pane to the canonical
  `nx run mapgen-studio:serve-daemon` target rather than preserving a duplicate
  raw Bun watch command. Keep the frontend launch aligned with the canonical
  Vite owner and retain `STUDIO_DAEMON_PORT`, `STUDIO_DEV_PORT`, and
  `STUDIO_DEV_RPC_TARGET`.
- Readiness and status must require the frontend and the daemon's `/healthz`
  endpoint. A nonzero HTTP response from an arbitrary daemon route is not a
  health proof.
- The helper owns a private tmux socket and derives a unique session and port
  pair from the Git worktree root. Its state is under the already ignored
  `.mapgen-studio/codex-environment/`. Preserve its private
  `NX_WORKSPACE_DATA_DIRECTORY` under that state directory; this Nx coordination
  isolation is required for coexistence with a standard Studio session in the
  same worktree. Do not replace this with the shared
  `scripts/restart-mapgen-studio.sh` or with listener-wide port kills.
- The standard Studio defaults and ports remain untouched. Codex-specific
  ports exist only while this helper's private session is running.

## Environment Bootstrap Coupling

Managed-worktree setup uses the normal clean-checkout sequence: initialize the
resources submodule and pinned Effect reference source, install the frozen Bun
graph, build, and check. It does not prebuild Habitat or copy generated output
from another checkout. The Habitat Nx plugin must load directly from source
before ignored `tools/habitat/dist` exists. If that bootstrap contract changes,
update `CODEX-LOCAL-ENVIRONMENT-REFERENCE.md` and
`OPERATIONAL-FIELD-GUIDE.md` together.

## Composition Check

After a Studio reorganization, run:

```bash
bash -n scripts/codex/manage-mapgen-studio.sh
nx run mapgen-studio:build
bash scripts/codex/manage-mapgen-studio.sh start
bash scripts/codex/manage-mapgen-studio.sh status
curl --fail http://127.0.0.1:<daemon-port>/healthz
bash scripts/codex/manage-mapgen-studio.sh stop
```

Use two worktrees for the final lifecycle proof: stopping one instance must
leave the other frontend and daemon reachable. This is operational isolation,
not a Studio behavior test.
