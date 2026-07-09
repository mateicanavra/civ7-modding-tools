# Studio Refactor Handoff

## Intent

The Codex local-environment workstream adds an operator control surface around
MapGen Studio. It does not change the Studio product, runtime protocol, default
ports, or the existing shared restart helper. The isolated lifecycle helper is
deliberately separate so deleting a Codex-managed worktree cannot terminate a
developer's normal Studio process.

## What The Studio Stack Must Preserve Or Repoint

- `.codex/environment.toml` invokes `scripts/codex/manage-mapgen-studio.sh`
  for explicit start/stop and cleanup. Keep that contract as the one
  worktree-owned lifecycle entrypoint.
- The helper first runs `nx run mapgen-studio:build`, then launches the current
  daemon source with Bun and the current Vite application with `bun vite`.
  If the Studio refactor moves either executable boundary, update those two
  launch commands together and retain the environment variables
  `STUDIO_DAEMON_PORT`, `STUDIO_DEV_PORT`, and `STUDIO_DEV_RPC_TARGET`.
- The helper owns a private tmux socket and derives a unique session and port
  pair from the Git worktree root. Its state is under the already ignored
  `.mapgen-studio/codex-environment/`. Do not replace this with the shared
  `scripts/restart-mapgen-studio.sh` or with listener-wide port kills.
- The standard Studio defaults and ports remain untouched. Codex-specific
  ports exist only while this helper's private session is running.

## Environment Bootstrap Coupling

Managed-worktree setup initializes the resources submodule, performs the
canonical resource check, installs the frozen Bun graph, builds the ignored
Habitat Nx-plugin artifact, and runs the workspace build. The direct TypeScript
bootstrap is intentional: a clean worktree cannot load the custom Nx plugin
until `tools/habitat/dist` exists. If the refactor changes plugin build output
or removes that bootstrap need, change the setup command and its references in
`CODEX-LOCAL-ENVIRONMENT-REFERENCE.md` and `OPERATIONAL-FIELD-GUIDE.md`
together.

## Composition Check

After a Studio reorganization, run:

```bash
bash -n scripts/codex/manage-mapgen-studio.sh
nx run mapgen-studio:build
bash scripts/codex/manage-mapgen-studio.sh start
bash scripts/codex/manage-mapgen-studio.sh status
bash scripts/codex/manage-mapgen-studio.sh stop
```

Use two worktrees for the final lifecycle proof: stopping one instance must
leave the other frontend and daemon reachable. This is operational isolation,
not a Studio behavior test.
