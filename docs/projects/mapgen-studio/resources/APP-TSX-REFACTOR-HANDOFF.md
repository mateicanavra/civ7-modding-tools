# MapGen Studio — `App.tsx` refactor implementer handoff

You are implementing a **move-by-extraction refactor** of `apps/mapgen-studio/src/App.tsx` into a modern, modular React + TypeScript architecture **without changing behavior**.

This is not a redesign. Your job is to **carve the monolith into feature modules** while preserving determinism, bundling constraints, and UX invariants.

---

## Work context (do not deviate)

- Worktree (cd here; verify with `pwd -P`):
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-spike-mapgen-studio-arch`
- Starting branch (verify with `git branch --show-current`):
  - `spike/mapgenstudioarch`
- You will create **a new Graphite branch on top of the current stack for each slice** (RFX-01..RFX-05).

Constraints:
- Investigation is done; this phase is **implementation**.
- Keep changes **acyclic** (no import cycles) and **browser-safe** (worker bundle guardrails).
- Avoid “nice to have” cleanups that add risk (formatting churn, big renames, etc.).

---

## Source of truth docs (read first; follow exactly)

- Executable slice plan (acceptance criteria + binding APIs):
  - `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`
- High-level architecture + rationale:
  - `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md`
- Seam navigation (what to extract, in order):
  - `docs/projects/mapgen-studio/resources/APP-TSX-SEAMS-MAP.md`
- Seam details (read the relevant seam when implementing its slice):
  - `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` (directional; do not over-scope)

---

## Non-negotiables (“don’t break these”)

### Build / bundling
- `bunx turbo run build --filter=mapgen-studio` stays green after every slice (includes worker bundle checks).
- Worker-side code (`apps/mapgen-studio/src/browser-runner/*`) must remain browser-safe (no Node-only imports).
- No import cycles across `src/app`, `src/features`, `src/shared`, `src/browser-runner`.

### Determinism / authority
- Worker remains the authority for merge/validation; UI may pre-validate but must not silently change semantics.
- Seed + config → deterministic outputs unchanged.

### UX invariants
- Rerun retains selected step + selected layer.
- Seed reroll auto-runs and preserves retention behavior.
- Cancel semantics remain “hard terminate” (`worker.terminate()`), unless explicitly changed later.
- Config overrides UX:
  - schema form primary; JSON editor fallback/advanced
  - presentation-only wrapper collapsing stays presentation-only; top-level stage container remains visible/collapsible
- Layer picker / legend UX (current direction):
  - layer labels derive from `VizLayerMeta` (`layer.meta?.label ?? layer.layerId`)
  - `layer.meta?.visibility === "debug"` is surfaced in labeling (suffix `", debug"`)
  - `layer.meta?.categories` drives categorical legend + colors when present; otherwise use fallback heuristics

---

## How to execute (Graphite + incremental validation)

### Branching discipline

For each slice in `APP-TSX-REFACTOR-EXECUTION.md`:
- Create a new branch on top of the current tip (do not restack/reparent other branches).
- Land a focused commit for that slice.
- Verify build + smoke.
- Move to the next slice on top of it.

Suggested commands (adapt to your workflow):
- `gt ls`
- `gt create -am "refactor(mapgen-studio): RFX-01 config overrides extraction" rfx-01-config-overrides`
- `bunx turbo run build --filter=mapgen-studio`
- `bun run dev:mapgen-studio` (manual smoke per slice checklist)

### Definition of done
- `App.tsx` shrinks to composition/orchestration (target ~250–450 LOC).
- Seams extracted to the target feature layout (`src/features/*`, `src/app/*`, `src/shared/*`) as defined by the execution doc.
- Every slice meets its acceptance criteria and passes `bunx turbo run build --filter=mapgen-studio`.

---

## Scope guardrails (avoid accidental overreach)

- Do not “fix” recipe typing in protocol as part of this refactor (direction exists, but it is out of scope unless explicitly required by moves).
- Do not introduce a router/global store unless the execution doc says to.
- Keep refactor “move-only” unless you find a real behavior bug; if you do, isolate the fix into the smallest possible commit and call it out in the PR description.
