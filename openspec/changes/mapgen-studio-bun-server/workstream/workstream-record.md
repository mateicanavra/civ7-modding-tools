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
- Non-goals: legacy retirement without the user checkpoint; deploy/Caddy
  changes; any contract or client transport change; engine rewrites.
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
  frontend-only cutover + legacy compat port.
- Phase 5 (checkpoint, SUPERVISED): retirement decision; then
  `design/bun-legacy-retire`.

## Evidence

- (per phase, appended as slices close)
