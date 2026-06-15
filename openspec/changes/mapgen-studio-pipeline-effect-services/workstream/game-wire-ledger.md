# D5 Game-Wire Ledger

Status: implementation candidate
Date: 2026-06-15

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

## Implementation Disposition

D5 implemented `packages/studio-server/src/ports/Civ7WorkflowControl.ts` as the workflow game-call facade. It depends on `Civ7TunerSession` and calls direct-control atoms through `tuner.use(...)`; it does not import or provide `Civ7TunerSessionLive`, call `makeCiv7TunerSessionLayer`, or construct `Civ7DirectControlSession`.

`packages/studio-server/src/runtime.ts` is the visible owner/composition point for `Civ7TunerSessionLive`: it names `const civ7TunerSessionLayer = Civ7TunerSessionLive`, merges that layer into the Studio runtime graph, and provides that named layer to the operation runtime graph when no test/runtime override is supplied.

Proof:

- `bun run --cwd packages/studio-server test -- test/workflowSessionGraph.test.ts test/operationRuntime.test.ts test/handler.test.ts` passed.
- `test/workflowSessionGraph.test.ts` includes a static source-shape guard for the production graph and a dynamic Layer proof that `Civ7WorkflowControlLive` consumes an externally supplied `Civ7TunerSession` service. The dynamic proof does not claim `Civ7TunerClient` and `Civ7WorkflowControlLive` share one live FireTuner socket by running against Civ7; it proves workflow-control has no independent session owner.
- The game-call scan hits only package-owned `Civ7TunerClient` read services and package-owned `Civ7WorkflowControl` workflow actions; app production code has no direct setup/start/autoplay game-call imports.
- The session-owner scan hits only `packages/studio-server/src/runtime.ts` for the accepted top-level `Civ7TunerSessionLive` composition.

Live Play and Save/Deploy proof was not run in D5. D12 retains the final live game-door proof pointer requirement.
