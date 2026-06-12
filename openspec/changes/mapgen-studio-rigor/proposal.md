## Why

The data-model slice (`mapgen-studio-data-model`) realised the oRPC-native read
surface and the persisted stores, but the oRPC failure-translation seam still has
type-precision rough edges that escaped each prior slice's scope:

1. **Scattered inline `err.data` casts.** Each `features/*/api.ts` failure helper
   re-implements the same `(err.data ?? undefined) as { … }` cast to recover one
   side field (`observedAt`, `details`) from a thrown `ORPCError`. The contract
   declares no `errorMap`, so on the client `ORPCError.data` is `unknown`; every
   caller open-codes the same narrowing. That is duplicated, untyped boilerplate.

2. **Dead `??` fallbacks on contract-required fields.** `features/civ7Setup/api.ts`
   guards the SUCCESS body with `body.observedAt ?? new Date().toISOString()` and
   `body.directory ?? ""`. But `civ7.setupConfig` / `civ7.savedConfigs` declare
   `observedAt` (and `directory`) as REQUIRED on their success output schema — the
   fallbacks can never fire and falsely imply the field may be absent.

3. **`AnyRouter` on the server router seam.** `createStudioRouter` is annotated
   `: AnyRouter` and `StudioRouter = AnyRouter`, discarding the `StudioContract`
   pinning the effect-orpc router actually carries.

This is a pure type-precision + cleanup pass: NO behavior change, NO parity surface
moves. Refactors translate/centralize; they never rewrite logic.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4.7 everything talks oRPC)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§6 ts rigor, §7 do-not-break registry — the non-uniform status codes and the
  error-`data` side fields are parity and must survive unchanged)
- `apps/mapgen-studio/src/lib/orpc.ts` (the client seam — new home for the accessor)
- `packages/studio-server/src/contract/civ7.ts` (the required-field declarations)
- `packages/studio-server/src/router/index.ts` (the `AnyRouter` annotation)

## What Changes

- **One shared `readErrorData<T>()` accessor.** Add `readErrorData` to
  `src/lib/orpc.ts`: it takes a thrown `ORPCError` and narrows its `data` to
  `Partial<T> | undefined` (an object or nothing), centralizing the one cast.
  `features/civ7Setup/api.ts` and `features/runInGame/api.ts` use it in place of
  their inline `(err.data ?? undefined) as { … }` casts. The per-field runtime
  guards (`typeof data?.observedAt === "string"`, `data?.details !== undefined`)
  are unchanged, so the produced failure envelopes are byte-identical.
- **Drop dead success-path fallbacks.** In `features/civ7Setup/api.ts` remove the
  `?? new Date().toISOString()` (observedAt) and `?? ""` (directory) fallbacks on
  the `fetchCiv7SetupConfig` / `fetchCiv7SavedSetupConfigs` SUCCESS returns; the
  contract output guarantees those fields. (The error-path `observedAt`, which
  legitimately may be absent, still flows through `readErrorData` + its guard.)
- **Narrow the router away from `AnyRouter`.** `createStudioRouter` returns the
  contract-derived `Router<StudioContract, Record<never, never>>` (its initial
  context is fully provided by the injected `ManagedRuntime`), and
  `StudioRouter = ReturnType<typeof createStudioRouter>`. This is the portable
  contract-pinned type; inferring the raw effect-orpc `EnhancedRouter<…>` is NOT
  used because it references effect-orpc internals and trips TS2742 in the emitted
  declarations. `RPCHandler` still accepts it (`AnyRouter` is its lower bound).
- **Intentional comments on the seam.** Add "why" doc comments on `readErrorData`
  (why `data` is `unknown` and the cast is centralized) and the router narrowing
  (why the type is annotated, not inferred). The stores and component tree already
  carry intentional headers from prior slices; no churn there.

## Requires

- `mapgen-studio-data-model` (the prior slice — the `readErrorData` callers and the
  contract output schemas this prunes against come from there; this stacks on its
  `design/data-model` tip)

## Affected Owners

- `apps/mapgen-studio/src/lib/orpc.ts` (`readErrorData` added)
- `apps/mapgen-studio/src/features/civ7Setup/api.ts` (use accessor; drop fallbacks)
- `apps/mapgen-studio/src/features/runInGame/api.ts` (use accessor)
- `packages/studio-server/src/router/index.ts` (router type narrowed)

## Forbidden Owners

- No change to the non-uniform status codes, the error-`data` side fields, or the
  failure-envelope shapes (`{ ok, error, statusCode, observedAt, details }`) — they
  are parity (§7) and must round-trip unchanged.
- No enabling of `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes` in this
  slice (too broad; deferred).
- No logic rewrite in any router procedure body or any `features/*/api.ts` caller.
- No `mods/**` changes.

## Stop Conditions

- The `Router<StudioContract, …>` annotation cannot type-check against the
  effect-orpc router or breaks the `RPCHandler` / `handler.ts` consumers — in that
  case leave `AnyRouter` and note it (the narrowing is "if feasible without churn").
- Centralizing the `err.data` cast changes any produced failure envelope.
- Dropping a `??` fallback would expose a field the contract does NOT guarantee.

## Consumer Impact

None observable. The studio behaves identically: same failure envelopes, same
non-uniform status codes, same error-`data` side fields, same success payloads. The
change is internal type precision — one typed `readErrorData` accessor instead of
scattered casts, no dead fallbacks on guaranteed fields, and a contract-pinned
`StudioRouter` type instead of `AnyRouter`.

## Verification Gates

- `bun run check` in `apps/mapgen-studio` (tsc clean) and `tsc --noEmit` for
  `packages/studio-server` (the router type changed).
- `bun run build` (vite + worker-bundle check; studio-server `tsup` DTS emit clean —
  proves the narrowed type is portable) + `bun run test` in `apps/mapgen-studio`
  (all green).
- Runtime: dev server; failure envelopes + success payloads unchanged over `/rpc`;
  no console errors; screenshot renders the studio.
- `bun run openspec -- validate mapgen-studio-rigor --strict`.
