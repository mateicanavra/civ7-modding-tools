# MapGen Studio Redesign — Normative Operational Frame

> **What this is.** The durable, compaction-surviving operating frame for this
> workstream. It is the lens, not the task list. Read it first on every resume.
> It names the objective, what is in/out, what may never break, what would force
> a reframe, and the guardrails the user set. Concrete code, paths, branches, and
> skills are *referenced*, not inlined — follow the reference when you need the
> detail.
>
> **Authority order when sources disagree:** this FRAME (intent + guardrails) →
> [`00-GOAL.md`](00-GOAL.md) (active goal + status ledger) →
> [`architecture/10-target-architecture.md`](architecture/10-target-architecture.md)
> + [`architecture/11-slice-plan.md`](architecture/11-slice-plan.md) (how) → the
> audits/research (`audit/*`, `research/*`). Any prior "PAUSED / wait-for-merge"
> language is **superseded** by the Operating Model below.

---

## 1. Objective (framed)

Transform `apps/mapgen-studio` from a 3,010-line god-component into a **top-1%,
data-driven** React 19 application — decomposed architecture, real
state/server-data boundaries, a **first-class design system**, accessibility and
interaction craft, and intentional comments/organization — **without changing**
map-generation, Deck.gl rendering, recipe semantics, or live-game runtime
behavior. The work is delivered as a **Graphite stack of OpenSpec-backed slices**
that is **never submitted**, each slice a domino that makes the next easier.

"Data-driven, not commodity content-driven" is the quality bar: structure,
tokens, contracts, and types carry the interface — not bespoke one-off markup.

## 2. Selection & salience (the frame proper)

- **In / foregrounded:** component decomposition; client state + server-data
  architecture; **design-system formalization (the first domino)**; accessibility
  and interaction craft; intentional comments/organization; end-to-end type
  safety; the *interface seam* to live-control.
- **Exterior (deliberately out — not absent, constructed-out):** map-generation
  algorithms, Deck.gl math, recipe semantics, game-runtime/mod behavior, **and
  the implementation of the live-control substrate itself** (owned by the
  `codex/*` live-control stack — we design *toward* it, we do not build it).
- **Structural alternative considered & rejected:** a pure visual reskin
  (tokens + polish, leave the state tangle). Rejected — the 3k-line state tangle
  is the actual ceiling on robustness, and a reskin cannot lift it.

## 3. Hard core · protective belt · falsifier

- **Hard core (never sacrificed):** behavior parity for map-gen, Deck.gl,
  recipes, and the live-control loop; end-to-end type safety; the design system,
  once established, is the single source of UI truth (no parallel ad-hoc styling).
- **Protective belt (negotiable under pressure):** exact file/module layout,
  slice ordering within a phase, which shadcn components ship in which slice,
  whether the server cutover lands now or is staged behind the live-control seam.
- **Falsifier (forces a reframe — STOP and tell the user):** if decomposition or
  the server migration cannot preserve the hard-core behaviors; if "simpler"
  measurably degrades the authoring workflow; or if the live-control seam we
  design toward turns out to be incompatible with what lands in `main`.

## 4. Operating model & guardrails (user-set, normative)

These are the standing constraints. Violating one is a defect, not a tradeoff.

1. **Graphite-first, never submit.** All branch/stack/PR-shaped git actions go
   through `gt` (skill: `graphite`). Build the work as a **stack of slices**,
   one logical change per branch, bottom-up. **Do not `gt submit`** — not the
   stack, not a branch. The deliverable is a *local* stack the user reviews and
   ships themselves. Use `gt sync --no-restack` + `gt restack --upstack` (shared
   metadata; this repo runs many parallel `codex/*` worktrees — never global
   restack by accident).
2. **Design system first, then everything downstream uses it.** The first real
   work is building the design system via the `design:*` command chain
   (`design:init` → `design:extract`/`design:audit`/`design:critique`/
   `design:status`; `design:init` reads the `ui-design` skill and writes a
   `system.md`). Every later component slice consumes that system; none predates
   it. This re-orders the slice plan: **design-system foundation precedes server
   and decomposition work.**
3. **OpenSpec-backed changesets.** Every logically-grouped change is recorded as
   an OpenSpec change under `openspec/changes/<change-id>/` (CLI:
   `bun run openspec -- …`; skill: `civ7-open-spec-workstream`). One OpenSpec
   change ↔ one Graphite slice ↔ one coherent domino. Validate before stacking.
4. **Do NOT wait for the live-control stack to merge.** The studio-relevant
   substrate is mostly already in `main`; the rest is mid-consolidation in the
   `codex/*` stack (see [the consolidation playbook](../graphite-stack-integration/LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md)).
   That stack is *restacking to catch up to code already on main / our stack* — we
   are partially ahead. So we work off `main` now and treat live-control as a
   **coordinated peer team**: inspect the **top of the live-control stack**,
   design the exact interfaces / flows / boundaries / domain organization the
   studio needs, and plan toward that eventual integration — without building or
   blocking on it. See §6.
5. **No FireTuner reads.** Live state is consumed through the control-oRPC /
   intelligence-bridge seam, never FireTuner (canary/diagnostic only). When the
   real surface isn't on `main` yet, design against the stack-top contract and
   stage behind the seam.
6. **Fully autonomous to a built (unsubmitted) stack.** No per-gate approval.
   The one genuine taste fork — design *direction* — is confirmed once at
   `design:init` per that command's own protocol; everything else proceeds.

## 5. Skills & mechanisms (reference, load on demand)

| Concern | Mechanism / skill | Where |
| --- | --- | --- |
| Frame & objective | `framing-design`, `create-goal` | cognition skills (paths in chat) |
| Systematic method (12 gates) | `civ7-systematic-workstream` | `.agents/skills/` |
| Changeset phases | `civ7-open-spec-workstream` + OpenSpec CLI | `.agents/skills/`, `openspec/` |
| Graphite discipline | `graphite` | plugin skill |
| Design system | `design:init/extract/audit/critique/status` + `ui-design` | `design` plugin (commands) |
| Component/composition craft | `vercel-react-best-practices`, `vercel-composition-patterns`, `ui-design` | referenced skills |
| Type rigor | `typescript` | referenced skill |
| Multi-agent team | `team-design` | referenced skill |
| Read-only setup introspection | `introspect` | `meta` plugin skill |

## 6. Live-control integration seam (peer-team coordination)

The studio is the "frontend"; the `codex/*` live-control stack is the "backend."
They must meet at a designed seam, not by accident.

- **Ground truth today:** `packages/civ7-control-orpc` is an **empty placeholder**
  on this branch and **absent from `main`**; the studio reads live state via
  `@civ7/direct-control` (`apps/mapgen-studio/vite.config.ts`). The consolidated
  effect-oRPC control router + intelligence-bridge ingress, and the rebuilt
  mapgen-studio "Studio link", live in the live-control stack (playbook rows for
  the Studio link).
- **Obligation:** before designing the studio's server/data seam, **inspect the
  top of the live-control stack** (the `codex/*` control-oRPC branches; identify
  the tip from the consolidation playbook) and capture the *target* control-oRPC
  contract surface the studio will consume. Record it as the re-baseline of
  [`audit/05`](audit/05-server-contracts.md) and §1 of
  [`architecture/10`](architecture/10-target-architecture.md), explicitly marked
  "designed-toward stack-top, not yet on main."
- **Posture:** design the exact interfaces/flows/boundaries/domain organization
  for that integration; build the decoupled studio shell, design system, state,
  and decomposition now; keep the live-state consumption behind a thin seam that
  can bind to the real control-oRPC client when it lands. Never re-implement live
  reads; never read FireTuner.

## 7. Revised phase order (supersedes slice-plan sequencing)

Design-system-first re-orders [`architecture/11-slice-plan.md`](architecture/11-slice-plan.md).
Canonical order for this workstream:

1. **Design system** (was Phase C) — `design:*` chain → tokens, theming repair,
   shadcn + Tailwind v4 foundation, documented `system.md`. **First domino.**
2. **Client data layer** (Phase B) — oRPC-native TanStack Query + Zustand, with
   live consumption behind the live-control seam (§6).
3. **Component decomposition** (Phase D) — un-god `App.tsx` onto the design system.
4. **Primitives → shadcn + new components + rjsf re-skin + craft** (Phase E).
5. **Server** (Phase A) — effect-oRPC on Bun, consuming/aligned to control-oRPC;
   staged with respect to the live-control seam, not blocking the UI work.
6. **Rigor + cleanup** (Phase F) — strict tsconfig flags, dead code, comments.
7. **Verify + review wave** (Phase G) — but **close by handing the user a built,
   unsubmitted Graphite stack**, not by submitting a PR.

Each step: OpenSpec change → Graphite slice → `tsc --noEmit` clean + builds +
parity on touched surfaces → stack, **do not submit**.

## 8. Status anchor

- Branch base: `design/mapgen-studio-redesign` (planning/frame base), stacked on
  `main`. Implementation slices stack on top.
- This frame **un-pauses** the workstream under the Operating Model above. The
  old "full pause until control-oRPC merges to main" resume condition is retired;
  the live-control seam (§6) replaces it.
- Live status + closure tracking: [`00-GOAL.md`](00-GOAL.md) § status ledger.
