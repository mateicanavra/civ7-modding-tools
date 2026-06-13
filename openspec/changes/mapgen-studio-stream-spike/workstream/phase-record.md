# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S3.0 `stream-spike`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/stream-spike` stacked on `main`
- Started: 2026-06-13
- Status: closed; merged and drained through Graphite

## Objective

- Target movement: decide the stream bridge for WS-3 before production EventHub
  work begins.
- Non-goals: production EventHub, operation poll deletion, watchdog deletion,
  live-game watcher migration, alternate transport surfaces.
- Done condition: working reference proof and findings note identify the S3.1
  implementation path, cleanup proof, client API correction, risks, and
  deletion/promotion targets.

## Authority

- Root/subtree `AGENTS.md`: root repo router, exact staging, Graphite process,
  no dirty repo closure.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md` WS-3 S3.0.
- Architecture refs: one `/rpc` surface from S1.1; daemon-owned state from
  S2.1; event spine target from DP-3.
- Project refs: `openspec/changes/mapgen-studio-runtime-one-mount/`,
  `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/`,
  `openspec/changes/mapgen-studio-error-spine/`,
  `openspec/changes/mapgen-studio-operations-current/`.
- Excluded/stale inputs: stale habitat branch, pre-S2 browser recovery bridge,
  stale plan vocabulary when installed package declarations differ.

## Current State

- Repo/Graphite state: `codex/stream-spike` merged via PR #1684 into `main` at
  `9c0ba47acea904f2348293d0945e1868a6810ecc`, then retired from the local
  Graphite stack.
- Dirty files and owner: none for S3.0 after merge/drain.
- Current code evidence: one `/rpc` surface exists; `operations.current`
  exists for reconnect adoption; status polls/watchdog remain for S3.2/S3.3.
- Generated outputs affected: none expected.
- Tests/guards affected: focused package stream reference test and Vite proxy
  stream passthrough test.

## Scope

- Write set: `openspec/changes/mapgen-studio-stream-spike/**`, focused
  reference/proof tests under `packages/studio-server/test/**` and/or
  `apps/mapgen-studio/test/**`, minimal test-local helpers if required.
- Protected files: production EventHub service, production client store feeds,
  generated outputs, unrelated OpenSpec changes, operation poll deletion.
- Owners: S3.0 owns feasibility evidence and reference proof; S3.1 owns
  production EventHub/watch implementation.
- Forbidden owners: alternate runtime transport, hidden compatibility route,
  new Zod success schemas for durable event contracts.
- Consumer impact: no production runtime behavior change expected from S3.0.
- Downstream assumptions: S3.1 uses the selected bridge; S3.2/S3.3 delete
  polls/watchdog only after production events exist.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-stream-spike/`.
- Tasks: `tasks.md`.
- Validation status: `bun run openspec -- validate mapgen-studio-stream-spike --strict`
  passed.

## Review

- Review lanes: S3.0 watcher lane `019ec079-d523-7e63-9929-0689dc99cd44`.
- Blocking findings: none known yet.
- Accepted findings repaired: none.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: package/API evidence explorer `019ec07c-de9d-7973-9b9e-9fe8fa0fa655`;
  transport evidence explorer `019ec07d-999c-75e2-9b8f-4354b5f40dbe`.
- Completed agents: watcher `019ec079-d523-7e63-9929-0689dc99cd44`.
- Assigned write sets: watcher is read-only.
- Latest evidence by agent: watcher returned `DONT_NOTIFY`; strict OpenSpec
  validation passed, scope guards were present, and no live watcher
  note/correction artifact was required. Package/API explorer returned
  feasible-with-caveats and selected `experimental_liveOptions`. Transport
  explorer confirmed the `/rpc` path and recommended a test-local proof plus a
  live Vite proxy guard.
- Open findings by agent: none.
- Running/stale status: all S3.0 agents complete/closed.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: initial S3.0 frame, strict OpenSpec validation, watcher lane
  start/disposition, evidence map, reference proof, findings, and downstream
  plan realignment.
- Remaining tasks: none for S3.0; continue S3.1.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-stream-spike --strict`
- `bun run --cwd packages/studio-server test -- test/streamSpike.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts`
- `bun x turbo run check --filter=@civ7/studio-server`
- Results: OpenSpec strict validation passed; stream reference proof passed;
  Vite proxy stream passthrough proof passed; studio-server package check
  passed.
- Gate disposition: package/app proof gates green; studio-server package check
  green.
- Evidence boundary: no production EventHub/client subscription implemented;
  S3.1 must promote/delete the spike package fixture when production tests land.

## Realignment

- Downstream docs/specs/issues updated:
  `docs/projects/studio-runtime-simplification/PLAN.md` now names
  `experimental_liveOptions`/`experimental_streamedOptions` and selects live
  options for latest-state event consumption.
- Tests/guards updated: `packages/studio-server/test/streamSpike.test.ts` and
  `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts`.
- Deferrals/triage updated: S3.1 must promote/delete the spike package fixture;
  Vite proxy guard may remain as durable stream passthrough coverage.
- Downstream realignment ledger: captured in `workstream/findings.md`.

## Next Action

- Exact next step: open S3.1 `event-hub`.
- First files to inspect for implementation:
  `packages/studio-server/src/handler.ts`,
  `packages/studio-server/src/contract/index.ts`,
  `packages/studio-server/src/router/index.ts`,
  `apps/mapgen-studio/src/lib/orpc.ts`,
  daemon/vite proxy paths under `apps/mapgen-studio/src/server`.
- Stop condition: if `eventIterator` cannot be served through `effect-orpc`
  `.effect()`, record the source evidence and select the plain oRPC handler
  path for S3.1 rather than adding a dual route.
