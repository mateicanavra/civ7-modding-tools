## 1. Frame

- [x] 1.1 Create S2.1 proposal/design/tasks/spec delta from the accepted
      runtime simplification plan and merged S1.1/S1.1a/S1.2 context.
- [x] 1.2 Run strict OpenSpec validation before implementation.
- [x] 1.3 Start watcher/review lane before code changes.

## 2. Server Truth

- [x] 2.1 Add operation-store enumeration/current methods with existing TTL
      pruning semantics.
- [x] 2.2 Extend `StudioEngines` and `StudioServerContext` with a
      daemon-owned `operations.current` snapshot over Run in Game and
      Save&Deploy registries.
- [x] 2.3 Add `studio.operations.current` contract/router entry using
      TypeBox/Standard Schema for new durable output schema.
- [x] 2.4 Add focused tests for fresh-daemon empty current, active mutex
      visibility, recent terminal visibility, and TTL/status miss truthfulness.

## 3. Client Adoption And Bridge Deletion

- [x] 3.1 Replace mount-time localStorage request-id restore in `StudioShell`
      with one boot adoption from `studio.operations.current`.
- [x] 3.2 Delete persisted operation recovery fields from `runStore`; keep only
      session-only run UI fields.
- [x] 3.3 Delete `features/runInGame/sourceSnapshotStorage.ts` and the
      map-config save request-id key export.
- [x] 3.4 Delete or rewrite localStorage resumption/serializer tests tied to
      the four-key operation bridge; keep snapshot fingerprint/relation pins.
- [x] 3.5 Keep status polls and daemon watchdog intact with written deletion
      targets S3.2/S3.3.

## 4. Verification + Closure

- [x] 4.1 `bun run openspec -- validate mapgen-studio-operations-current --strict`.
- [x] 4.2 Focused app tests for operation stores, client state, boot adoption,
      and one-mount current procedure.
- [x] 4.3 App gate disposition: `bun run --cwd apps/mapgen-studio check`
      failed before S2.1 code on missing built workspace package exports, then
      remained long-running after dependency builds and was stopped after no
      S2.1 diagnostics surfaced. Focused app tests and package gates are green.
- [x] 4.4 Package gate: `bun x turbo run check --filter=@civ7/studio-server`,
      `bun x turbo run build --filter=@civ7/studio-server`, and
      `bun run --cwd packages/studio-server test -- test/handler.test.ts`.
- [x] 4.5 Downstream realignment: plan/workstream notes, stale bridge language
      scan, watcher disposition.
- [ ] 4.6 Graphite submit/merge/drain according to repo rules.
