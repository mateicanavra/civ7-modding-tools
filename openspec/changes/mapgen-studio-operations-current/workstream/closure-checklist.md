# D6 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal repaired.
- [x] Design repaired.
- [x] Tasks repaired.
- [x] Spec delta repaired.
- [x] Phase record repaired.
- [x] Prework ledger created.
- [x] Testing ledger created.
- [x] Downstream realignment ledger created.
- [x] Fresh reviews complete.
- [x] Hardening/prework review complete.
- [x] Black-ice review complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Packet Verification Before Acceptance

- [x] `bun install --frozen-lockfile`
- [x] current packet-authoring base: `bun run build` and `bun run check`
- [x] `git status --short --branch`
- [x] `gt status`
- [x] `gt log --no-interactive`
- [x] `bun run openspec -- validate mapgen-studio-operations-current --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] prework recorded in `prework-ledger.md`
- [x] testing strategy recorded in `testing-ledger.md`
- [x] downstream assumptions recorded in `downstream-realignment-ledger.md`

## Future Implementation Closure Gates

- [ ] `studio.operations.current` resolves D4 `StudioOperationRuntime.current`.
- [ ] operation current DTOs are TypeBox-backed and D3/D4-aligned.
- [ ] fresh daemon empty truth is tested.
- [ ] active operation and terminal-only recent retained operations are tested.
- [ ] TTL/status matrix is tested: active, retained terminal, expired-known tombstone, physically pruned or never-known id, and daemon identity mismatch.
- [ ] browser operation recovery localStorage is deleted.
- [ ] app boot adoption does not replay request ids.
- [ ] unrelated localStorage owners remain green: authoring, preset, theme, and non-operation UI state.
- [ ] remaining active status polling is D8/D9 deletion-targeted.
- [ ] package/app gates and negative searches are recorded.
