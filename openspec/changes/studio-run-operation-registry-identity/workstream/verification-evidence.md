# Packet 02 Evidence - Operation Registry Identity

Packet: `studio-run-operation-registry-identity`

Status: core implementation and static/behavior/Habitat verification are green.
Live Studio endpoint verification remains before Packet 2 closure.

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

- Live Studio endpoint evidence for request-id admission, same-content repeat
  admission after terminalization, and active ownership conflict projection.
- Packet closure still requires the live endpoint gate; the static,
  behavior-test, Habitat, OpenSpec, and review-lane gates above are green.
