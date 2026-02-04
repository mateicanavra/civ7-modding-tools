# Migration Slice: Cutover Morphology Consumption + Cleanup (Current → Target)

## Scope

- Decision packets:
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md`
- SPEC sections:
  - `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`

## Current divergence

- What exists today:
  - Morphology consumes legacy Foundation tile drivers (`foundation.plates`, `foundation.crustTiles`) and synthesizes belts/topography using legacy assumptions.
  - New Pipeline-Realism tile artifacts may exist (history/provenance tiles), but Morphology may not require them yet.
- Why it exists:
  - [ ] Compatibility requirement: current pipeline expects Morphology outputs for gameplay.
  - [ ] Bridge construct: legacy drivers are the current seam.

## Target change

- SPEC section: `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
- Target behavior:
  - Morphology MUST consume:
    - `artifact:foundation.tectonicHistoryTiles`
    - `artifact:foundation.tectonicProvenanceTiles`
  - Morphology belt synthesis uses:
    - continuous belt corridors derived from history/events
    - provenance/age to avoid wall mountains (age-aware diffusion)
  - Legacy-only consumption paths are deleted.

## Phased plan

### Phase 1: Prepare (dual-read + metrics-only comparison)

- Changes:
  - Update Morphology to accept the new inputs (history/provenance tiles) in parallel with legacy drivers.
  - Run the new belt synthesis path but do not yet use it for final outputs; emit comparison diagnostics only.
  - Add D09r input-contract checks in Morphology:
    - required artifacts exist
    - dims match
    - sentinel/range rules valid
- Verification:
  - new belt synthesis produces continuous belts (component length distributions) without wall-mountain artifacts.
  - correlation checks (uplift driver ↔ elevation response) look plausible.
- Rollback:
  - disable new belt synthesis and continue legacy outputs.

### Phase 2: Cutover (Morphology output depends on new drivers)

- Changes:
  - Make Morphology outputs depend on new drivers:
    - uplift/volcanism/fracture from history+provenance tiles
  - Keep legacy drivers only as compatibility for other downstream consumers if needed (but do not use them for belts).
- Verification:
  - D09r Tier-1 gates pass for required inputs and morphology outputs.
  - strict-mode diagnostics validate “no wall mountains” invariants and belt continuity metrics.
- Rollback:
  - revert Morphology to legacy driver path (temporary; indicates Foundation→Morphology seam not ready).

### Phase 3: Cleanup (no legacy left)

- Deletion targets:
  - [ ] Delete Morphology belt synthesis paths that consume legacy-only Foundation drivers.
  - [ ] Delete any compatibility bridge artifacts that exist solely for pre-cutover morphology.
  - [ ] Delete metrics-only shadow compute once new path is validated across the canonical suite.
- Verification:
  - compile-time: Morphology requires the new artifacts, and runs fail if absent (hard seam).
  - runtime: belt continuity and correlation gates pass.
- Rollback:
  - N/A for deletions (must be reintroduced intentionally if needed).

## Risks and quality gates

| Risk | Likelihood | Mitigation | Gate |
|------|------------|------------|------|
| Morphology becomes a second tectonics engine | M | restrict knobs; consume drivers deterministically | D07r contract: no authoring knobs for tectonics semantics |
| Wall-mountains regressions | M | enforce belt continuity + age-aware diffusion invariants | strict-mode gates + visual spine inspection |
| Downstream artifacts drift after stage renames | M | integrate stage ids/artifact ids via integration pass | integration memo + doc updates before final cutover |

## Tracking

- Deferrals/issues:
  - none (this is the domain seam cutover).
- Tracking gaps (if any):
  - identify any downstream stages that still depend on legacy Foundation drivers and schedule their cleanup.

