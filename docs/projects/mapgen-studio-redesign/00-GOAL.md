# MapGen Studio Redesign — Active Goal & Frame

> Controlling scope for the systematic workstream. This is the closure test:
> work is done when this objective is met and its falsifier has not fired.
>
> **Controlling frame:** [`FRAME.md`](FRAME.md) (normative operating model +
> guardrails). On any conflict, FRAME → this goal → architecture → audits.
> **Status: ACTIVE (un-paused 2026-06-08).** All "PAUSED / wait-for-merge"
> sections below are **superseded** by FRAME §4 (Operating Model) and §7
> (revised phase order). They are retained only as history.

## Active goal (controlling, create-goal fallback record)

Active goal:
Rebuild `apps/mapgen-studio` into a top-1%, data-driven React 19 app —
design-system-first, decomposed architecture, real client-state vs server-data
boundaries (oRPC-native TanStack Query + Zustand), full canonical shadcn +
Tailwind v4, end-to-end types, intentional comments/organization — WITHOUT
changing map-gen, Deck.gl, recipe, or live-game behavior (parity is hard core).
Deliver as a Graphite stack of OpenSpec-backed slices, each a domino;
**never submit the stack**. Do NOT wait for the live-control stack to merge:
work off `main`, inspect the TOP of the live-control `codex/*` stack, and design
the exact studio↔control-oRPC integration seam to bind later (no FireTuner reads,
no re-implementing live reads). Build the design system FIRST (via `design:*`),
then consume it everywhere. Fully autonomous; confirm design *direction* once at
`design:init`. Falsifier: if decomposition/server migration can't preserve
parity, or "simpler" degrades the authoring workflow, or the designed seam is
incompatible with what lands on `main` — stop and tell the user.

## Active goal

Transform `apps/mapgen-studio` from a 3,010-line god-component (`App.tsx`) into a
top-1%, data-driven React 19 application: decomposed component architecture, real
state/server-data boundaries, a documented shadcn(Radix)+Tailwind design system,
accessibility + interaction craft, and comments/organization that read as
intentional — **without changing** map-generation, Deck.gl rendering, recipe
semantics, or live-game runtime behavior. Behavior parity is hard core.

## User-confirmed decisions

- **Design system:** adopt **full canonical shadcn/ui** (`components.json` + Radix),
  replacing the hand-rolled primitives; formalize tokens + `system.md` via the
  `design:*` skills. Go all the way.
- **State / data:** standardize server state on oRPC's **native** TanStack Query
  integration (use it directly if it subsumes a separate client; otherwise
  TanStack Query / React Query). **Zustand** for client / UI state. "Go all the way."
- **Serverside:** build a **native Effect + oRPC router mounted on a Bun server**,
  replacing the ~660 lines of untyped Vite middleware currently in
  `vite.config.ts`. Leverage native oRPC middleware/context and the native
  oRPC × Effect capabilities. **Research this deeply and natively FIRST**, before
  designing.
- **MANDATED bridge (user-confirmed):** use the **`effect-orpc`** library
  specifically (`utopyin/effect-orpc`, v0.2.2) — handlers written as
  `.effect(function* () {…})`, Effect error channel mapped to `ORPCError` via
  `ORPCTaggedError`, services provided from an Effect `ManagedRuntime`/`Layer`.
  It is pre-1.0 / single-maintainer: **isolate it to the `router/` layer** so the
  blast radius of a breaking change is ~30 lines of manual `Effect.runPromise`
  fallback. Verified install set: `@orpc/server@1.14.5`, `@orpc/client@1.14.5`,
  `@orpc/contract@1.14.5`, `effect-orpc@0.2.2`, `effect@3.21.3`,
  `@orpc/tanstack-query@1.14.5`, `@tanstack/react-query@5.101.0`, `zustand@5.0.14`.
- **Execution:** **fully autonomous through to a PR** (Graphite stack). No
  per-gate approval required.

## Honest correction (controls scope)

The user said "stick with oRPC and Effect serverside, we already have it."
**They are NOT in the repo** — zero `@orpc/*` or `effect` imports anywhere in
`apps/` or `packages/`. The current "server" is hand-rolled `fetch`/middleware
inside `vite.config.ts`. So **oRPC × Effect × Bun is greenfield here**, not a
constraint to preserve. The intent (typed, native oRPC×Effect server) stands; the
"already have it" premise does not.

## Frame

- **In / foregrounded:** component decomposition, state & server-data
  architecture, design-system formalization, accessibility & interaction craft,
  intentional comments/organization, end-to-end type safety.
- **Exterior (out of scope):** map-generation algorithms, Deck.gl rendering math,
  recipe semantics, game-runtime / mod behavior. The engine is correct; this is
  the shell around it.
- **Hard core (never sacrificed):** behavior parity, end-to-end type safety, no
  regression in the live-game control loop.
- **Falsifier:** if decomposition or the server migration cannot preserve
  map-gen / live-control behavior, or if "simpler" measurably degrades the
  authoring workflow, stop and re-scope.
- **Structural alternative considered & rejected:** a pure visual reskin
  (tokens + polish only) — rejected because it leaves the 3k-line state tangle,
  the actual ceiling on robustness.

## Method (civ7-systematic-workstream gates)

1. Deep oRPC × Effect × Bun + oRPC-native-TanStack research → canonical reference.
2. Current-state audit + design-system extraction + critique.
3. Target architecture spec + sliced redesign plan.
4. Implement in Graphite slices with worktree isolation.
5. Framed agent review (correctness, a11y, types, behavior parity).
6. Verify (typecheck / tests / build) + open PR.

## Status ledger

- [x] Gate 1 — Frame the workstream (this doc)
- [x] Gate 2 — Isolate repo state (branch `design/mapgen-studio-redesign`)
- [x] Gate 1-research — Deep oRPC×Effect×Bun + oRPC-TanStack reference (`research/01`, `research/02`)
- [x] Gate 3 — Diagnose / audit current state (`audit/03-06`, `system.md`)
- [x] Gate 4-7 — Corpus, target architecture, slice plan (`architecture/10`, `architecture/11`)
- [ ] Gate 8 — Implement slices (Phase A → G; see `architecture/11-slice-plan.md`)
- [ ] Gate 9-10 — Verify / runtime parity
- [ ] Gate 11 — Review wave
- [ ] Gate 12 — Close (PR)

## Execution log

- Branch: `design/mapgen-studio-redesign`. Strategy: one branch, one commit per
  slice, one PR (not a multi-branch Graphite stack — lower risk for autonomous run).
- Committed `cae889456` (planning), `5dba36d35` (A1 contracts).

## ⚠ LIVE-CONTROL SUBSTRATE CORRECTION (2026-06-08) — Phase A/B PAUSED

User correction: **no FireTuner reads — there is a better way now**, and the
redesign must consume the **actual latest live-control code**, which is **not in
this base**.

Ground truth verified:
- `packages/civ7-control-orpc` is **empty (0 ts files)** on this branch. The new
  **effect-oRPC control router + `Civ7IntelligenceBridge` ingress** (the target
  read/action substrate) lives in the **570-branch live-control stack currently
  being consolidated** — see `docs/projects/graphite-stack-integration/`
  `LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md`. It is **not settled** (local-only,
  no PRs, folding 570 → ≤50 semantic branches).
- The studio reads live state **today** via `@civ7/direct-control`
  (`apps/mapgen-studio/vite.config.ts:32`) — exactly the surface being rebuilt.
  **FireTuner is being demoted** to canary/parity/diagnostic; the in-game App-UI
  controller bridge (oRPC/Effect) becomes baseline.
- The **mapgen-studio ↔ control "Studio link" is itself being rebuilt** inside
  that stack (playbook rows 38, 42–43). So Phase A (replace the studio server)
  would collide with / be superseded by that work.

Consequences:
- **`audit/05-server-contracts.md` and `architecture/10` §1 (server) are PROVISIONAL /
  superseded** — they model the deprecated `@civ7/direct-control` surface. Re-baseline
  against the consolidated control-oRPC contracts once that stack settles.
- **A1 (`@civ7/studio-server` contracts) is provisional** — kept on this isolated
  branch for reference; will be re-derived from the settled substrate.
- Reference prior art for the target client stack (effect-oRPC + RPCLink +
  oRPC-TanStack-Query + Zustand React shell) already exists in the repo's
  **gt-stack-inspect** toolkit lane — mirror it when re-baselining (that lane is a
  separate owner and out of scope to modify).

Lane status:
- ⏸ **PAUSED (blocked on live-control settle):** Phase A (server), Phase B (data
  layer + live wiring), live-state-coupled parts of Phase D (decomposition).
- ✅ **Still valid (decoupled from live-control):** Phase C (Tailwind v4 + shadcn +
  token/theming repair) and the presentational parts of Phase E. These are
  app-local CSS + primitive components with no `@civ7/direct-control` coupling.
  Carries minor merge risk against in-flight "Studio link" branches.
- ✅ **Still-valid audits:** `audit/03` (component architecture), `audit/04`
  (design system), `audit/06` (TS rigor), `research/02` (client patterns).

## ⏸ WORKSTREAM PAUSED — resume conditions (decided 2026-06-08)

User decision: **full pause**; re-baseline source of truth = **`main`** (not the
in-flight stack). Do **not** proceed on any lane — including the decoupled design
system — until resumed.

**Resume trigger:** the consolidated control-oRPC / direct-control substrate
(effect-oRPC router + `Civ7IntelligenceBridge` ingress + rebuilt mapgen-studio
"Studio link") has **merged to `main`**. The user will signal, or I re-check `main`.

**On resume, before writing any code:**
1. `git checkout main && git pull`; rebase `design/mapgen-studio-redesign` onto it.
2. Re-audit the **settled** substrate on main: read the merged `@civ7/control-orpc`
   router + contracts, the `Civ7IntelligenceBridge` invoke surface, how Tuner is
   now scoped (canary/diagnostic), and how the studio is now wired to control.
3. **Re-baseline** `audit/05-server-contracts.md` and `architecture/10` §1 against
   those real contracts. Re-derive A1 (`@civ7/studio-server`) — the studio server
   should consume/extend the control-oRPC substrate, **not** re-implement reads and
   **not** read FireTuner.
4. Mirror the repo's existing effect-oRPC + RPCLink + oRPC-TanStack + Zustand
   pattern (gt-stack-inspect lane) for the client.
5. Then resume Phase A → G per `architecture/11-slice-plan.md`.

**Unchanged on resume (no re-audit needed):** the design-system, component-
architecture, and TS-rigor audits and the client-pattern research remain valid.

## Status ledger (ACTIVE — supersedes the paused ledger above)

Phase order per [`FRAME.md`](FRAME.md) §7 (design-system-first):

- [x] Frame, isolate, research, audit, target architecture, slice plan
- [x] Re-frame + un-pause + normative FRAME.md + goal reset (2026-06-08)
All implementation delivered as a 15-slice Graphite stack on `main` (NOT submitted).
Whole stack green: tsc + build + worker-bundle + **138/138 tests** + dark/light
live screenshots, zero console errors. Each slice = one OpenSpec change.

- [x] **P0 Seam** — `design/control-seam` (`architecture/12-control-seam.md`).
- [x] **P1 Design system** — `design/ds-foundation` (Tailwind v4 + shadcn + tokens + `.dark`).
- [x] **P4a Primitives** — `design/ui-primitives` (canonical shadcn `components/ui/*`).
- [x] **P4b Reskin** — `design/shell-reskin` (substrate-elevation chrome; felt depth).
- [x] **P3a Decompose helpers** — `design/app-decompose`.
- [x] **P5a Server (oRPC)** — `design/server-orpc`: `@civ7/studio-server` effect-orpc
  at `/rpc`, `/api` lifted verbatim (shared engine singletons), parity **verified live vs Civ7**.
- [x] **P2 Client data** — `design/client-data`: zero `/api` fetch; live poll verbatim; viewStore.
- [x] **P3b Decompose shell** — `design/app-shell`: `App.tsx` → 17-line root + shell tree.
- [x] **Test infra** — `design/test-harness-fix` (vitest `@` alias + TooltipProvider).
- [x] **P4c Craft/a11y** — `design/craft-a11y` (diagnostics in-DOM, landmarks, Select migration, type scale, empty-stage).
- [x] **P2b Data model** — `design/data-model` (oRPC-native TanStack Query reads; contract fix; persisted stores).
- [x] **P6 Rigor** — `design/rigor` (typed error accessor, dead code, comments).
- [x] **Theming finish** — `design/theming-finish` (delete `createTheme`/`lightMode`/`getFormTheme`/rjsf hex).
- [x] **A11y P2** — `design/a11y-fixes` (Radix Save menu, field-error association, slider names, skip target).
- [x] **P7 Review** — multi-lens reviewer waves each run; no open P1/P2 at tip.

**Remaining (SUPERVISED — not auto-run):**
- [x] **P5b Server cutover** — DONE (2026-06-12, user go granted; OpenSpec
  `mapgen-studio-bun-server`, slices `design/bun-server-frame` →
  `design/bun-server-engines` → `design/bun-control-fetch` →
  `design/bun-server-daemon`): standalone **Bun** daemon
  (`src/server/daemon/daemon.ts`, port 5174) owns all server state
  (extracted `createStudioEngines`) + the three oRPC mounts (`/rpc`,
  `/api/civ7/rpc` and `/api/recipe-dag/rpc` both now fetch-adapter,
  statically imported under Bun — `ssrLoadModule` gone); `bun run dev` =
  dev-live runner (daemon → healthz → Vite); `vite.config.ts` is
  frontend-only (proxy `/rpc` + `/api`); optional `--assets-root` static
  serving opens the prod story. Legacy `/api/*` REST handlers **RETIRED
  outright** per user directive 2026-06-12 ("no legacy... forward only") —
  no compat layer, unknown `/api` → 404; parity script moved to oRPC.
  Gates: studio 201, mod 471, build + worker bundle, strict OpenSpec,
  live-verified (run loop + pipeline view through the proxy).
- [ ] *(optional)* deeper `StudioShell` container/presentational panel split.

Live-control: NOT waiting for merge. Seam designed toward stack-top (FRAME §6).

## Pass 2 — design fixes (ACTIVE 2026-06-11)

User verdict on Pass 1: **not functionally complete; still "squished"**. Pass 2 is
a visually-grounded fix workstream — frame, issue→change map, and verification
contract in [`pass-2-design-fixes.md`](pass-2-design-fixes.md). Five OpenSpec
slices stacked on `design/a11y-fixes` (Graphite-only, never submitted); each slice
closes only with visual proof from the running app:

- [x] **C1** `mapgen-studio-layout-geometry` — `design/layout-geometry` (340px dock,
  content-driven header reserve, header→footer docks, scroll-edge fade)
- [x] **C2** `mapgen-studio-form-hierarchy` — `design/form-hierarchy` (foreground
  labels vs muted prose; rawErrors-gated alert regions — 40 phantom alerts → 0)
- [x] **C3** `mapgen-studio-run-console` — `design/run-console` (single Run CTA in
  the footer console; full-width Save & Deploy; "Balanced" not "Bal")
- [x] **C4** `mapgen-studio-explore-toolbar` — `design/explore-toolbar` (Render/Space
  as inset segmented controls)
- [x] **C5** `mapgen-studio-first-run-visibility` — `design/first-run-visibility`
  (diagnosis: not reproducible at tip; fit/selection fallbacks verified; rAF-starvation
  commit backstop added to vizStore)
- [x] **C6** `mapgen-studio-theme-class-sync` — `design/theme-class-sync` (found by
  the visual gate: nothing wrote `.dark` after boot; theme toggle now re-themes live)

**Pass-2 closure (2026-06-11):** all six slices implemented + visually verified on
:5173 (dark + light screenshots, DOM measurements, fresh-state first-run proof).
Gates green at tip: tsc, build + worker-bundle, 144 tests, six strict OpenSpec
validations. Review wave: no P1/P2; two P3s repaired in-stack (scroll-fade padding;
a foreign `codex/sieve-engine-reference` docs commit `gt move`d out of the stack
base). Stack remains UNSUBMITTED per the standing rule.

## Pass 3 — spacing substrate + config surface + console split (2026-06-11, evening)

Next user wave: config-panel padding/margins "really bad" (wants a ground-up
elevation/nesting pass), separate live-game vs studio-only bottom controls,
inventory + regroup the explore bottom buttons, and a new standing law: **no
hard-coded config overrides anywhere**. Frame, root-cause diagnosis, and
designs in [`pass-3-design-fixes.md`](pass-3-design-fixes.md). Five OpenSpec
slices stacked on `design/theme-class-sync`:

- [x] **D0** `mapgen-studio-spacing-substrate` — `design/spacing-substrate`
  (ROOT CAUSE: unlayered `* {margin:0;padding:0}` in index.html outranked
  Tailwind v4's `@layer utilities`, zeroing every spacing utility app-wide;
  removed. Theme bootstrap now reads `theme-preference` with useTheme's
  resolution + light pre-paint flash guard)
- [x] **D4** `mapgen-studio-no-hardcoded-defaults` — `design/no-hardcoded-defaults`
  (deleted the 330-line hand-maintained default-config duplicate the app never
  imported; shape tests retargeted at STANDARD_RECIPE_CONFIG, exposing real
  drift in the ecology stages)
- [x] **D1** `mapgen-studio-config-surface` — `design/config-surface` (nesting
  by surface elevation: recessed group wells replace border-l indent ladders,
  two-surface cap, arrays unified; FORM.rhythm 4/8/12 codified; group headings
  inverted to the eyebrow tier)
- [x] **D2** `mapgen-studio-footer-consoles` — `design/footer-consoles`
  (centered Studio console merges the two studio bars; named modular
  `GameConsole` right-docked under a Civ7 eyebrow — live chip + sync bridge,
  autoplay, Run in Game + status/retry/diagnostics, save-deploy chip; exact
  centering while space allows, yield-not-overlap verified at 1199px)
- [x] **D3** `mapgen-studio-explore-toolbar-groups` — `design/explore-toolbar-groups`
  (VIEW vs LAYER clusters by control target; debug toggle relocated to the
  Data list header it actually filters — verified filtering live)

**Pass-3 closure (2026-06-11):** all five slices implemented + visually
verified on :5173 (dark + light screenshots; DOM-computed spacing proof
px-3 ⇒ 12px; footer centering measured 860==860 @1720px; debug filter
exercised live 2→3→2). Gates green at tip: tsc, build + worker-bundle,
146 tests, five strict OpenSpec validations. Stack remains UNSUBMITTED per
the standing rule.

## Pass-4 design fixes (2026-06-11, late) — COMPLETE

User-grounded wave four (`pass-4-design-fixes.md`): game-console placement
deliberation, console icon set, and the config-collapse feature. New standing
meta-rule recorded (and saved to agent memory): user callouts are categorical
by default — sweep the class, not the instance. OpenSpec slices stacked on
`design/explore-toolbar-groups`:

- [x] **E1** `mapgen-studio-game-console-dock` — `design/game-console-dock`
  (deliberated merge-vs-colocate; chose colocation: AppHeader `gameConsole`
  slot renders the console centered beneath the world bar — vertical zoning
  top = game, bottom = studio; footer reduced to the centered Studio console;
  shared operation gating preserved; game-console tests moved to the
  component that owns the markup)
- [x] **E2** `mapgen-studio-game-console-icons` — `design/game-console-icons`
  (autoplay `FastForward`/`Square`/spinner, Run in Game
  `SquareArrowOutUpRight` — icon-only with the dynamic action labels leading
  aria-label/title/Tooltip; new disabled `Binoculars` Explore placeholder so
  the three-command set reads together)
- [x] **E3** `mapgen-studio-config-collapse` — `design/config-collapse`
  (per-object header anatomy with trailing action zone — future home of
  object-local Reset/Show-JSON; collapsed-by-default with manual expand,
  focused stage root defaults expanded; pointer-keyed state survives mode
  switches — verified live; sticky auto-expand-on-scroll toggle default OFF,
  DOM-driven engine with scroll anchoring, cascade verified live through
  nested groups. Found + documented: rjsf `deepEquals` treats functions as
  always-equal, so collapse state must cross formContext as Set DATA, not
  closures)

**Pass-4 closure (2026-06-11):** all three slices implemented + visually
verified on :5173 (dark + light; focused/unfocused collapse, persistence,
and the sticky chain walk exercised live). Gates green at tip: tsc, build +
worker-bundle, 162 tests, three strict OpenSpec validations. Stack remains
UNSUBMITTED per the standing rule.

## Pass-5 design fixes (2026-06-11, night) — COMPLETE

User-grounded wave five (`pass-5-design-fixes.md`): the Game/World toolbar
architecture v2 (user-specified, supersedes Pass-4's colocation), tile
rendering correctness, and canvas affordance honesty. New standing rule
recorded (saved to agent memory): for complex UI patterns, search existing
component libraries (shadcn/ui first) before building from scratch — without
forcing a library where the in-repo solution is better. OpenSpec slices
stacked on `design/config-collapse`:

- [x] **X1** `mapgen-studio-toolbar-architecture-v2` —
  `design/toolbar-architecture-v2` (top bar = THE Game toolbar: Gamepad2
  identity, saved-config selector, the GameConsole cluster inlined without
  panel chrome, and a trailing icon-only game-setup disclosure expanding
  Leader/Civ/Difficulty/Speed only; bottom bar = THE World/Map console:
  Globe identity, Size/Players/Resources left of Seed riding the shared
  operation gate; last-run stats compressed into a History icon whose
  tooltip + accessible name carry the run and whose click copies the seed)
- [x] **X2** `mapgen-studio-grid-icon` — `design/grid-icon` (ViewControls
  grid toggle rendered an empty `w-4 h-4` div — restored `Grid3x3`;
  categorical sweep found no other empty placeholders, inline svgs, or
  non-lucide icons; live-DOM scan confirms only the overrides Switch is
  legitimately glyph-less)
- [x] **X3** `mapgen-studio-tile-orientation` — `design/tile-orientation`
  (odd-Q tiles were drawn pointy-top on a sheared pointy-axial lattice;
  they now render flat-top on the model's CANONICAL hex space —
  `projectOddqToHexSpace`, the frame the Delaunay/world.xy layers live in —
  with the lattice's exact tiling hexagon; mesh contract: noData/non-finite
  tiles fully transparent with stroke following fill alpha, one
  `TILE_BORDER_COLOR` ink legible on white/black/graphite. Flagged
  upstream, out of scope: mapgen-core models odd-q column-offset while
  Civ7's native adjacency is pointy-top row-offset)
- [x] **X4** `mapgen-studio-flash-fix` — `design/flash-fix` (instrumented
  reloads with an earliest-inline-script sampler: the root element sat
  unstyled — transparent background, `color-scheme: normal` — until
  JS-injected CSS landed ~138ms in, so the navigation clear color was
  white; the flash guard now puts background + color-scheme on `:root` for
  both theme branches; after: dark root by the first animation frame ~8ms)
- [x] **X5** `mapgen-studio-prerun-cursor` — `design/prerun-cursor`
  (pre-run the deck controller was live but only the DOM graticule was
  visible — a grab cursor promising an invisible drag; the canvas is now
  inert with a default cursor until a manifest exists, restoring
  grab/grabbing + the controller post-run via setProps without remount)

**Pass-5 closure (2026-06-11):** all five slices implemented + verified on
:5173 (dark + light; setup disclosure, History affordance, footer
authoring, tile lattice zoom inspection, cursor states, and the flash
sampler before/after exercised live). Gates green at tip: tsc, build +
worker-bundle, 167 tests, five strict OpenSpec validations. Stack remains
UNSUBMITTED per the standing rule.

Two user-flagged follow-up slices landed the same night:

- [x] **X6** `mapgen-studio-tile-game-geometry` — `design/tile-game-geometry`
  (user flagged the vertically squished grid + clashing slate borders; the
  hex-convention audit — `research/03-hex-convention-audit.md` — proved
  with official evidence that Civ7's plot grid is pointy-top odd-R and
  mapgen-core's odd-Q is a mislabel whose lattice is not a regular tiling,
  which IS the squish; both tile spaces now render regular pointy-top
  odd-R hexes on the same world frame, and `TILE_BORDER_COLOR` is one
  graphite ink — #0d0d11 α200 — in both themes. Engine-side odd-Q→odd-R
  migration spawned as its own task, out of studio scope)
- [x] **X7** `mapgen-studio-world-console-map-params` —
  `design/world-console-map-params` (Resources leaves the footer UI — its
  select, label, and History-tooltip line — under the newly codified zone
  boundary rule: World console iff the map pipeline reads it; Players stays
  because `playerCount` feeds `PlayersLandmass1/2`. The original
  end-to-end removal was REVISED mid-flight by the user: ALL backend
  resources plumbing stays byte-identical — `WorldSettings.resources`,
  persistence, fingerprints, run requests, proof identity, and the
  worker's `StudioResourcesMode` write, the wire deliberately reserved for
  the placement stack's resources vertical; verified no reader exists on
  any branch before touching the UI)

## DAG handoff (2026-06-12) — restack + pipeline tab — COMPLETE

The recipe-DAG feature merged to main (PRs #1587–#1591) with a handoff spec
addressed to this lane
(`docs/projects/graphite-stack-integration/DAG-STUDIO-REDESIGN-HANDOFF.md`):

- [x] **Restack onto post-DAG main** (main @ 6adfc9ec3, 19 commits
  absorbed). §4 resolutions: App.tsx/AppHeader/ViewControls/layout.ts —
  this lane's versions win (old DAG chrome not ported); vite.config.ts —
  recipe-dag oRPC middleware preserved; package.json/bun.lock — dep union
  (+ `design/post-dag-restack-lockfile` reconcile). All §1 "preserve"
  items intact: `features/recipeDag/*` headless modules,
  `server/recipeDag/*`, `shared/recipeDagOrpc.ts`, mapgen-core
  `recipe-dag.ts`. Gates at tip post-restack: tsc, 192 studio tests
  (incl. 5 recipeDag suites), 103 mapgen-core, build + worker bundle.
- [x] **`mapgen-studio-dag-tab`** — `design/dag-tab-frame` (OpenSpec
  workstream: proposal/design/tasks/spec/workstream record) +
  `design/dag-tab-stage` (implementation): the DAG re-expressed as the
  **Pipeline stage view** — floating Map|Pipeline segmented switcher
  (stage-furniture rule, codified in system.md), `PipelineStage`
  token-driven chrome preserving all handoff §2.6 interaction semantics,
  pipeline console strip, TanStack Query data layer
  (`useRecipeDagQuery`), viewStore pipeline fields, Explore dock scoped to
  map view, map canvas mounted-but-invisible under the pipeline (camera +
  in-flight runs survive). `RecipeDagView.tsx` deleted; its behavioral
  pins ported to `PipelineStage.test.tsx`. Verified live dark + light:
  17-stage standard-recipe graph, selection/expansion/label focus,
  generation run completed WHILE the pipeline view was active.

## Tuner-session workstream (2026-06-12, post-P5)

- [x] **Shared tuner session (Effect)** — OpenSpec `mapgen-studio-tuner-session`,
  slices `design/tuner-session-frame` → `design/tuner-session-seam` →
  `design/tuner-effect-session` → `design/tuner-daemon-wiring`. Root cause of
  the tuner wedge (game-side fd leak from connect-per-request churn) closed:
  `Civ7DirectControlOptions.session` seam + graceful FIN close + connect-race
  dedup in `@civ7/direct-control`; `Civ7TunerSession` Effect service
  (Layer.scoped acquireRelease, backoff gate on consecutive response-timeouts,
  typed `Civ7TunerBackoffError`, health port) owns the ONE connection in the
  studio runtime; daemon injects it into the control mount, reports tuner
  health on `/healthz` (`wedgeSuspected`), and disposes the runtime on
  shutdown. Live soak: exactly 1 established tuner connection across
  sustained polling, zero leaked fds, game releases its descriptor on daemon
  stop. Run-in-game flows untouched (parity). Deferred: run-flow convergence;
  "restart Civ7" UI affordance.
- [x] **Effect-native substrate spike** — user-directed leverage question: should
  the daemon shell, devLive runner, and tuner protocol client be rebuilt on
  `@effect/platform(-bun)` primitives (HttpServer/runMain, Command,
  Socket/Stream/Deferred)? Three-investigator research wave, verified against
  published tarball source. **Verdict: REJECT all three; revisit at Effect v4
  stable** — adapters ≈ deleted code, platform-bun drags non-optional
  rpc/sql/cluster peers, platform Socket semantics mismatch the soak-verified
  FIN/reconnect invariants, effect-orpc requires its own ManagedRuntime
  regardless (no "one graph" payoff), and v4 (in beta) folds platform into
  effect core — adopting v3 platform now buys a guaranteed second migration.
  Full evidence + revisit triggers:
  `research/04-effect-native-substrate-spike.md`.

## Studio fixes wave Y (2026-06-12, user-reported)

- [x] **Y1 — "Waiting for Proof" zombie (run-in-game proof never matched).**
  Root cause: `gen:maps` runs inside turbo's CACHED `build` task and
  `SWOOPER_STUDIO_RUN_ID` was never declared in `turbo.json` — strict env
  mode stripped it / the cache replayed a bundle without it, so the deployed
  map script logged `[mapgen-proof] {"requestId":null,…}` (observed live)
  and the marker waiter could never match: every Run in Game sat the full
  90s log timeout in "Waiting for Proof" while the game reached turn green.
  Fix: `turbo.json` `build.env: ["SWOOPER_STUDIO_RUN_ID"]` (cache-correct:
  the output genuinely differs) + a post-deploy fail-fast guard
  (`mapScriptEmbedsRequestId`, code `run-request-id-not-materialized`) so a
  missing embedded id can never masquerade as a proof wait again. Verified
  live end-to-end: Run in Game → Complete, proof line carries the request id.
- [x] **Y2 — saved-config precedence affordance.** Verified the suspected
  partial overwrite is NOT real (dropdown changes merge cleanly); the real
  gap was silent drift. New categorical rule (system.md Y-wave amendment):
  drift = "re-applying the saved file would change the state"
  (`studioSetupDriftsFromSavedConfig`; governed keys + player options only);
  the header selector gets a warning ring + orange "Modified" pill, click
  re-applies the saved config. 5 new drift pins. Verified live (Speed →
  Quick → pill; click → Standard restored, pill cleared).
- [x] **Y3 — tile grid restored on every stage.** X6's constant graphite
  border ink (#0d0d11 = the page substrate) was invisible between dark fills
  at fit zoom — Huge-map tiles are a few px wide, so the tessellation
  dissolved into dots everywhere except the Delaunay mesh (its own slate
  ink), i.e. "the grid disappears for every stage besides the first". Fix:
  the one tile-border RULE — border = own fill × 0.55, opaque
  (`tileBorderColorForFill`), legible at every zoom/palette/theme. Plus:
  layer-selection default now prefers the step's tile-space GRID layer over
  first-emitted (the map studio defaults to the map). New border-rule pin;
  verified live across stages 2/10/13 (contiguous lattice at fit zoom).
  Second user report ("when I switch stages, the grid goes away") exposed
  the OTHER grid: the canvas graticule was gated on layer kind
  (points/segments only), so it vanished for tile/mesh selections — i.e. on
  most stage switches. New rule: the graticule is CANVAS substrate — once a
  manifest exists it follows the grid toggle on every stage (including
  zero-layer steps like Placement); layers may opt out via meta. Verified
  live across stages 1/2/10/13/17.
- [x] **Y4 — flat config accordion.** Stage cards retired: top-level config
  objects are full-bleed disclosure rows with hairline dividers and zero
  inter-item margin; expansion opens a recessed `surface-sunken` slab (door
  INTO the graphite); wells keep their one tier inside. Verified live, dark
  + light. system.md Y-wave amendment carries all three design rules.

## Studio fixes wave Z (2026-06-12, user-directed) — Game bar v3

Six rapid, craft-attuned toolbar changes on the Game bar (GameConsole +
AppHeader), committed as `design/z1-game-toolbar-v3`:

- **Z1a gear:** the game-setup disclosure became a `Settings` gear icon
  Button riding the CONFIG cluster (right of the selector + Modified pill,
  before the divider into the console) — the setup it opens is exactly what
  drifts a saved config. `SlidersHorizontal` + chevron retired.
- **Z1b one status:** the run-in-game phase chip + relation pill and the
  save/deploy chip left the bar; the signal chip now holds THE combined
  status (dot folds live + run + deploy; text narrates the active phase
  while one runs). Clicking the chip opens the **status hang-off** — a
  popover-tier panel under the bar with per-operation sections (Live game /
  Run in Game / Save & Deploy), request ids, errors, recovery hints, and the
  relocated secondary affordances. Popup semantics (outside-click + Escape
  dismissal) — also what prevents stacking against the setup row (the bar's
  backdrop-blur makes z-index local, so simultaneous-open had overlapped).
- **Z1c debug action:** Copy-diagnostics moved into the hang-off as the
  `Bug` ghost button (with `RotateCw` refresh beside it when retryable).
- **Z1d explore glyph:** `Binoculars` → `ScanEye` (vision/reveal, non-toy;
  `Eye` stays reserved for layer visibility).
- **Z1e autoplay glyph:** `FastForward` → composed play-in-clockwise-loop
  (small filled `Play` centered in `RotateCw`; `!` size overrides beat the
  Button's svg sizing rule). Stop remains `Square`.
- **Z1f Play CTA:** Run in Game became the bar's one filled action — label
  "Play" ("Playing..." in flight), `Rocket` glyph (launch-the-external-app
  semantics), exact Button-size parity with the World console's Run
  (verified live: both 32px, same primary fill).

Evidence: studio suite 213 passed (3 new chip/hang-off/CTA pins; existing
pins retargeted — expanded-status pins render via `defaultStatusOpen`
because static markup can't click); tsc clean; live-verified dark + light
(bar order, hang-off open/dismiss, gear↔hang-off exclusivity, CTA parity
measured via computed styles). system.md gained the Z-wave amendment
(Game bar v3 + console glyph registry v3); Pass-4 glyph registry marked
superseded.

## Restack onto post-integration main (2026-06-12, operator-mandated)

Per `docs/projects/graphite-stack-integration/STUDIO-REDESIGN-RESTACK-HANDOFF.md`
(+ DAG handoff §6): the one-time reconciliation of this 62-branch stack onto
frozen main `1db0dfc4c` (taxonomy + rivers; dag/placement were already in the
base). `gt sync --no-restack` + `gt restack --downstack` from the leaf; 8
conflict events (rerere compounded the predicted ~25–30), resolved per the
handoff's pre-decided dispositions: our decomposition won all chrome
(App.tsx, ExplorePanel, AppHeader), our `packages/studio-server` won its 8
shared files (main's `test/handler.test.ts` + `vitest.config.ts` kept and
green — the reworked handler passes them unchanged; the package regained a
`test` script so they run in gates), `civ7-direct-control/index.ts` was the
pure export union (applied clean), main's resources gitlink (`fbc38ef8`)
taken, `bun.lock` regenerated via `bun install`.

Post-restack semantic reconciliation (the real work, committed as
`design/post-main-restack-reconcile` + two mid-stack amends):

- **Engines ported to the rivers deploy** (`engines.ts`): the retired
  stdout-parsed deploy command → `buildSwooperMapsStudioDeployPlan` (Turbo
  graph, threads `SWOOPER_STUDIO_RUN_ID`) + `@civ7/plugin-mods` `deployMod`;
  deploy details follow the new `{build, targetDir, modsDir, filesCopied}`
  shape end-to-end (save/deploy client type included). The rivers
  **materialization content-marker gate** (request/config/envelope + native
  river markers proved in local AND deployed map JS before launch) is now
  enforced in our engine flow, alongside the Y1 request-id embed guard.
- **tags.ts union repaired** (amend at `design/map-stage-domains`): the
  blanket lane-wins resolution had dropped main's S5 placement effects
  (`resourcesPlanned`/`resourcesAdjusted` + owners) and kept two retired
  `PlacementOutputsV1` fields in the placement satisfier
  (floodplainsCount/snowTilesCount) — the latter made EVERY recipe run die
  with `UnsatisfiedProvidesError: effect:engine.placementApplied` (44
  failures across the mod suite). Union restored; satisfier matches main.
- **Schema-test pins** (amend at `design/no-hardcoded-defaults`):
  `defaultConfigSchema.test.ts` reverted to main's canonical version — the
  lane copy had resurrected the deliberately-dropped legacy default guards
  (handoff §1.2 forbids) and pinned pre-rivers key lists (`drainageRouting`
  missing, retired `riverProjection`/`support` groups present).
- **Stale scratch removed:** the untracked pre-restack
  `studio-current.config.json` (old-schema keys) broke `gen:maps`; deleted —
  the studio regenerates it via Save & Deploy with import-time migration.

Gates at tip (all green): mapgen-studio **223** + tsc + build/worker-bundle;
mod-swooper-maps **569/0 fail** (= handoff baseline); civ7-direct-control
**433** (427 baseline + our 6 session pins); civ7-control-orpc **345**
(= baseline; the 4 appshot failures were a stale local direct-control dist —
rebuild proved it, main-worktree control run cross-checked); mapgen-core
**103/0 fail**; studio-server **2** (main's handler pins). Deferred to the
operator: draining the stack (standing never-submit rule vs handoff step 5).

## P7 deep semantic review (2026-06-12, operator-mandated) — COMPLETE

The post-restack review-and-fix wave: a 5-lane framed subagent review
(config-precedence evidence, dead-ends, semantic-loss-vs-main,
inspector design, idiom/conformance) over everything the restack merged,
plus mid-flight operator additions. Nine slices stacked on
`design/post-main-restack-reconcile`:

- [x] **Reconcile amend — contract regressions (P1×2).** The restack had
  kept pre-rivers studio-server contracts while the ported engines emit
  rivers shapes: `mapConfigs` deploy details (nested
  `{build,targetDir,modsDir,filesCopied}`) and `runInGame` content-proof
  fields (`contentMarkerProof`/`fileContentProof` + local/deployed script
  content) restored from main, amended into the reconcile commit.
- [x] **`design/p7-config-precedence-custom` — the "big big big" item.**
  Root cause at the engine seam: `prepareCiv7SinglePlayerSetup` loads the
  saved config file FIRST then re-applies every studio key on top, so any
  unauthored studio key silently overrides the file. Selection is now
  exact-replace (`studioSetupConfigFromSavedConfigFile`, previously
  production-dead), drift is total-equality, and the selector shows
  **Custom** whenever the launched state differs from the file
  ("Re-apply" restores it). Proven live: launch payload carried EXACTLY
  the file's options (vs the prior 22-key default wall captured in the
  wild), persistence wipe included.
- [x] **`design/p7-water-proof-inspector`** — river/lake/floodplain
  inspector summary surfaced in the Explore dock with layer-jump chips —
  superseded in-stack by `design/p7-water-stats` after operator review.
- [x] **`design/p7-explore-wiring`** — the Explore button wired for real:
  the mounted control-oRPC router reached through the typed
  `LiveControlPort.display.explore` seam (the gap was client-side only);
  three-state affordance + result toasts; live-proven (full-map reveal).
- [x] **`design/p7-idiom-jsdoc-polish`** — naming/JSDoc pass over the
  restacked surface (why-comments on the precedence seam, port taxonomy,
  setup-config type).
- [x] **`design/p7-responsive-status-chip`** — turn/seed chip drops the
  seed suffix under a Tailwind v4 container query when the bar narrows.
- [x] **`design/p7-flat-config-explorer`** — config objects flattened
  into a flush nested disclosure explorer: wells retired, scalar runs and
  section rows divided by hairlines, depth read via compounding `pl-3`
  indent + heading tiers; array items as hairline rows.
- [x] **`design/p7-orpc-native-errors` — categorical wrapper kill.**
  Operator directive: any error mapping/extraction around oRPC is an
  architectural flaw. Investigation (native docs + effect-orpc source)
  then migration: per-procedure `.errors()` maps pin the legacy
  non-uniform statuses on DECLARED codes; the host context maps engine
  `RunInGameHttpError`s to matching raw `ORPCError`s that arrive as
  DEFINED errors; clients read `safe()` + `isDefinedError()` and branch
  on codes. Deleted outright: `orpcError`/`statusToCode`/
  `rethrowEngineError`/`orpcFailure`/`runInGameFailure`/
  `saveDeployFailure`/`readErrorData`/`StudioServerOrpcFailure`/
  `recipeDagSafeErrorMiddleware`. **Deferred follow-up:** migrate the
  ~18 engine `RunInGameHttpError` throw sites to contract errors so the
  host mapping shim can die too.
  **D12 status:** that deferred follow-up is closed by the runtime Effect
  refactor stack: D3 introduced package-owned typed runtime failures, D4/D5
  moved lifecycle/workflow ownership into package services, and D12's residue
  scan treats remaining `RunInGameHttpError` mentions here as historical
  redesign evidence rather than active implementation authority.
- [x] **`design/p7-water-stats`** — operator verdict on the proof UI:
  "slop". Re-expressed as a stats section: semantic counts per data
  family, divergence (mismatch/reject) warning-tinted, collapsed summary
  "matches baseline"/"N mismatched"; proof vocabulary BANNED from product
  chrome (system.md amendment) — claim semantics stay in the
  riverLakeInspector module.

Dead-ends sweep closed: Explore wired, the dead selection helper now the
production path, all legacy error wrappers deleted; no dead routes — the
control-oRPC mount serves canonical procedures only.

Gates at tip (all green): mapgen-studio **239/50** (canonical
`bun run test`) + tsc + build; studio-server build/check/**5** tests;
mod-swooper-maps **569**; direct-control **433**; control-orpc **345**;
mapgen-core **103**. Live proofs: config-precedence launch payload,
Explore reveal, water stats over a real run (surfaced a genuine
32-intent vs 31-engine lake delta at a glance).

Submission: operator LIFTED the never-submit rule for this phase —
`gt submit --stack --ai` + merge drain per the repo-local
graphite-stack-drain skill.
