# D2.5 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal created.
- [x] Design created.
- [x] Tasks created.
- [x] Spec delta created.
- [x] Prework ledger created.
- [x] Schema spine ledger drafted.
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
- [x] `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] schema inventory scan over `packages/studio-server/src/contract/**`
- [x] mixed-baseline residue searches recorded in `schema-spine-ledger.md`
- [x] implementation prework and peer-agent prework lanes recorded in `prework-ledger.md`
- [x] future implementation closure gates recorded in `testing-ledger.md`

## Future Implementation Closure Gates

These gates are not packet-acceptance gates. They are the required proof for the D2.5 implementation workstream.

- [ ] package gates: `bun run --cwd packages/studio-server test`, `check`, and `build`
- [ ] negative search for Zod imports / `z.infer`
- [ ] negative search for stale Zod contract commentary
- [ ] negative search for stale app/server Zod-derived commentary
- [ ] negative search for package comments making app-local operation status modules the DTO authority
- [ ] negative search and classification for direct `/api` operation paths
- [ ] negative search and classification for public raw operation input/tunnel fields
- [ ] negative search for oRPC response/event casts into app-local operation wire DTO types
- [ ] loose duplicate operation schema scan and canonical schema reuse proof
- [ ] expected-error `details?: unknown` bridge classification or narrowing proof
- [ ] same-stack D3 deletion/narrowing guard if permissive error details bridge remains
- [ ] open public mutation input closure or recovered-schema raw-control rejection proof
- [ ] no `effect-orpc` imports outside router/runtime implementation ownership
