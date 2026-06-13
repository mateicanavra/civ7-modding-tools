# MapGen Studio error spine

## Why

S1.1 unified Studio runtime traffic onto one `/rpc` surface, and S1.1a made
Play/Save&Deploy live proof meaningful by removing deploy-written files from
the daemon import graph. The next runtime simplification slice is the error
spine: the daemon should not expose known engine failures as anonymous 500s.

Today `createStudioServerContext` maps engine `RunInGameHttpError` statuses
through a partial status table and falls through to `*_FAILED` 500 for known
but unmapped categories. Some engine paths also still throw plain `Error`s, and
Save&Deploy status 404 does not carry the server identity echo that Run in Game
uses for restart detection. That keeps the client from making durable decisions
based on typed failure data.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — S1.2 requires sealed
  failure unions, no unmapped 500s, Save&Deploy 404 identity echo, and
  normalized recovery-action hints across Run in Game and Save&Deploy.
- `openspec/changes/mapgen-studio-runtime-one-mount/` — S1.1 left error-spine
  work intentionally untouched.
- `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/` — S1.1a closed
  the dev-watch self-restart blocker so live proof is meaningful again.
- `apps/mapgen-studio/src/server/studio/context.ts` and
  `apps/mapgen-studio/src/server/studio/engines.ts` — current engine error
  adapter and throw sites.
- `packages/studio-server/src/contract/errors.ts` — declared oRPC error
  envelopes that must become the single contract authority.

## What Changes

- Introduce a sealed engine failure model for Studio host engines, with tagged
  failure categories instead of ad-hoc status-code fallthroughs.
- Replace the partial `toOrpc()` fallback with an exhaustive mapping from every
  known engine failure category to a declared oRPC error code/status/data shape.
- Preserve durable existing error-code pins while adding a new no-unmapped-500
  pin over the failure union.
- Add Save&Deploy status 404 server identity echo parity so both operation
  status endpoints can support restart-aware client behavior.
- Realign the still-live `mapgen-studio-server-orpc` OpenSpec wording and
  package contract/context comments that currently preserve the old
  Save&Deploy 404 no-echo asymmetry.
- Normalize recovery-action hints in Run in Game and Save&Deploy failure data
  instead of leaving recovery guidance as one-off detail fields.

## Non-Goals

- No S2.1 operation recovery or daemon-truth adoption.
- No client localStorage bridge deletion.
- No UI copy rewrite beyond consuming the normalized error shape if required by
  tests.
- No fallback/dual-path compatibility shim without an explicit deletion target.

## Impact

- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/src/server/studio/engines.ts`
- Run in Game / Save&Deploy operation error helpers and tests
- `packages/studio-server/src/contract/errors.ts`
- `packages/studio-server/src/contract/mapConfigs.ts`
- `packages/studio-server/src/context.ts`
- `openspec/changes/mapgen-studio-server-orpc/specs/mapgen-studio/spec.md`
- App and package tests that pin typed engine errors

## Verification Gates

- `bun run openspec -- validate mapgen-studio-error-spine --strict`
- Focused engine-error tests proving every sealed failure maps to a declared
  non-fallback error.
- App gate: `bun x turbo run check --filter=mapgen-studio`
- Package gates: `@civ7/studio-server`, `@civ7/control-orpc`,
  `@civ7/direct-control`
- Live proof disposition: Play/Save&Deploy failure paths return typed errors
  without daemon restart; success-path live proof can reuse S1.1a coverage
  unless implementation touches operation execution.
