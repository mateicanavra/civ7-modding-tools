<toc>
  <item id="purpose" title="Purpose"/>
  <item id="punchlist" title="Punchlist"/>
  <item id="decisions" title="Terminology decisions"/>
  <item id="sweep" title="Pages to sweep"/>
  <item id="done" title="Definition of done"/>
</toc>

# Hardening: terminology + coherence (Slice 11B)

## Purpose

Punchlist + decision log for making canonical MapGen docs internally consistent.

This scratch page exists so we can:
- converge on a single vocabulary,
- surface drift pairs explicitly (instead of inventing new terms),
- and then sweep canonical pages quickly.

## Punchlist

- Make `docs/system/libs/mapgen/reference/GLOSSARY.md` the single source of truth for:
  - `runId` vs `planFingerprint`
  - RunSettings (target) vs Env (current)
  - artifact vs buffer vs field vs overlay
  - stage vs step vs op vs phase
- Sweep canonical pages to:
  - use glossary terms,
  - avoid introducing new synonyms,
  - and replace ambiguous phrasing with drift-aware phrasing (`RunSettings (Env today)`).

## Terminology decisions

- **`planFingerprint`** is the canonical *plan identity* (hash of plan inputs); see `packages/mapgen-core/src/engine/observability.ts`.
- **`runId`** is the canonical *run identity* used by trace sessions and dumps.
  - Current code sets `runId === planFingerprint` (by design today): `deriveRunId(plan) === computePlanFingerprint(plan)`.
  - Docs must treat them as conceptually distinct *names* even if the current implementation uses the same value.
- **Run settings** is the concept; **Env** is the current concrete schema name. Prefer “RunSettings (Env today)” in narrative text.
- **Artifact** is immutable published output; **Buffer/Field** is mutable and may be snapshotted for viz; **Overlay** is a visualization/UI layer, not an engine primitive.
- **Stage** is authoring-time config compilation grouping; **Step** is the executable unit; **Op** is a strategy envelope used within steps; **Phase** is the step’s `GenerationPhase` (used for ordering and grouping).

## Pages to sweep

Primary targets (canonical):
- `docs/system/libs/mapgen/reference/GLOSSARY.md`
- `docs/system/libs/mapgen/reference/RUN-SETTINGS.md`
- `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- `docs/system/libs/mapgen/how-to/integrate-mapgen-studio-worker.md`
- `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Definition of done

- Glossary defines the terms above and includes drift posture.
- Canonical pages do not contradict each other on these terms.
- `rg -n "planFingerprint" docs/system/libs/mapgen` shows consistent wording and explicit mapping where needed.
