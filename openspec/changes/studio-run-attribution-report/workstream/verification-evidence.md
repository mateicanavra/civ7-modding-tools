# Packet 13 Verification Evidence

## Behavior And Contract Gates

- `bun nx run control-studio-server:test`
  - Result: pass, 8 files, 125 tests.
  - Covers private attribution report lifecycle, required-section completion
    semantics, explicit diagnostics lookup, and public accepted/status/current
    event cleanliness.
- `bun nx run mapgen-studio:test`
  - Result: pass, 69 files, 411 tests.
  - Covers Studio app caller behavior and Run in Game integration surfaces.
- `bun nx run control-studio-server:check`
  - Result: pass.
  - Covers TypeScript contract for the server runtime and oRPC router tests.
- `bun run lint`
  - Result: pass for 9 lint projects.

## OpenSpec And Habitat Gates

- `bun run openspec -- validate studio-run-attribution-report --strict`
  - Result: pass.
- `bun habitat check --json --rule grit-studio-run-attribution-report-boundary`
  - Result: pass.
  - SA-13 now guards attribution assembly and diagnostics-section wiring as a
    private runtime reporting boundary instead of pinning exact implementation
    symbols.
- `bun habitat check --json --rule grit-studio-run-public-contract-closed`
  - Result: pass.
- `bun habitat check --json --rule structure-studio-run-workspace-topology`
  - Result: pass.

## Classify-Reported Checks

- `bun habitat classify packages/studio-server/src/operationRuntime/attributionReport.ts`
  - Owner: `control-studio-server`.
  - Runnable targets reported: `nx run control-studio-server:check`,
    `nx run control-studio-server:test`, `bun run lint`.
- `bun habitat classify packages/studio-server/src/operationRuntime/diagnostics.ts`
  - Owner: `control-studio-server`.
  - Runnable targets reported: `nx run control-studio-server:check`,
    `nx run control-studio-server:test`, `bun run lint`.
- `bun habitat classify packages/studio-server/test/handler.test.ts`
  - Owner: `control-studio-server`.
  - Runnable targets reported: `nx run control-studio-server:check`,
    `nx run control-studio-server:test`, `bun run lint`.
- `bun habitat classify .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary`
  - Owner: `habitat-authority`.
  - Runnable target reported: `bun run lint`.
- `bun habitat classify openspec/changes/studio-run-attribution-report/tasks.md`
  - Owner: workspace.
  - Runnable target reported: `bun run lint`.

## Live Studio Endpoint Evidence

Live daemon:

- Session: `mapgen-studio-packet13`.
- Daemon: `http://127.0.0.1:5184`.
- Health endpoint: `/healthz` returned HTTP 200 with
  `runtimeMode: "studio-daemon-effect-orpc"`.
- `studio.serverInfo` over `/rpc` returned `ok: true`,
  `runInGameApiVersion: 2`, and `viteCommand: "daemon"`.

Endpoint sequence:

- `studio.events.watch({})` returned a `hello` event from the daemon.
- `runInGame.start(...)` admitted request
  `studio-run-in-game-mrbw71sj-1run-2` with diagnostics id
  `run-diagnostics-1083cfd5-c103-4d18-80ce-c0f4f45f6396`.
- Public accepted status, operation events, terminal `runInGame.status`, and
  `studio.operations.current` serialized without the string `attribution`.
- `runInGame.diagnostics({ diagnosticsId })` returned `ok: true` and included
  `sections.attribution`.
- Missing diagnostics lookup returned
  `{ ok: false, reason: "not-found" }`.

Observed live terminal:

- `civ7.live.status({})` returned `ok: false` because the Tuner socket at
  `127.0.0.1:4318` was unavailable.
- The run terminalized publicly as `failed` with safe category
  `runtime-control`.
- The private attribution report was present and `incomplete`, with source,
  manifest, generation, deployment, and terminal-result sections present. The
  missing sections were `scripting-log-observation`, `setup-row-readback`, and
  `bounded-loaded-game-readback`, which depend on the post-Civ runtime
  observation path.

This satisfies Packet 13's live endpoint requirement for private attribution
lookup and public-surface non-disclosure. It does not satisfy the later packet
train's in-game validation gate because Civ7/Tuner was unavailable for this run.

## Review Lanes

- TypeScript refactoring lane: accepted findings on completion-state typing,
  JSON serialization typing, and SA-13 shape; repaired with a discriminated
  report model, `JsonValue` private serialization, and a boundary-oriented Grit
  rule.
- Code quality/structure lane: accepted finding that SA-13 was over-prescriptive;
  repaired by replacing the token-presence rule with a private-boundary rule.
- oRPC/Effect/library correctness lane: accepted findings on missing oRPC
  diagnostics lookup coverage and stale diagnostics contract comment; repaired
  with handler-level RPC client coverage and updated contract JSDoc.
