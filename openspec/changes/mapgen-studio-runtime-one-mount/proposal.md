# Runtime one-mount — one oRPC surface, one runtime, one client

## Why

The studio daemon hosts three oRPC mounts, each with its own `RPCHandler`,
context seam, and error edge: `/rpc` (studio-server), `/api/civ7/rpc`
(control-oRPC), and `/api/recipe-dag/rpc` (recipe DAG). The daemon dispatches
between them with a prefix if-chain (`daemon.ts:144-160`) and threads the
shared tuner session into the control mount with a post-hoc context patch
(`daemon.ts:183-186` — the recipe-DAG mount never receives it). The client
mirrors the split: three `RPCLink`s/clients (`lib/orpc.ts`,
`lib/control/civ7ControlOrpcClient.ts`, `features/recipeDag/client.ts`), plus
a dead fourth (`features/studioServer/studioServerClient.ts`, zero production
consumers), and the Vite dev proxy needs two rules.

Every seam is a beam that bends: session sharing exists only where someone
remembered to patch it, error envelopes diverge per mount, and "where does
this procedure live" is a routing-table question instead of a contract
question. This is slice S1.1 of the accepted runtime-simplification program
(`docs/projects/studio-runtime-simplification/PLAN.md`, DP-1): ONE oRPC
surface at `/rpc`, one `ManagedRuntime` in `@civ7/studio-server` hosting all
namespaces, one client.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — program authority
  (frame §1, DP-1 unified router host, WS-1 S1.1 write set + test
  dispositions §3/§4).
- `openspec/changes/mapgen-studio-bun-server/` — the daemon topology this
  change SUPERSEDES in part: its "three mounts" requirement collapses to one
  mount; the daemon process, two-process dev shape, engines ownership, and
  legacy-REST retirement requirements remain in force.
- `openspec/changes/mapgen-studio-tuner-session/` — the shared
  `Civ7TunerSession` ownership model this change completes structurally
  (session flows inside the package instead of via host patch).

## What Changes

- **`@civ7/studio-server` absorbs the two satellite routers.** The package
  contract gains the control namespaces (spread of `Civ7ControlOrpcContract`
  under `civ7.*` — key sets are disjoint: studio's
  `status/mapSummary/gameInfo/autoplay/setupConfig/savedConfigs/setupCatalog/live`
  vs control's
  `attention/city/diplomacy/display/government/narrative/notifications/progression/readiness/strategy/turn/unit/view/world`)
  and a `recipeDag.*` namespace (contract/schema/errors moved verbatim from
  `apps/mapgen-studio/src/server/recipeDag/`). The router composes all three
  under the ONE existing `ManagedRuntime`; the recipe-DAG implementer's
  private empty runtime dies.
- **Session sharing becomes structural.** `createStudioRpcHandler` builds the
  control procedures' per-request context internally: the shared
  `Civ7TunerSession` is resolved from the runtime once (memoized; the session
  object is acquired unconnected — no socket until first command) and flows
  into `endpointDefaults.session` for every control call. The daemon-side
  patch and the public `tuner.session()` port are deleted (`tuner.health()`
  stays for `/healthz`).
- **`StudioServerContext` gains two required fields:** `recipeDagService`
  (the recipe-DAG service stays app-side — it imports `mod-swooper-maps`
  recipes, a dependency that must not enter the package) and `civ7Control`
  (`directControl` facade + `timeoutMs`), making both injection seams
  explicit and test-fakeable.
- **The daemon serves ONE mount.** `createStudioDaemonFetch` routes
  `/healthz`, `/rpc`, optional static assets; everything else — including the
  retired `/api/civ7/rpc` + `/api/recipe-dag/rpc` mounts and all legacy
  `/api/*` paths — is 404. The Vite proxy shrinks to one `/rpc` rule.
- **One client.** `lib/orpc.ts`'s `orpcClient` (typed off the unified
  contract) becomes the only transport. Deleted: the control client
  (`liveControlPort` retargets to `orpcClient.civ7.*`), the recipe-DAG client
  (`useRecipeDagQuery` retargets to `orpcClient.recipeDag.get`), the dead
  `studioServerClient.ts`, the dead `studioServer/rpcPath.ts` gate, the two
  Connect middlewares + `nodeWebBridge`, and both shared path constants.
- **Tests ride the slice** (PLAN §4): `daemonFetch.test.ts` REWRITTEN for the
  single mount (legacy-404 pins extended to the two retired mount paths);
  `rpcPath.test.ts` DELETED with its module (grounding correction to the
  plan: zero production consumers — delete, not rewrite);
  `studioServerClient.test.ts` + `civ7ControlOrpcClient.test.ts` +
  `recipeDag/orpc.test.ts` REPLACED by one single-mount contract pin (all
  three namespaces respond over one real `/rpc` handler; out-of-scope paths
  404; control timeout default + recipe-DAG not-found error preserved).

## Non-Goals

- Error-spine work (S1.2): the 14 unmapped engine throw sites and the bare
  500 fallback are untouched here; control-orpc error envelopes pass through
  unchanged.
- Client `DedupeRequestsPlugin`/`BatchLinkPlugin`: deferred with evidence —
  the dedupe plugin's filter defaults to `request.method === "GET"` and the
  RPC link sends POST, so enabling it now is a no-op posing as protection.
  Re-evaluate at S3.2 when the polls die (same disposition PLAN already
  assigns batching).
- Contract shape changes: every procedure's I/O and error schema is
  byte-identical; only the mount path and client wiring move.

## Impact

- `packages/studio-server`: contract/router/handler/context + new `recipeDag/`
  modules; deps add `@civ7/control-orpc`, `typebox`.
- `apps/mapgen-studio`: daemon fetch surface, vite proxy, client seams,
  deletions listed above; recipe-DAG service stays app-side.
- Wire compatibility: control + recipe-DAG procedures change URL
  (`/api/civ7/rpc/*` → `/rpc/civ7/*`, `/api/recipe-dag/rpc/recipeDag/*` →
  `/rpc/recipeDag/*`). The only consumers are the studio app itself (updated
  here); repo scripts already ride `/rpc`.
