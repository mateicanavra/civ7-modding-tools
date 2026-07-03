> **HISTORICAL — retired app-hosted/package-shape pipeline (pre-extraction, superseded at B7 2026-07-02). Kept for the record; NOT a runbook.**

# Frame — Complete the MapGen Studio design-sync surface

> Standalone frame (framing-design). Object: **solution reframe**. Durability: **standalone** — must survive compaction/handoff. Carries WHAT + WHY + hard core + falsifier + scope + assumptions; **not** HOW (the HOW lives in the continuation snippet + `NOTES.md`).
>
> Status: committed lens for the final design-sync work stream. Stack tip at authoring: `mapgen-studio-ds-consolidation` (#1958), design system `531d158d` = 45 components.

## Reframe diagnostic (what the prior frame got wrong)

- **Prior frame:** "Checkpoint B = build the Config Authoring panel as an editable claude.ai/design PROJECT — a different, product-surface workflow."
- **What failed:** it treated a Batch-1/2-era **deferral note** ("SchemaConfigForm only makes sense against a real schema → demonstrate via a project, not the system") as a hard requirement for an external surface. Two facts dissolve it:
  1. The Config Authoring panel **already exists as working app code** — `RecipePanel` → `SchemaConfigForm` → `BrowserConfig*` templates → rjsf widgets → `FieldRow` (`RecipePanel.tsx:442`). Nothing needs creating.
  2. The **fixture-driven sync pattern is already proven** — Batch 3 `PipelineStage` ships against a static `RecipeDagResult`; Batch 2 widgets/templates against runtime mocks. So "needs a real schema" is satisfiable in-repo.
- **Named move: constraint relaxation.** The "must be a design project" constraint was self-imposed; relaxing it collapses "Checkpoint B" into one ordinary sync batch.

## WHAT — selection + salience

- **In scope:** sync `SchemaConfigForm` (the config-authoring engine) — and `SchemaForm` (the recursive rjsf renderer) **if it renders cleanly** — into the design system as fixture-driven cards (**Batch 5**); then a **close-out** that declares the syncable surface complete.
- **Foreground:** faithful composition (the engine driving the already-synced Batch-2 widgets/templates against a genuine schema + config); **zero-regression to the existing 45**; the proven re-sync pipeline + invariants.
- **Exterior** (deliberately out — constructed, not absent):
  - the editable claude.ai/design **project** (CLI-unreachable; `StudioShell` is *its* reference, not a system card);
  - the runtime/logic **drops** — `DeckCanvas` (WebGL), `CanvasStage` host, `StudioProviders` (context tree), `StudioShell` (pulls deck.gl + server), hooks/stores/constants;
  - any **net-new app components** — this is sync-of-existing, not feature work.

## WHY

Batch 2 synced the rjsf *parts* (widgets + templates) but explicitly withheld the *engine* that composes them — the system shows the parts, not the working whole. Batch 5 closes that gap so the design agent can compose a real config-authoring form from the customer's actual components. Completing the surface (and declaring done) prevents open-ended "more batches" drift.

## Hard core (non-negotiable)

- Every existing component stays **byte-identical render** — the resync `changed:[]` verdict is the parity gate.
- Atomic upload; deletes **only** from `upload.deletePaths`; never touch the user's `explorations/` design.
- Never commit `.civ7/outputs/resources`.
- Forward sync only: the repo is the source of truth; the design system is the mirror.

## Protective belt (adjustable)

- Whether `SchemaForm` ships as its own card vs. `SchemaConfigForm`-only — decided by render-check fidelity.
- Fixture choice: the **real published mapgen config schema** vs. a representative subset (RecipePanel's existing `RJSFSchema` mock) — pick the most faithful that renders cleanly.
- Group (`configoverrides`, path-derived) + `cardMode`.

## Assumptions committed

- `SchemaConfigForm`/`SchemaForm` bundle cleanly (rjsf `@rjsf/core` + ajv8 already in the Batch-2 bundle).
- The investigation's "drops" classification holds — these two are the **last** syncable presentational surface.
- The fixture renders the form faithfully in the headless capture (no live server needed).

## Falsifier (forces re-frame)

- If `SchemaConfigForm` **cannot render faithfully from a static fixture** in the headless capture (hard-requires live oRPC/server data, or ajv8 mis-bundles) → "sync the engine as a system card" is the wrong frame: fall back to demonstrating it **only** via the (exterior) design project, and the deferral note was right.
- If the surface scan is wrong and meaningful presentational components remain beyond `SchemaConfigForm`/`SchemaForm` → "Batch 5 = last" is false: re-scope.

## Structural alternative (considered, not taken)

Frame the remaining work as "build the editable claude.ai/design project" (different unit of analysis: a product artifact, not a repo sync). **Rejected** — CLI-unreachable, the panel already exists, and it leaves the syncable surface incomplete while chasing an activity the user can do anytime. Kept as the **exterior follow-up**, not the core.

## Scope

One sync batch (**Batch 5**) + a **close-out** pass; stacked on `mapgen-studio-ds-consolidation` (#1958). **Not** the editable design project (separate, optional, product-surface).

---

## Outcome (2026-06-28) — FRAME HELD, SHIPPED

- **Falsifier resolved in the frame's favor.** `SchemaConfigForm`/`SchemaForm` are pure prop-driven (`schema` + `value`, no oRPC/server/stores — `RecipePanel` itself receives `configSchema` as a plain prop). The empirical tail (does `@rjsf/core` + ajv8 bundle + render headless?) **passed**: the engine rendered clean from a static fixture, `pageErrs:[]`.
- **Shipped Batch 5 (→46).** `SchemaConfigForm` synced as a fixture-driven card; render check **46/0/0/0**, the 45 existing `changed:[]` (parity held), `deletePaths:[]` (explorations preserved). `SchemaForm` kept as an internal bridge (protective-belt decision: a standalone card would be synthetic).
- **Surface declared complete.** The exterior (editable design project + runtime/logic drops) was correctly left out. Details in `NOTES.md` (Batch 5 + "SURFACE COMPLETE").

---

*Skills used: framing-design (solution reframe, standalone), solution-design (axis placement: tame-with-one-wicked-input / smooth / single-layer / optimize-within / reversible / rich-prior).*
