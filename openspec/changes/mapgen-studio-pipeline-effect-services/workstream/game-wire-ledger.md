# D5 Game-Wire Ledger

Status: draft
Date: 2026-06-14

## Decision

D5 Studio workflow services use the daemon runtime's shared `Civ7TunerSession` for game-facing direct-control calls.

## Allowed Session Constructor Owners

- `packages/studio-server/src/services/Civ7TunerSession.ts`: constructs and owns the daemon shared session.
- `packages/civ7-direct-control/src/session/session.ts`: owns the low-level session class and package internals.

## Allowed Shared-Session Facades

- `packages/studio-server/src/ports/Civ7WorkflowControl.ts`: resolves `Civ7TunerSession` from the managed runtime and calls direct-control atoms with the shared session.

`Civ7WorkflowControl` is not a constructor owner. It is the only Studio workflow facade allowed to make game-facing direct-control calls.

## Forbidden Session Or Game-Wire Owners

- `apps/mapgen-studio/**`
- `packages/studio-server/src/router/**`
- `packages/studio-server/src/workflows/**`
- local scripts and tests pretending to be production owners
- app leaf adapters importing direct-control game-call atoms

## Required Guard Searches

```bash
rg -n "new\\s+Civ7DirectControlSession\\(" apps packages -g "*.{ts,tsx}"
rg -n "withCiv7DirectControlSession" apps/mapgen-studio packages/studio-server -g "*.{ts,tsx}"
rg -n "getCiv7PlayableStatus|ensureCiv7SetupMapRowVisible|runCiv7SinglePlayerFromSetup|startCiv7Autoplay|stopCiv7Autoplay" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
rg -n "\\bcommand\\b|operationType|rawCommand|script|javascript|session|stateName|rawJs|context|\\bargs\\b" packages/studio-server/src/contract packages/civ7-control-orpc/src/modules apps/mapgen-studio/src/server -g "*.{ts,tsx}"
```

Hits are classified as sanctioned package owners, forbidden workflow/app/router ownership, non-executable status/proof evidence, tests, or historical packet evidence.

## D12 Handoff

D5 records the stricter Studio invariant for D12: no Studio workflow code uses direct per-flow session helpers. D12 closes the final game-door invariant after D5-D11 land and keeps the exact constructor allowlist current.

D5 implementation must hand D12:

- final allowed constructor owners;
- every workflow game-call route and whether it used shared `Civ7TunerSession`;
- public-route raw-field search classification;
- control-oRPC/direct-control metadata proof;
- live Play and Save/Deploy proof pointers.
