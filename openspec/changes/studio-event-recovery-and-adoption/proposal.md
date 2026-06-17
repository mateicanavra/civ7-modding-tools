# Studio Event Recovery And Operation Adoption

## Why

The Studio browser must recover from event-stream errors and daemon restarts without stale local errors, silent busy gates, or incorrect operation adoption.

## What Changes

- Add a pure event-recovery coordinator seam for deterministic tests.
- Use existing hello/current daemon identity for adoption and mismatch handling.
- Provide visible user feedback for busy gates.

## Non-Goals

- No server contract expansion unless the phase record reopens the owning server packet.
- No live Civ7 proof.
- No generated/deployed output edits.

## Verification Gates

- `bun run openspec -- validate studio-event-recovery-and-adoption --strict`
- `nx run mapgen-studio:test --outputStyle=static`
- `nx run mapgen-studio:build:vite --outputStyle=static`
