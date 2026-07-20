# Packet 11 Verification Evidence

Date: 2026-07-08

## Summary

Packet 11 is verified for deployment snapshot and runtime lease behavior. Run in
Game deploys by copying the generated mod to `mod-swooper-studio-run`, records
private `RunDeployment` and `DeployedModSnapshot` evidence, attaches deployed
mod ownership to the runtime lease, blocks Save/Deploy while the Run in Game
lease is active, and keeps deployment details out of public status/errors.

The full initiative in-game proof remains outside this packet closure: the live
endpoint reached Civ7 preparation and produced deployment evidence, but this
packet does not claim post-start Civilization 7 proof.

## Behavior And Static Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| `bun nx run control-studio-server:check` | PASS | TypeScript check passed. |
| `bun nx run control-studio-server:test` | PASS | 8 files, 122 tests. |
| `bun nx run mapgen-studio:check` | PASS | App/server TypeScript check passed. |
| `bun nx run mapgen-studio:test` | PASS | 68 files, 384 tests. |
| `bun nx run studio-contract:check` | PASS | Contract TypeScript check passed. |
| `bun nx run mapgen-studio-ui:check` | PASS | UI TypeScript check passed. |
| `bun nx run mod-swooper-maps:test:studio-run-in-game` | PASS | 17 tests. |
| `bun nx run mod-swooper-maps:check` | PASS | Mod TypeScript/build check passed. |
| `bun habitat check --rule grit-studio-run-copy-deploy-boundary --json` | PASS | SA-11 source-boundary rule passed. |
| `bun habitat check --rule grit-studio-run-operation-identity-owner --json` | PASS | Identity/lease rule passed after trimming brittle checks. |
| `bun habitat check --owner mapgen-studio --json` | PASS | Owner check passed, including SA-11. |
| `bun run openspec -- validate studio-run-deployment-snapshot-lease --strict` | PASS | Change validates strictly. |
| `git diff --check` | PASS | No whitespace errors. |

## Live Endpoint Probe

Command shape: running Studio daemon on `http://127.0.0.1:5185`, then direct
oRPC calls against `/rpc`.

Observed result:

```json
{
  "serverInfo": {
    "ok": true,
    "viteCommand": "daemon",
    "runInGameApiVersion": 2
  },
  "started": {
    "requestId": "studio-run-in-game-mrbleg3r-1l2o-2",
    "status": "running",
    "phase": "resolving-source",
    "diagnosticsId": "run-diagnostics-26df8d23-1a8e-4295-ae6e-86dd4c924a2a"
  },
  "postDeployConflict": {
    "code": "SAVE_DEPLOY_BLOCKED",
    "status": 409,
    "activePhase": "checking-civ7",
    "publicIncludesDeployedModId": false,
    "diagnostics": {
      "code": "studio-operation-active"
    }
  },
  "publicStatusLeak": false,
  "diagnosticsOk": true,
  "diagnosticsHasDeploymentEvidence": true,
  "diagnosticsHasSnapshot": true,
  "diagnosticsHasStudioMod": true
}
```

Interpretation:

- The live Run in Game request reached post-deploy Civ7 preparation.
- A live Save/Deploy request during `checking-civ7` returned public
  `SAVE_DEPLOY_BLOCKED` with only safe public diagnostics.
- Public status samples did not contain deployment/snapshot/private path fields.
- Explicit diagnostics lookup contained private deployment and snapshot
  evidence for `mod-swooper-studio-run`.
- The daemon was stopped after the probe and port `5185` was clear.

## Review Lanes

| Lane | Result | Notes |
| --- | --- | --- |
| TypeScript refactoring | CLEAR | No unresolved P1/P2 after repair. Residual P3: future type-state split could make deployed evidence non-optional on the broad operation type; a canonical evidence builder/parser would further reduce fake evidence risk. |
| Code quality / Habitat authority | CLEAR | No unresolved P1/P2 after repair. Residual P3: SA-11 and SA-02 still contain a few local-name-sensitive Grit snippets, accepted as current guardrails. |
| oRPC / Effect / library correctness | CLEAR | No unresolved P1/P2 after repair. Residual P3: deploy cancellation is cooperative around filesystem calls; explicit mod enablement is represented by stable map-script launch plus visibility failure reporting; marker observations live in materialization proof rather than the snapshot object. |
