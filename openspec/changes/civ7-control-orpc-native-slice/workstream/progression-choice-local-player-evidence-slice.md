# Progression Choice Local-Player Evidence Slice

Status: implemented local package/procedure repair.
Date: 2026-06-05.

## Purpose

Repair `progression.technology.choice.request` and
`progression.culture.choice.request` before any controller bridge allowlist
uses them for live mutations. The service already reads direct-control
notification evidence before sending; this slice makes that before-read
`localPlayerId` the request/output identity used for the closeout request
instead of treating caller `playerId` as controller/runtime send authority.

## Write Set

- `packages/civ7-control-orpc/src/modules/progression/procedures/choice-request.ts`
- `packages/civ7-control-orpc/test/progression-choice-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- this workstream record

## Boundary

- `@civ7/direct-control` remains the low-level App UI/Tuner closeout runtime
  port and progression postcondition classifier owner.
- `packages/civ7-control-orpc` owns the service behavior that composes
  readiness, before/after notification evidence, closeout runtime
  ports, and semantic output.
- Caller `playerId` remains part of the caller-facing progression input, but
  the service binds the closeout request and normal output to the source-owned
  local-player evidence from the before-notification read.
- Progression controller bridge ingress remains rejected until a separate
  allowlist slice adds the request/response union, dispatch branch, closed
  controller proof envelope, and package/OpenSpec proof.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/progression-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package and OpenSpec proofs only. Runtime/live proof,
controller bridge allowlisting, UIScript/modinfo packaging, play-thread action,
and parent `7.3` acceptance remain pending.
