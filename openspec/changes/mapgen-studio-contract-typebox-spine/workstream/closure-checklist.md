# D2.5 Packet Closure Checklist

Status: implementation evidence current; D2.5 implementation closure gates complete except live Civ7 proof, which is not claimed by this packet
Date: 2026-06-15

## Packet Shape

These rows describe packet acceptance review, not the current implementation-diff review gate.

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

- [x] package gates: `bun run --cwd packages/studio-server test`, `check`, and `build`
- [x] focused package gate: `bun run --cwd packages/studio-server check`
- [x] focused package gate: `bun run --cwd packages/studio-server test -- test/contractTypeboxSpine.test.ts`
- [x] focused app gate: `bun run --cwd apps/mapgen-studio check`
- [x] focused app gate: `bun run --cwd apps/mapgen-studio test -- test/runInGame/requestValidation.test.ts test/studioEvents/operationAdoption.test.ts`
- [x] negative search for Zod imports / `z.infer`
- [x] negative search for stale Zod contract commentary
- [x] negative search for stale app/server Zod-derived commentary
- [x] negative search for package comments making app-local operation status modules the DTO authority
- [x] negative search and classification for direct `/api` operation paths
- [x] negative search and classification for public raw operation input/tunnel fields
- [x] negative search for oRPC response/event casts into app-local operation wire DTO types
- [x] loose duplicate operation schema scan and canonical schema reuse proof
- [x] expected-error `details?: unknown` bridge classification or narrowing proof
- [x] same-stack D3 deletion/narrowing guard if permissive error details bridge remains
- [x] open public mutation input closure or recovered-schema raw-control rejection proof
- [x] no `effect-orpc` imports outside router/runtime implementation ownership
- [x] fresh implementation-diff review after the final DTO/proof-type split

## Current Implementation Evidence

- Adapter origin recovery is implemented in `packages/studio-server/src/typeboxStandardSchema.ts` and covered by `packages/studio-server/test/contractTypeboxSpine.test.ts`.
- `studio.operations.current` and `studio.events.watch` now reuse `operationStatusTypeSchema` and `saveDeployStatusTypeSchema`; the package test asserts TypeBox object identity for current-operation active/recent schemas.
- `packages/studio-server/src/recipeDag/{contract,errors}.ts` no longer import `effect-orpc`; the only active package import remains `packages/studio-server/src/router/index.ts`.
- Save&Deploy feature status helpers now import package DTO types but do not re-export public DTO authority; app/server/test Save&Deploy public DTO type use sites import from `@civ7/studio-server`, and Save&Deploy response/adoption casts were removed.
- Run-in-Game feature status helpers now import package DTO types but do not re-export public DTO authority; app/test Run-in-Game public DTO type use sites import from `@civ7/studio-server`; package entrypoints export public Run-in-Game proof subtypes; detailed server-only proof extensions use `RunInGameDetailed*` names in `apps/mapgen-studio/src/server/runInGame/proofTypes.ts`; Run-in-Game response/adoption/context/event casts were removed.
- `packages/studio-server/test/contractTypeboxSpine.test.ts` rejects public `RunInGame*` and `MapConfigSaveDeploy*` DTO type imports through the feature status helper modules, including app test use sites and feature-helper type re-export forms.
- `runInGame.start` remains intentionally open at the public schema layer, but `apps/mapgen-studio/test/runInGame/requestValidation.test.ts` recovers the TypeBox input schema and proves host-side rejection for top-level and nested `command`, `script`, `javascript`, `rawCommand`, `rawJs`, `session`, and `stateName`.
- Direct `/api` operation path and raw-field scans are classified in `schema-spine-ledger.md`.
- Expected-error `details?: unknown` remains a D3-bound bridge only; `mapgen-studio-error-spine` already carries the same-stack deletion/narrowing target and closure blockers.

## Current Non-Closure Evidence

- `nx run @civ7/studio-server:check --outputStyle=static` is non-green through its dependency graph at `@internal/habitat-harness:grit:check`. The failures are D1/lower-slice Swooper recipe contract import-boundary findings on `mods/mod-swooper-maps/src/recipes/standard/**` imports from `@mapgen/domain/<domain>/contract`, not D2.5 Studio TypeBox contract-spine files. This is stack-owned lower-slice debt and must be repaired before final runtime stack closure.
- Live Civ7 Play/Save&Deploy product proof is not claimed by D2.5.
