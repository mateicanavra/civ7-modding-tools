# Studio Operation Lifecycle Failure Classification

## Why

Run in Game and related Studio operations can fail after admission in phases that users need to understand. Plain background exceptions must not collapse into validation failures.

## What Changes

- Classify Run in Game materialization, deploy, restart, setup, start, log proof, exact-authorship proof, and cleanup failures.
- Preserve operation registry truth for duplicate, disposed, terminal, expired, and daemon-mismatch states.
- Keep browser rendering and live proof for later packets.

## Non-Goals

- No browser UI edits except exact type-import tests named in the phase record.
- No direct-control transport changes.
- No generated/deployed output edits.

## Verification Gates

- `bun run openspec -- validate studio-operation-lifecycle-failure-classification --strict`
- `nx run @civ7/studio-server:test --outputStyle=static`
- `nx run @civ7/studio-server:build --outputStyle=static`
