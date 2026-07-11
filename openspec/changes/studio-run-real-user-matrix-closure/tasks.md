## 1. Harness Readiness

- [ ] 1.1 Read the browser-originated harness and final target vocabulary.
- [ ] 1.2 Ensure the harness selects saved config, source, seed, Huge map, and
      10 players through the rendered UI, then captures the rendered Run in
      Game click's browser-originated `runInGame.start` request with
      `worldSettings.resources: balanced` and the same request's generation
      manifest.
- [ ] 1.3 Ensure follow-up `/rpc` calls capture status/current/events,
      diagnostics, live status, and live snapshot for the admitted request.
- [ ] 1.4 Ensure evidence rows redact public records and retain private details
      only by explicit diagnostics id/request id.
- [ ] 1.5 Ensure evidence rows match setup row readback to the exact admitted
      `runArtifactId` and fail on prior request rows.

## 2. Required Scenario Runs

- [ ] 2.1 Run Swooper Earthlike with `ToT_BasicModsEnabled.Civ7Cfg`, Huge map,
      10 players, seed `1538316415`, and browser-originated
      `worldSettings.resources: balanced` retained in the same request's
      generation manifest.
- [ ] 2.2 Run Latest Juicy with `ToT_BasicModsEnabled.Civ7Cfg`, Huge map, 10
      players, seed `1538316415`, and browser-originated
      `worldSettings.resources: balanced` retained in the same request's
      generation manifest.
- [ ] 2.3 Run Swooper Desert Mountains with `ToT_BasicModsEnabled.Civ7Cfg`,
      Huge map, 10 players, seed `1538316415`, and browser-originated
      `worldSettings.resources: balanced` retained in the same request's
      generation manifest.
- [ ] 2.4 Run missed terminal event or browser reload recovery row.
- [ ] 2.5 Run generated-row-missing failure row.
- [ ] 2.6 Run stale saved-config/generated-mod mismatch row.
- [ ] 2.7 Run repeat freshness row for the same rendered scenario.

## 3. Closure Verification

- [ ] 3.1 Run `nx run mapgen-studio:test`.
- [ ] 3.2 Run contract/server/app/UI checks reported by Habitat and relevant
      Nx targets.
- [ ] 3.3 Run `bun run openspec -- validate studio-run-real-user-matrix-closure --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [ ] 3.6 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [ ] 3.7 Run and record public/private redaction scans over retained
      workstream logs plus public status/current/event payloads.
- [ ] 3.8 Record every gate and every live row in
      `workstream/verification-evidence.md`.
