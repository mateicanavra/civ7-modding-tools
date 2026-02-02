<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="authority" title="Authority + correctness posture"/>
  <item id="scope" title="Scope + non-goals"/>
  <item id="inputs" title="Inputs + invariants"/>
  <item id="loose-docs" title="Loose docs / stray branches posture"/>
  <item id="workflow" title="Workflow (Graphite slices)"/>
  <item id="slices" title="Slice plan (11A–11F)"/>
  <item id="qa" title="QA checklist (hard gates)"/>
  <item id="maintenance" title="Maintenance (keep it hardened)"/>
</toc>

# MapGen canonical docs — hardening implementation proposal

## TL;DR

The MapGen doc spine is now built end-to-end under `docs/system/libs/mapgen/**`.
Hardening is a follow-on phase that makes it:
- *mechanically correct* (no unanchored claims),
- *coherent* (single vocabulary; no contradictions),
- *navigable* (routing/indexes always point to canon),
- and *maintainable* (cheap automated checks prevent regressions).

This proposal defines a **multi-slice execution plan** (11A–11F). Each slice lands as a stacked branch/PR.

## Authority + correctness posture

Hard rule: the canonical docs must remain **target-architecture-first**, while staying correct by:
- anchoring every claim to code/spec,
- labeling “Current mapping” where drift exists,
- and marking true unknowns as **Open questions** (no guessing).

## Scope + non-goals

### In scope

- Claim/anchor audit across canonical docs (exclude `_archive/`).
- Terminology consolidation (single-source definitions + consistent usage).
- Routing/index polish (no dead ends; ≤3 clicks from `MAPGEN.md` to any leaf).
- Visualization + Studio posture alignment (deck.gl viz is current canon; streaming vs dump clarified).
- Legacy router verification (routers always point to the right canon).
- Tooling: automated checks for anchors/paths + “no drift” safety rails.

### Out of scope

- Runtime refactors to match docs.
- Sidebar edits (`docs/_sidebar.md` is auto-generated; never touch).
- Deep rewrite of historical archive docs (archives may keep stale anchors; routers must not).

## Inputs + invariants

### Primary doc roots

```text
$MAPGEN_DOCS = docs/system/libs/mapgen
$MAPGEN_SPIKE = docs/projects/engine-refactor-v1/mapgen-docs-alignment
```

### Hard invariants

- Every new/modified canonical page keeps:
  - mini XML `<toc>` at top
  - “Ground truth anchors” section (paths + ids/symbols)
- Prefer published package entrypoints in docs (avoid workspace-only aliases).
- Visualization posture is current canon; route to:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Loose docs / stray branches posture

We may observe additional “stray” commits/branches on top of the stack (e.g., incremental fixes to domain reference pages).

Hardening rule:
- Do **not** drop or overwrite unknown work.
- If a stray change is correct and improves canon, keep it and harden around it.
- If a stray change conflicts with the canonical model, convert it into:
  - an explicit “Current mapping” note, or
  - a legacy router, or
  - an archive-only artifact (with a canonical replacement pointer).

## Workflow (Graphite slices)

- Each hardening slice is its own stacked branch + PR.
- Avoid cross-slice file conflicts by following ownership boundaries:
  - 11A: scans + punchlists + minimal edits for “must-fix correctness”
  - 11B: terminology refactors (mostly `reference/GLOSSARY.md` + small edits across pages)
  - 11C: routing/index changes
  - 11D: viz + Studio posture alignment
  - 11E: legacy routers verification and safety language
  - 11F: tooling + docs QA scripts

## Slice plan (11A–11F)

### Slice 11A — claims + anchors audit (canonical docs only)

**Goal:** No unanchored factual claims remain in non-archive docs.

**Deliverables:**
- A punchlist doc in `$MAPGEN_SPIKE/scratch/` capturing:
  - page → claim → anchor required
  - recommended wording (target vs current mapping)
- Minimal fixes applied directly to canonical docs where they’re clearly wrong.

**Acceptance:**
- A repo-local automated scan finds **zero** missing code-path anchors in non-archive MapGen docs.

### Slice 11B — terminology + coherence pass

**Goal:** One vocabulary across the doc set; no contradictions.

**Deliverables:**
- Harden `docs/system/libs/mapgen/reference/GLOSSARY.md` to be the single source of truth.
- Sweep key pages to use the canonical terms consistently:
  - run identity (`runId`, `planFingerprint`), env/run settings, truth/projection,
  - artifact/buffer/overlay semantics, op/step/stage.

**Acceptance:**
- No page defines terms that disagree with `GLOSSARY.md`.

### Slice 11C — routing + index polish

**Goal:** Every leaf is reachable and correctly categorized (Diátaxis).

**Deliverables:**
- Ensure `MAPGEN.md` + subtree indexes are complete and “task-first”.
- Fix any misplaced content (e.g., explanation content inside how-tos).

**Acceptance:**
- ≤3 clicks from `MAPGEN.md` to any leaf page.
- No dead links in non-archive MapGen docs.

### Slice 11D — visualization + Studio posture reconcile

**Goal:** Viz + Studio docs match the *current* implementation posture.

**Deliverables:**
- Confirm `pipeline-visualization-deckgl.md` reads as “current canon” (not speculative).
- Ensure `VISUALIZATION.md` contract routing matches:
  - streaming (`viz.layer.upsert`)
  - dump viewer workflows (only where actually implemented)
- Ensure Studio seam reference/how-to are consistent with worker code.

**Acceptance:**
- No contradictory statements about “dump vs stream” across viz and Studio pages.

### Slice 11E — legacy routers + archive safety pass

**Goal:** Legacy roots route to canon; archives are clearly non-canonical.

**Deliverables:**
- Verify each legacy router points to correct canonical replacement.
- Ensure routers are short, consistent, and explicitly “not canonical”.

**Acceptance:**
- No legacy router links to another legacy router (always routes to canon).

### Slice 11F — tooling + maintainability checks

**Goal:** Make hardening regressions cheap to catch.

**Deliverables:**
- Add a small Python QA script(s) to:
  - detect missing anchored file paths in non-archive MapGen docs,
  - detect duplicate/conflicting term definitions (lightweight heuristic),
  - and optionally detect forbidden patterns (e.g., `@mapgen/*` imports in docs).
- Document how to run the checks.

**Acceptance:**
- A single command can validate the MapGen docs set for the above invariants.

## QA checklist (hard gates)

Before submitting the hardening stack:

- `git status` is clean.
- `bun run lint:mapgen-docs` passes (canonical MapGen docs QA: toc + anchors + anchor-path existence).
- Automated scan: no missing anchored paths in non-archive MapGen docs.
- Manual spot-check:
  - `MAPGEN.md` routing is correct.
  - Studio seam docs match worker code.
  - Viz doc posture is coherent (streaming vs dumps).
- No edits to `docs/_sidebar.md`.

## Maintenance (keep it hardened)

After merge, add a lightweight “docs QA” step to the standard workflow (manual or CI) so that:
- new docs can’t introduce unanchored claims,
- terminology drift gets flagged early,
- and the canonical spine stays the single path.

### Canonical command

Run:

```bash
bun run lint:mapgen-docs
```

This executes `scripts/lint/lint-mapgen-docs.py`, which:
- scans `docs/system/libs/mapgen/**` (excluding `_archive/`, `research/`, and `adrs/` by default),
- requires mini XML `<toc>` and a `## Ground truth anchors` section for canonical docs (routers are exempt from anchors),
- validates that backticked repo-relative anchor paths point to real files,
- and flags `@mapgen/*` mentions (workspace-only alias) so docs prefer published entrypoints.
