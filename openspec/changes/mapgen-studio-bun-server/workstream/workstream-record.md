# Systematic Workstream Record

## Frame

- Objective: Move the Studio's server surface off the Vite dev middleware
  onto a standalone Bun daemon (P5b cutover, user go granted 2026-06-11),
  making Vite frontend-only and dissolving the effect-orpc TS-source
  loading constraint — with zero observable behavior change for the app or
  the legacy REST surface.
- Future state: `bun run dev` runs a daemon (owning every `/rpc` + `/api`
  byte and all server state) plus a Vite frontend that proxies to it; the
  daemon can also serve the built SPA, opening a real production server
  story.
- Non-goals: deploy/Caddy changes; any contract or client transport
  change; engine rewrites.
- Decision (2026-06-12, user directive, supersedes the planned retirement
  checkpoint): **"no legacy allowed. remove all fallbacks and legacy
  paths. no support. forward only."** The daemon serves the three oRPC
  mounts only; the 16 legacy REST handlers die with the Vite server
  plugin; the parity script moves to oRPC.
- Hard core: behavior parity (run/poll/localStorage/transport semantics);
  arch/10 §1 parity invariants (non-uniform status codes, 404-echo
  asymmetry, live/status embedded-error 200, `assertNoRawControlFields`,
  serialized queue + dual mutex, fingerprint dedup→202); path contracts
  (`/rpc`, `/api/civ7/rpc`, `/api/recipe-dag/rpc`); single engine instance
  per server process.
- Exterior: `codex/*` branches (read-only prior art); placement-stack
  resources vertical; the live-control lane's stack.

## Authority

- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§1 server target, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/00-GOAL.md` (P5b — supervised)
- `packages/studio-server/src/{index,handler}.ts` (A4-lite fetch seam)
- `openspec/changes/mapgen-studio-dag-tab/design.md` addendum (mount
  research: fetch handlers canonical, Vite hosting dev-era)
- `tools/gt-stack-inspect` @ `codex/gt-stack-inspect-dev-live-topology`
  (daemon + dev-live + proxy blueprint)

## Plan

- Phase 1 (`design/bun-server-frame`): this record + proposal/design/tasks
  + spec deltas, `--strict` valid.
- Phase 2 (`design/bun-server-engines`): engine extraction, no topology
  change.
- Phase 3 (`design/bun-control-fetch`): control mount → fetch adapter.
- Phase 4 (`design/bun-server-daemon`): daemon + dev-live + Vite
  frontend-only cutover + legacy retirement (per the 2026-06-12 user
  directive) + parity-script oRPC migration.

## Evidence

- Phase 1 (`design/bun-server-frame`): docs committed; `openspec validate
  mapgen-studio-bun-server --strict` valid.
- Phase 2 (`design/bun-server-engines`): tsc clean; studio 193; mod 471;
  build + worker bundle (the build evaluates the config under node,
  proving the extracted graph stays node-safe); fresh-process live smoke —
  `/api/studio/server-info` carries the factory identity, recipe-dag POST
  200, run-in-game stale-id 404 echoed `serverInstanceId`/`serverStartedAt`
  live (restart-detection parity pin observed end-to-end).
- Phase 3 (`design/bun-control-fetch`): tsc clean; studio 193 (existing
  `civ7ControlOrpcClient.test.ts` node-transport pins unchanged over the
  fetch adapter); live `readiness.current` 200 on a fresh process.
- Phase 4 (`design/bun-server-daemon`): tsc clean; studio 201 (8 new
  daemon/dev-live pins); mod 471; build + worker bundle; `--strict` valid.
  Live on fresh processes: dev-live boots daemon (5174, Bun loads
  effect-orpc TS natively — stack traces show `src/server/studio/*.ts`
  executing from source) then Vite (5173); all three oRPC mounts answer
  through the proxy; retired legacy paths 404 (`/api/civ7/status` et al);
  `studio.serverInfo` → `viteCommand: "daemon"`; full generation run
  completes; Pipeline stage view loads the DAG via the proxy; zero browser
  console errors. Control facade timeout at test time verified
  runtime-independent (same read times out under node).
- Legacy retirement: executed per the 2026-06-12 user directive (decision
  recorded under Frame); parity script moved to oRPC `runInGame.status`.
- Phase 4 addendum — live-control connect VERIFIED after a tuner-wedge
  incident: the initial cutover smoke could not reach the tuner and the
  failure was misattributed to transient game state. Root cause of the
  outage: Civ7 itself had accumulated **187 leaked tuner connections**
  (`lsof` CLOSED-state fds inside the game process) over the long dev
  session, wedging the tuner for ALL clients (node and Bun alike — the
  same read timed out under both). After restarting Civ7: node and Bun
  reads both succeed and leak ZERO fds across sequential (10×),
  concurrent (8×), and forced-timeout (5×) matrices — Bun is NOT the
  trigger; the leak class predates the cutover (polling during busy-game
  windows, e.g. in-game mapgen/loading, is the suspected accumulator).
  End-to-end through the daemon on a healthy tuner: `readiness.current` →
  `"shell"`, `civ7.status` returns the full App UI snapshot, and the
  studio Game bar shows the live `shell` readiness chip. Durable
  follow-up (tuner wedge mitigation) tracked outside this change.
