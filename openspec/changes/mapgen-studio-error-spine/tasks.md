## 1. Frame

- [x] 1.1 Create S1.2 proposal/design/tasks/spec delta from the accepted
      runtime simplification plan and merged S1.1/S1.1a context.
- [x] 1.2 Run strict OpenSpec validation before implementation.
- [x] 1.3 Start watcher/review lane before code changes.

## 2. Implementation

- [ ] 2.1 Introduce a sealed Studio engine failure union covering the known
      Run in Game, Save&Deploy, and autoplay engine failure categories.
- [ ] 2.2 Replace partial status-code fallthrough mapping with exhaustive
      `toOrpc()` mapping for all known failure categories.
- [ ] 2.3 Add Save&Deploy status 404 `serverInstanceId` / `serverStartedAt`
      echo parity.
- [ ] 2.4 Realign stale Save&Deploy no-echo docs/spec residue in
      `mapgen-studio-server-orpc`, `packages/studio-server/src/contract/errors.ts`,
      `packages/studio-server/src/contract/mapConfigs.ts`, and
      `packages/studio-server/src/context.ts`.
- [ ] 2.5 Normalize recovery-action hint data across Run in Game and
      Save&Deploy failures.
- [ ] 2.6 Retire or wrap bare engine `Error` throw sites so known failures
      cannot surface as anonymous 500s.

## 3. Verification

- [ ] 3.1 `bun run openspec -- validate mapgen-studio-error-spine --strict`.
- [ ] 3.2 Focused no-unmapped-500 tests over the sealed failure union.
- [ ] 3.3 Procedure tests for Run in Game and Save&Deploy start/status failure
      paths, including Save&Deploy status 404 identity echo.
- [ ] 3.4 App gate: `bun x turbo run check --filter=mapgen-studio`.
- [ ] 3.5 Package gates for `@civ7/studio-server`, `@civ7/control-orpc`, and
      `@civ7/direct-control`.
- [ ] 3.6 Live proof or written live-proof disposition based on whether the
      implementation touches operation execution.

## 4. Closure

- [ ] 4.1 Update workstream records with final evidence and watcher
      disposition.
- [ ] 4.2 Graphite submit/merge/drain according to repo rules with foreign
      dirty state quarantined.
