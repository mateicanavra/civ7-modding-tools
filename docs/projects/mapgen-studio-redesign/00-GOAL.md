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
- Next: Phase A (server `@civ7/studio-server`).
