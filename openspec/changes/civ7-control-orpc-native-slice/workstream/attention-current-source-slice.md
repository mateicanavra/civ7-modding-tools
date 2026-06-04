# Attention Current Source Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Seed the first service-owned semantic procedure after the read-wrapper freeze.
`attention.current` answers "what needs player-support attention now?" by
composing existing direct-control runtime ports through native
oRPC/effect-orpc procedure/router primitives.

This is deliberately not a new `@civ7/direct-control` attention facade. The
service behavior lives in `packages/civ7-control-orpc`; direct-control remains
the runtime port and proof authority for playable status, notification reads,
ready actor reads, validators, command serialization, and runtime evidence.

## Write Set

- `packages/civ7-control-orpc/src/modules/attention/contract.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/current.ts`
- `packages/civ7-control-orpc/src/modules/attention/router.ts`
- `packages/civ7-control-orpc/src/contract.ts`
- `packages/civ7-control-orpc/src/router.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/metadata.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/test/attention-current-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`attention.current`:

- reads playable status first and skips attention source reads when the game is
  not playable;
- reads notifications when playable and derives notification blockers and
  decisions from the decision queue and blocking notification evidence;
- reads ready-unit and ready-city ports whenever playable, using notification
  actor IDs as hints when present and `{}` otherwise so the ready ports can
  self-discover selected, first-ready, or blocking actors;
- returns a semantic normal-output shape: `blockers`, `decisions`,
  `readyActors`, `nextSteps`, source read statuses, and counts;
- omits `host`, `port`, raw state/session fields, raw command text, and source
  payload bundles from normal output;
- maps source failures through native `effect-orpc` tagged errors with bounded
  `procedureKey`/`source` data only.

## Non-Goals

- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no play-thread wake and no runtime/live-game proof claim;
- no mutation procedure, approval middleware, validator-first middleware, or
  postcondition/no-repeat middleware acceptance;
- no broad Task 5.4 or 5.5 acceptance beyond the recorded subitems;
- no direct-control-local procedure core, custom middleware pipeline,
  correlation bus, error bus, or transport layer.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test attention-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`

Focused proof covers in-process procedure calls, server-side client calls,
conditional source reads, raw context input rejection, public safe tagged
errors, and contract metadata. These are local package proofs only.

## Residual Risk

The current source set still relies on transitional direct-control-shaped
ports for notifications and ready actors. The follow-up turn-completion slice
deepens the semantic `attention` behavior; future slices should continue
burning down old facade-only leaves only when the native service shape is
sufficient.
