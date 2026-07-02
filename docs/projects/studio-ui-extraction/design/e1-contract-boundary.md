# E1 — the contract boundary, done the way it should be done

Status: **RESEARCH COMPLETE 2026-07-01** — answers the E1 REDIRECT in [DESIGN.md §4a](../DESIGN.md)
(lines 166–176). Repo evidence read from `wt-studio-ui-extraction` @ main tip `c4ebaf1e1`; docs
evidence from orpc.dev (the docs MCP connector is disabled; official pages fetched directly) and
the org's canonical oRPC skill (`dev:orpc`, contract-first reference). No repo file modified except
this report.

The directive being satisfied (Matei, verbatim): *"We want to completely separate runtime concerns
from the client side. The server should be a fully contained boundary. The server should ship its
own types if it needs to do that. The React application should not be reaching in or maintaining
the types of the service it uses. More broadly, every package should be fully contained. … The
gist is: do this the way it should be done."*

---

## 0. TL;DR — the recommendation

**E1-C: extract the studio-owned contract into its own workspace package —
`@civ7/studio-contract` at `packages/studio-contract`, tagged `kind:foundation`** — as a precursor
branch (B0) under the existing 8-branch stack.

- This is not a compromise between E1-A and E1-B; it is the shape oRPC itself prescribes
  (contract package ≠ server package; server *implements* the contract; clients *consume* the
  contract) and the shape the repo is already 90% of the way to: `packages/studio-server/src/contract/`
  is already runtime-light (plain `oc` + TypeBox + `@standard-schema/spec` — **no Effect, no
  `@orpc/server`, no direct-control**), and the server already implements it at one seam
  (`implementEffect(studioEffectContract, runtime)`, `packages/studio-server/src/router/index.ts:56`).
- **No taxonomy revision is needed.** `kind:foundation → kind:foundation` is already legal
  (`eslint.boundaries.config.mjs:33`), `kind:control → kind:foundation` is already legal (`:41-43`),
  `kind:app → kind:foundation` is already legal (`:56-68`). The E1-A deadlock (foundation→control
  illegal) dissolves because the edge changes, not the rule.
- The UI package types its three prop surfaces and the `statusLabels` formatters against the
  **real** contract types (`import type` from `@civ7/studio-contract`); the E1-B structural twins
  and their parity-fence test are **deleted from the plan** — nothing to fence when there is one
  owner.
- The claude.ai/design card degradation is **not caused by where the contract lives** — the
  converter's ts-morph project loads only the UI package's own d.ts tree plus `@types/react`
  (`.ds-sync/lib/dts.mjs:102-115`), so *any* externally-owned type degrades. §6 gives the priced
  three-step ladder (empirical check → one-line vendored dts-roots patch → sanctioned
  `cfg.dtsPropsFor` pin) and the honest baseline: **today's cards already degrade these exact
  three props** (the app's emitted d.ts already carries external `@civ7/studio-server` imports),
  so E1-C cannot regress card quality relative to what ships now.

---

## 1. The deadlock, restated

Three UI-package components need server-originated shapes in their public props —
GameConsole/RecipePanel (`MapConfigSaveDeployStatus`, `RunInGameOperationStatus`) and
PipelineStage (`RecipeDagResult`) — plus two phase unions (`MapConfigSaveDeployPhase`,
`RunInGamePhase`) consumed by the pure label formatters moving into `panels/statusLabels.ts`
(LEDGER rows 42/43/44; DESIGN §1 "Structure").

- **E1-A** (UI package type-depends on `@civ7/studio-server`): illegal edge —
  `kind:foundation → kind:control`, and `@nx/enforce-module-boundaries` counts type-only imports
  ([identity-wiring §4](./identity-wiring.md), E1-A branch) — forcing a formal `kind:ui`
  taxonomy revision; plus the converter degrades the affected cards' props
  ([build-css §E1 flag](./build-css.md), line 116).
- **E1-B** (re-home structural twins into the UI package): precisely *"the client maintaining the
  types of the service it uses"* — rejected by the directive (DESIGN §4a).

Both options misdiagnose the artifact. The contract is neither server-internal (A's premise) nor
client-ownable (B's premise). It is a **third thing** with its own ownership and its own correct
position in the graph — which is exactly what oRPC's architecture says out loud.

## 2. Docs leg — what oRPC prescribes

### 2.1 Contract-first is a package topology, not a file convention

- **Define-contract** (https://orpc.dev/docs/contract-first/define-contract): contract-first is
  *"a design pattern where you define the API contract before writing any implementation code"*;
  a procedure contract is a standard procedure *"with extraneous APIs removed to better support
  contract-first development"*; the contract ensures *"both client and server share a clear,
  consistent interface"*, with `InferContractRouterInputs/Outputs` deriving both sides' types
  from the one artifact.
- **Implement-contract** (https://orpc.dev/docs/contract-first/implement-contract): the server
  imports the contract and attaches handlers via `implement(contract)` — dependency direction is
  **server → contract**, never contract → server.
- **Monorepo best practices** (https://orpc.dev/docs/best-practices/monorepo-setup): the
  recommended layout is `packages/core-contract/` (defines contracts with `@orpc/contract`)
  separate from `packages/core-service/` (defines procedures with `@orpc/server`), with the
  **"Contract First" topology variant: `apps/web` imports `core-contract`; `apps/api` imports and
  implements `core-contract`**. The client never imports server code. (The page's TypeScript
  Project References guidance is the mitigation for repos that *aren't* contract-first — moot
  here.)
- The org's canonical oRPC skill states the same as hard dependency rules
  (`dev:orpc` → `references/monorepo-setup.md`, "Dependency rules (most important)"):
  1. *"`packages/contracts` must not depend on app code or server frameworks."*
  2. *"Clients should depend on `packages/contracts` (or a generated client package), not
     `apps/server`."*
  And its pitfall #6: *"'Schemas in their own files' is **not** contract-first. Contract-first is
  `@orpc/contract` + `implement()` (contract is a first-class artifact)."*

So the directive's *"the server should ship its own types"* maps, in oRPC's vocabulary, to: **the
server boundary publishes a contract artifact; the server package implements it; every consumer
(app transport client, UI package props) types against the artifact, not against the server.**
Ownership stays with the server side (it is the server's published interface); *packaging*
separates so no consumer touches server internals — "fully contained" on both sides.

### 2.2 The Effect integration does not complicate this

The studio contract layer is built with **plain `oc` from `@orpc/contract`**
(`packages/studio-server/src/contract/index.ts:2,50`; `mapConfigs.ts:1`; `recipeDag/contract.ts:2`)
— not with effect-orpc's `eoc` builder. Effect enters only at implementation:
`src/router/index.ts:3,56` (`implementEffect(studioEffectContract, runtime)`), and that file
documents itself as *"the ONLY module that imports `effect-orpc`"* (`router/index.ts:23`).
effect-orpc consumes a plain-oc contract; nothing about the Effect runtime needs to (or may) live
in the contract package. Contrast: `@civ7/control-orpc`'s contract IS built with `eoc`
(`packages/civ7-control-orpc/src/contract-base.ts:2,7-12` — `EffectContractBuilder` from
`effect-orpc`, a value import), which is why the control contract cannot ride along (§4.1).

## 3. Repo leg — the contract is already almost a package

### 3.1 What lives in `packages/studio-server/src/contract/` and its true closure

Eight files, 1,693 lines. Full import closure of the contract layer (grep of every `^import`,
verified file-by-file):

| Module | Imports | Runtime weight |
|---|---|---|
| `contract/{civ7,live,mapConfigs,runInGame,studio,shared,errors}.ts` | `@orpc/contract` (`oc`, `eventIterator`), `typebox`, `@standard-schema/spec`, intra-contract | schemas + `oc` routers only |
| `contract/index.ts` | above + `../errors/failure.js` (type-only), `../recipeDag/contract.js`, **`@civ7/control-orpc/contract` (value — the merge)** | the ONE heavy edge |
| `errors/errorData.ts`, `errors/failure.ts` | `typebox` only / nothing | pure schemas + const arrays |
| `typeboxStandardSchema.ts` | `@standard-schema/spec`, `typebox/compile`, `typebox/value` | pure schema→StandardSchema adapter |
| `recipeDag/{contract,schema,errors}.ts` | `@orpc/contract`, `typebox`, `typeboxStandardSchema` | pure |
| `liveGame/model.ts` | `typebox` only | pure schemas + pure builders |

**Everything is foundation-grade except one line**: `contract/index.ts:1` imports
`Civ7ControlOrpcContract` (value) to compose the merged client-facing surface
(`contract/index.ts:82-88`), and the control contract's value graph includes `effect-orpc`
(`contract-base.ts`). That one composition is genuinely a *server* concern — "which procedures
does the daemon mount" — and it stays server-side (§5.2). Everything else is the shareable
artifact.

### 3.2 Who consumes what today (39 import sites of `@civ7/studio-server` in the app)

- **Pure contract material** (types, phase unions, DTO schemas, setup-config
  normalizers): ~18 client-side files — `features/{mapConfigSave,runInGame}/status.ts` (the two
  status modules; type + `*_PHASES` value imports), `features/{mapConfigSave,runInGame}/api.ts`,
  `features/civ7Setup/setupConfig.ts` (value imports: `DEFAULT_RUN_IN_GAME_SETUP_CONFIG`,
  `normalizeRunInGameSetupConfig`, option-id arrays — the contract graph is **already in the
  browser bundle today**), `features/recipeDag/{useRecipeDagQuery,layout,PipelineStage}`,
  `features/liveRuntime/model.ts` (`./live-game` subpath), `ui/components/{GameConsole,RecipePanel}.tsx`,
  `app/{studioEventRecovery,operationAdoption}.ts`, `app/hooks/{useStudioOperations,useStudioEvents,useRunInGameTerminalToast,useSaveDeploy}.ts`,
  `features/runInGame/clientState.ts`, `storybook/recipeDagFixture.ts`.
- **The transport client**: `src/lib/orpc.ts:1` — `import type { StudioContract }` and nothing
  else; the file's own comment documents that typing off the contract type is what keeps
  server/Effect/direct-control code out of the browser bundle (`lib/orpc.ts:17-22`).
- **Genuine server API** (values: handler, runtime, services): only `src/server/**` — the daemon
  host (`server/daemon/daemon.ts:5` `createStudioRpcHandler`, `server/studio/{context,engines}.ts`,
  `server/recipeDag/service.ts`, `server/runInGame/proof*.ts`). These are correct and stay.

The app is `kind:app` (`apps/mapgen-studio/package.json:7-10`), so all of this is boundary-legal
today — the illegality only appears when the *UI package* (foundation) needs the same types.

### 3.3 The boundary taxonomy needs no new row

`eslint.boundaries.config.mjs` dep-constraints (the enforced form of habitat taxonomy §3):
- `kind:foundation → [kind:foundation]` (line 33)
- `kind:control → [control, foundation, adapter, engine]` (lines 41-44)
- `kind:app → [sdk, engine, adapter, foundation, plugin, control, mod, tooling]` (lines 56-68)

A foundation-tagged contract package is legally importable by the server (`kind:control`,
`packages/studio-server/package.json:6-8`), the app, and the UI package simultaneously. And
"types/contract package" is already the *practiced meaning* of foundation here — `@civ7/types`
(`packages/civ7-types/package.json:4-7`, a types-only package) and `@civ7/config`/`map-policy`
carry the tag (identity-wiring §6 T1: foundation members are "contract/util packages"). No
`kind:ui`, no allow-list entry (T3 is banned by the config header, `eslint.boundaries.config.mjs:10-14`),
no taxonomy edit at all.

### 3.4 The exports precedent is already cut

`@civ7/studio-server` already ships `./contract` and `./live-game` subpaths with
`types` + `bun-source` + `import` conditions and real dist d.ts
(`packages/studio-server/package.json:20-33`; `tsup.config.ts` entries `src/contract/index.ts`,
`src/liveGame/model.ts`). The new package copies this manifest shape verbatim — including the
`bun-source` condition and `files: ["src","dist"]`, which the dev daemon's run-from-TS-source
closure requires.

## 4. The options, priced

### 4.1 (i) `@civ7/studio-contract` — extract the contract into its own package ★ WINNER

The oRPC-prescribed shape (§2.1) applied to this repo, with one scoping decision that makes it
land cleanly: **the studio-owned contract moves; the civ7-control merge stays server-side.**

- Moves (git-mv, ~15 files): `src/contract/{civ7,live,mapConfigs,runInGame,studio,shared,errors}.ts`,
  `src/errors/{errorData,failure}.ts`, `src/typeboxStandardSchema.ts`,
  `src/recipeDag/{contract,schema,errors}.ts`, `src/liveGame/model.ts`, plus the
  `studioEffectContract` router assembly from `contract/index.ts`.
- Stays in `@civ7/studio-server` (a thin `src/contract/index.ts`): the
  `Civ7ControlOrpcContract` merge (`contract` value, `StudioContract` type — `contract/index.ts:76-88`
  today) and compat re-exports. Reason: the merge's value graph includes `@civ7/control-orpc`
  (kind:control, effect-orpc-built contract, §2.2) — pulling it into a foundation package would
  recreate the illegal edge one level down. The merged surface is the *server's composition* of
  its mount — exactly the thing the server should own. (A future workstream can give
  `@civ7/control-orpc` the same contract split; out of scope, nothing here blocks it.)
- Cost: one new package + ~11 server-file repoints + ~18 app one-line repoints (§5.4); zero
  behavior change; zero taxonomy change; kills the parity-fence task and the E1-B twin surface.
- Risk: the card-degradation question is *moved, not auto-solved* — priced honestly in §6 with a
  bounded ladder and a no-regression baseline.

### 4.2 (ii) Keep `./contract` as a subpath of the server + fix the boundary semantics — fails

Three sub-variants, all rejected:
- **`kind:ui` taxonomy row admitting `ui → control`**: encodes the direction smell permanently
  into the boundary table (identity-wiring §9.1 calls this E1-A's "single biggest hidden cost");
  cross-lane habitat process weight; and it does nothing for the converter degradation
  (build-css.md:384). It also fails the directive on its face: the UI package would still be
  "reaching into" the *server package* for its types — the fact that the reach lands on a subpath
  doesn't make the server boundary contained; the Nx graph gains a real UI-package→server edge
  (cold-cache build ordering, identity-wiring §4 E1-A).
- **Exempt type-only imports in the rule**: `@nx/enforce-module-boundaries` has no such option —
  verified twice in the design corpus (identity-wiring §4: "the boundaries rule does not exempt
  `import type`"; DESIGN §2.2). Patching the rule ourselves would be a fork of habitat's one
  enforcement layer for one package's convenience.
- **`allow:` entry for `@civ7/studio-server/contract`**: expressible
  (`eslint.boundaries.config.mjs:111`) but banned — "any red edge is a violation, not negotiable
  debt" (config header `:10-14`); identity-wiring T3 calls it "a taxonomy revision in disguise,
  minus the honesty."

### 4.3 (iii) E1-B re-home structural twins — rejected by the directive (recorded)

The prior synthesizer recommendation (DESIGN §2.2). Matei's §4a redirect rejects it: twins in the
UI package are the client maintaining the service's types. Even fenced (the mutual-assignability
parity test, identity-wiring §4 E1-B), it is a permanent two-owner arrangement with a standing tax
(the fence test, the re-decide-later debt, HEAVY twin maintenance for the DAG shape — LEDGER §5
E1 "trivial for unions, HEAVY for the DAG shape"). Under E1-C the fence test is **not built** —
delete it from the B5 task list (DESIGN §3 "E1-B drift fence").

### 4.4 (iv) oRPC-doc alternates considered and set aside

- **Service-first / hybrid topology** (monorepo page variants): has the client import the
  *router's* types — strictly worse for this directive (client reaches deeper into server code).
- **TypeScript Project References** (monorepo page): the doc's mitigation for resolving server
  types without importing server *code* when you aren't contract-first. We are contract-first;
  the contract package makes it unnecessary — and it wouldn't touch the Nx boundary rule anyway
  (the rule fires on the import specifier, not the resolution mechanism).
- **`minifyContractRouter()` artifact** (dev:orpc skill, pitfall 4): a serialized contract for
  runtime/drift-check purposes — useful someday as a contract-drift snapshot test inside the
  contract package, but not a substitute for TS types in UI props.

## 5. The winner, specified

### 5.1 Package identity

- **Name: `@civ7/studio-contract`** at **`packages/studio-contract`** (dir = unscoped suffix per
  house convention, DESIGN §4a Q2). Rationale: the contract is the server family's published
  interface — it pairs with `@civ7/studio-server` the way `core-contract` pairs with
  `core-service` in the oRPC docs; `@civ7/*` is the practiced infra/control scope
  (identity-wiring §1). (Alternative if Matei reads it product-family: `@swooper/mapgen-studio-contract`;
  one-line rename, nothing else changes.)
- `private: true`, `version 0.1.0`, ESM, `nx.tags: ["kind:foundation"]`,
  `engines.node 22.22.0`.
- **Manifest** (mirrors studio-server's practiced shape, `packages/studio-server/package.json:14-33`):
  ```jsonc
  {
    "name": "@civ7/studio-contract",
    "nx": { "tags": ["kind:foundation"] },
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "files": ["src", "dist"],                     // src: bun-source closure needs it
    "exports": {
      ".": { "types": "./dist/index.d.ts", "bun-source": "./src/index.ts", "import": "./dist/index.js" }
    },
    "scripts": { "build": "tsup", "check": "tsc -p tsconfig.json --noEmit", "clean": "rimraf dist" },
    "dependencies": {
      "@orpc/contract": "1.14.6",
      "@standard-schema/spec": "^1.1.0",
      "typebox": "^1.0.80"
    }
  }
  ```
  One entry (`src/index.ts` barrel re-exporting the current `contract/index.ts` surface minus the
  merge, plus `recipeDag` schema/contract, `liveGame` model, `errorData`/`failure`,
  `toStandardSchema`). `tsup` with `dts: true` + a `check` tsc gate (same split as studio-server);
  no `noExternal` needed — the contract never touches `effect-orpc`. **Zero workspace
  dependencies** → trivially legal under `foundation → foundation`.
- Internal layout keeps today's file names (`src/{civ7,live,mapConfigs,runInGame,studio,shared,errors}.ts`,
  `src/recipeDag/…`, `src/liveGame/model.ts`, `src/lib/typeboxStandardSchema.ts`) — a move, not a
  rewrite; git history follows.

### 5.2 What each party imports afterward

| Party | Imports | Edge / legality |
|---|---|---|
| `@civ7/studio-server` | `@civ7/studio-contract` (value: `studioEffectContract`, error maps, schemas) — `implementEffect(studioEffectContract, runtime)` unchanged at `router/index.ts:56`; thin `./contract` module keeps the `Civ7ControlOrpcContract` merge + `StudioContract` type + compat re-exports | control → foundation ✓ (`:41-43`) |
| `@swooper/mapgen-studio-ui` | `@civ7/studio-contract` in `dependencies` (`workspace:*` — types appear in published d.ts, so a devDep would be the adjudication-10 under-declaration); all imports `import type` (compiler-enforced by `verbatimModuleSyntax`, identity-wiring §7) | foundation → foundation ✓ (`:33`) |
| app (client side) | contract material from `@civ7/studio-contract` (~18 one-line repoints, §5.4); `lib/orpc.ts` keeps `import type { StudioContract } from "@civ7/studio-server/contract"` — the *merged mount surface* is the server's own published type, which is exactly "the server ships its own types" | app → foundation ✓, app → control ✓ |
| app (`src/server/**` daemon host) | `@civ7/studio-server` unchanged | app → control ✓ |

### 5.3 UI package outcome — statusLabels + the three props

- `panels/statusLabels.ts` (the 4 moving formatters: `formatMapConfigSaveDeployPhaseLabel`,
  `formatRunInGamePhaseLabel`, `runInGamePrimaryActionLabel`, `runInGameRequiresProcessRestart`
  per the errata) types against the **real** unions:
  `import type { MapConfigSaveDeployPhase, RunInGamePhase, RunInGameOperationStatus } from "@civ7/studio-contract"`.
  The dead `*_PHASES` value re-exports still die (LEDGER `sf` remedy); the collapsed
  `RunInGameActionRelation` union stays package-owned (it was never a server type —
  identity-wiring §4).
- `GameConsoleProps`/`RecipePanelProps`: `saveDeployStatus: MapConfigSaveDeployStatus | null`,
  `runStatus: RunInGameOperationStatus | null` — real contract types.
  `PipelineStageProps.dag: RecipeDagResult` — real contract type. `RecipeDagLoadStatus` still
  re-homes into the package (LEDGER row 44 — it is a *client query-state* union, not a server
  type; the TS7056 kill is unaffected).
- **The E1-B parity-fence test is removed from the plan** (DESIGN §3 bullet; identity-wiring §4
  E1-B). One owner, zero twins, zero fence.
- The CI `verify` assertion "no `@civ7/studio-server` specifier in dist JS" (DESIGN §3) stays and
  gets a sibling: no `@civ7/studio-server` specifier in dist **d.ts** either (now achievable);
  `@civ7/studio-contract` may appear in d.ts (by design) but not in dist JS (all imports are
  type-only).

### 5.4 Migration cost (verified file lists)

- **Server-internal repoints (~11 files, mechanical `../contract/…` → package specifier):**
  `src/{context,handler,index}.ts`, `src/operationRuntime/{StudioOperationRuntime,model,projection,registry,sourceSnapshot}.ts`,
  `src/ports/workflowTypes.ts`, `src/router/index.ts`, `src/services/StudioEventHub.ts` (grep at
  `c4ebaf1e1`). `tsup.config.ts` drops the `src/contract/index.ts` + `src/liveGame/model.ts`
  entries or keeps them as thin re-export shims (recommend: keep `./contract` = the merge module;
  keep `./live-game` as a one-line re-export until the app repoint lands in the same branch,
  then it may also thin out).
- **App repoints (~18 one-line import edits)**: the §3.2 "pure contract material" list. Several of
  these files are moving/splitting later in the stack anyway (GameConsole, RecipePanel,
  PipelineStage, both status modules, recipeDagFixture) — doing B0 first means they move already
  carrying clean imports, so the per-branch staging rule (DESIGN header) has less to repoint.
- **New files**: `packages/studio-contract/{package.json,tsconfig.json,tsup.config.ts,src/index.ts}`.
- **Root wiring**: none — workspaces glob auto-registers; boundary/biome/CI cover `packages/**`
  on day one (identity-wiring §2).
- Proof: whole-repo `build,check,lint,test,verify` green + `boundaries` green; zero behavior
  change (a move + repoints).

### 5.5 Stack slotting

**B0 — a precursor branch at the bottom of the extraction stack** (before B1 scaffold), or
equivalently an independent PR merged first — it is a pure server-side refactor, CI-green alone,
with no dependence on anything UI. B1's scaffold then declares
`"@civ7/studio-contract": "workspace:*"` in the UI package manifest from birth. Do **not** fold it
into B1: B0 touches `packages/studio-server` + app transport files, B1 creates the UI package —
different review surfaces, and B0 is independently revertible.

## 6. The design-sync converter question, answered honestly

**Mechanism** (verified in the vendored converter): `projectFor` builds a ts-morph project with
`skipAddingFilesFromTsConfig: true` and adds exactly two things — the UI package's own d.ts tree
(`${root}/**/*.d.ts`, `.ds-sync/lib/dts.mjs:108`) and `@types/react/index.d.ts`
(`dts.mjs:104,115`). The `[DTS_REACT]` hard warning (`dts.mjs:116-123`) exists precisely because
dependency types do **not** come in via ambient resolution — which corroborates the designers'
finding that externally-owned types degrade to `any`/`unknown` on the cards (build-css.md:116;
DESIGN §2.2). Moving the contract from `@civ7/studio-server` to `@civ7/studio-contract` changes
the *legality and ownership* of the reference, **not** the converter's ability to resolve it.

**The ladder (in order; stop at the first rung that holds):**
1. **Empirical check at B1** (one converter run over the scaffolded package): confirm whether the
   checker lazily resolves the workspace symlink (`packages/mapgen-studio-ui/node_modules/@civ7/studio-contract`
   under bun's isolated linker → real dist d.ts). Expected outcome per the evidence above:
   degradation confirmed.
2. **One-line vendored patch** (preferred): extend `projectFor` to `addSourceFilesAtPaths` the
   d.ts trees of a new config key (e.g. `dtsIncludeRoots: ["node_modules/@civ7/studio-contract/dist"]`).
   The vendored `.ds-sync` already carries an un-upstreamed patch (the `--tw-*` emit fix, DESIGN
   §6) — local patching is precedented, and this one is upstreamable. Note the independent
   240-char guard (`dts.mjs:265` — over-long type texts fall back to `unknown` by design), so the
   two big status shapes may print as named aliases or wide types either way; that is a
   card-display ceiling, not a type-system defect.
3. **Sanctioned config pin** (fallback, zero code change): `cfg.dtsPropsFor.<Name>` is a
   whitelisted config key (`.ds-sync/lib/common.mjs:192`) that overrides a component's emitted
   props body (`dts.mjs:363-364`; the self-heal loop even routes to it, `dts.mjs:404-406`). Pin
   GameConsole/RecipePanel/PipelineStage. This is a hand-maintained *display* string for 3 cards
   — bounded, visible in config, and nothing like an E1-B type twin.

**Baseline that de-dramatizes this**: the app's current sync emits its d.ts tree from app `src`
(via `tsconfig.dts.json`/`build-inputs.sh`), where these three props are *already* typed via
external `import("@civ7/studio-server/…")` references the converter *already* cannot resolve —
today's uploaded cards already degrade exactly these props. E1-C with rung 2 is a strict
improvement; even at rung 0 it is no worse than shipping.

## 7. Risks / open items

1. **Rung-1 empirical check** (§6) is the one unverified fact — schedule it into B1's converter
   smoke run; rungs 2/3 are both priced and small.
2. **`@civ7/control-orpc` asymmetry**: its contract stays effect-orpc-built inside a
   `kind:control` package. Consistent-but-not-uniform; if the control plane ever grows a
   browser-side consumer beyond the merged type, run the same extraction there. Not a blocker —
   the merged `StudioContract` type is consumed only by the app (legal) via the server's own
   subpath (directive-compliant).
3. **Contract-package discipline**: the package must never grow a workspace dep or an
   `@orpc/server`/`effect` import — the `foundation → foundation` boundary row *is* the
   enforcement (any such import goes red in `boundaries`), plus the isolated linker fails
   undeclared deps loudly. Optionally add the dev:orpc skill's `minifyContractRouter()` snapshot
   as a contract-drift test later (§4.4).
4. **`liveGame/model.ts` pure-builder functions** (`buildLiveGameState`, `hashLiveGameValue`)
   move with the schemas (they are dependency-pure); if anyone objects to functions in a
   contract package, they can split into the server later — the app consumes only
   types/schemas from that module today (`features/liveRuntime/model.ts`).
5. **DESIGN.md updates on sign-off**: §1 "Structure" (statusLabels typing source), §3 (delete the
   E1-B drift-fence bullet; add the d.ts sibling assertion), §1 "Migration" (insert B0), UI
   manifest (one dependency line). LEDGER stays frozen; this supersession is recorded here and in
   DESIGN §4a per the existing errata protocol.

## 8. Recommendation (one read)

Extract the studio-owned contract — the eight `src/contract` modules plus their pure closure
(`errorData`/`failure`, `typeboxStandardSchema`, `recipeDag` contract/schema/errors,
`liveGame/model`) — into a new `@civ7/studio-contract` package at `packages/studio-contract`,
tagged `kind:foundation`, with the `Civ7ControlOrpcContract` merge staying behind in
`@civ7/studio-server`'s thin `./contract` subpath; the server keeps implementing the identical
contract via `implementEffect`, the app repoints ~18 one-line type/value imports to the contract
package (its transport client keeps typing off the server's merged `StudioContract` — the server
shipping its own types), and the UI package takes one `workspace:*` dependency and types
GameConsole/RecipePanel/PipelineStage props and the `statusLabels` formatters against the real
contract — no `kind:ui` taxonomy row, no structural twins, no parity fence, one B0 precursor
branch (~15 moved files, ~29 mechanical repoints, zero behavior change), and the claude.ai/design
card concern is handled by a priced three-rung ladder whose worst case equals what ships today.
This is the topology oRPC's own docs prescribe for contract-first monorepos (core-contract /
core-service / apps-import-the-contract), which is why it reads as "the way it should be done"
rather than a workaround.
