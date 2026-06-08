# 06 — TypeScript Rigor Audit

**App:** `apps/mapgen-studio`
**Lane:** TypeScript-rigor (effect-orpc → typed oRPC client → TanStack Query → React)
**Date:** 2026-06-08
**Method:** `dev:typescript` skill lens; grep inventory + `tsc --noEmit`. All evidence cited `file:line`.

---

## TL;DR

- **Typecheck: CLEAN.** `bun run --cwd apps/mapgen-studio check` (`tsc --noEmit`) exits **0**, **0 errors**. The floor is honest today — this is a green-field rigor raise, not a cleanup.
- **`any` total: 21** — `: any` ×6, `as any` ×14, `<any>` ×1. No `any[]`, no `Array<any>`. Genuinely low.
- **`as` casts (typed): 126** + `as unknown` ×19 + `as const` ×29. Non-null `!`: ~17 (almost all guarded array-index access).
- **~10–12 casts evaporate for free** once the typed oRPC client lands (every `res.json() as <ad-hoc>` in `App.tsx`). The bulk (RJSF/JSON-Schema, deck.gl typed arrays, deliberate `unknown` recipe boundary) need explicit work or are intentional.
- **Top 3 tsconfig flags to enable:** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.

---

## 1. tsconfig strictness

`apps/mapgen-studio/tsconfig.json` is **standalone** — it does NOT extend `tsconfig.base.json`. It is already above average: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `isolatedModules`, `moduleDetection: force`.

### Present
| Flag | Value |
|---|---|
| `strict` (→ `noImplicitAny`, `strictNullChecks`, etc.) | ✅ true |
| `noUnusedLocals` / `noUnusedParameters` | ✅ true |
| `noFallthroughCasesInSwitch` | ✅ true |
| `noUncheckedSideEffectImports` | ✅ true |
| `isolatedModules` | ✅ true |

### Missing — gaps for top-1% rigor
| Flag | Status | Why it matters here |
|---|---|---|
| **`noUncheckedIndexedAccess`** | ❌ missing | The ~17 `!` assertions (`ExplorePanel.tsx:297`, `era.ts:41/44`, `presentation.ts:321/354/418-422`, `worker-viz-dumper.ts:14-15`) are all guarded array-index access that *look* safe only because indexing returns `T` not `T | undefined`. With this on, those become honest `T | undefined` and the compiler forces the guard. Highest-leverage flag for this codebase. |
| **`exactOptionalPropertyTypes`** | ❌ missing | The fetch-body types use `Partial<X> & { error?: string }` and the server validators build `...(cond ? { x } : {})` (`requestValidation.ts:43-47`). Without this, `{ x?: string }` silently accepts `{ x: undefined }`, blurring "absent" vs "present-but-undefined" — exactly the distinction Effect Schema / oRPC contracts will encode. |
| **`verbatimModuleSyntax`** | ❌ missing | Already used by a sibling package (`packages/mapgen-viz/tsconfig.json:7`). Forces `import type` discipline — critical once the oRPC contract package is imported on both client and server; prevents accidental value imports of server-only types into the browser bundle. |
| `noImplicitReturns` | ❌ missing | Cheap addition; catches missing-return paths in the many branchy handlers in `App.tsx`. |
| `noPropertyAccessFromIndexSignature` | ❌ missing | Pairs with `noUncheckedIndexedAccess` for record-shaped config access. |

`noImplicitAny` is already on transitively via `strict`. `skipLibCheck: true` is acceptable (deck.gl / RJSF type perf), keep it.

### Recommended config
```jsonc
{
  "compilerOptions": {
    // ...existing...
    "strict": true,
    "noUncheckedIndexedAccess": true,      // P0 — surfaces guarded ! assertions
    "exactOptionalPropertyTypes": true,    // P0 — aligns with Effect Schema optionals
    "verbatimModuleSyntax": true,          // P1 — type-only import discipline for contract pkg
    "noImplicitReturns": true,             // P2
    "noPropertyAccessFromIndexSignature": true // P2
  }
}
```
Enable P0 flags one at a time and burn down the resulting errors; they will NOT be zero today (that is the point — they reveal currently-hidden unchecked access).

---

## 2. `any` inventory (21 total)

| Cluster | Locations | Count | Verdict |
|---|---|---|---|
| **Recipe runtime contract** | `browser-runner/recipeRuntime.ts:19-20` (`compile(env: any, config?: any): any`, `runAsync(...)`) | 3 | **Needs work.** This is the recipe plugin seam. Should become a generic `RecipeModule<Env, Config, Plan>` interface. oRPC won't touch it (worker-side). |
| **Worker compile plan** | `pipeline.worker.ts:131` (`const plan: any`), `:134` (`node: any`) | 2 | **Needs work.** Flows from the untyped `recipeRuntime` contract above; fix together. |
| **deck.gl link accessors** | `DeckCanvas.tsx:96-97` (`getSourcePosition: (d: any)`), `:40` (`useRef<Deck<any>>`), `:109` (`deckRef.current as any`) | 4 | **Needs work (explicit).** deck.gl layer-data generics. Type with the viz layer model; oRPC/Effect irrelevant. |
| **RJSF widget/template props** | `SchemaForm.tsx:49` (`configWidgets as any`), `rjsfTemplates.tsx:224` (`(item as any)?.children`) | 2 | **Needs work or accept.** RJSF v6 registry typing is notoriously loose; these are library-boundary casts. Low value to chase. |
| **DOMException / AbortError shims** | `deckgl/render.ts:47/50`, `useVizState.ts:24` | 3 | **Accept.** Browser global feature-detection (`globalThis as any`, `(err as any).name`). Idiomatic; could be `unknown` + guard but low risk. |
| **Typed-array length/index reads** | `deckgl/render.ts:342/357/433/518/600/665/666/671` (`(values as any)[i]`) | 8 (of the 14 `as any`) | **Needs work (explicit).** Casting `ArrayLike<number>` access. Should use the `as unknown as ArrayLike<number>` pattern already present at `presentation.ts:294` / `render.ts:262`, or a `readScalar()` helper. Pure viz, not a wire boundary. |

**None of the `any`s are fetch/response casts** — those use `as <type>` (Section 3), not `as any`. So the typed oRPC client removes **zero** `any`s directly, but removes the `as` casts that the `any`s would otherwise have become.

---

## 3. `as` casts & non-null assertions

**Typed `as` casts: 126** (by file): `App.tsx` 28 · `schemaPresentation.ts` 20 · `SchemaConfigForm.tsx` 12 · `recipes/catalog.ts` 11 · `proofIdentity.ts` 9 · `config.ts` 6 · `clientState.ts` 5 · `persistence.ts`/`pathUtils.ts`/`recipeRuntime.ts` 4 each.

### Dangerous (casting untrusted data)
| Location | Cast | Risk |
|---|---|---|
| `App.tsx:173,214,288` | `res.json() as (Partial<MapConfigSaveDeployStatus> & { error? })` | **HIGH.** Fetch JSON cast to a domain type with no validation. Type-on-faith across the network boundary. ×8 sites total (173/214/268/288/304/349/381/414). |
| `App.tsx:989,1043` | `res.json() as unknown` | Lower — at least honest `unknown`, but then consumed without a parse step shown. |
| `App.tsx:1290` | `runPipelineConfig as unknown` | Erases config type before sending to worker. |
| `worker-trace-sink.ts:94` | `data as unknown as { type: ...; layer: VizLayerEmissionV1 }` | **HIGH.** Double-cast through `unknown` — worker message payload trusted blindly. |
| `pipeline.worker.ts` / `recipeRuntime.ts` | plan/node `any` casts | Recipe seam (Section 2). |

### Safe / idiomatic (leave)
- `as const` ×29 — fine.
- `as unknown` in **persistence parsers** (`persistence.ts:94`, `storage.ts:84`, `importExport.ts:52`, `clientState.ts:189`, `proofIdentity.ts:1162`): `JSON.parse(...) as unknown` **immediately followed by `isRecord`/`isValidStore` guards**. This is the *correct* parse-at-boundary pattern — do not "fix."
- Typed-array views `as unknown as ArrayLike<number>` (`presentation.ts:294`, `render.ts:262`) — legitimate structural narrowing of numeric buffers.

### Non-null `!` (~17)
Almost entirely guarded array-index access: `era.ts:41/44`, `presentation.ts:321/354/418-422`, `setupConfig.ts:243/265`, `mapSizes.ts:16`, `worker-viz-dumper.ts:14-15`, `App.tsx:1234/1239` (`stages[0]!` after a `.some()` check). These are **artifacts of `noUncheckedIndexedAccess` being off** — they assert what the flag would force the compiler to verify. Enabling the flag is the real fix; the `!`s then either stay (justified) or get replaced by explicit guards.

---

## 4. Untyped boundaries

| Boundary | Locations | Current state | Post-redesign |
|---|---|---|---|
| **`fetch` responses** | `App.tsx:168,213,251,287,303,348,380,409,986,1042` (10 endpoints) | Every one is `res.json() ... as <ad-hoc-or-unknown>`. No shared response schema. Server side is **raw Vite connect middleware** in `vite.config.ts:379+` (`server.middlewares.use("/api/...")`, manual `req`/`res`, hand-rolled JSON) with hand-written `unknown`-based validators (`server/*/requestValidation.ts`). | **This is the headline win.** Replace middleware with effect-orpc handlers + typed oRPC client. All 10 `res.json() as X` casts vanish; request validators (`parseMapConfigSaveRequest` etc.) collapse into the contract schema. |
| **`JSON.parse`** | 10 sites. **Disciplined:** `schemaPresentation.ts:42/80`, `storage.ts:84`, `importExport.ts:52`, `clientState.ts:189`, `persistence.ts:94`, `proofIdentity.ts:1162` all → `as unknown` + guard. **Weaker:** `clientState.ts:162` → `as Partial<RunInGameClientSnapshot>` (cast, not parsed). `config.ts:25` / `operationState.ts:225` are deep-clone idioms (safe). | clientState.ts:162 is the one to harden. |
| **`localStorage`** | `useTheme.ts:11/35`, `App.tsx` (~12 sites), `storage.ts:66`, `persistence.ts:28`. | **Well-handled.** Reads route through `parseRunInGameSourceSnapshot` / `parseRunInGameClientSnapshot` / `parseStudioAuthoringState`, each `JSON.parse as unknown` → guard → typed snapshot. `useTheme` reads a raw string (fine). | Not a gap. This is the model the fetch layer should copy. Effect Schema could replace the hand-rolled guards but it is not broken. |
| **`postMessage` / Worker** | `workerClient.ts:25/27/32/34`, `pipeline.worker.ts:17/193`. | Typed at the type level (`MessageEvent<BrowserRunEvent>`, `MessageEvent<BrowserRunRequest>`) but **trusts `ev.data` without runtime validation** (`workerClient.ts:28` checks only truthiness). `onmessageerror` uses `as (ev: MessageEvent) => void` (`:32`). `worker-trace-sink.ts:94` double-casts the payload. | Worker boundary is out of oRPC scope (no network). Recommend an Effect Schema decode on `ev.data` at `workerClient.ts:28` and in the worker's `onmessage` (`pipeline.worker.ts:193`) for parity with the wire boundary. |
| **`window`/global** | `globalThis as any` (`render.ts:47`), `window.localStorage ?? null` (`storage.ts:66`, `persistence.ts:28`), `typeof localStorage === "undefined"` (`App.tsx:575`). | Feature-detected, SSR-safe. | Fine. |

---

## 5. Type organization

- **Shared types:** `src/ui/types/index.ts` — a single large hand-authored barrel (Theme, SelectOption, Stage/Step options, "API types" by comment). Referenced by only **7** files. Heavily UI/presentation-shaped, not domain contracts.
- **Per-feature types:** `features/presets/types.ts`, `features/liveRuntime/model.ts`, `features/viz/model.ts`, plus inline types in `server/*/requestValidation.ts`. Reasonable colocation.
- **`interface` vs `type`:** 56 `export interface` / 141 `export type` (~197 exported types). Mixed convention, no enforced rule. Fine, but pick one for object shapes (recommend `interface` for extensible object contracts, `type` for unions/aliases) and lint it.
- **Drift risk:** the **fetch-body ad-hoc types in `App.tsx`** (inline `{ ok?: boolean; ... }` literals at `:304/349/381/414`) are duplicated/parallel to the server's `requestValidation.ts` shapes — two sources of truth that can silently diverge. This is the classic type-value drift the skill warns about.

### Recommendations
1. **Single contract source.** Define request/response shapes once in the oRPC contract (Effect Schema), `infer` the TS types, share across client + server. Delete the inline `App.tsx` body types and the hand-rolled `requestValidation.ts` parsers. This is the largest organizational win.
2. **Split `ui/types/index.ts`.** Separate presentation tokens (`Theme`, options) from any data contracts; the file's "backend engineers: these are your contracts" comment is aspirational — the real contracts are in `App.tsx` and `server/`.
3. **Audit dead exported types** once the contract lands (`ui/types` has low inbound references — 7 files; `find_unused_exports` recommended post-migration).
4. **`verbatimModuleSyntax`** to keep the contract package's type-only imports from leaking server code into the browser bundle.

---

## 6. Typecheck status

```
$ bun run --cwd apps/mapgen-studio check
$ tsc --noEmit
=== EXIT: 0 ===   error count: 0
```

**Clean. Zero errors today.** The rigor raise is additive (turning on flags), not remedial. Expect the P0 flags to surface a *bounded* set of new errors concentrated in the array-index `!` sites (Section 3) and the optional-property fetch/validator shapes (Section 1) — these are precisely the spots the redesign already touches.

---

## Priority actions for the redesign

1. **(Floor)** Enable `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`; burn down the bounded error set.
2. **(Biggest win)** Replace the 10 `res.json() as X` casts and the raw `vite.config.ts` middleware with the effect-orpc contract + typed client. Deletes ~10 casts, the inline `App.tsx` body types, and the hand-rolled `server/*/requestValidation.ts` validators.
3. **(Parity)** Decode worker `ev.data` (`workerClient.ts:28`, `pipeline.worker.ts:193`) and `worker-trace-sink.ts:94` with Effect Schema; type the `recipeRuntime.ts` contract generically to kill the worker-side `any`s.
4. **(Cleanup)** Type deck.gl typed-array reads (`render.ts` ×8 `as any`) via a `readScalar` helper; leave persistence-layer `as unknown`+guard patterns alone — they are the reference implementation.
