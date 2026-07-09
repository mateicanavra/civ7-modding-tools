# Studio Run Generator Integration

## Why

The server runtime now has resolved sources, a request workspace, one manifest,
and a manifest-only generator. This packet connects those pieces into the Run in
Game workflow and retires the ambient request-generation lane.

## System Context

Affected owners:

- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- `packages/studio-server` Run in Game workflow
- Swooper manifest generator target/port
- Nx target/project configuration for request generation

This packet does not own the deployment snapshot/lease guardrail; it produces
the generated mod record and private metadata that the deployment packet
formalizes.

## Before And After

Before:

- Run in Game can materialize request config through ambient files, env
  selectors, cleanup regeneration, or request-specific Nx cache inputs.

After:

- Run in Game invokes the manifest-only generator with the manifest path;
- generated mod path comes from the request workspace;
- public status advances through source resolution and artifact generation
  using Packet 1 vocabulary;
- request-specific generation data flows through the manifest only.

## Behavior Verification

Behavior tests verify the workflow invokes manifest generation, handles
generation success/failure, records diagnostics, and exposes safe public status.

## Structural Enforcement

Permanent positive assertions:

- Run in Game exposes one manifest-reference generator port;
- workflow/app generator calls do not accept request/prepared/output-root side
  channels.

Structural authority row: SA-10 `grit-studio-run-generator-port-boundary`.

## Verification Gates

- Focused workflow behavior tests.
- Generator integration behavior tests.
- Live Studio endpoint evidence that a run invokes the manifest generator and
  records generated mod metadata privately.
- SA-10 `grit-studio-run-generator-port-boundary`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-generator-integration --strict`.
