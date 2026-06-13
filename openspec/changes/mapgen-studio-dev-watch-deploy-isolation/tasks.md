## 1. Frame

- [x] 1.1 Create S1.1a proposal/design/tasks/spec delta with authority refs,
      non-goals, and verification gates.
- [x] 1.2 Correct stale S1.1 closure checkbox so the previous slice reflects
      the already-merged PR #1678 / main `331534895`.

## 2. Implementation

- [x] 2.1 Retarget daemon-side recipe-DAG stage imports from generated package
      exports to Swooper recipe source.
- [x] 2.2 Change Play/Save&Deploy deploy build args so operation-time builds
      do not replay dependency outputs in the daemon import graph.
- [x] 2.3 Add focused static/unit guards for daemon import graph and deploy
      build arguments.
- [x] 2.4 Keep frontend watcher ignore pins aligned with deploy-written mod
      outputs.

## 3. Verification

- [x] 3.1 `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`.
- [x] 3.2 Focused app tests: deploy command, dev deploy isolation, recipe DAG.
- [x] 3.3 App gate: `bun x turbo run check --filter=mapgen-studio`.
- [x] 3.4 Live falsification proof: Play deploy does not change
      `serverInstanceId` mid-operation.
- [x] 3.5 Live falsification proof: Save&Deploy deploy does not change
      `serverInstanceId` mid-operation.

## 4. Closure

- [x] 4.1 Update downstream plan/workstream notes with final evidence and any
      remaining risk.
- [x] 4.2 Graphite submit/merge/drain according to repo rules with foreign
      dirty state quarantined; PR #1679 is the S1.1a Graphite closure lane.
