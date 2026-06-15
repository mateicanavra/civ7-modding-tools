# D3 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal repaired.
- [x] Design repaired.
- [x] Tasks repaired.
- [x] Spec delta repaired.
- [x] Phase record repaired.
- [x] Error corpus ledger drafted.
- [x] Failure vocabulary ledger drafted.
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
- [x] `bun run openspec -- validate mapgen-studio-error-spine --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] failure corpus recorded in `error-corpus-ledger.md`
- [x] failure vocabulary recorded in `failure-vocabulary-ledger.md`
- [x] failure reason codes are TypeBox-declared before engine/application projections can emit them
- [x] implementation prework and peer-agent prework lanes recorded in `prework-ledger.md`
- [x] future implementation closure gates recorded in `testing-ledger.md`

Dirty-file quarantine note: `bun run build` rewrote the generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` bundle; it was restored from `HEAD` and is not part of D3.

## Future Implementation Closure Gates

- [ ] no expected public error data uses `Type.Unknown()` / `details?: unknown`
- [ ] no expected failure path uses status-code truth as the domain model
- [ ] no raw `ORPCError` construction outside router/runtime mapping ownership
- [ ] status-miss identity echo parity remains green
- [ ] recovery actions are TypeBox vocabulary values
- [ ] operation-state projections use typed failure data and sealed recovery-action values
- [ ] mapper totality tests cover all operation namespaces and expected tags
- [ ] lifecycle mapper tests cover the exact D3 matrix without implementation-selected mappings
- [ ] Autoplay start/stop and verification failures map to typed `AUTOPLAY_FAILED` outcomes
- [ ] no unclassified `effect-orpc` imports outside router/runtime ownership
- [ ] no production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, or bridge mapping remains
- [ ] `@civ7/control-orpc` and `@civ7/direct-control` package gates run when touched, or untouched-package negative scans are recorded
- [ ] stale old-S1.2 closure and schema allowance comments are deleted or corrected
