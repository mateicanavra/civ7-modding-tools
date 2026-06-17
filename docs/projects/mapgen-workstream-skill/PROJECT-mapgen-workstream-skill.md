# Project — Map-Generation Workstream Skill

Build a repo-local skill that lets a future agent team take a map-generation request
end-to-end (investigate → design → implement → verify in-game → review → finalize)
without the user re-explaining the pipeline or harness each time.

**Status:** Delivered (Phase 0–2 complete). The skill is live at
`.agents/skills/civ7-mapgen-workstream/`.

## Artifacts (read in this order)

| Artifact | Role |
|---|---|
| [FRAMING.md](FRAMING.md) | **Normative.** The objective frame (intent, scope, philosophy, hard core, falsifier). The grounding reference for the whole workstream. Living artifact — revise if its falsifier/degeneration trigger fires. |
| [PHASE-1-DISCOVERY.md](PHASE-1-DISCOVERY.md) | Live-source discovery: the recipe pipeline shape, the harness, the reference graph, worked examples, and the adversarial critic's appendices. Critic verdict: CONFIDENT. |
| [PHASE-2-PREWORK.md](PHASE-2-PREWORK.md) | Exact copy-paste authoring facts (strategy keys + selection, op/step/stage scaffolds, live-verify gate, Studio-viz edit surface, recipe-doc drift). |
| [PHASE-1-RAW-FINDINGS.json](PHASE-1-RAW-FINDINGS.json) | Raw structured discovery findings (backing data). |

## The delivered skill

`.agents/skills/civ7-mapgen-workstream/`

- `SKILL.md` — lean router: scope, routing table (request → arm → problem class → facets → owners), the 11-step loop, the reference graph + currency banner, vocabulary, the generation-vs-display discriminator, `<invariants>`, quick start.
- `references/pipeline-map.md` — technical-arm grounding (17 stages, 7 domains, ops/recipes/artifacts, truth↔projection split, mod↔engine boundary).
- `references/facet-physics.md` — **Facet 1 (deepest, net-new):** Earth-science/physics per domain, MODELED/APPROXIMATED/ABSENT buckets, the 8 realism gaps.
- `references/facet-verification.md` — **Facet 2:** base proof discipline (→ `civ7-operational-debugging`) + 3 net-new overlays (Studio-viz, Earth-like benchmark, pipeline diagnostics).
- `references/facet-civ7-domain.md` — **Facet 3:** game-data modalities (→ `civ7-product-authority`) + research/design-intent dimension.
- `references/worked-examples.md` — 4 archetype workstreams + the loop pattern.
- `references/orchestration.md` — the 11-step loop in depth + facet-agent team pattern (→ `cognition:team-design`) + closure handoff.
- `assets/recipe-scaffolds.md` — copy-paste op/strategy/step/stage/artifact templates.
- `assets/earthlike-expectation-ledger.md` — pre-declared Earth-like expectation ledger (step-5 gate).
- `assets/live-verification-runbook.md` — runnable in-game verification gate checklist (step-7 gate).

## Method (how it was built)

- **Phase 0 — Framing** (`cognition:framing-design`, objective-framing, standalone). Produced FRAMING.md; passed the framing mandate.
- **Phase 1 — Discovery** (deep multi-agent workflow: 6 investigators → synthesis → adversarial critic). Mapped live source; CONFIDENT verdict, zero cache-skill leakage.
- **Phase 2 — Compose** (prework extraction → 10-agent authoring → 4-lens adversarial review → patch). Verdict SHIP_WITH_FIXES; fixes applied.

## Hard core (from FRAMING.md)

1. Composition/orchestration layer, not a content monolith.
2. In-game verification is the closure test.
3. Recipe-domain logic (`mods/mod-swooper-maps/src`) ≠ engine/SDK architecture (`packages/`).
4. Both arms (technical structure + behavioral realism) served together.
5. Progressive disclosure: minimal navigable top; depth in facets.

## Falsifier (when to reframe)

If a future agent handed the skill + a real request still must ask the user to explain the
pipeline/harness; or building on it requires *redefining* engine/SDK boundaries; or the loop
closes on changes the live engine rejects — reconstruct the frame, don't patch it.
