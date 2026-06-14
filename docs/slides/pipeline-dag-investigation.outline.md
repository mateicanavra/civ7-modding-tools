# Outline — Pipeline-as-DAG investigation (verdict-first, full-schema upgrade)

Deck id: `pipeline-dag-investigation` (v2 — rebuilt against the authoritative
TypeBox schema at playground/slides/packages/core/src/schema/).
Narrative: verdict-first (approved P0 from v1). Composition: Alternative A —
multi-block vertical stacking per slide.
Source of truth: docs/projects/pipeline-realism/workstreams/ws-dag-executor-investigation.md

Schema notes honored: `concept` required per slide; layers segments 2–5 with
extended color palette; objectives require description + 1–3 categorized key
results; metricsGrid values max 2 (unused); kpiGrid layouts.

Concepts: verdict (green), current (blue), evidence (orange), design (purple),
plan (rose).

Slides (blocks stacked top→bottom):

1. **The answer** (verdict) — layers stack w/ title+caption, loop-region layer
   carries 3 segments (carried artifacts / cap / predicate); kpiGrid uniform
   (cycles admitted: 0 · loop exit: cap · engine changes for evolution: 0).
2. **Executor today** (current) — kpiGrid hero (topological sorts: 0 ·
   schedule source: authored order · dependency tags: validate-only);
   codeBlock PipelineExecutor.ts:107–118; explanation.
3. **Decorative DAG** (current) — diagram (two consumers of contracts); table
   of duplicate providers; explanation (first-writer-wins).
4. **Five feedback pressures** (evidence) — kpiGrid spotlight (4 physics / 1
   invalidation / 0 expressible); table of five couplings; explanation
   separating invalidation from physics.
5. **Prior art** (evidence) — explanation (three properties cycles destroy);
   table of six systems.
6. **Taxonomy verdict** (design) — radialMetric 3/7 patterns adopted; table of
   T1–T7.
7. **Loop region anatomy** (design) — diagram (mermaid loop region); table of
   the five contract fields; explanation (fixed counts vs predicates).
8. **Recipe-as-run** (design) — diagram (evolutionary loop); objectivesDisplay
   (1 objective: make generation evolutionary — add selection signal, increase
   observability, remove nothing from engine).
9. **Phase vs domain** (design) — codeBlock GenerationPhase enum
   (types.ts:8–15, the conflation evidence); table of facets.
10. **Steps / oRPC / strategies** (design) — table of three decisions;
    explanation (concepts before encoding).
11. **Sequencing** (plan) — objectivesDisplay with 4 objectives (v0 fix
    duplicates / v1 unrolling / v2 loop regions / v3 selection layer), each
    with categorized key results; explanation (reversibility calibration).
12. **Falsifier & escape ramp** (plan) — table of risk controls; explainer
    with source = workstream record path.

Transitions unchanged from v1: verdict → ground truth → motivation → defense
of each layer → semantics → plan → risk.
