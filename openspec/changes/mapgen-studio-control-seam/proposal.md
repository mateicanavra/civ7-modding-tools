## Why

The mapgen-studio redesign must consume live game state, but the studio must
**not** read FireTuner and must **not** re-implement live reads (FRAME §4–§6).
The target read substrate — the `@civ7/control-orpc` effect-oRPC router plus the
`Civ7IntelligenceBridge` ingress — has now landed on `main`. The studio redesign
binds to it through a thin `src/lib/control/*` port so the app shell can consume
readiness without taking direct ownership of control-oRPC transport details.

This change captures and maintains the studio-side adapter seam, and re-baselines
the prior server-contract audit and target-architecture server section as
"studio-server surface only; live reads go through the control seam."

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4 guardrails, §6 seam)
- `docs/projects/mapgen-studio-redesign/00-GOAL.md`
- `docs/projects/graphite-stack-integration/LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md`
- `packages/civ7-control-orpc/src/index.ts` (mainline package)
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts` (ingress contract)
- `packages/civ7-control-orpc/src/bridge/intelligence-bridge.ts` (`Civ7IntelligenceBridge`)

## What Changes

- Add `docs/projects/mapgen-studio-redesign/architecture/12-control-seam.md`: the
  target studio ↔ control-oRPC interface, request/response envelope, flows,
  boundaries, domain organization, and the thin `LiveControlPort` adapter seam.
- Bind the app shell's live-runtime readiness read through
  `apps/mapgen-studio/src/lib/control/liveControlPort.ts`, which speaks to the
  Studio-hosted `/api/civ7/rpc` middleware.
- Re-baseline `audit/05-server-contracts.md` header: scope it to the studio-server
  surface; mark the FireTuner read rows superseded by the control seam.
- Re-baseline `architecture/10-target-architecture.md` §1: studio-server owns
  authoring/deploy/run-in-game; live reads bind through the control seam.

## Requires

- The landed `@civ7/control-orpc` package and Studio-hosted
  `/api/civ7/rpc` middleware.

## Enables Parallel Work

- P2 client data layer and P5 studio-server can proceed against a stable seam
  contract without direct FireTuner coupling in UI code.

## Affected Owners

- `docs/projects/mapgen-studio-redesign/**`
- `apps/mapgen-studio/src/lib/control/**`
- `apps/mapgen-studio/src/app/StudioShell.tsx`

## Forbidden Owners

- No `packages/civ7-control-orpc/**` changes (consumption only).
- No FireTuner read paths introduced into the studio.

## Stop Conditions

- The landed control-oRPC contract surface cannot satisfy Studio readiness needs.
- The captured contract surface is structurally incompatible with the studio's
  live-read needs (FRAME §3 falsifier — escalate, do not paper over).

## Consumer Impact

The redesign team can design the studio's live-state seam against an exact,
documented target contract through a thin port, with no FireTuner coupling and no
re-implemented live reads.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-control-seam --strict`.
- Doc cross-references resolve (FRAME §6 ↔ doc 12 ↔ audit/05 ↔ architecture/10).
- `bunx turbo run check --filter=@civ7/control-orpc --filter=@civ7/studio-server --filter=mapgen-studio`.
