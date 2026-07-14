# Studio Refactor Handoff

## Intent

The Codex local environment exposes MapGen Studio through its canonical Nx
development graph. It does not own a second process manager, lifecycle protocol,
or set of Studio defaults.

## Composition Contract

- `.codex/environments/environment.toml` starts Studio with
  `nx run mapgen-studio:dev` in a foreground terminal.
- `mapgen-studio:dev` is the continuous Vite target. Its continuous
  `mapgen-studio:serve-daemon` dependency owns the Bun daemon, and the daemon's
  one-shot producer dependencies complete before it starts.
- `continuous` tells Nx not to wait for the daemon to exit before starting Vite.
  It is scheduling metadata, not application-readiness evidence.
- `STUDIO_DEV_PORT`, `STUDIO_DAEMON_PORT`, and `STUDIO_DEV_RPC_TARGET` remain the
  supported port and routing overrides. Defaults remain product-owned.
- The action terminal owns the process graph. Interrupting the foreground Nx
  command must stop both the frontend and daemon; no tmux server, private Nx
  workspace directory, state file, cleanup hook, or listener-wide kill exists.

## Bootstrap Contract

Managed-worktree setup uses the normal clean-checkout sequence: initialize the
resources submodule and pinned Effect reference source, install the frozen Bun
graph, build, and check. It does not prebuild Habitat or copy generated output
from another checkout. The Habitat Nx plugin must load directly from source
before ignored `tools/habitat/dist` exists.

## Composition Proof

1. Inspect `nx run mapgen-studio:dev --graph=stdout` and confirm the daemon is
   the sole continuous dependency while all producers are one-shot tasks.
2. Start the graph on bounded frontend and daemon ports.
3. Verify the frontend and the daemon's `/healthz` endpoint.
4. Interrupt the parent Nx process once and verify both listeners are released.

This proves development lifecycle composition. Product behavior still requires
its own rendered Studio and runtime verification.
