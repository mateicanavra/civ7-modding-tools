# MapGen Studio Redesign — Active Goal & Frame

> Controlling scope for the systematic workstream. This is the closure test:
> work is done when this objective is met and its falsifier has not fired.

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

## Status ledger (paused)

- [x] Frame, isolate, research, audit, target architecture, slice plan
- [x] A1 — `@civ7/studio-server` contracts (PROVISIONAL — re-derive on resume)
- [⏸] Everything downstream — blocked until control-oRPC lands on `main`
