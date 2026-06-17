# Studio Browser Scenario Proof

## Why

Server and API tests do not prove rendered Studio state-machine behavior. The reported setup and Run in Game flows need rendered-shell evidence and diagnostics.

## What Changes

- Define manual browser protocol evidence for setup load, Run in Game, terminal failure, retry, restart, event reconnect, and daemon identity mismatch.
- Keep existing Vitest/component tests as deterministic source proof.
- Require a separate accepted test-stack packet before adding browser automation dependencies.

## Non-Goals

- No server runtime fixes in this packet.
- No live Civ7 loaded/in-game proof.
- No generated/deployed output edits.

## Verification Gates

- `bun run openspec -- validate studio-browser-scenario-proof --strict`
- `nx run mapgen-studio:test --outputStyle=static`
- `nx run mapgen-studio:build:vite --outputStyle=static`
- Manual browser protocol recorded in `workstream/browser-proof-ledger.md`
