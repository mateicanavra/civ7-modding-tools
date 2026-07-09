# Packet 3 Verification Evidence

Status: Packet 3 declared gates complete locally. Later packet-train Civ7
generated-content live gates remain open until the final target-vocabulary
matrix.

## Product Evidence

- Public API: `runInGame.cancel({ requestId })` is a public oRPC command with
  the same closed request-id input shape as status lookup and a public operation
  status output.
- Explicit owner: cancellation is only reachable through the public cancel
  command. HTTP/browser abort is covered by handler behavior tests and does not
  call cancellation logic.
- Active cancellation: cancelling a running Run in Game operation interrupts the
  tracked worker fiber, waits for materialization cleanup ownership when
  cancellation lands during in-flight materialization, runs registered cleanup,
  records private diagnostics, releases the runtime lease after
  cleanup/diagnostics finalization, and emits one terminal public event.
- Idempotence: repeated cancellation and cancellation after terminalization
  return the existing terminal projection without mutating runtime state.
- Public/private split: public cancellation status exposes only safe category
  data. Private operation detail remains available through explicit diagnostics
  lookup by diagnostics id.

## Live Endpoint Evidence

Harness note: live endpoint proof used a direct non-watch daemon:
`STUDIO_DAEMON_PORT=5199 bun --conditions bun-source src/server/daemon/daemon.ts`
from `apps/mapgen-studio`. The dev `mapgen-studio:serve-daemon` target runs
`bun --watch`; a probe showed that Run in Game materialization writes can
restart that dev watcher mid-operation, leaving a durable lease from the prior
daemon identity while the new in-memory registry has no request. That is a
watch-harness artifact, not the live proof harness for this packet.

Endpoint: `http://127.0.0.1:5199/rpc`

Captured live results on 2026-07-07 after the cleanup-order repair:

- Endpoint proof artifact:
  `openspec/changes/studio-run-explicit-cancellation/workstream/artifacts/packet-03-live-endpoint-proof-2026-07-07.json`
- Daemon output artifact:
  `openspec/changes/studio-run-explicit-cancellation/workstream/artifacts/packet-03-live-daemon-2026-07-07.log`
- Captured request ids:
  `studio-run-in-game-mra4lop6-1pol-3` for active cancellation and
  `studio-run-in-game-mra4loq2-1pol-4` for existing-terminal cancellation.

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| live-health | Required | `GET /healthz` against `http://127.0.0.1:5199` | Direct non-watch daemon running from the packet worktree | Health returned `ok: true` | Endpoint proof JSON; daemon log | The direct daemon is alive and owns `/rpc` for this proof run. | PASS |
| live-active-start | Required | oRPC `runInGame.start` over `/rpc`; payload shape captured in JSON | Direct daemon; disposable Run in Game payload; packet code loaded via `bun-source` | Request `studio-run-in-game-mra4lop6-1pol-3` admitted as `running/generating-artifacts` | Endpoint proof JSON | Start admits a fresh Run in Game operation and returns a public running status. | PASS |
| live-active-cancel | Required | oRPC `runInGame.cancel({ requestId })` over `/rpc` | Active request `studio-run-in-game-mra4lop6-1pol-3` | Terminal public status `cancelled/cancelled`; safe failure category `operation-cancelled`; diagnostics id present | Endpoint proof JSON | Explicit cancel terminalizes the active operation with only safe public failure data. | PASS |
| live-repeated-cancel | Required | oRPC `runInGame.cancel({ requestId })` over `/rpc` | Cancelled request `studio-run-in-game-mra4lop6-1pol-3` | Repeated cancel returned byte-equivalent terminal projection | Endpoint proof JSON | Repeated cancellation is idempotent and does not create a new mutation. | PASS |
| live-cancelled-status | Required | oRPC `runInGame.status({ requestId })` over `/rpc` | Cancelled request `studio-run-in-game-mra4lop6-1pol-3` | Status returned the same terminal cancellation projection | Endpoint proof JSON | Status lookup after cancellation agrees with the terminal cancel response. | PASS |
| live-private-diagnostics | Required | oRPC `runInGame.diagnostics({ diagnosticsId })` over `/rpc` | Diagnostics id from active cancellation response | Explicit diagnostics lookup returned request id `studio-run-in-game-mra4lop6-1pol-3` and private section `operation` with `cancelled/cancelled` | Endpoint proof JSON | Private operation detail is available only through diagnostics lookup. | PASS |
| live-unknown-cancel | Required | oRPC `runInGame.cancel({ requestId: "missing-live-cancel-request" })` over `/rpc` | Direct daemon; no matching request in registry/durable record | Defined error `RUN_IN_GAME_STATUS_NOT_FOUND` with HTTP status `404` | Endpoint proof JSON | Unknown request ids return the declared safe not-found error. | PASS |
| live-terminal-start-to-terminal | Required | oRPC `runInGame.start` plus polling `runInGame.status` over `/rpc` | Direct daemon; second disposable request | Request `studio-run-in-game-mra4loq2-1pol-4` reached terminal `failed/failed` | Endpoint proof JSON | A non-cancelled request reaches a terminal public projection before terminal-cancel idempotence is checked. | PASS |
| live-existing-terminal-cancel | Required | oRPC `runInGame.cancel({ requestId })` over `/rpc` | Terminal request `studio-run-in-game-mra4loq2-1pol-4` | Cancel returned the existing `failed/failed` terminal projection unchanged | Endpoint proof JSON | Cancelling an already terminal operation returns its existing terminal projection unchanged. | PASS |

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| packet-runtime-tests | Required | `bun run --cwd packages/studio-server test operationRuntime.test.ts` | Packet 3 source diff applied | `60` tests passed | Terminal output from 2026-07-07 run | Runtime cancellation behavior, cleanup races, diagnostics, idempotence, and publish ordering are covered. | PASS |
| packet-contract-server-tests | Required | `bun run --cwd packages/studio-server test contractTypeboxSpine.test.ts errorSpine.test.ts handler.test.ts operationRuntime.test.ts` | Packet 3 source diff applied | `94` tests passed | Terminal output from 2026-07-07 run | Contract spine, error spine, handler routing, and runtime behavior agree. | PASS |
| server-project-test | Required | `nx run control-studio-server:test --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable | `8` files / `114` tests passed | Terminal output from 2026-07-07 run | Server package test suite remains green with Packet 3 behavior. | PASS |
| app-project-test | Required | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable | `67` files / `380` tests passed | Terminal output from 2026-07-07 run | App/UI behavior and request validation remain green. | PASS |
| contract-check | Required | `nx run studio-contract:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable | TypeScript check passed | Terminal output from 2026-07-07 run | Public contract types remain coherent after adding `runInGame.cancel`. | PASS |
| server-check | Required | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable | TypeScript check passed | Terminal output from 2026-07-07 run | Server runtime/router/workflow types remain coherent. | PASS |
| app-check | Required | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable | TypeScript check passed | Terminal output from 2026-07-07 run | App leaf-port and validation code type-checks with Packet 3 contract. | PASS |
| openspec-strict | Required | `bun run openspec -- validate studio-run-explicit-cancellation --strict` | OpenSpec change present | Change is valid | Terminal output from 2026-07-07 run | Packet 3 proposal/design/spec/task records satisfy OpenSpec strict validation. | PASS |
| sa03-targeted-habitat | Required | `bun habitat check --rule grit-studio-run-cancel-command-owner --json` | SA-03 rule registered under Habitat | Rule passed with `0` diagnostics | Terminal JSON from 2026-07-07 run | Structural ownership for the explicit cancel command is enforced by Habitat. | PASS |
| mapgen-studio-habitat | Required | `nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable; Habitat built | `10` rules passed, `0` failing, `0` advisory findings | Terminal output from 2026-07-07 run | MapGen Studio Habitat authority remains green with SA-03 included. | PASS |
| habitat-classify | Required | `bun habitat classify <path>` for Packet 3 contract, server runtime, registry, rule, and docs paths | Habitat classify available | Packet paths routed to expected owners/targets; docs portability advisory unrelated to Packet 3 source diff | Terminal output from 2026-07-07 run | Packet files are classified through the expected Habitat owners. | PASS |
| lint | Required | `NX_DAEMON=false bun run lint` | Nx daemon disabled to avoid prior daemon EPIPE harness artifact | `9` lint targets passed from cache; `0` failures | Terminal output from 2026-07-07 run | Repo lint target remains green after Packet 3 changes. | PASS |
| diff-hygiene | Required | `git diff --check` | Source diff present | No whitespace errors | Terminal output from 2026-07-07 run | Patch has no diff hygiene failures. | PASS |
| ui-source-diff | Required | Source diff inspection | Packet 3 diff available | No visible Run in Game cancellation affordance source changed; app-side source changes limited to server materialization cleanup registration and closed-input cancel validation | `git diff --stat`; changed-file inspection | Packet 3 adds public API/runtime cancellation without introducing UI affordance behavior. | PASS |

## Review Lanes

Required review lanes ran after implementation and again after first-round
repairs. P1/P2 findings were dispositioned before closure.

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring | Runtime ownership, cleanup memoization, helper shape, dead code, and comments. | PASS after repairs. Accepted the in-flight materialization cleanup P2 and sync cleanup throw P2. Runtime now pre-registers a cleanup owner before materialization starts, memoizes cleanup by promise, avoids stale app `runContexts` re-add after early cleanup, and includes adversarial tests for late cleanup and sync throws. Residual note: the internal operation type remains a broad optional-field record; cleanup-failure validity is enforced by registry guards. |
| Code quality/structure | State topology, behavioral/structural boundary, Habitat authority shape, evidence shape, and JSDoc/anchor comments. | PASS after re-review. Accepted and repaired the evidence-shape P2 by adding per-gate command/protocol, precondition, result, artifact, oracle, and verdict rows plus captured endpoint artifacts. SA-03 remains Habitat-owned, not `.grit` authority, with positive structural ownership checks and scoped alternate-public-leaf guards. |
| oRPC/Effect/library correctness | oRPC public contract/error shape, Effect fiber interruption semantics, cancellation ordering, and app leaf cleanup. | PASS after repairs. Replaced blocking `Fiber.interrupt` with `Fiber.interruptFork`, added an adversarial test proving cancel does not hang behind a blocked worker publish, added materialization-window and sync-throw cleanup tests, and guarded app `runContexts` against stale re-add after early cleanup. Residual note: real app-port cancellation while non-cooperative filesystem promises hang is not fully live-proven; current proof covers the public `/rpc` cancellation contract and handler tests cover transport abort not being cancellation. |

## Authority Notes

- SA-03 is registered under Habitat, not a standalone `.grit` authority tree.
  The Grit pattern is used only through Habitat rule ownership.
- SA-03 intentionally asserts structural command ownership and scoped alternate
  public-leaf guards, not behavioral sequencing. Cancellation behavior is
  verified by product/runtime tests and live endpoint evidence.
- The live watcher restart discovery was treated as harness evidence. Packet 3
  endpoint proof uses a direct daemon so generated-content writes do not restart
  the process being tested.
