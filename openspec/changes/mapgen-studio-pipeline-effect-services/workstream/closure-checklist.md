# D5 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

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
- `git status --short --branch`, `gt status`, and `gt log --no-interactive` were checked on `codex/runtime-effect-openspec-packets`; only the D5 packet files are pending before commit.

## Future Implementation Closure Gates

- [ ] `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` are package-owned Effect services.
- [ ] workflow services enter through D4 `StudioOperationRuntime`.
- [ ] D3 typed failures are the only expected workflow failure model.
- [ ] Run in Game materialization/proof/start/log/exact-authorship semantics remain green.
- [ ] Save/Deploy save/deploy/rollback semantics remain green.
- [ ] Save/Deploy same-request idempotency remains green.
- [ ] Autoplay conflict/unavailable/start/stop/verification failures are typed.
- [ ] Studio workflow game calls use shared `Civ7TunerSession`.
- [ ] no app-local workflow authority remains in `createStudioEngines`, app helpers, or package context.
- [ ] no unsanctioned session constructor or `withCiv7DirectControlSession` use exists in Studio workflow/app/router code.
- [ ] public raw-control input guardrails remain green.
- [ ] control-oRPC/direct-control package gates or untouched dispositions are recorded.
- [ ] D12 game-door handoff evidence is recorded.
- [ ] live Play and Save/Deploy proof is recorded.
