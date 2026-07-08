## 1. Browser Request Surface

- [x] 1.1 Read the current Run in Game UI control, operation client, and oRPC
      contract call sites.
- [x] 1.2 Ensure visible UI selections create the closed public
      `runInGame.start` input without private or internal config fields.
- [x] 1.3 Capture the daemon-admitted `requestId` from public status/current
      state rather than browser-local identity.

## 2. Tests And Harness

- [x] 2.1 Add focused UI/request construction tests for visible selections.
- [x] 2.2 Add a browser-originated harness path that clicks the visible button
      and records request/current/event/status agreement.
- [x] 2.3 Update workstream evidence vocabulary to separate endpoint,
      browser-originated, and in-game observed rows.

## 3. Verification

- [x] 3.1 Run `bun run openspec -- validate studio-run-browser-originated-contract --strict`.
- [x] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [x] 3.3 Run focused Studio UI/request tests.
- [x] 3.4 Run a live Studio endpoint check from this worktree using the visible
      Run in Game button.
- [x] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [x] 3.6 Record every gate in `workstream/verification-evidence.md`.
