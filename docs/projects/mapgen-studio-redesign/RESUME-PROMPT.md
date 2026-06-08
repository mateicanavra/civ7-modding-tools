# Resume Prompt — MapGen Studio Redesign (post live-control merge, post-compaction)

> Hand the block below back to the agent once the consolidated control-oRPC work
> has merged to `main`. It is self-contained and assumes zero memory of the prior
> session. (Mirror copy of this lives in git; the agent should still re-read the
> linked docs as the source of truth.)

---

You are resuming a **paused, already-framed workstream**: the MapGen Studio
redesign. You have **no memory** of the prior session — everything you need is in
the repo. **Do not write any code until you have re-grounded and re-baselined.**

**One-line intent:** Rebuild `apps/mapgen-studio` into a top-1%, data-driven
React 19 app — decomposed architecture, real state/server-data boundaries, full
canonical shadcn + Tailwind v4, end-to-end types — **without changing** map-gen,
Deck.gl, recipe, or live-game behavior. **Behavior parity is hard core.** We
paused because the live-control substrate the new server must consume was
mid-consolidation; you are resuming because it has now merged to `main`.

**STEP 0 — Read first (durable source of truth; trust these over any summary):**
- `docs/projects/mapgen-studio-redesign/00-GOAL.md` — frame, confirmed decisions,
  the live-control correction, and the exact resume checklist. **Read fully.**
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` and
  `11-slice-plan.md`.
- Still valid: `audit/03` (components), `audit/04` (design system), `audit/06`
  (TS rigor), `research/01` (oRPC×Effect×Bun), `research/02` (oRPC-TanStack+Zustand),
  `apps/mapgen-studio/system.md`.
- **Provisional / re-derive:** `audit/05-server-contracts.md` and `architecture/10` §1.

**Confirmed decisions (do NOT re-litigate — the user already chose these):**
- Server: native **effect-oRPC** router on a **Bun** server. The `effect-orpc`
  library (utopyin/effect-orpc) is **mandated**; isolate it to the router layer.
- The studio server must **consume/extend the now-merged `@civ7/control-orpc`
  substrate** (Civ7IntelligenceBridge ingress). **No FireTuner reads. Do not
  re-implement live reads.** FireTuner is canary/diagnostic only.
- Client: oRPC's **native TanStack Query** integration (use the generated query
  utils directly) + **Zustand** for UI state. Mirror the repo's existing
  **gt-stack-inspect** pattern (effect-oRPC + RPCLink + oRPC-TanStack + Zustand).
- Design system: **full canonical shadcn/ui** (Radix, `components.json`) +
  **Tailwind v4**. Fix the broken theming (`createTheme`/`lightMode`); one
  committed accent; HSL tokens.
- Execution: **fully autonomous to a single PR**. One branch
  `design/mapgen-studio-redesign`, one commit per slice. Use a **team of agents**
  per the `civ7-systematic-workstream` method.

**STEP 1 — Realign (before any code):**
1. `git checkout main && git pull`; checkout `design/mapgen-studio-redesign`;
   rebase it onto `main`.
2. **Guard:** if `packages/civ7-control-orpc` is still empty / the consolidated
   substrate is NOT actually on `main`, **STOP and tell the user** — the resume
   trigger has not fired.
3. Re-audit the **settled** substrate on `main` (use research/audit agents): the
   merged `@civ7/control-orpc` router + contracts, the `Civ7IntelligenceBridge`
   invoke surface, how FireTuner is now scoped, and how mapgen-studio is now wired
   to control (the rebuilt "Studio link").
4. **Re-baseline** `audit/05` and `architecture/10` §1 against the real contracts.
   Re-derive the A1 `@civ7/studio-server` contracts to **consume** control-oRPC
   (not `@civ7/direct-control`, not FireTuner). Update `00-GOAL.md` status ledger.
5. Re-confirm the do-not-break parity registry (`architecture/10` §7) against the
   new substrate.

**STEP 2 — Implement (Phase A→G of `11-slice-plan.md`), fully autonomous:**
A server (effect-oRPC on Bun, consuming control-oRPC) → B client data layer
(oRPC-native TanStack + Zustand) → C design-system foundation (Tailwind v4 +
shadcn + tokens) → D decompose the 3,010-line `App.tsx` → E primitives→Radix
shadcn + new components + rjsf re-skin + craft → F TS-rigor flags
(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`)
+ dead code + intentional comments → G verify + agent review wave + open PR.

**Hard core (never sacrifice):** behavior parity for map-gen, Deck.gl, recipes,
and the live-control loop; end-to-end type safety.
**Falsifier:** if decomposition or the server migration cannot preserve those
behaviors, or "simpler" measurably degrades the authoring workflow — **stop,
re-scope, and tell the user.**

**Verify** each slice (`tsc --noEmit` clean + app builds) and at the end (tests +
parity checks on the live-control loop and run-in-game). Commit per slice. Open
**one** PR linking the workstream docs. Track phases with a task list.

---
