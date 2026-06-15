# D2.5 Testing Ledger

Status: accepted
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| TypeBox contract samples | `Value.Check` / `Value.Parse` samples for every Studio public contract family | valid minimal and representative rich payloads pass; invalid payloads fail at meaningful paths |
| Adapter origin | tests against `toStandardSchema(...)` and recovered schemas from contract procedures | wrapper exposes recoverable TypeBox `TSchema` identity or equivalent stable origin metadata; input/output/error schema recovery fails loudly for non-TypeBox wrappers |
| Adapter behavior | parse/issue tests | closed-object stripping, open-object preservation, unknown record behavior, optional fields, no schema-level defaults unless explicit, and nested issue paths match accepted parity |
| Declared errors | client/handler or direct contract tests for all error maps | every declared error code/status/message pin is enumerated and every `data` schema validates permissive sanitized data through recovered TypeBox schemas |
| Operation DTO derivation | package/app type-check or type tests | app Run in Game and Save&Deploy request/status types are derived from package contract/schema exports |
| Canonical operation schemas | schema identity/reuse tests for endpoint status, operations-current, and operation events | operation-current and event payloads compose canonical endpoint DTO schemas instead of broader duplicate copies |
| Open mutation input guard | recovered-schema samples plus parser/guard tests | any open public mutation input rejects executable raw-control fields before engine execution, including nested variants |
| Phase/projection parity | Run in Game and Save&Deploy phase/status sample tests | phase unions, running/terminal classification, recovery actions, and public projections stay exhaustive |
| Event/live schemas | event iterator and live-game state samples | `hello | operation | live-game` and live status payloads validate against TypeBox schemas |
| Residue negative searches | Zod/comment/raw-field/API-path searches | no active hits outside negative policy text or implementation evidence ledger; raw-field hits are classified as forbidden executable input/tunnel fields or allowed non-executable status/proof evidence |
| D3 bridge guard | same-stack D3 OpenSpec update or TypeBox narrowing tests | permissive `details?: unknown` does not survive as a durable protocol beyond the D3 error spine |

## Packet-Baseline Evidence Carried Into Implementation

- `packages/studio-server/src/typeboxStandardSchema.ts` lacks the TypeBox-origin metadata pattern present in `packages/civ7-control-orpc/src/typebox-standard-schema.ts`.
- `packages/studio-server/src/index.ts` still says legacy Studio success schemas remain Zod.
- `apps/mapgen-studio/src/features/runInGame/api.ts`, `apps/mapgen-studio/src/features/mapConfigSave/api.ts`, and `apps/mapgen-studio/src/app/operationAdoption.ts` cast oRPC responses/events into app-local operation status types.
- `packages/studio-server/src/contract/studio.ts` currently duplicates looser operation schemas for `studio.operations.current` and operation events.
- `packages/studio-server/src/contract/errors.ts` currently uses permissive `details?: Type.Unknown()` for engine error data; D2.5 must classify it as D3-bound bridge residue or narrow it.
- `packages/studio-server/src/contract/runInGame.ts` currently keeps `runInGame.start` top-level input open for downstream raw-control scanning; D2.5 must close it or prove the guard with adversarial samples.
- Existing `packages/studio-server/test/handler.test.ts` proves selected behavior/errors but does not enumerate every contract schema or declared error map.

## Implementation Evidence - 2026-06-15

Passed:

- `bun run --cwd packages/studio-server check`
- `bun run --cwd packages/studio-server test -- test/contractTypeboxSpine.test.ts`
- `bun run --cwd packages/studio-server build`
- `bun run --cwd packages/studio-server test`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio test -- test/runInGame/requestValidation.test.ts test/studioEvents/operationAdoption.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/runInGame/status.test.ts test/runInGame/proofIdentity.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/runInGame/status.test.ts test/runInGame/proofIdentity.test.ts test/runInGame/requestValidation.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/runInGame/status.test.ts test/runInGame/proofIdentity.test.ts test/runInGame/requestValidation.test.ts test/runInGame/clientState.test.ts test/runInGame/GameConsole.test.tsx test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts`
- `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict`
- `bun run openspec:validate`
- `git diff --check`
- `nx run @civ7/studio-server:test --outputStyle=static`
- `nx run @civ7/studio-server:build --outputStyle=static`
- `nx run mapgen-studio:check --outputStyle=static`
- `nx run mapgen-studio:test --outputStyle=static`
- `./node_modules/.bin/biome check apps/mapgen-studio/src/features/mapConfigSave/status.ts apps/mapgen-studio/src/features/runInGame/status.ts apps/mapgen-studio/src/server/runInGame/operationState.ts apps/mapgen-studio/src/server/studio/engines.ts apps/mapgen-studio/test/runInGame/proofIdentity.test.ts apps/mapgen-studio/test/runInGame/requestValidation.test.ts packages/studio-server/src/contract/index.ts packages/studio-server/src/index.ts packages/studio-server/test/contractTypeboxSpine.test.ts`
- `./node_modules/.bin/biome check apps/mapgen-studio/src/features/mapConfigSave/status.ts apps/mapgen-studio/src/features/mapConfigSave/api.ts apps/mapgen-studio/src/app/operationAdoption.ts apps/mapgen-studio/src/app/StudioShell.tsx apps/mapgen-studio/src/ui/components/RecipePanel.tsx apps/mapgen-studio/src/ui/components/GameConsole.tsx apps/mapgen-studio/src/server/mapConfigs/operationState.ts apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts apps/mapgen-studio/test/mapConfigSave/operationState.test.ts apps/mapgen-studio/src/features/runInGame/status.ts apps/mapgen-studio/src/features/runInGame/api.ts apps/mapgen-studio/src/features/runInGame/clientState.ts apps/mapgen-studio/src/app/hooks/useRunInGameTerminalToast.ts apps/mapgen-studio/test/runInGame/GameConsole.test.tsx apps/mapgen-studio/test/runInGame/clientState.test.ts apps/mapgen-studio/test/runInGame/status.test.ts packages/studio-server/test/contractTypeboxSpine.test.ts`

Non-green:

- `nx run @civ7/studio-server:check --outputStyle=static` failed in dependency task `@internal/habitat-harness:grit:check` on Swooper recipe contract domain-surface imports from `@mapgen/domain/<domain>/contract`. The failing files are under `mods/mod-swooper-maps/src/recipes/standard/**`; none are D2.5 Studio TypeBox contract-spine files. This is stack-owned lower-slice D1/Habitat boundary debt, not external baseline debt.

What those commands prove:

- The Studio adapter exposes recoverable TypeBox origin metadata for direct Standard Schema wrappers and oRPC procedure input/output schemas.
- The adapter retains current `Value.Parse` closed-object extra stripping and reports nested issue paths.
- `studio.operations.current` composes the canonical Run-in-Game and Save&Deploy operation schemas instead of duplicated looser siblings.
- Recipe-DAG contract/error modules no longer import `effect-orpc`; router/runtime remains the package owner for the active `effect-orpc` import.
- Save&Deploy app response/adoption paths type-check without casts into app-local public wire DTOs.
- Run-in-Game and Save&Deploy feature status modules now import package-owned public DTO types for helper signatures but do not re-export those DTO types; app/server/test use sites import public DTO names from `@civ7/studio-server`.
- Detailed Run-in-Game proof-only state is server-owned under `src/server/runInGame/proofTypes.ts`, server runtime files no longer import `features/runInGame/status`, and Run-in-Game response/adoption paths type-check without casts into app-local public wire DTOs.
- Server-only Run-in-Game rich proof extensions use `RunInGameDetailed*` names; public Run-in-Game exact proof and sub-DTO names remain exported by `@civ7/studio-server`.
- `studioOperationEventSchema` reuses the canonical Run-in-Game and Save&Deploy operation DTO schemas, and the focused package test asserts those schema identities.
- The intentionally open `runInGame.start` schema is paired with host parser tests that reject raw-control fields before engine execution, including `session` and `stateName`.
- Direct `/api` operation path hits are comments only; public raw-control field hits are classified as rejection policy, non-executable status/proof evidence, or implementation internals outside the public mutation contract.
- The retained expected-error `details?: unknown` bridge is classified as D3-bound residue. `mapgen-studio-error-spine` already declares the deletion/narrowing target and implementation closure blockers for expected-failure unknown details.

What remains unproven:

- Root/Habitat closure is not green because `@internal/habitat-harness:grit:check` fails on lower-slice Swooper recipe contract domain imports. The runtime stack cannot claim final clean root/Nx/Habitat closure until that lower-slice debt is repaired.
- The permissive expected-error `details?: unknown` bridge is not narrowed in D2.5; D3 owns the deletion/narrowing proof before D3 closure.
- Fresh implementation-diff review completed after the final DTO/proof-type split. Gauss, Nash, and Mencius found no blocking P1/P2 after their respective review passes; their P3 proof-hardening findings were repaired and rechecked with `bun run --cwd packages/studio-server test -- test/contractTypeboxSpine.test.ts`.

## Packet Acceptance Commands

```bash
bun install --frozen-lockfile
bun run build
git status --short --branch
gt status
gt log --no-interactive
bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict
bun run openspec:validate
git diff --check
```

`bun run build` is the packet-authoring baseline command on the historical pre-settlement stack. On the accepted migrated Nx/Habitat implementation base, replace it with the repo-local Nx/Habitat target(s) selected by classification before code edits. If those targets are unavailable on the selected implementation base, stop and reroute rather than treating OpenSpec validation as trusted implementation readiness.

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server build
```

The future D2.5 implementation packet may add Nx/Habitat equivalents on the accepted migrated baseline, but these package-local gates remain the minimum implementation closure proof.
