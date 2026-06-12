# Tasks — mapgen-studio-rigor

## 1. Shared `readErrorData<T>()` accessor
- [x] 1.1 Add `readErrorData<T extends Record<string, unknown>>(err: ORPCError<…>):
      Partial<T> | undefined` to `apps/mapgen-studio/src/lib/orpc.ts`; it narrows
      `err.data` to an object (or `undefined`), centralizing the one `unknown` cast.
- [x] 1.2 `features/civ7Setup/api.ts` — replace the inline
      `(err.data ?? undefined) as { observedAt?: string }` with
      `readErrorData<{ observedAt: string }>(err)`; the `typeof data?.observedAt ===
      "string"` guard is unchanged.
- [x] 1.3 `features/runInGame/api.ts` — replace the inline
      `(err.data ?? undefined) as { details?: RunInGameFailureDetails }` with
      `readErrorData<{ details: RunInGameFailureDetails }>(err)`; the
      `data?.details !== undefined` guard is unchanged.
- [x] 1.4 Confirm no other `features/*/api.ts` reads `err.data`
      (`mapConfigSave/api.ts` only reads `err.message` / `err.status`).

## 2. Drop dead success-path `??` fallbacks
- [x] 2.1 `features/civ7Setup/api.ts` `fetchCiv7SetupConfig` — drop
      `?? new Date().toISOString()` on `observedAt` (contract output declares it
      `isoTimestamp`, REQUIRED).
- [x] 2.2 `features/civ7Setup/api.ts` `fetchCiv7SavedSetupConfigs` — drop
      `?? new Date().toISOString()` (observedAt) and `?? ""` (directory); both are
      REQUIRED on the `civ7.savedConfigs` success output.
- [x] 2.3 Leave the ERROR-path `observedAt` (which may legitimately be absent)
      flowing through `readErrorData` + its runtime guard.

## 3. Narrow the router away from `AnyRouter`
- [x] 3.1 `packages/studio-server/src/router/index.ts` — annotate
      `createStudioRouter(runtime): Router<StudioContract, Record<never, never>>`
      (initial context fully provided by the injected `ManagedRuntime`); import
      `type { Router }` from `@orpc/server` and `type { StudioContract }` from the
      contract; drop the `AnyRouter` import.
- [x] 3.2 Set `StudioRouter = ReturnType<typeof createStudioRouter>`.
- [x] 3.3 Confirm the `RPCHandler(router, …)` call and `handler.ts`
      `StudioRpcHandle.router` consumers still type-check (`AnyRouter` is the lower
      bound of `RPCHandler`).
- [x] 3.4 Confirm the `tsup` DTS emit is clean (no TS2742 portability error) —
      proves the annotated type is nameable without effect-orpc internals.

## 4. Intentional comments
- [x] 4.1 Doc-comment `readErrorData` (why `data` is `unknown`; why the cast is
      centralized; why `Partial<T>`).
- [x] 4.2 Comment the router narrowing (why annotated, not inferred — TS2742) and
      the two `civ7Setup` success returns (the contract guarantees the field).
- [x] 4.3 No churn on the stores / component tree — they already carry intentional
      headers from the prior slices.

## 5. Dead code
- [x] 5.1 Confirm no exports became unused after centralizing the cast
      (`orpcFailure`, `runInGameFailure`, `saveDeployFailure`, `toConfigId`,
      `MAP_CONFIG_SAVE_LAST_REQUEST_KEY` all still referenced).

## 6. Verify
- [x] 6.1 `bun run check` (tsc clean) in `apps/mapgen-studio` + `tsc --noEmit` for
      `packages/studio-server`.
- [x] 6.2 `bun run build` (vite + worker-bundle; studio-server `tsup` DTS emit) +
      `bun run test` (all green) in `apps/mapgen-studio`.
- [x] 6.3 Dev-server runtime: failure envelopes + success payloads unchanged over
      `/rpc`; no console errors; screenshot.
- [x] 6.4 `bun run openspec -- validate mapgen-studio-rigor --strict`.
