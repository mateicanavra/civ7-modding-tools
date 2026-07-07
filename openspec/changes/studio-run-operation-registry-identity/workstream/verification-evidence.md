# Packet 02 Evidence - Operation Registry Identity

Packet: `studio-run-operation-registry-identity`

Status: closed-passed for Packet 2 scope. Static, behavior, Habitat, OpenSpec,
review-lane, and live Studio endpoint verification are green.

## What Moved

- Run in Game admission is keyed by `requestId` only. Content-derived values are
  retained as `correlationDigest` evidence and no longer block same-content
  fresh requests after the prior request terminalizes.
- Expired tombstones are lookup facts for their own request id only; the
  registry no longer searches active operations or tombstones by content digest.
- `RunOperationRecord` persists request id, daemon id, daemon start time, lease
  id, phase, status, diagnostics id, timestamps, and terminal outcome for
  restart reconciliation.
- `RuntimeOwnershipLease` is the durable single ownership slot for Run in Game
  and Save/Deploy deployed-mod writes.
- Lease writes publish atomically behind a token-owned filesystem lock, corrupt
  lease files are quarantined on startup/admission, and daemon identity includes
  collision-resistant entropy plus `daemonStartedAt`.
- Startup releases stale durable leases only when the owning PID is gone.
  Ambiguous live-PID leases with absent/mismatched heartbeat proof remain
  conflicts rather than being released into double ownership. Stale lock
  takeover is likewise limited to missing/dead lock owners and uses a renamed
  stale lock path instead of deleting the active lock path by name.
- Corrupt or request-id-mismatched operation records are quarantined and
  terminalized under the storage request id instead of disappearing from
  reconciliation.
- Abandoned Run in Game records terminalize as public `ownership` failures with
  private diagnostics available only through explicit diagnostics lookup.
- Run in Game public status-not-found payloads no longer echo daemon identity;
  the exported generic status-not-found schema no longer validates Run in Game
  daemon identity either. The intentionally public server identity remains on
  `serverInfo` and existing non-Run in Game surfaces.
- `runInGame.start` is a closed top-level public input schema; opaque nested
  config/setup/source payloads remain host-scanned for raw-control vocabulary.
- Public lease-conflict diagnostics expose safe category/code data only; lease
  ids, daemon ids, and raw filesystem causes stay private.
- SA-02 is registered as Habitat-owned Grit authority under
  `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-operation-identity-owner/`
  and now asserts key runtime relationships, not only helper-name presence.

## Verification Run

- `bun tools/habitat/bin/dev.ts check --rule grit-studio-run-operation-identity-owner --json` - pass after relationship strengthening and lock-owner assertions.
- `nx run control-studio-server:check` - pass.
- `nx run studio-contract:check` - pass.
- `bun run openspec -- validate studio-run-operation-registry-identity --strict` - pass.
- `nx run control-studio-server:test -- operationRuntime.test.ts` - pass, 48 tests.
- `nx run control-studio-server:test -- errorSpine.test.ts contractTypeboxSpine.test.ts` - pass, 11 tests.
- `nx run mapgen-studio:test -- runInGame/requestValidation.test.ts` - pass, 3 tests.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --runner grit --json` - pass, 5 Studio-owned Grit rules including SA-02.
- `nx run control-studio-server:test` - pass, 8 files, 98 tests.
- `nx run-many -t check --projects=studio-contract,control-studio-server,mapgen-studio-ui,mapgen-studio` - pass.
- `nx run mapgen-studio:test` - pass, 67 files, 379 tests.
- `nx run mapgen-studio:habitat:check` - pass, 9 Studio-owned Habitat rules including SA-02. This remains the graph-owned proof boundary for generated Studio app assets because it depends on the Studio build.
- `git diff --check` - pass.

## Live Endpoint Evidence

- Started the actual daemon from this worktree with
  `STUDIO_DAEMON_PORT=5199 nx run mapgen-studio:serve-daemon --outputStyle=static`.
- `studio.serverInfo({})` over the real `/rpc` oRPC endpoint returned
  `ok: true`, `runInGameApiVersion: 2`, `viteCommand: "daemon"`, and server id
  `studio-server-mra1jaio-1cd1-1-9d5a08ee-471d-4946-a909-c114fe0b7cb6`.
- A live `runInGame.start` for `recipeId: "mod-swooper-maps/standard"`,
  `selectedConfig.id: "latest-juicy"`, seed `1538316415`, map size
  `MAPSIZE_STANDARD`, player count `6`, resources `balanced`, disposable
  materialization, and `config: {}` was admitted as request
  `studio-run-in-game-mra1l94p-1cd1-3` with public phase
  `generating-artifacts`, status `running`, and diagnostics id
  `run-diagnostics-3be3f537-f8b4-4288-8585-5bdb4b1170d0`.
- While that request owned the runtime lease, a second live `runInGame.start`
  returned declared public error `RUN_IN_GAME_BLOCKED`, HTTP status `409`,
  safe category `ownership`, and public recovery actions
  `copy-diagnostics`/`retry-status`. The public error data did not expose lease
  id, daemon id, filesystem paths, or raw causes.
- Polling `runInGame.status` for `studio-run-in-game-mra1l94p-1cd1-3` observed
  `generating-artifacts:running`, `deploying:running`, then terminal
  `failed:failed`. The terminal failure is acceptable for this Packet 2 gate:
  the gate proves endpoint admission identity, active ownership conflict, and
  terminalization before same-content repeat admission, not successful Civ7
  launch.
- Repeating the same live `runInGame.start` body after terminalization admitted
  a fresh request `studio-run-in-game-mra1lbh9-1cd1-5`, proving same-content
  repeat admission no longer reuses the prior content-derived identity. The
  repeated request terminalized as `failed:failed`, leaving no active lease.

## Authority Notes

- Habitat remains the only durable authority tree. The SA-02 source-pattern
  assertion uses the Habitat rule manifest and runner plumbing; direct Grit
  documentation and probes informed rule shape only.
- Official GritQL docs confirm the rule can use snippet patterns,
  metavariables, `contains`, `within`, and `not` predicates for source-pattern
  assertions. That keeps this packet in Grit-backed Habitat authority rather
  than converting source syntax checks into scripts.
- The rule is positive where Packet 2 requires durable owners and relationships
  to exist (`RunOperationRecord`, `RuntimeOwnershipLease`, token-owned lease
  lock, daemon heartbeat, request-id admission with `lease.leaseId`, startup
  reconciliation adoption, durable record publication) and negative only for the retired
  digest-as-identity shapes that could reintroduce the old runtime model.
- Effect resource-management documentation states finalizers/cleanup run on
  success, failure, and interruption. The packet therefore keeps worker
  registration inside the uninterruptible critical section and restores only the
  worker effect itself; terminal transition publication and lease release are
  uninterruptible.

## Review Lanes

Initial and focused review lanes found blockers and drove the repair passes:
corrupt/partial leases, PID-only liveness, Run in Game 404 daemon identity
leakage, Save/Deploy duplicate lease leakage, Effect interruption windows,
daemon identity collision risk, record/storage-key mismatch, ambiguous
live-PID/no-heartbeat ownership, open Run in Game top-level input, generic
status-not-found schema leakage, and SA-02 brittleness. The fixes are included
in this slice and verified above.

Final narrow review lanes after the green proof run are disposed:

- TypeScript refactoring review: no P1 findings. P2 state-space findings were
  accepted and fixed by requiring durable lease `processId/acquiredAt/updatedAt`
  owner proof, validating timestamp fields, splitting `RunOperationRecord` into
  running vs terminal variants, collapsing `Admission` into a discriminated
  union, and replacing test `Record<string, any>` diagnostics helpers with
  `Record<string, unknown>`.
- Code quality / Habitat structure review: P1 accepted. SA-02 could false-green
  dead helper plumbing, so the Habitat rule now asserts lease mutation paths are
  locked, heartbeat is acquired during runtime startup before reconciliation,
  and lock owner tokens/stale takeover relationships exist.
- oRPC + Effect + library correctness review: P1 accepted. Stale lock cleanup
  could delete a fresh lock after a stale-read race, so cleanup now takes over
  only missing/dead-owner stale locks and renames the stale path before removal.
  P2 accepted by making heartbeat publication best-effort without throwing
  through a `never` error channel. No blocking TypeBox/oRPC or Grit syntax
  findings remained.

## Remaining Packet 2 Gates

- None. Packet 2 static, behavior-test, Habitat, OpenSpec, review-lane, and
  live Studio endpoint gates are green. Full packet-train closure still awaits
  later-packet live Civ7 in-game evidence from the target-vocabulary matrix.
