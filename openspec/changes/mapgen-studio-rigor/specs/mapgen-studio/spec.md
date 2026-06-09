## ADDED Requirements

### Requirement: oRPC Error-Data Is Read Through One Shared Typed Accessor

Mapgen Studio SHALL recover the side fields a thrown `ORPCError` carried in its
`data` body through a single shared typed accessor (`readErrorData<T>()` in
`src/lib/orpc.ts`), not scattered inline `(err.data ?? undefined) as { … }` casts.
The accessor SHALL narrow `ORPCError.data` (typed `unknown`, because the contract
declares no `errorMap`) to `Partial<T> | undefined`, and each caller SHALL keep its
existing per-field runtime guard so the produced failure envelopes are unchanged.

#### Scenario: Setup-config and saved-configs failures recover observedAt via the accessor

- **WHEN** `fetchCiv7SetupConfig` or `fetchCiv7SavedSetupConfigs` catches a thrown
  `ORPCError` (the 503 / 500 failure)
- **THEN** the `observedAt` side field is recovered via
  `readErrorData<{ observedAt: string }>(err)`, not an inline cast
- **AND** the `typeof data?.observedAt === "string"` guard still gates whether
  `observedAt` is included, so the `{ ok:false, error, statusCode, observedAt? }`
  envelope is byte-identical to before

#### Scenario: Run-in-game failure recovers details via the accessor

- **WHEN** `runCurrentConfigInGame` or `fetchRunInGameStatus` catches a thrown
  `ORPCError`
- **THEN** the `details` (`RunInGameFailureDetails`) side field is recovered via
  `readErrorData<{ details: RunInGameFailureDetails }>(err)`, not an inline cast
- **AND** the `data?.details !== undefined` guard and the `statusCode` (the pinned
  legacy HTTP code, incl. the 404 used for restart detection) are unchanged

#### Scenario: The accessor returns undefined for a non-object data body

- **WHEN** a thrown `ORPCError` has a `data` that is `null` or not an object
- **THEN** `readErrorData` returns `undefined`, so the caller's `?.`-chained field
  read produces no side field — matching the previous `(err.data ?? undefined)`
  behavior

### Requirement: Contract-Required Response Fields Carry No Dead Fallbacks

Mapgen Studio SHALL NOT apply `??` fallbacks to response fields the studio contract
declares as REQUIRED on the SUCCESS output. The `civ7.setupConfig` and
`civ7.savedConfigs` success bodies guarantee `observedAt` (and `directory`), so the
client SHALL read them directly. Error-path fields that the contract does NOT
guarantee SHALL keep their runtime guard.

#### Scenario: Setup-config success reads observedAt directly

- **WHEN** `fetchCiv7SetupConfig` returns a success result
- **THEN** `observedAt` is read straight from the response body with no
  `?? new Date().toISOString()` fallback, because the `civ7.setupConfig` output
  declares `observedAt: isoTimestamp` (required)

#### Scenario: Saved-configs success reads observedAt and directory directly

- **WHEN** `fetchCiv7SavedSetupConfigs` returns a success result
- **THEN** `observedAt` and `directory` are read straight from the response body
  with no `?? new Date().toISOString()` / `?? ""` fallbacks, because the
  `civ7.savedConfigs` output declares both as required

#### Scenario: Error-path observedAt keeps its guard

- **WHEN** the same procedures fail and the error body may omit `observedAt`
- **THEN** that field is still recovered through `readErrorData` and only included
  when the `typeof … === "string"` guard passes (it is NOT defaulted)

### Requirement: Studio Router Type Is Contract-Derived, Not AnyRouter

The `@civ7/studio-server` router SHALL expose a contract-derived type rather than the
lossy `AnyRouter`. `createStudioRouter` SHALL return
`Router<StudioContract, Record<never, never>>` (its initial context is fully provided
by the injected `ManagedRuntime`), and `StudioRouter` SHALL be
`ReturnType<typeof createStudioRouter>`. The type SHALL be nameable in the emitted
declarations (no TS2742), and `RPCHandler` SHALL still accept it.

#### Scenario: createStudioRouter is typed against the contract

- **WHEN** `createStudioRouter(runtime)` is type-checked
- **THEN** its return type is `Router<StudioContract, Record<never, never>>` (pinned
  to the studio contract), not `AnyRouter`
- **AND** `StudioRouter` resolves to that contract-derived type for the
  `StudioRpcHandle.router` consumer

#### Scenario: The narrowed type is portable in the emitted declarations

- **WHEN** `@civ7/studio-server` is built with `tsup` (DTS emit)
- **THEN** the build succeeds with no TS2742 portability error — the annotated
  `Router<StudioContract, …>` is nameable without referencing effect-orpc internals
  (which inferring the raw `EnhancedRouter<…>` would require)

#### Scenario: RPCHandler still accepts the narrowed router

- **WHEN** `new RPCHandler(router, …)` is constructed with the narrowed router
- **THEN** it type-checks (`AnyRouter` is the lower bound of `RPCHandler`), so the
  `/rpc` mount is unchanged
