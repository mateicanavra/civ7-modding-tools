# Control-Layer Migration Audit — 2026-06-18

Read-only audit of how far the Civ7 control layer has migrated to the intended
**mod-as-control-layer / domain-centered oRPC** architecture. Scope: map (1) what is
fully migrated, (2) what is still the old approach, (3) where logic is duplicated or
inconsistent across both — and the scope of what is left. **No fixes applied.**

Evidence is cited as `path:line`. Counts were derived directly from source
(`procedureKey` literals in module contracts vs. the bridge envelope union), not estimated.

---

## 0. Intended end-state (documented, not re-derived)

Authority: **ADR-007** (`docs/system/ADR.md:155-181`, Accepted 2026-06-03), the
`civ7-orpc-control-architecture` skill, and `mods/mod-civ7-intelligence-bridge/AGENTS.md`.

- `@civ7/control-orpc` (`packages/civ7-control-orpc`) owns **all** procedure composition
  and orchestration — the domain-centered command hierarchy (`src/modules/<domain>`).
- A **single** Civ mod, `mod-civ7-intelligence-bridge`, bootstraps
  `globalThis.Civ7IntelligenceBridge.invoke(...)` as a **serialized ingress adapter only**
  into the in-process oRPC router. "Do not add procedure logic … or raw JavaScript command
  surfaces" to the mod (`AGENTS.md:5-13`).
- CLI / Studio consume the **same** router via `createCiv7ControlOrpcServerClient`; they must
  not hand-roll exec/orchestration.
- Raw `CMD:<stateId>:<js>` / `game exec` stays a **diagnostic/probe transport only**, not the
  agent-facing product API (`ADR.md:164-165`).

The migration is being executed deliberately under OpenSpec change
`civ7-control-orpc-native-slice` (≈150 child slices complete). This audit is a snapshot of
where the seams actually sit in code.

---

## 1. The migration has four seams, at three different stages

| # | Seam | What it is | Status |
|---|------|-----------|--------|
| 1 | **Domain hierarchy** | `@civ7/control-orpc/src/modules/*` (contract + router + procedures) | ✅ **Done** — 14 domains, 44 procedures, router wires all 14, zero contract↔router drift |
| 2 | **In-mod engine logic** | `createCiv7GameUiDirectControlFacade` in `game-ui.ts` (runs on `globalThis`, no wire) | ⚠️ **Partial** — 26/41 facade methods run in-engine; **15 still `throw "not supported"`** |
| 3 | **Bridge allowlist** | `bridge/controller-ingress.ts` — what `Civ7IntelligenceBridge.invoke` can reach | ⚠️ **Partial + drift-prone** — **28/44** procedures bridged; **16 unbridged**; hand-maintained mirror |
| 4 | **Caller boundary** | CLI / Studio actually calling the mod API | ❌ **Not started** — 0 callers hit the bridge; 100% ride the OLD JS-over-wire facade |

The single most important fact: **the entire domain logic exists twice** — once as
JS-source-string builders in `@civ7/direct-control/src/play/*` (the OLD over-the-wire path)
and once as engine-side `game-ui-*.ts` modules in `@civ7/control-orpc` (the NEW in-mod path).
The two implementations of the one facade interface
(`Civ7ControlOrpcDirectControlFacade`, `dependencies/direct-control.ts:188-373`) diverge by
exactly the 15 not-yet-migrated methods — and several already-migrated pairs have **drifted**
(§4).

---

## 2. What is FULLY migrated

### 2a. The domain hierarchy (Seam 1) — complete

All 14 modules have `contract.ts` + `router.ts` + `procedures/`, and `src/router.ts:20-36`
wires every one. Each module's router mirrors its contract exactly — **no contract↔router
drift** anywhere. The 44 procedures are reachable in-process via `Civ7ControlOrpcRouter`.

Modules: `attention, city, diplomacy, display, government, narrative, notifications,
progression, readiness, strategy, turn, unit, view, world`.

### 2b. Capabilities that run end-to-end through the NEW stack — 26 of 41 facade methods

These are implemented in **both** facades **and** reachable through the bridge — i.e. they
could run inside the deployed mod today:

- **All 23 mutations**: production choice, notification dismissal, narrative, diplomacy
  response, first-meet response, government + celebration, 8× progression
  (tech/culture choice·target, attribute purchase·review, tradition change·review),
  town-focus change·review, assign-worker, expand-city, unit target-action, unit
  upgrade·resettle, turn complete.
- **Reads bridged via their own key**: `world.plot.read`, `world.grid.read`,
  plus playable-status / play-notification-view / ready-unit / ready-city / turn-completion
  bridged through their aggregating keys (`readiness.current`, `attention.current`,
  `world.current`).

Evidence: `game-ui.ts:341-410` (in-mod impls), `controller-ingress.ts:518-547` (bridge union),
`game-ui.ts:480-550` (supported lists).

---

## 3. What is STILL the OLD approach

### 3a. The caller layer — entirely old (Seam 4, not started)

- **Zero** references to `Civ7IntelligenceBridge` / the bridge ingress anywhere outside the
  mod (grep across `packages/cli`, `packages/studio-server`, `apps`).
- **100%** of oRPC traffic uses `liveCiv7ControlOrpcDirectControlFacade`
  (`runtime.ts` → `dependencies/direct-control.ts:375-476`), which ships JS source strings
  over the tuner wire. Every oRPC-using CLI command **and**
  `apps/mapgen-studio/src/server/studio/context.ts` wire this facade.
- Studio is only **partially** on the shared router at all: only the footer-readiness member
  routes through `readiness.current`; map/autoplay remain REST (`tasks.md:1106-1109`).

### 3b. 15 facade methods that only work over the wire (Seam 2 frontier)

The in-mod facade explicitly `throw`s `"… not supported"` for these (`game-ui.ts:345-443`),
so they **cannot run inside the deployed mod**:

| Domain | Methods (all throw in-mod) |
|--------|----------------------------|
| `display` | visibility-summary, display-queue read·close·suspend·resume, explore-grant apply·release |
| `view` | camera-focus, clean-frame enter·exit, window-shot capture¹ |
| `notifications` | advisor-warning viewed |
| `progression` | progress-dashboard, traditions-view |
| `strategy` | settlement-recommendations |

¹ `captureCiv7WindowShot` is OS-local ScreenCaptureKit (`direct-control.ts:369-372`) — it is
intrinsically out-of-engine and may *never* belong in the mod.

### 3c. Capabilities never lifted into the hierarchy/facade at all

These live only in `@civ7/direct-control` and are reached by CLI **directly** (no oRPC, no
facade method, no game-ui module):

- `getCiv7UnitMovePreview` (`play/ready/move-preview.ts`)
- autoplay configure/start/stop/status (`play/autoplay.ts`)
- `readCiv7StartPositions` (`play/start-positions.ts`)
- city/player/unit summaries + `getCiv7GameInfoRows` (`play/summaries.ts`, `play/map/gameinfo.ts`)

### 3d. CLI commands that bypass the oRPC hierarchy entirely — 17

`operation` (the flagship bypass — reimplements validate+send inline, `operation.ts:118-148`),
`inspect`, `autoplay`, `restart`, `health`, `catalog`, `gameinfo`, `ai/loaded-levers`,
`map/starts`, `watch`, `play/unit-move-preview`, `play/ready-city`, `play/ready-unit`,
`play/promotion-readiness`, `play/settlement-recommendations`, `play/rehydrate`,
`play/notifications`. (`game exec` is the sanctioned raw-JS REPL; `topics` + `local-data/inspect`
call no service.)

---

## 4. What is DUPLICATED / INCONSISTENT

### 4a. The whole domain logic is written twice (~19 domains) with measurable drift

Same validation/postcondition/probe logic exists as embedded-JS in `@civ7/direct-control`
**and** as TypeScript in `game-ui-*.ts`. Confirmed drift (not just duplication):

1. **`successFromCanStart`** (canStart-result truthiness) reimplemented **4×** — OLD JS copies
   (`notifications/view.ts:376-385`, `operations/router.ts:239-248`,
   `operations/production-choice.ts:312-318`, `operations/unit-target-action.ts:~408`) + NEW TS
   copies (`game-ui-first-meet.ts:313-323`, `game-ui-production.ts:191`,
   `game-ui-unit-target.ts:255`). Kept in sync by hand.
2. **`toComponentId` casing drift** — OLD reads both `Owner/owner`, `ID/id`, `Type/type`
   (`view.ts:290-305`); NEW reads only lower-case (`game-ui-attention.ts:441-450`). NEW returns
   `null` for any runtime object exposing capitalized component-id fields that OLD accepts.
3. **First-meet classifier match-logic drift** — same 6 classifications + reason strings, but
   OLD `findFirstMeetNotification` matches on `notification.player ?? details.player2 ?? decision.player`
   and is null-permissive (`first-meet-postconditions.ts:96-124`); NEW matches `target.owner/target.id`
   and is **not** null-permissive (`game-ui-first-meet.ts:267-281`). Same game state can classify
   differently.
4. **ReadyUnitView / ReadyCityView "migrated in name only"** — OLD computes legalOperations,
   productionCandidates, townFocusOptions, populationPlacement, promotionReadiness, nearby plots
   (`play/ready/unit.ts` 397 LOC, `ready/city.ts` 764 LOC); NEW returns **empty arrays / nulls**
   with a note that "validator-backed mutation procedures own action execution"
   (`game-ui-attention.ts:135-201`). Same type, drastically reduced content.
5. **Notification decision-hints rich vs empty** — OLD `playNotificationViewSource` emits populated
   `requiredInputs`/`commonActions` with confidence `live-proof` (probes first-meet costs, validates
   candidate operations); NEW `notificationDecisionHint` always returns `[]/[]` with confidence
   `official-ui` (`game-ui-attention.ts:327-349`). Same notification → action plan vs. stub.
6. **Production close-UI mechanism + retry drift** — OLD `closeProductionUi()` + a retry/poll
   re-validation loop (`production-choice.ts:446,529-547`); NEW `InterfaceMode.switchToDefault()`
   single before/after with no retry (`game-ui-production.ts:131,320-322`).
7. **Category keyword drift** — NEW keys on `CHOOSE_PRODUCTION` (`game-ui-attention.ts:371-379`);
   OLD keys on `CHOOSE_CITY_PRODUCTION` (`production-choice.ts:388`). Different tokens → same type
   categorized differently.
8. **Transport/host drift** — OLD results carry the real tuner host/port; NEW hard-codes
   `host:"game-ui", port:0` (`game-ui-attention.ts:83-85`, `game-ui-first-meet.ts:140-143`).
   OLD itself is split between `executeCiv7TunerCommand` and `executeCiv7AppUiCommand`.

### 4b. The bridge ingress is a hand-maintained parallel mirror of the contract

`controller-ingress.ts` (~1,532 LOC) duplicates the contract with **no codegen**. Each bridged
procedure needs ~7 hand-written sites (input-schema binding, request-envelope schema + type,
success-response schema + type, union member, dispatch branch, `isUnsupportedProcedureRequest`
literal, and for mutations an `isControllerBridgeMutationRequest` literal). Adding a contract
procedure compiles fine while silently leaving it unbridged — which is exactly the current state.

**16 contract procedures are reachable in-process but NOT via the bridge** (44 − 28):

```
attention.priorities                        progression.dashboard.current
display.explore.request                     progression.traditions.current
display.queue.close                         strategy.battlefieldScan
display.queue.current                       strategy.civilianRouteTriage
notifications.advisorWarning.viewed.request strategy.destinationAnalysis
notifications.queue.current                 strategy.formationSnapshot
notifications.queue.dismiss.request         strategy.targetCandidates
view.appshot.capture                        view.camera.focus
```

Other bridge inconsistencies:

- **Implemented-but-unbridged**: `strategy.targetCandidates` / `strategy.destinationAnalysis`
  are implemented in the in-mod facade (`game-ui.ts:399-409`) yet absent from the bridge union
  and supported lists — can run in-process, can't be `invoke`d.
- **Dispatchable-but-unlisted**: `readiness.current` is hard-allowed
  (`controller-ingress.ts:1500` returns `true`) but appears in **no** supported list — asymmetric
  vs. every other read which is gated through `gameUiSupportedReadProcedures`.
- **Fragile dispatch**: `attention.current` has no explicit `if` branch — it is the trailing
  else-fallthrough (`controller-ingress.ts:1386-1392`). Any unmatched-but-allowed key would be
  mis-dispatched as `attention.current`.

### 4c. The CLI "mixed" boundary — 23 commands split by a flag

Every mutating play command routes its `--send` branch through the oRPC router but reaches
**around** it for dry-run/validate (via `validatePlayOperation` → `canStartCiv7*` in
`game-play-shared.ts:101-115`) or for reads (`getCiv7*View`). So the same domain operation is
exercised through two different code paths depending on `--send`. `respond-first-meet.ts` is the
worst case — a *triple* path: oRPC send + direct-control validate + **raw JS over the wire**
(`executeCiv7AppUiCommand`, `respond-first-meet.ts:116`) to resolve a first-meet enum.

### CLI integration-path tally (66 leaf commands)

| Path | Count |
|------|-------|
| oRPC (live facade) only | 20 |
| direct-control direct (bypasses oRPC) | 17 |
| mixed (send→oRPC / validate·read→direct-control) | 23 |
| raw JS over wire (`game exec`) | 1 |
| other / none | 2 |
| **bridge invoke** | **0** |

---

## 5. Scope of what is left to finish

The migration is **structurally far along but blocked at the proof boundary**, not abandoned.
Per the OpenSpec ledgers (`civ7-control-orpc-native-slice`,
`docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge`):

1. **No deployed-Civ7 / live-runtime proof.** The bridge mod is only a generated bundle; it has
   never been loaded in-game (`controller-game-ui-bootstrap-slice.md:87-91` Residual Risk). ~60
   task lines say "do not claim deployed Civ7 runtime proof." This gates everything downstream.
2. **Parent acceptance tasks open**: 5.2–5.5, 6.1, 6.3, 7.3, 7.4 (`tasks.md:86,111,115,266,455,487,1110,1519`).
3. **Finish Seam 2** — implement the 15 in-mod facade methods (§3b): the whole `display` + `view`
   domains plus advisor-warning, progress-dashboard, traditions, settlement-recommendations.
4. **Finish Seam 3** — bridge the 16 missing procedures (§4b), and ideally **generate**
   `controller-ingress.ts` from the contract to kill the hand-mirror drift class.
5. **Start Seam 4** — route at least one caller (CLI command or Studio member) through
   `Civ7IntelligenceBridge.invoke` once a deployed lifecycle exists; then migrate the 17 oRPC-
   bypassing CLI commands and the 23 mixed commands onto the router.
6. **Shared mutation middleware not yet promoted** (validator-first / postcondition-proof),
   `tasks.md:455,487`; `actions.executeApproved` stays **disabled** until a disposable
   approved-mutation proof exists (`design.md:127,182-186`).
7. **De-duplicate Seam 1↔2** — once the mod path is proven, retire the
   `@civ7/direct-control` JS-builder copies (gated by proof-ladder rung 8) and resolve the §4a
   drift before it causes divergent behavior.
8. **Intentionally deferred (not gaps)**: OpenAPI/external REST (`tasks.md:1519`); caller-provided
   approval was **retired** by design (`tasks.md:460,470`); the static-AI lane (age transitions,
   native-AI live mutation, save parser) is a separate authority side.

### Doc-drift warning

There are **three** overlapping OpenSpec changes for this one migration. The oldest,
`direct-control-game-controller-bridge`, still names **superseded paths that do not exist on
disk** — `mods/mod-civ7-intelligence-controller`, `packages/civ7-direct-control/src/controller-bridge.ts`,
`packages/civ7-direct-control/src/orpc/**`. The work actually landed under
`civ7-control-orpc-native-slice` (`packages/civ7-control-orpc`, `src/game-ui.ts`,
`src/bridge/controller-ingress.ts`). Treat the older intelligence-layer workstream docs as stale.

---

## Appendix — method/count reconciliation

- Facade interface (`dependencies/direct-control.ts:188-373`): **41 methods**. Live facade
  implements all 41; in-mod facade implements **26**, throws on **15**.
- Contract procedureKeys (derived from `procedureKey:` literals across `modules/*/contract.ts`):
  **44**. Bridge procedureKeys (`Type.Literal` in `controller-ingress.ts`): **28**.
  Unbridged: **16** (listed §4b). Bridge keys outside the contract: **0**.
- Method count (41) ≠ procedureKey count (44) because some methods back multiple keys
  (`requestCiv7UnitCommand` → `unit.upgrade.request` + `unit.resettle.request`) and some keys are
  served by aggregating read methods.
