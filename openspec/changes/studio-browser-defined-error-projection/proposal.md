# Studio Browser Defined Error Projection

## Why

Browser API clients currently preserve defined oRPC errors unevenly. User diagnostics need consistent code/data projection or a tested intentional simplification.

## What Changes

- Add a shared browser defined-error projection helper.
- Align Run in Game, Save/Deploy, setup config, and Autoplay client behavior.
- Keep rendered browser scenario proof for a later packet.

## Non-Goals

- No server runtime changes.
- No live Civ7 proof.
- No generated/deployed output edits.

## Verification Gates

- `bun run openspec -- validate studio-browser-defined-error-projection --strict`
- `nx run mapgen-studio:test --outputStyle=static`
- `nx run mapgen-studio:build:vite --outputStyle=static`
