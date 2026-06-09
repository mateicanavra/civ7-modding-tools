## Why

The mapgen-studio redesign must consume live game state, but the studio must
**not** read FireTuner and must **not** re-implement live reads (FRAME §4–§6).
The target read substrate — the `@civ7/control-orpc` effect-oRPC router plus the
`Civ7IntelligenceBridge` ingress — is **absent from `main`** (empty placeholder on
our branch) and lives at the **tip of the live-control `codex/*` stack**, which is
mid-consolidation (570 → ≤50 branches per the consolidation playbook). The studio
cannot block on that landing, but its server/data design must be **designed-toward**
that exact contract surface so the later bind is a thin adapter swap, not a rewrite.

This change is **docs-only**: it captures the target control-oRPC contract surface
and the studio-side adapter seam, and re-baselines the prior server-contract audit
and target-architecture server section as "studio-server surface only; live reads
go through the control seam."

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4 guardrails, §6 seam)
- `docs/projects/mapgen-studio-redesign/00-GOAL.md`
- `docs/projects/graphite-stack-integration/LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md`
- `packages/civ7-control-orpc/src/index.ts` (at live-control stack tip)
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts` (ingress contract)
- `packages/civ7-control-orpc/src/bridge/intelligence-bridge.ts` (`Civ7IntelligenceBridge`)

## What Changes

- Add `docs/projects/mapgen-studio-redesign/architecture/12-control-seam.md`: the
  target studio ↔ control-oRPC interface, request/response envelope, flows,
  boundaries, domain organization, and the thin `LiveControlPort` adapter seam.
- Re-baseline `audit/05-server-contracts.md` header: scope it to the studio-server
  surface; mark the FireTuner read rows superseded by the control seam.
- Re-baseline `architecture/10-target-architecture.md` §1: studio-server owns
  authoring/deploy/run-in-game; live reads bind through the control seam,
  designed-toward stack-top, not yet on `main`.

## Requires

- The captured live-control stack tip (`codex/live-control-hotseat-source-route-adoption`)
  as the contract source. The tip must be re-verified before any future bind.

## Enables Parallel Work

- P2 client data layer and P5 studio-server can proceed against a stable seam
  contract without waiting for the live-control stack to merge.

## Affected Owners

- `docs/projects/mapgen-studio-redesign/**` (docs only)

## Forbidden Owners

- No `apps/mapgen-studio/**` source changes (docs-only slice).
- No `packages/civ7-control-orpc/**` changes (read-only inspection only).
- No FireTuner read paths introduced into the studio.

## Stop Conditions

- The live-control stack tip cannot be located or its control-oRPC contract
  surface cannot be captured.
- The captured contract surface is structurally incompatible with the studio's
  live-read needs (FRAME §3 falsifier — escalate, do not paper over).

## Consumer Impact

The redesign team can design the studio's live-state seam against an exact,
documented target contract and bind a real client later via a one-line adapter
swap, with no FireTuner coupling and no re-implemented live reads.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-control-seam --strict`.
- Doc cross-references resolve (FRAME §6 ↔ doc 12 ↔ audit/05 ↔ architecture/10).
- No source/build changes (docs-only slice; tsc/build untouched).
