# Design — mapgen-studio-rigor

## Context

A pure type-precision + cleanup pass over the oRPC failure-translation seam left
behind by the redesign stack. No parity surface moves; the guiding rule is MOVE /
centralize, never rewrite. Each decision below preserves the produced wire/envelope
shapes exactly and only sharpens the types around them.

## Decisions

### D1 — Where the shared `readErrorData<T>()` lives, and its shape

`src/lib/orpc.ts` is the client seam (it owns `orpcClient` + the `RPCLink`), so the
accessor for `ORPCError.data` belongs there next to the client that throws those
errors. Signature:

```ts
function readErrorData<T extends Record<string, unknown>>(
  err: ORPCError<string, unknown>,
): Partial<T> | undefined
```

- **`Partial<T>`, not `T`.** The contract declares no `errorMap`, so the wire shape
  of `data` is not statically guaranteed; each field is treated as possibly-absent
  and the caller keeps its existing runtime guard (`typeof data?.observedAt ===
  "string"`, `data?.details !== undefined`). This is exactly what the old inline
  `as { observedAt?: string } | undefined` casts expressed — centralized, not
  loosened.
- **`| undefined`** when `data` is not a non-null object, so callers `?.`-chain into
  it the same way they did against `(err.data ?? undefined)`.
- The accessor does NOT decide `instanceof ORPCError` — callers already gate on that
  (their non-`ORPCError` branch produces the bare-`message` envelope). It only
  removes the duplicated `data` cast.

Result: the two callers' failure envelopes are byte-identical; only the cast moved.

### D2 — Which `??` fallbacks are dead

`civ7.setupConfig` and `civ7.savedConfigs` success outputs (contract/civ7.ts)
declare `observedAt: isoTimestamp` and `directory: z.string()` as REQUIRED. On the
SUCCESS branch the body therefore always carries them, so:

| Site | Fallback | Verdict |
| --- | --- | --- |
| `fetchCiv7SetupConfig` success `observedAt` | `?? new Date().toISOString()` | dead — required on output |
| `fetchCiv7SavedSetupConfigs` success `observedAt` | `?? new Date().toISOString()` | dead — required on output |
| `fetchCiv7SavedSetupConfigs` success `directory` | `?? ""` | dead — required on output |
| ERROR-path `observedAt` (in `orpcFailure`) | guarded, not defaulted | KEPT — error body may omit it |

The error path is untouched: there `observedAt` legitimately may be absent (the
router attaches it on 503/500 but the type does not guarantee it), so it still flows
through `readErrorData` + the `typeof … === "string"` guard.

### D3 — Narrowing the router type

The effect-orpc `oe.router(...)` result is an `EnhancedRouter<…>` whose type
references effect-orpc internals (`effect-procedure.js`). Two options:

1. **Infer** the return type (`ReturnType<typeof createStudioRouter>` with no
   annotation). REJECTED: `tsup` emits declarations for `@civ7/studio-server`, and
   the inferred type trips **TS2742** ("cannot be named without a reference to
   effect-orpc/src/effect-procedure.js — not portable").
2. **Annotate** the contract-derived `Router<StudioContract, Record<never, never>>`
   from `@orpc/server`. CHOSEN: `Router` is part of `@orpc/server`'s public surface
   (nameable, portable), it pins the type to `StudioContract` (the goal), and the
   initial context is `Record<never, never>` because the injected `ManagedRuntime`
   fully provides `Civ7TunerClient | StudioConfig`. `RPCHandler` accepts it
   (`AnyRouter` is its lower bound), so `handler.ts` is unaffected.

`StudioRouter = ReturnType<typeof createStudioRouter>` then resolves to that
annotated `Router<StudioContract, …>` — contract-pinned, portable, no churn.

### D4 — Comments: why, not what

New "why" comments are added only where the rationale is non-obvious: `readErrorData`
(why `data` is `unknown` + why centralize), the router annotation (why annotated not
inferred — TS2742), and the two pruned success returns (the contract guarantees the
field). The stores and `app/*` component tree already carry intentional headers from
the data-model / app-shell slices; re-commenting them would be churn, which this
no-behavior-change slice avoids.

## Risks

- **Parity (§7).** The non-uniform status codes, the error-`data` side fields, and
  the failure-envelope shapes are do-not-break. Mitigation: `readErrorData` is a
  pure cast-centralization (same guards, same outputs), the dropped fallbacks are on
  fields the contract guarantees on the success path, and the router narrowing is a
  type-only change. `bun run test` (138 tests incl. the status/envelope suites) +
  the runtime check are the guard.
- **Portability of the narrowed router type.** Mitigation: the `tsup` DTS build is
  in the verification gate — a non-portable type would fail it (TS2742).
