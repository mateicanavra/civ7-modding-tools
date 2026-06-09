# Progression Choice Proof Policy Slice

Status: implemented direct-control proof ownership prework.
Date: 2026-06-05.

## Purpose

Move technology and culture choice blocker postcondition classification out of
the CLI commands and into `@civ7/direct-control` progression proof ownership.

This is pre-oRPC service work. It makes the native domain-owned progression
procedure able to consume source-owned postcondition policy instead of copying
caller-local CLI logic or inferring success from raw App UI closeout sends.

## Write Set

- `packages/civ7-direct-control/src/play/progression/choice-postconditions.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/test/progression-choice-postconditions.test.ts`
- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- this OpenSpec record, `tasks.md`, the control-oRPC spec delta, and the
  atom/policy inventory

## Behavior Boundary

Direct-control now owns the shared progression-choice postcondition classifiers:

- `technologyChoicePostcondition`
- `cultureChoicePostcondition`
- `findTechnologyChoiceNotification`
- `findCultureChoiceNotification`

The policy classifies:

- turn-unblocked;
- blocker-cleared;
- blocker-transitioned;
- state-changed while the same blocker remains live;
- sticky blocker/no clear proof.

The CLI still owns shell flags, option display, send orchestration, and normal
CLI output. The CLI no longer owns the post-send blocker proof policy for
technology or culture choice closeouts.

## Non-Goals

- no control-oRPC procedure, router, middleware, or transport change;
- no shared validator/postcondition middleware promotion;
- no change to technology/culture App UI closeout send behavior;
- no raw command/session/payload projection into native service outputs;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/progression-choice-postconditions.test.ts`
- `bun run test:cli:play`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package and CLI proofs only. Runtime proof remains pending for
any future live mutation closure claim.

## Residual Risk

Technology and culture choice request wrappers still return raw App UI closeout
payloads from direct-control. A future native progression choice procedure must
own the caller-facing semantic contract and projection, consume this proof
policy, and preserve no-repeat guarding for sticky or
state-changed-blocker-still-live paths.
