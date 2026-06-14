# Studio Runtime Simplification — Program Plan

**Status:** accepted direction (operator, 2026-06-12); execution-ready
**Method anchors:** dev:architecture (current/target/transition separation, spine-first ordering, deletion targets), cognition:system-design (leverage points), cognition:testing-design (falsification-first test relayering), dev:spike-methodology (evidence discipline), civ7-open-spec-workstream (slice mechanics), Habitat harness philosophy (categories before instances; invariants as enforceable records).
**Evidence base:** three agent evidence packs (2026-06-12): runtime inventory + smell audit (7 seams, file:line), effect/oRPC/SSE capability pack, test-suite audit (50 files classified). Direct verification: `eventIterator` exists in @orpc/contract 1.14.5; S3.0 corrected the installed `@orpc/tanstack-query` 1.14.5 helper names to `experimental_streamedOptions` and `experimental_liveOptions`, with `experimental_liveOptions` selected for the event spine because it keeps latest state instead of accumulating an unbounded chunk array; client plugins include `ClientRetryPlugin` (event-iterator reconnect), `BatchLinkPlugin`, `DedupeRequestsPlugin`.

## 1. The frame

One sentence: **the Studio server owns all ephemeral truth and pushes it; the client renders.**

Today the browser tab compensates for the Studio server not owning state: a four-key
localStorage operation bridge with resume/re-adoption logic
(`apps/mapgen-studio/src/stores/runStore.ts`,
`features/runInGame/sourceSnapshotStorage.ts`, `features/mapConfigSave/api.ts`),
five concurrent polling loops with three different scheduling strategies
(`app/hooks/useOperationStatusPolls.ts` 1s/3s ×2, `useServerInstanceWatchdog.ts`
10s, two custom setTimeout loops in `StudioShell.tsx` for live status/snapshot),
identity-echo restart detection, three oRPC mounts each with its own handler +
context + error seam (`server/studioServer.ts:144-160`), and a session-sharing
post-hoc patch (`studioServer.ts:183-186` manually threads the tuner session into the
control mount; the recipe-DAG mount never gets it).

Every one of those is a beam that bends. The target frame has four spines, each
small enough to see through:

| Spine | Target | What dies |
|---|---|---|
| **Transport** | ONE oRPC surface (`/rpc`), one runtime, one client | two mounts, the path-dispatch if-chain, the session patch, one of two proxy rules |
| **Error** | Sealed failure unions, exhaustive mapping, zero unmapped 500s | the 14 bare-`Error` throw sites; the "internal server error" click |
| **State** | Studio server-owned `operations.current` read; restart = honest empty | localStorage bridge, resume logic, identity echoes |
| **Event** | ONE typed event channel (SSE/eventIterator) | all five polls + the watchdog |

**KEEP (strong beams, untouched):** the run-in-game phase machine
(`server/studio/engines.ts` orchestrator — inherently sequential), the
operation mutex queue, the shared tuner Effect session
(`packages/studio-server/src/services/Civ7TunerSession.ts` — fd-wedge fix), the
proof-identity system (correctness boundary), turbo deploy graph, the
Studio server + Vite one-process dev host, TTL pruning semantics.

**Explicit non-goals:** operation durability across Studio server restarts (no
database/Redis/file ledger — dev-honest "restart → nothing running" is the
design, not a gap); preset-layer kill (separate decision, operator scope
pending); CLI/control-orpc package surface changes beyond what the unified
runtime needs.

## 2. Decision packets (resolved unless marked OPEN)

**DP-1 Unified router host — RESOLVED.** The unified router lives in
`packages/studio-server` (effect-orpc `implementEffect`, one `ManagedRuntime`).
Namespaces: `studio.*` (existing), `civ7.*` (absorbs the control mount),
`recipeDag.*` (absorbs the DAG mount). The Studio server mounts ONE `RPCHandler` at
`/rpc`. Session sharing becomes structural (all procedures `yield*` the same
scoped `Civ7TunerSession`) instead of the post-hoc context patch. Contracts do
not change shape — they merge under one router.

**DP-2 Operation state durability — RESOLVED (against).** Registries stay
in-memory with TTL. What changes is OWNERSHIP of recovery: the client stops
persisting request ids; on boot (and on stream reconnect) it calls
`studio.operations.current` and adopts whatever the Studio server reports. A fresh
Studio server truthfully reports nothing running. This is the level-6 intervention
(change the rules: server owns truth) — not a level-2 buffer (add a database).

**DP-3 Stream granularity — RESOLVED.** ONE multiplexed channel:
`studio.events.watch` (contract `eventIterator`), carrying a sealed event union
built as a CATEGORY first: `{ type: "hello", serverInstanceId, startedAt } |
{ type: "operation", kind: "run-in-game" | "save-deploy", status } |
{ type: "live-game", state }`. Studio server side: one Effect `PubSub` in the runtime
layer (the EventHub service); publishers are instances filling the category.
Client side: one subscription via `experimental_liveOptions` (TanStack Query) +
`ClientRetryPlugin` for reconnect; `hello` events replace the watchdog and
serverInfo poll; reconnect triggers `operations.current` re-adoption. The
older `streamedOptions` wording is stale for this installed package and would
accumulate events rather than model latest Studio server state.

**DP-4 Civ7 interface hybrid — RESOLVED (coherence, not rewrite).** The
inventory verdict: the shape is right (one shared socket multiplexing
everything), the abstraction leaks. Actions: structural session unification
falls out of DP-1; name the invariant ("every game wire call flows through the
runtime's Civ7TunerSession — no session construction outside it") as a guard
test + doc; keep the game-process restart flow in-band (correctly synchronous).
The Studio server-side live-game watcher (WS-3) moves the status-poll loop server-side
onto the same session.

**DP-5 Error spine — RESOLVED.** Sealed engine failure union with exhaustive
mapping in `packages/studio-server/src/context.ts`. The 14 unmapped-throw sites
in `apps/mapgen-studio/src/server/studio/engines.ts` (133, 161, 177, 309-323,
851, 877) become typed failures: transient/infra → 503 `*_UNAVAILABLE`,
config-shape → 400 `*_INVALID`, genuine bug → 500 with detail. The bare
rethrows at 851/877 currently turn Civ7DirectControlError timeouts into bare
500s — this is the operator's live "internal server error" failure class.
Save-deploy status 404 gains the `serverInstanceId` echo before events land.

**DP-OPEN-1 Preset-layer kill.** Out of this program. Needs operator scope
confirmation (scratch/localStorage presets, import/export, vocabulary).

## 3. Workstreams and slices

Sequencing is spine-first: WS-1 → WS-2 → WS-3; WS-4 is woven through and closes
last. One slice = one openspec change (`openspec/changes/<id>/`) = one Graphite
branch off main, gated (`bun run test` in apps/mapgen-studio 239+/50+, package
gates: studio-server, control-orpc 347, direct-control 433, plus
`bun run openspec:validate`). Test dispositions ride WITH the slice that
deletes their subject — never before, never after.

### WS-1 “One Surface” (transport + error spine)

**S1.1 `runtime-one-mount`** — Unified router + runtime.
- studio-server contract/router absorb `civ7.*` (from
  `apps/mapgen-studio/src/server/civ7ControlOrpc.ts`) and `recipeDag.*` (from
  `server/recipeDag/orpc.ts`); one `RPCHandler` at `/rpc` in
  `server/studioServer.ts`; delete the prefix if-chain and the session patch;
  vite proxy shrinks to `/rpc`; ONE `orpcClient` in `lib/orpc.ts` (the
  `lib/control/liveControlPort.ts` seam retargets to it).
- Enable server `StrictGetMethodPlugin` (already on) + client
  `DedupeRequestsPlugin`; evaluate `BatchLinkPlugin` after polls die (not before
  — batching polls hides the real fix).
- Tests: REWRITE `server/studioServerFetch.test.ts` (single mount route table; legacy
  `/api/*` 404 pins move here — the Studio server HTTP layer STAYS, audit's deletion
  call corrected). NEW PIN: all three namespaces respond on one
  mount; out-of-scope paths 404.
- EXECUTED 2026-06-12 (`mapgen-studio-runtime-one-mount`): two grounding
  corrections — `studioServer/rpcPath.ts` and
  `features/studioServer/studioServerClient.ts` had ZERO production consumers
  (vite-middleware-era leftovers), so both DELETED with their tests instead of
  rewritten; their transport pins live on in `test/server/oneMount.test.ts`.
  Client `DedupeRequestsPlugin` deferred with evidence (dedupes only GET; RPC
  link sends POST — no-op) to the S3.2 re-evaluation alongside BatchLink.

**S1.2 `error-spine`** — Sealed failure unions, no unmapped 500s.
- Engine failure union (tagged) covering the 14 sites; exhaustive `toOrpc()`
  (no `else → 500` fallback for known categories); SD 404 serverInstanceId
  echo; recovery-action hints normalized across RIG + SD.
- Tests: NEW PIN "no bare 500 from any engine failure path" (table-driven over
  the failure union); keep all DURABLE error-code pins.

**S1.1a `dev-watch-deploy-isolation` (HOTFIX, inserted 2026-06-12)** — Root
cause of the operator's "launch click → error" found DURING S1.1 live proof,
with restart-identity evidence: the run-in-game/save-deploy engines rebuild
`mod-swooper-maps` dist, which sits in the Studio server's own import graph (static
recipeDag service import of `mod-swooper-maps/recipes/*` → dist), so `bun
--watch` (#1676) restarts the Studio server MID-OPERATION (observed at +84s into a
launch; child deploy process killed; registry wiped; watchdog reloads the
tab). Pre-existing since #1676 — every dev-mode launch/deploy dies this way.
Fix candidates (decide in the slice): import recipe stages from mod SOURCE
under Bun (deploys touch only dist), lazy/subprocess recipe projection, or
watch-graph isolation. Blocks meaningful live launch proofs for all later
slices — run BEFORE S1.2.

### WS-2 “Server Truth” (state spine)

**S2.1 `operations-current`** — Studio server-owned operation recovery.
- `studio.operations.current` procedure: both registries' active + recent
  operations, full status shapes. Client boot adoption replaces localStorage
  read; DELETE the four-key bridge, `sourceSnapshotStorage.ts`, resume
  re-adoption in `runStore.ts`, identity-echo handling (watchdog stays until
  S3.2 — it is the interim restart detector).
- Tests: DELETE localStorage resumption/serializer tests with this slice
  (audit: APPROACH-ENCODING); keep snapshot fingerprint/relation logic pins
  (`clientState.test.ts:61-113`); NEW PINS: restart truthfulness (fresh
  registry → `current` returns empty; status by old id → typed NOT_FOUND with
  new serverInstanceId), TTL expiry → NOT_FOUND, mutex visibility (active op
  appears in `current`).

### WS-3 “Push” (event spine)

**S3.0 `stream-spike`** — (small, timeboxed; spike-methodology applies)
- Prove: effect-orpc `implementEffect` procedure with `eventIterator` output
  (the one unverified bridge — `.effect()` handlers returning async
  iterables/Streams); Effect `PubSub` → async-iterable adapter with
  scope-tied unsubscribe on client disconnect; vite dev proxy SSE passthrough
  (no buffering); `experimental_liveOptions` consumption + `ClientRetryPlugin`
  reconnect. Output: working reference procedure + findings note. If
  effect-orpc cannot express it, fallback: plain oRPC `.handler()` for the
  watch procedure calling into the runtime — decided in the spike, not during
  S3.1.
- Runs in parallel with WS-2.

**S3.1 `event-hub`** — The category abstraction.
- EventHub service (Effect PubSub in the studio runtime layer), sealed event
  union (`hello` | `operation` | `live-game`), `studio.events.watch`
  eventIterator procedure emitting `hello` on connect; client subscription
  hook (one place) feeding existing stores; reconnect → re-adopt via
  `operations.current`.
- Tests: NEW PINS — subscribe → hello arrives with serverInstanceId;
  disconnect cleans up subscription (no leak); reconnect re-adopts.

**S3.2 `operations-push`** — Instance 1: operations.
- Registry `update()` publishes operation events; DELETE both operation polls
  (`useOperationStatusPolls.ts`), 404-stop logic, the WATCHDOG +
  serverInfo poll (`hello` owns identity now).
- Tests: DELETE poll-cadence pins; REWRITE `liveRuntime/model.test.ts`
  poll-delay tests as reconnect-backoff if reused (audit flagged
  `nextLiveRuntimePollDelayMs` as pinning deleted code); NEW PIN: phase
  transition published → event observed (falsification: kill the publisher,
  test must fail).

**S3.3 `live-game-watch`** — Instance 2: game state.
- Studio server-side watcher loop (server polls the game over the SHARED session on
  its own cadence, publishes `live-game` deltas keyed by turn+hash — keying
  logic survives from `liveRuntime/model.test.ts` DURABLE pins); client drops
  the status setTimeout loop; on-demand snapshot read STAYS request/response.
- Tests: keep keying/commit-gating pins; NEW PIN: watcher publishes on state
  change, stays quiet when unchanged.

### WS-4 “One Game Door” (coherence + closure)

**S4.1 `game-door-invariant`** — Mostly absorbed by S1.1; this slice closes:
guard test "no `Civ7DirectControlSession` construction outside
`Civ7TunerSession`/engines' sanctioned per-flow path"; invariant doc (Habitat
style: id, owner, scope, forbids, detection, remediation); close out the
`mapgen-studio-tuner-session` openspec change (17/19 tasks pending closure);
final sweep deleting anything the previous slices orphaned (dead hooks, dead
taxonomy enums, dead vite proxy config); schema-tech closeout for
`packages/studio-server/src/contract/*` so the remaining legacy Zod success I/O
schemas are either migrated to TypeBox/Standard Schema or retained by a durable
schema-technology rationale. S1.2 already keeps new error `data` schemas on
TypeBox/Standard Schema.

## 4. Test program relayering (from the audit)

- 39 files DURABLE — untouched (config, phase machines, proof identity, viz,
  presets, UI components).
- 7 REWRITE-WITH-SLICE: `studioServerFetch` (S1.1, rewrite NOT delete — Studio server HTTP
  layer survives), `rpcPath` (S1.1), `recipeDag/orpc` (S1.1), two fallthrough
  groups (S1.1), `clientState` resumption parts (S2.1), `liveRuntime/model`
  poll-delay (S3.2).
- 3 DELETE-WITH-SLICE: localStorage resumption suites (S2.1), poll-cadence
  pins (S3.2), watchdog coverage (S3.2).
- 6 NEW PIN FAMILIES: single-mount contract (S1.1), no-unmapped-500 (S1.2),
  restart truthfulness + TTL (S2.1), stream lifecycle hello/cleanup/reconnect
  (S3.1), publish-on-transition falsification (S3.2), watcher delta quiet/loud
  (S3.3).
- Layering: package-level = contract shapes + error unions + session/stream
  lifecycle; app-level = state machines, adoption, store feeds; live-proof =
  the operator's click-through (Play, Save&Deploy, Explore, server-restart
  recovery) recorded per slice closure.

## 5. Execution discipline

Per civ7-open-spec-workstream: each slice opens with its openspec change
(proposal/design/tasks/spec deltas, strict-validated), pre-code review lane,
implementation inside the write set, gates, downstream realignment, clean
closure. Graphite per repo rules (never `git add -A`; check `git diff --cached`
for foreign staged files — AGENTS.md + river-lake docs + openspec river-lake
notes belong to another lane; drain via
`gt sync --force --no-restack --no-interactive` after merges, freeing
worktree-held branches first). No shortcut language (no fallbacks/dual
paths/shims without deletion targets). Bridges introduced mid-program (e.g.
watchdog surviving until S3.2) carry their deletion slice in writing.
