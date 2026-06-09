# Progression Choice Decision Slice

Status: implemented local package/procedure slice.
Date: 2026-06-05.

## Purpose

Add `decisions.progression.choice.request` as a native service-owned
control-oRPC decision procedure for technology and culture node choices.

This consumes the direct-control progression closeout runtime ports and the
source-owned progression choice postcondition classifiers, while keeping the
caller-facing procedure contract semantic and closed against raw App UI
closeout internals.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/decisions/contract.ts`
- `packages/civ7-control-orpc/src/modules/decisions/router.ts`
- `packages/civ7-control-orpc/src/modules/decisions/procedures/progression-choice-request.ts`
- `packages/civ7-control-orpc/test/decisions-progression-choice-procedure.test.ts`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The service procedure owns:

- the caller-facing progression kind/player/node/notification input shape;
- the `decisions.progression.choice.request` contract/router/procedure leaf;
- approval and playable-readiness composition through existing native
  effect-oRPC middleware;
- before/after notification evidence collection around the direct-control
  closeout request;
- semantic projection to sent status, evidence summary, postcondition summary,
  and next steps;
- no-repeat guarded pending-runtime-proof projection when a sent closeout cannot
  complete the post-send notification read;
- bounded tagged error projection for direct-control runtime-port failures.

Direct-control remains the source authority for:

- App UI technology/culture closeout command construction and send authority;
- Tuner/App UI endpoint execution;
- progression notification postcondition classification;
- no-repeat proof semantics consumed by the service projection.

## Raw Surface Exclusions

Normal procedure input and output exclude:

- endpoint/session/state selection;
- raw command or command-source fields;
- direct-control `command`, `payload`, `host`, `port`, and `state` envelopes;
- App UI activation toggles and closeout internals;
- legacy proof booleans such as `verified`.

## Non-Goals

- no direct-control runtime implementation change;
- no CLI, Studio, RPCLink, bridge, or in-game controller adapter change;
- no broad decisions catalog or generic operation router;
- no custom oRPC/context/middleware/procedure-core plumbing;
- no shared validator/postcondition middleware acceptance;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/decisions-progression-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-direct-control test test/progression-choice-postconditions.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/procedure and OpenSpec proofs only. Runtime proof
remains pending for any future live mutation closure claim.

## Residual Risk

The service procedure performs one before and one after notification read around
the direct-control closeout request when a closeout is sent. It does not claim
bounded live polling or runtime certainty. If the closeout was sent but the
post-send read fails, the caller receives `sent-unverified` with
`pending-runtime-proof` confidence and a do-not-repeat next step. Sticky
blocker and state-changed-blocker-still-live paths also remain no-repeat
guarded and require fresh attention/progression evidence before another
attempt.
