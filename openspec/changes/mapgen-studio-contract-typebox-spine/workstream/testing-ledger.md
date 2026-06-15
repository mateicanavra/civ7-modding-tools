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

## Current Evidence To Close

- `packages/studio-server/src/typeboxStandardSchema.ts` lacks the TypeBox-origin metadata pattern present in `packages/civ7-control-orpc/src/typebox-standard-schema.ts`.
- `packages/studio-server/src/index.ts` still says legacy Studio success schemas remain Zod.
- `apps/mapgen-studio/src/features/runInGame/api.ts`, `apps/mapgen-studio/src/features/mapConfigSave/api.ts`, and `apps/mapgen-studio/src/app/operationAdoption.ts` cast oRPC responses/events into app-local operation status types.
- `packages/studio-server/src/contract/studio.ts` currently duplicates looser operation schemas for `studio.operations.current` and operation events.
- `packages/studio-server/src/contract/errors.ts` currently uses permissive `details?: Type.Unknown()` for engine error data; D2.5 must classify it as D3-bound bridge residue or narrow it.
- `packages/studio-server/src/contract/runInGame.ts` currently keeps `runInGame.start` top-level input open for downstream raw-control scanning; D2.5 must close it or prove the guard with adversarial samples.
- Existing `packages/studio-server/test/handler.test.ts` proves selected behavior/errors but does not enumerate every contract schema or declared error map.

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
