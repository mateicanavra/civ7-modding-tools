# D5 Packet Closure Checklist

Status: implementation committed
Date: 2026-06-15

## Packet Shape

- [x] Proposal drafted.
- [x] Design drafted.
- [x] Tasks drafted.
- [x] Spec delta drafted.
- [x] Phase record drafted.
- [x] Workflow corpus ledger drafted.
- [x] Game-wire ledger drafted.
- [x] Prework ledger drafted.
- [x] Testing ledger drafted.
- [x] Fresh reviews complete.
- [x] Hardening/prework review complete.
- [x] Black-ice review complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Packet Verification Before Acceptance

- [x] `bun install --frozen-lockfile`
- [x] historical pre-settlement packet-authoring base: `bun run build` and `bun run check`
- [x] `git status --short --branch`
- [x] `gt status`
- [x] `gt log --no-interactive`
- [x] `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] workflow corpus recorded in `workflow-corpus-ledger.md`
- [x] game-wire decision recorded in `game-wire-ledger.md`
- [x] implementation prework and peer-agent prework lanes recorded in `prework-ledger.md`
- [x] future implementation closure gates recorded in `testing-ledger.md`

## Packet Acceptance Evidence

- `bun install --frozen-lockfile` passed with no dependency changes.
- `bun run build` passed on the historical pre-settlement packet-authoring baseline; generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` was restored because it is build output and outside this packet.
- `bun run check` passed; `lint-mapgen-docs` reported three pre-existing `@mapgen/*` warnings in mapgen docs and exited OK.
- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict` passed.
- `bun run openspec:validate` passed: 151 passed, 0 failed.
- `git diff --check` passed.
- Historical packet-authoring status proof was checked on `codex/runtime-effect-openspec-packets` before the D5 packet commit. Current D5 implementation work is on `codex/runtime-effect-pipeline-effect-services`; the implementation commit exists at the current branch tip and post-commit `git status --short --branch` was clean.

## Future Implementation Closure Gates

- [x] `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` are package-owned Effect services.
- [x] workflow services enter through D4 `StudioOperationRuntime`.
- [x] D3 typed failures are the only expected workflow failure model.
- [x] Run in Game materialization/proof/start/log/exact-authorship semantics remain green.
- [x] Save/Deploy save/deploy/rollback semantics remain green.
- [x] Save/Deploy same-request idempotency remains green.
- [x] Autoplay conflict/unavailable/start/stop/verification failures are typed.
- [x] Studio workflow game calls use shared `Civ7TunerSession`.
- [x] no app-local workflow authority remains in `createStudioEngines`, app helpers, or package context.
- [x] no unsanctioned session constructor or `withCiv7DirectControlSession` use exists in Studio workflow/app/router code.
- [x] public raw-control input guardrails remain green.
- [x] control-oRPC/direct-control package disposition is recorded: D5 touched neither package; package game-call routing is through `@civ7/studio-server` services.
- [x] D12 game-door handoff evidence is recorded.
- [ ] live Play and Save/Deploy proof is recorded.
- [x] fresh implementation-diff review disposition is recorded.
- [x] Graphite implementation commit exists and post-commit `git status --short --branch` is clean.

## Implementation Evidence

- `bun run --cwd packages/studio-server check` passed.
- `bun run --cwd packages/studio-server build` passed; no tracked `dist` artifact diff is pending.
- `bun run --cwd packages/studio-server test -- test/workflowSessionGraph.test.ts test/operationRuntime.test.ts test/handler.test.ts` passed. `workflowSessionGraph.test.ts` now includes both source-shape guards and a dynamic Layer proof that `Civ7WorkflowControlLive` consumes an externally supplied `Civ7TunerSession`.
- `bun run --cwd apps/mapgen-studio check` passed after the package declaration rebuild.
- `bun run --cwd apps/mapgen-studio build` passed.
- `bun run --cwd apps/mapgen-studio test -- runInGame/requestValidation.test.ts server/oneMount.test.ts server/engineEffectCorpus.test.ts` passed.
- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict` passed.
- `git diff --check` passed.
- Negative scans show direct-control game-call imports only in package `Civ7TunerClient` read services and package `Civ7WorkflowControl` workflow actions; lifecycle/error seam scan has no production hits, with remaining `createStudioEngines`/engine token hits only in `engineEffectCorpus.test.ts` as deletion/negative-proof fixtures.
- Final implementation-diff review found a public `StudioServerContext.civ7WorkflowControl` override. The override was removed from the public context and production runtime path, and the root `Civ7WorkflowControl*` export was removed. Package declarations were rebuilt; public DTS no longer exposes the override or workflow-control layer, and the remaining fake workflow-control seam is package-internal to `makeStudioOperationRuntimeLayer` tests.

Live Play and Save/Deploy were not run for D5 and are not claimed green. D12 retains the final game-door live-proof handoff.
