# Studio Dev Startup Proof

## Why

Studio dev startup must be reproducible on isolated ports and classified separately from runtime, Civ7, direct-control, and generated-output failures.

## What Changes

- Prove root/Nx `bun run dev:mapgen-studio` startup with daemon/Vite/RPC URLs recorded.
- Preserve isolated port support through `STUDIO_DEV_PORT`, `STUDIO_DAEMON_PORT`, and `STUDIO_DEV_RPC_TARGET`.
- Record generated-output and process cleanup state before and after dev proof.

## Non-Goals

- No live Civ7 success proof.
- No Habitat authority changes unless separately accepted.
- No generated-output commits without exact phase-record ownership.

## Verification Gates

- `bun run openspec -- validate studio-dev-startup-proof --strict`
- `nx run mapgen-studio:test --outputStyle=static`
- `nx run mapgen-studio:build:vite --outputStyle=static`
- Bounded isolated-port dev run recorded in `workstream/dev-startup-proof-ledger.md`
