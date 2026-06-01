# FireTuner Runtime-Proof Boundary

This resource operation slice acknowledges the DRA watcher instruction now
carried by the downstream resource-runtime-proof boundary.

The resource-distribution stack must not claim final runtime proof until it is
integrated and restacked on top of the active FireTuner restart stack boundary.
The current known restart boundary is:

- Branch: `codex/firetuner-socket-studio-restart`
- Commit: `bb39b3cf7 fix: submit Studio restarts through FireTuner socket`
- Files:
  - `apps/mapgen-studio/vite.config.ts`
  - `packages/cli/src/utils/firetunerSocket.ts`
  - `packages/cli/test/utils/firetunerSocket.test.ts`

Before a future runtime-proof slice closes, it must:

1. Verify whether `codex/firetuner-socket-studio-restart` has advanced beyond
   `bb39b3cf7`.
2. Integrate the current restart branch if needed and restack resource branches
   on top.
3. Use the FireTuner socket/API restart path for game restart evidence.
4. Record the exact branch/commit boundary and restart command/path used for
   runtime proof.

This aquatic operation contract slice is local/spec proof only. It does not
restart the game and does not claim runtime proof.
