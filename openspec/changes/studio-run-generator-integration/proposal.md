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

This packet does not change deployment copy/snapshot behavior; it produces the
generated mod that the deployment packet consumes.

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

- Run in Game request generation has one manifest input;
- request generated output root is the request workspace generated-mod root.

Structural authority row: SA-10 `grit-studio-run-generator-port-boundary`.

## Verification Gates

- Focused workflow behavior tests.
- Generator integration behavior tests.
- SA-10 `grit-studio-run-generator-port-boundary`.
- `bun run openspec -- validate studio-run-generator-integration --strict`.
