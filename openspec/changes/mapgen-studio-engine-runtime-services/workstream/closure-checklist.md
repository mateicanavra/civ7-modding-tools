# D4 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal drafted.
- [x] Design drafted.
- [x] Tasks drafted.
- [x] Spec delta drafted.
- [x] Phase record drafted.
- [x] Runtime corpus ledger drafted.
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
- [x] `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] runtime corpus recorded in `runtime-corpus-ledger.md`
- [x] implementation prework and peer-agent prework lanes recorded in `prework-ledger.md`
- [x] future implementation closure gates recorded in `testing-ledger.md`

## Future Implementation Closure Gates

- [ ] `StudioOperationRuntime` owns identity, registries, TTL, current projection, event publication hooks, mutation gate, and worker supervision.
- [ ] cross-operation gate covers Run in Game, Save/Deploy, and Autoplay.
- [ ] duplicate Run in Game request fingerprint idempotency is preserved and owned by `StudioOperationRuntime`.
- [ ] Run in Game and Save/Deploy use closed internal ADTs with exhaustive public projection.
- [ ] Autoplay is a typed immediate runtime command through the shared gate.
- [ ] accepted-then-background semantics remain green.
- [ ] runtime disposal projects deterministic `runtime-disposed` state.
- [ ] internal ADTs are absent from every public package surface: root exports, declared subpaths, generated `.d.ts`, package `exports`, `@civ7/studio-server/runtime`, and source-runtime imports.
- [ ] projected DTOs validate through D2.5 TypeBox schemas.
- [ ] D3 typed failure vocabulary remains the only expected failure taxonomy.
- [ ] no app-local lifecycle ownership remains in `createStudioEngines` or operation stores.
- [ ] app leaf adapter ports are bounded and own no phase transitions, failure classification, request fingerprints, operation conflict checks, registry callbacks, or background workers.
- [ ] no unscoped background worker ownership remains in `StudioOperationRuntime`.
