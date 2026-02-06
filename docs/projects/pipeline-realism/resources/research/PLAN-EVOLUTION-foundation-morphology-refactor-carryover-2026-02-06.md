# PLAN EVOLUTION — Foundation ↔ Morphology refactor carryover (2026-02-06)

This doc is a **curated carryover** of plan-evolution nuance recovered from recent sessions, with a specific focus on restoring any **non-negotiable sequencing/gating requirements** that are easy to lose when the canonical plan gets repeatedly “rehardened”.

Source recovery inputs (not committed):

- Session transcript: `019c3486-02e2-77f0-a724-709eac11518e`
- Plan recovery bundle generated during the session (118 extracted plan-like messages, plus `summary.md` and `index.md`, stored outside the repo)

Canonical plan-of-record (normative):

- `docs/projects/pipeline-realism/plans/PLAN-no-legacy-foundation-morphology-refactor-2026-02-05.md`

## Executive Summary

The current implementation plan is already strong on:

- **Maximal posture** (no-legacy, forward-only, single causal spine).
- **Contracts + invariants** (continuous crust truth, provenance resets, landmask coherence gates).
- **Hybrid seam diagnosis** (“new belts, old landmask”).

The single highest-risk nuance that was **explicitly called out late** (and is easy to omit as a headline) is:

- **Phase 0: an explicit “no dual-engine / no shadow / no compare paths” preflight gate** (with a hard failure condition), before attempting Phase A/B changes.

Without Phase 0, subsequent Phase A/B work can appear to succeed (or “look wired”) while **shadow/compare/fallback surfaces mask causality**, violating the plan’s hard-cutover intent.

## Timeline (How The Plan Evolved)

This is the minimum timeline that explains “why the plan looks the way it does” and where nuance can get diluted:

1. **2026-02-04 (Diagnosis spike plan)** — Session `019c2a1e-312f-76c1-9e0b-091a04a5810f`
   - Center: *why Earthlike regressed* (intent vs implementation).
   - High-signal breadcrumbs:
     - `compute-tectonic-history` emitting events/provenance without **updating crust truth across eras**.
     - Hybrid seam: belts consume history/provenance; landmass/topography still consumes legacy-style plates/crustTiles and noise/thresholding.
     - “continents impossible” implementation smell: crust/type thresholding + capped maturity seeds.

2. **2026-02-05 (Execution runbook)** — Session `019c2c49-864f-7cd2-904f-14c5cc310a9f`
   - Center: operational “unscrew stack + recover tooling” sequencing.
   - Value: concrete step ordering and “acceptance gates” for doing real work safely.
   - Not normative long-term (it’s an ops runbook), but it strongly influenced the later plan’s “execution checklist” posture.

3. **2026-02-06 (FixNow + plan hardening)** — Session `019c345d-c4b6-7e12-88ed-87d0a7f50560`
   - Center: turn the plan into a decision-complete implementation document and close PR review-thread loops with small fix slices.
   - Reasserts the same root-problem framing that should remain at the top of the plan: “fields emit, but material evolution doesn’t happen”.

4. **2026-02-06 (Phase 0 adjustment called out explicitly)** — Session `019c3110-a2e9-7010-8c0c-531b6e06b778`
   - Center: **sequencing risk**.
   - Key line: without an explicit Phase 0 delete/guard step, Phase A/B can be masked by shadow/compare paths.

5. **2026-02-06 (Plan recovery + delta summary)** — Session `019c3486-02e2-77f0-a724-709eac11518e`
   - Center: extract plan iterations + summarize “what got diluted”.
   - Primary dilution callout: Phase 0 guard + explicit kill-list for dual/shadow/compare.

## Nuance That Was At Risk Of Being Lost

### 1) Phase 0 is not “style”, it’s a hard sequencing gate

**What:** explicit preflight gate: *no dual-engine/shadow/compare compute paths or toggles exist*, and the pipeline fails fast if they do.

**Why it matters:** without Phase 0, we can “improve Phase A truth” and still observe unchanged landmasks because an alternate compute path is still being used (or still being exported/compared), directly violating “single causal spine / no legacy”.

**Where it should live:** implementation plan (headline phase), with a short, executable gate.

### 2) The early diagnosis had concrete “why it broke” breadcrumbs worth keeping

**What:** specific, actionable hypotheses like:

- `compute-tectonic-history` builds events + provenance tiles but does not update crust truth across eras (no “material evolution half”).
- `compute-crust` seed/threshold posture can make continents effectively impossible at t=0, pushing landmask to noise thresholding.
- Hybrid seam: mountains/belts consume new drivers while landmask remains legacy/noise-first.

**Why it matters:** these breadcrumbs shorten the feedback loop for implementers when Phase A/B work “does nothing” or shifts only cosmetics; they also prevent re-litigating the diagnosis from scratch.

**Where it should live:** supporting research (spike docs) and small “why we believe this” sections, not as repeated detail inside the implementation plan.

### 3) “No-legacy” needs an explicit kill-list, not just posture

**What:** the plan should continue to encode:

- explicit surfaces to delete/guard (dual read, compare toggles, shadow compute paths),
- and an enforcement posture (“fail if reintroduced”).

**Why it matters:** no-legacy is a *behavioral* constraint. Without a concrete kill-list + enforcement gate, drift can reappear as “temporary bridges”.

**Where it should live:** implementation plan (Phase 0) plus pipeline guardrails/tests.

## Recommendations (Actionable Carryover)

1. **Reinsert Phase 0 as a first-class phase** in the canonical implementation plan:
   - Objective: “no dual/shadow/compare surfaces exist in standard pipeline”.
   - Gate: run the existing guardrails test (and treat it as blocking).

2. **Keep code-level hypotheses out of the plan**, but ensure the diagnosis spike docs remain discoverable:
   - If someone needs the “why it broke” breadcrumbs, they should land in:
     - `docs/projects/pipeline-realism/resources/research/SPIKE-m1-foundation-realism-regression-2026-02-04.md`
     - `docs/projects/pipeline-realism/resources/research/SPIKE-m1-realism-miss-dump-driven-diagnosis-2026-02-05.md`

3. **Treat “no shadow paths” as an always-on regression gate**:
   - The plan should explicitly name the guard’s existence and its role, so it cannot silently “age out”.
