# Packet 10 Verification Evidence

## Scope

Packet 10 wires Run in Game from the package workflow into the
manifest-only Swooper generator port. Closure evidence is limited to this
domino: one generated-mod handoff from the manifest, safe public projection,
private generated artifact diagnostics, and SA-10 source-boundary authority.

Packet 11 still owns the durable deployment snapshot/lease topology. The
ultimate initiative live gate remains open until a running Civilization VII
session proves the launched game is using the generated Studio-run content.

## Behavior And Type Gates

| Gate | Exit | Evidence |
| --- | ---: | --- |
| `bun nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-control-studio-server-check.log` |
| `bun nx run control-studio-server:test --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-control-studio-server-test.log`; 8 test files, 118 tests |
| `bun nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-mapgen-studio-check.log` |
| `bun nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-mapgen-studio-test.log`; 67 test files, 383 tests |
| `bun nx run mod-swooper-maps:test:studio-run-in-game --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-mod-swooper-studio-run-test.log`; 17 tests across 4 files |
| `bun nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-mod-swooper-check.log` |
| `bun nx run studio-contract:check --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-studio-contract-check.log` |
| `bun nx run mapgen-studio-ui:check --skip-nx-cache --outputStyle=static` | 0 | `workstream/logs/2026-07-08-mapgen-studio-ui-check.log` |

Nx warned that unrelated tasks `control-direct:build-bundle` and
`mapgen-core:build` were flaky, but the invoked gates above completed
successfully.

## OpenSpec And Habitat

| Gate | Exit | Evidence |
| --- | ---: | --- |
| `bun habitat classify openspec/changes/studio-run-generator-integration` | 0 | `workstream/logs/2026-07-08-classify-packet10.log` |
| `bun habitat classify <Packet 10 write-set paths>` | 0 | `workstream/logs/2026-07-08-classify-write-set.log` |
| `bun run openspec -- validate studio-run-generator-integration --strict` | 0 | `workstream/logs/2026-07-08-openspec-validate.log` |
| `bun habitat check --rule grit-studio-run-generator-port-boundary --json` | 0 | `workstream/logs/2026-07-08-habitat-sa10.log` |
| `bun habitat check --owner mapgen-studio --json` | 0 | `workstream/logs/2026-07-08-habitat-owner-mapgen-studio.log` |
| `git diff --check` | 0 | `workstream/logs/2026-07-08-git-diff-check.log` |

SA-10 stays in Habitat as a Grit-backed source-boundary rule. It does not claim
filesystem topology; request-workspace topology remains Habitat structure
authority under SA-07/SA-08. The owner-level Habitat run includes
`grit-studio-run-generator-port-boundary` and
`structure-studio-run-workspace-topology`.

## Live Studio Endpoint Probe

Server:

- `bun --conditions bun-source src/server/daemon/daemon.ts --port 5184`
  launched a real Studio daemon at `http://127.0.0.1:5184`.
  Evidence: `workstream/logs/2026-07-08-live-daemon.log`.

Endpoint sequence:

- `studio.serverInfo({})` returned daemon identity
  `studio-server-mrbidezc-1y03-1-3078e0ff-8304-46a9-a6bc-f17ca2f1f55c`.
- `runInGame.start(...)` accepted request
  `studio-run-in-game-mrbidezs-1y03-2` with diagnostics id
  `run-diagnostics-0cbe6e96-4771-4d3a-9d46-f8ccaf4767aa`.
- `runInGame.status({ requestId })` publicly exposed only safe state. The
  probe also asserted that generated mod paths/digests, manifest digest, map
  row id, and script identity fields were absent from public status.
- `runInGame.diagnostics({ diagnosticsId })` privately exposed generated mod
  evidence:
  - `generationManifestDigest`:
    `4a2bfac59e337f98c858a5fddfb92a72acad07ae3940fdce933d5dc7b78208fe`
  - `runArtifactId`: `run-a3b07c61941852a34e38`
  - `generatedModFileCount`: `6`
  - `generatedModDigest`:
    `124f0a81b2d433737eca1e523813dd5fda672a165d89091771698af038177481`
  - `mapRowId`: `MAP_RUN_A3B07C61941852A34E38`
  - local and deployed map-script request markers were both present.
- After generated-mod proof was observed, the probe called
  `runInGame.cancel({ requestId })`; terminal public status was `cancelled` /
  `cancelled` with safe category `operation-cancelled`.

Evidence: `workstream/logs/2026-07-08-live-endpoint-probe.log`.

The live run crossed source resolution, artifact generation, and deployment.
It was intentionally cancelled after Packet 10 proof was collected so this
packet did not wait on the later in-game direct-control leg. The full
initiative's ultimate in-game proof remains open.

## Review Lanes

Detailed dispositions live in
`workstream/review-disposition-ledger.md`.

- TypeScript refactoring review: accepted findings repaired.
- Code quality/structure review: accepted findings repaired or dispositioned.
- oRPC/Effect/library correctness review: accepted findings repaired or
  intentionally deferred to Packet 11 when they concern deployment
  snapshot/lease topology.

Reviewer comment pass included JSDoc/anchor comments. The contract diagnostics
comments now explain why generated paths and digests are private lookup data,
not public status data.
