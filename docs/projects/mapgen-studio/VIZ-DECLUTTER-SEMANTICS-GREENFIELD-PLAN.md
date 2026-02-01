# MapGen Studio Viz v1 — Declutter + Semantics + Domain Greenfield Redesign (Executable Plan)

This is an **execution-grade** plan to:
1) remove UI/semantic confusion (especially around “projection”)
2) declutter the visualization surface area without losing depth
3) redesign MapGen visualizations per domain, **from first principles**, using the Viz SDK v1 contract

This plan assumes:
- Viz SDK v1 is the only supported contract (no legacy).
- We are the only consumers; we can be strict and delete old semantics instead of shimming.

Primary contract reference:
- `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

---

## Path roots (reference once)

```text
$APP = apps/mapgen-studio
$WORKER = $APP/src/browser-runner
$VIZ_FEATURE = $APP/src/features/viz
$VIZ_UI = $APP/src/ui/components/ExplorePanel.tsx

$MOD = mods/mod-swooper-maps
$PIPELINE = $MOD/src/recipes/standard/stages
```

---

## 0) Problem statement (why this plan exists)

### Symptoms (current state)
- UI uses “projection” to mean multiple different things (space vs render intent), leading to duplicated controls and confusion.
- Some steps (notably tectonics) emit a very large number of layers by default, drowning signal in noise.
- Variants are present as a UI concept but not consistently used as the *semantic slice* axis across producers.
- Our best capabilities (multi-space expressions, fields, vector semantics) aren’t systematically expressed across domains/stages; they appear as isolated wins rather than a coherent system.

### Target outcome (what “good” looks like)
- The UI has **one** language:
  - “Space” = coordinate space (`spaceId`)
  - “Render” = geometry carrier + render intent (`kind[:role]`)
  - “Variant” = semantic slice (`variantKey`)
- Each step has a **maximally minimal default** visualization set:
  - a small number of layers that tell the truth of the step
  - everything else is explicitly `debug` (and hidden by default)
- Each domain has a greenfield design pass that produces:
  - a concrete viz spec per stage/step
  - an implementation in the pipeline emissions
  - tests + doc updates
- “Multiple expressions” exist where meaningful (space/kind), not everywhere by default.

---

## 1) Canonical semantics (v1 vocabulary)

These are the only concepts the system should use end-to-end.

### 1.1 `dataTypeKey` — “What”
- A stable semantic identity for the underlying data product.
- Example: `foundation.tectonics.boundaryType`, `hydrology.wind.wind`, `morphology.routing.flow`.
- **Rule:** never encode era/season/snapshot into `dataTypeKey`. That belongs in `variantKey`.

### 1.2 `spaceId` — “Where” (UI name: **Space**)
- A stable identity for the coordinate space.
- Examples: `tile.hexOddR`, `world.xy`, `mesh.world`.
- **Rule:** UI must not call this “projection”. Call it **Space**.

### 1.3 `kind` + `meta.role` — “How it’s drawn” (UI name: **Render**)
- `kind` is the geometry carrier: `grid`, `points`, `segments`, `gridFields`.
- `meta.role` is the render intent within that kind (e.g. `magnitude`, `arrows`, `centroids`, `edges`).
- Combined identifier is `kind[:role]`.
- **Rule:** UI icons (or toggles) represent Render; do not overload them as “projection”.

### 1.4 `variantKey` — “Which slice” (UI name: **Variant**)
- Optional semantic slice axis for a single `dataTypeKey` in a single `spaceId` and `kind[:role]`.
- Examples:
  - `season:0..3`
  - `era:2`
  - `snapshot:latest`
- **Rule:** variants are for meaning (slice), not styling.

### 1.5 `meta.visibility` — “Default vs deep debug”
- `default`: intended to be shown by default.
- `debug`: valuable, but off-by-default.
- `hidden`: not shown unless explicitly requested (rare).
- **Rule:** every step should have a small `default` set; depth lives in `debug`.

---

## 2) UI contract (declutter + semantics)

### 2.1 UI control model (single mental model)

The Explore panel selection model must be:

```text
Step → Group → Data type → Space → Render → Variant
```

- “Group” is `layer.meta?.group` (collapsible).
- “Data type” is `dataTypeKey`.
- “Space” is `spaceId`.
- “Render” is `kind[:role]`.
- “Variant” is `variantKey`.

### 2.2 Remove duplicate “projection” affordances

We intentionally want icon-based selection for primary axes, but we must avoid two different representations of the same axis.

**Policy:**
- Render stays as icon toggles.
- Space becomes icon toggles (with an overflow dropdown only if the set becomes large).
- Variant is hidden if singleton; shown as a dropdown when multiple exist.

### 2.3 Variant UX rules (avoid meaningless dropdowns)

Variant is a semantic slice. Therefore:
- Hide variant control entirely when `variantOptions.length <= 1`.
- When shown, label variants conservatively:
  - If `variantKey` matches `dim:value`, display `dim · value`.
  - Otherwise display the raw `variantKey`.
- Never invent semantic labels the producer didn’t provide.

---

## 3) Producer semantics policy (declutter at the source)

### 3.1 Stop “dataTypeKey explosions”

**Anti-pattern:** encoding snapshot/era into `dataTypeKey` (leads to 30+ “different” data products).

**Target pattern:**
- Keep one `dataTypeKey`.
- Use `variantKey` to represent the slice.
- Move everything except the essential “truth layers” to `meta.visibility: "debug"`.

**Example (tectonics):**
- `foundation.tectonics.boundaryType` (default)
  - variants: `snapshot:latest` (default), `era:0..N` (debug)
- `foundation.tectonics.segmentRegime` (debug unless it’s essential)

### 3.2 Default set doctrine (“maximally minimal”)

For each step:
- Choose **3–7** default layers that answer:
  - What changed?
  - Where are the boundaries / forces / constraints?
  - What is the output artifact “shape”?
- Everything else:
  - becomes `debug`, or
  - is deleted if redundant/noisy

### 3.3 Multi-expression doctrine (“multiple spaces/kinds where meaningful”)

For important products, prefer **two meaningful expressions** over ten shallow ones.

Examples:
- A vector field as:
  - `gridFields` in tile space (magnitude + arrows), and
  - sampled `points` in world space (centroid visualization)
- A segmentation as:
  - `segments` in world space, and
  - `grid` membership map in tile space (if tile mapping exists and is meaningful)

**Rule:** only add an alternate expression when it changes what the developer can learn.

---

## 4) Execution plan (sliceable, parallelizable, verifiable)

### Phase A — Declutter + semantics remediation (integrator-owned)

Goal: make the UI and producer semantics *ready* for greenfield redesign work.

#### Slice A1 — UI semantics cleanup (Space/Render/Variant)
- Rename UI language (“projection” → Space, etc).
- Space selection: icon toggles (dropdown only as overflow).
- Variant control: hidden when singleton; conservative labeling.
- Group-first navigation: collapsible groups by `meta.group`.
- Add a “Show debug layers” toggle; default OFF.

#### Slice A2 — Producer declutter policies (starting with tectonics)
- Convert tectonics “era/snapshot explosion” into `variantKey` + `debug`.
- Ensure each step has a minimal default set.
- Add/adjust pipeline tests to prevent regressions in “default layer count” for key steps.

**Phase A acceptance criteria**
- UI has one concept per control (no duplicate “projection” representations).
- Default Explore list is readable without scrolling through dozens of tectonics internals.
- “Show debug layers” reveals depth without polluting defaults.

---

### Phase B — Domain greenfield redesign (parallel agents; each owns domain + all its stages)

Goal: treat each domain’s visualization system as a product, not an accident.

#### Domains (one dedicated agent each)
- Foundation: `foundation/**`
- Morphology: `morphology-pre/**`, `morphology-mid/**`, `morphology-post/**`, `map-morphology/**`
- Hydrology: `hydrology-climate-baseline/**`, `hydrology-climate-refine/**`, `hydrology-hydrography/**`, `map-hydrology/**`
- Ecology: `ecology/**`, `map-ecology/**`
- Placement: `placement/**`

#### Agent deliverables (mandatory)
Each agent produces:
1) **Greenfield domain viz spec doc**
   - Location: `docs/projects/mapgen-studio/viz-greenfield/<domain>.md`
   - Contents:
     - default layers per step (maximally minimal) + rationale
     - debug layers per step (deep) + rationale
     - “important products” matrix:
       - primary expression: (space, kind[:role])
       - alternate expression(s): (space, kind[:role]) only if meaningful
       - variants (`variantKey`) when semantically justified
2) **Implementation**
   - Update emissions in `$PIPELINE/<domain stages>/**`
   - Use `meta.visibility` aggressively to protect defaults.
   - Add/adjust tests:
     - correctness of emitted layer identity invariants
     - smoke checks for default layer counts in the “noisiest” steps

#### Guardrails (non-negotiable)
- Do not add UI knobs to compensate for noisy emissions; fix emissions.
- Use `variantKey` for semantics only; do not create “variant spam”.
- Prefer two meaningful expressions over many shallow ones.
- Keep Studio changes out unless explicitly requested by the integrator (minimize merge conflicts).

---

### Phase C — Integration hardening (integrator-owned)

Goal: keep parallel work composable and prevent “it works on my domain branch”.

- Merge by restacking upstack only (avoid global restacks).
- Maintain a running “contract & UX” checklist.
- Ensure CI + manual smoke is repeatable and documented.

---

## 5) Orchestrator workflow (Graphite + worktrees)

### 5.1 Parallel worktree rules (copy/paste)

- Each agent owns one domain and one worktree.
- Worktree root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/`
- Branch/worktree naming:
  - `agent-<id>-viz-v1-<domain>-greenfield`
  - Example: `agent-F-viz-v1-foundation-greenfield`
- Graphite safety:
  - `gt sync --no-restack` only
  - never delete or mutate other agents’ worktrees

### 5.2 Agent prompts (templates)

**Agent prompt template (domain = `<DOMAIN>`):**

> You own `<DOMAIN>` visualizations across all its stages. Redesign them from scratch using Viz SDK v1 semantics (dataTypeKey/spaceId/kind/meta.role/variantKey/meta.visibility).  
> Output:
> 1) A domain plan doc at `docs/projects/mapgen-studio/viz-greenfield/<domain>.md` describing default layers (maximally minimal) + debug layers + multiple expressions/variants where meaningful.  
> 2) Implement the plan by updating pipeline emissions under `mods/mod-swooper-maps/src/recipes/standard/stages/<...>` and adding/updating tests.  
> Constraints:
> - Do not touch Studio UI/rendering unless explicitly asked.
> - Default set must be small; depth must be `debug`.
> - Variants are semantic slices only; no stylistic variants.
> - Prefer 2 meaningful expressions over many shallow ones.
> - Use Graphite + isolated worktree; no global restacks; no destructive cleanup of other work.

---

## 6) Verification (commands + manual)

### Build/typecheck/test gates
- `bun run check-types`
- `bun run test:vitest`
- `bun run --cwd mods/mod-swooper-maps test`
- `bun run --cwd apps/mapgen-studio build` (ensures worker bundle integrity)

### Manual smoke (minimal but real)
- In Studio:
  - Select a noisy step (tectonics) and confirm defaults are readable.
  - Toggle “Show debug layers” and confirm depth appears.
  - Switch Space/Render/Variant and confirm no duplicated “projection” controls exist.

---

## 7) Risks and mitigations

- **Risk:** Each domain agent invents different semantics (incoherent UI).
  - **Mitigation:** Phase A lands first; this doc is binding on vocabulary and UI grouping.
- **Risk:** Merge conflicts in shared files during parallel edits.
  - **Mitigation:** agents avoid Studio changes; domains are largely file-disjoint.
- **Risk:** Default layer set creeps back into noise.
  - **Mitigation:** enforce `meta.visibility` + add “default layer count” smoke tests for historically noisy steps.

