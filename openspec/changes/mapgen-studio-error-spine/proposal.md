# MapGen Studio Error Spine

## Why

D2.5 makes TypeBox the public contract spine. D3 consumes that spine for expected Studio runtime failures: Run in Game, Save/Deploy, and Autoplay must not expose known engine outcomes through `statusCode`-driven `Error` objects, raw `ORPCError` construction, or permissive `details?: unknown` payloads.

The current baseline already contains an old S1.2 error-spine implementation, but that implementation is not the final runtime-refactor target. It still treats `StudioEngineError` as an Error bridge with `statusCode` and `details?: unknown`, maps by status-derived failure kinds, lets declared error data stay permissive, and confines the typed model to the app host. D3 repairs the packet to the accepted frame: expected failures become typed runtime values, wire data is TypeBox-owned and sanitized, and router mapping is exhaustive at the package boundary.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-engine-effect-corpus/`
- `openspec/changes/mapgen-studio-contract-typebox-spine/`
- Current evidence:
  - `apps/mapgen-studio/src/server/studio/engineErrors.ts`
  - `apps/mapgen-studio/src/server/studio/context.ts`
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `packages/studio-server/src/contract/errors.ts`
  - `packages/studio-server/src/context.ts`
  - `apps/mapgen-studio/test/server/engineErrorSpine.test.ts`
  - `packages/studio-server/test/handler.test.ts`

## What Changes

- Replace the status-code-shaped `StudioEngineError` bridge with Studio runtime failure ADTs whose tags encode the domain reason: blocked operation, invalid request, missing operation, expired operation, daemon identity mismatch, runtime disposed, unsupported operation type, dependency unavailable, and materialization/deploy/proof failure.
- Move public failure-data schemas into `@civ7/studio-server` TypeBox contract ownership; declared oRPC errors must not use `details?: Type.Unknown()` as the expected-failure protocol.
- Define a package-owned mapper from failure ADT plus namespace to declared oRPC code/status/data. The mapper is total over expected tags and has no known-category fallback to generic 500.
- Keep unknown exception containment only at the router edge. Unknown exceptions map to declared `*_FAILED` defect data after sanitization; they are not accepted as expected runtime outcomes.
- Preserve status-miss daemon identity echo for Run in Game and Save/Deploy.
- Normalize recovery actions as typed data, not prose-only details.
- Add a direct D2.5 closeout: any retained permissive expected-error `details?: unknown` bridge must be deleted or narrowed in D3, with a guard proving it cannot become a durable unknown-data protocol.
- Delete production status-code bridge errors in D3 implementation closure. `StudioEngineError` and `RunInGameHttpError` cannot survive as construction, catch, import, or mapping surfaces after D3 closes.
- Realign stale old-S1.2 docs/records that say the slice is already closed, merged, or allowed to keep legacy Zod/permissive details.

## Non-Goals

- No D4 runtime service implementation.
- No D5 pipeline service implementation.
- No D6 current-operation projection migration.
- No UI copy rewrite except type consumption required by the new failure data.
- No fallback, compatibility, status-code bridge, or dual public failure protocol.

## Future Implementation Write Set

- `packages/studio-server/src/contract/errors.ts`
- `packages/studio-server/src/contract/errorData.ts` or equivalent package-owned error-data module
- `packages/studio-server/src/errors.ts`
- `packages/studio-server/src/context.ts`
- `packages/studio-server/src/router/**`
- `apps/mapgen-studio/src/server/studio/engineErrors.ts` or replacement failure module
- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/src/server/studio/engines.ts`
- Run in Game / Save&Deploy / Autoplay request validation and operation-state helpers
- Package and app tests covering mapper, contract data, handler/client behavior, and scenario failure paths

Protected paths:

- Generated mod/app artifacts.
- D4-D12 OpenSpec packets except for explicit downstream realignment notes.
- Runtime success-path engines beyond changes required to emit typed expected failures.

## Verification Gates

### Packet Acceptance Gates

- `bun install --frozen-lockfile`
- Current packet-authoring base: `bun run build` and `bun run check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- `bun run openspec -- validate mapgen-studio-error-spine --strict`
- `bun run openspec:validate`
- `git diff --check`
- Fresh error-corpus, hardening/prework, black-ice, TypeScript/schema, Effect/lifecycle, and testing reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package gates for `@civ7/studio-server`.
- App gates for `mapgen-studio`.
- Package gates for `@civ7/control-orpc` and `@civ7/direct-control`, or an explicit untouched-package disposition backed by negative scans.
- Focused mapper tests enumerating every expected failure tag for Autoplay, Run in Game, and Save/Deploy.
- TypeBox `Value.Check` / `Value.Parse` tests for every declared Studio error data schema.
- Handler/client tests proving defined oRPC errors for blocked, invalid, unavailable, not-found identity echo, expected failed, and unknown-defect containment.
- Negative searches:
  - no `RunInGameHttpError`;
  - no expected-failure `details?: unknown` or `Type.Unknown()` bridge in declared error data;
  - no status-code-driven failure-kind truth;
  - no raw `ORPCError` construction outside router/runtime mapping ownership;
  - no `effect-orpc` imports outside router/runtime ownership, with recipe-DAG contract/error-builder hits classified as D2.5 residue until removed;
  - no production `StudioEngineError` or `RunInGameHttpError` construction, catch, import, or bridge mapping remains;
  - no stale comments claiming old S1.2 closure, legacy Zod allowance, or permissive data as the durable target.
- Scenario tests for Run in Game, Save/Deploy, and Autoplay failure paths.
- Live proof disposition: D3 does not claim fresh live failure-path proof at packet acceptance. Future error-only implementation closes with package/app handler, client, and scenario proof plus an explicit live-proof boundary. Fresh live proof is required only if implementation changes successful Play/Save&Deploy execution, daemon watch mounts, or deploy graph isolation.
