# Agent C — Lane Split + Downstream Rewire

## Ownership
- M4-004 lane split and downstream morphology rewiring planning.

## Plan
1. Inventory consumers of `artifact:foundation.*` map-facing projections.
2. Define hard-cut migration map to `artifact:map.*` surfaces.
3. Draft zero-dual-publish acceptance matrix.

## Working Notes
- pending

## Proposed target
- Lane split plan with complete downstream contract rewiring map.

## Changes landed
- Scratchpad initialized.

## Open risks
- Consumer spread beyond morphology may increase blast radius.

## Decision asks
- none

### 2026-02-14 — M4-004 Decision-Complete Lane Plan (S07)

#### Decision lock
```yaml
m4_004_decision_lock:
  posture: phased_lane_split__hard_cut_in_S07
  hard_rules:
    - no_dual_publish
    - no_bridge_alias
    - no_runtime_fallback_branch
  required_predecessors:
    - LOCAL-TBD-PR-M4-003 # stage topology + compile surface
    - LOCAL-TBD-PR-M4-005 # guardrails + test rewrite
  source_evidence:
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md:20
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md:31
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md:43
    - docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md:270
    - docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md:271
    - docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md:282
```

#### Hard-cut lane split map (`artifact:foundation.*` projection outputs -> `artifact:map.*`)
```yaml
lane_split_mapping:
  current_projection_publisher:
    path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts
    provides_lines: [22, 23, 24, 25, 26]
  current_projection_artifacts:
    path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts
    lines:
      plates: 820
      tileToCellIndex: 770
      crustTiles: 775
      tectonicHistoryTiles: 780
      tectonicProvenanceTiles: 785
  hard_cut_artifact_renames:
    - from: artifact:foundation.plates
      to: artifact:map.foundationPlates
      schema_policy: byte-for-byte schema carryover from foundationArtifacts.plates
    - from: artifact:foundation.tileToCellIndex
      to: artifact:map.foundationTileToCellIndex
      schema_policy: byte-for-byte schema carryover from foundationArtifacts.tileToCellIndex
    - from: artifact:foundation.crustTiles
      to: artifact:map.foundationCrustTiles
      schema_policy: byte-for-byte schema carryover from foundationArtifacts.crustTiles
    - from: artifact:foundation.tectonicHistoryTiles
      to: artifact:map.foundationTectonicHistoryTiles
      schema_policy: byte-for-byte schema carryover from foundationArtifacts.tectonicHistoryTiles
    - from: artifact:foundation.tectonicProvenanceTiles
      to: artifact:map.foundationTectonicProvenanceTiles
      schema_policy: byte-for-byte schema carryover from foundationArtifacts.tectonicProvenanceTiles
  execution_order:
    - add_new_map_artifacts_and_switch_all_consumers_to_map_ids_in_same_stack
    - remove_legacy_foundation_projection_artifact_definitions_in_same_stack
    - fail_build_if_any_old_projection_id_remains_in_contracts_or_runtime_reads
```

#### Downstream consumer rewiring inventory (runtime + tests)
```yaml
downstream_rewire_inventory:
  runtime_contract_consumers:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts
      current_requires:
        - foundationArtifacts.crustTiles
        - foundationArtifacts.tectonicHistoryTiles
        - foundationArtifacts.tectonicProvenanceTiles
      rewrite_requires:
        - mapArtifacts.foundationCrustTiles
        - mapArtifacts.foundationTectonicHistoryTiles
        - mapArtifacts.foundationTectonicProvenanceTiles
      evidence_lines: [17, 18, 19]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts
      current_requires:
        - foundationArtifacts.plates
      rewrite_requires:
        - mapArtifacts.foundationPlates
      evidence_lines: [16]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts
      current_requires:
        - foundationArtifacts.plates
      rewrite_requires:
        - mapArtifacts.foundationPlates
      evidence_lines: [15]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts
      current_requires:
        - foundationArtifacts.plates
      rewrite_requires:
        - mapArtifacts.foundationPlates
      note: this is an intra-foundation downstream dependency that must be rewired in the same hard cut
      evidence_lines: [11]

  runtime_impl_consumers:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts
      current_reads:
        - deps.artifacts.foundationCrustTiles.read
        - deps.artifacts.foundationTectonicHistoryTiles.read
        - deps.artifacts.foundationTectonicProvenanceTiles.read
      rewrite_reads:
        - deps.artifacts.foundationCrustTilesMap.read
        - deps.artifacts.foundationTectonicHistoryTilesMap.read
        - deps.artifacts.foundationTectonicProvenanceTilesMap.read
      evidence_lines: [178, 179, 180, 202, 252, 254]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.ts
      current_reads:
        - deps.artifacts.foundationPlates.read
      rewrite_reads:
        - deps.artifacts.foundationPlatesMap.read
      evidence_lines: [13, 29, 30, 31]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.ts
      current_reads:
        - deps.artifacts.foundationPlates.read
      rewrite_reads:
        - deps.artifacts.foundationPlatesMap.read
      evidence_lines: [77, 87, 88, 89, 90, 104, 106]
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts
      current_reads:
        - deps.artifacts.foundationPlates.read
      rewrite_reads:
        - deps.artifacts.foundationPlatesMap.read
      evidence_lines: [39, 40, 52]

  publisher_rewire:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts
      current_publishes:
        - deps.artifacts.foundationPlates.publish
        - deps.artifacts.foundationTileToCellIndex.publish
        - deps.artifacts.foundationCrustTiles.publish
        - deps.artifacts.foundationTectonicHistoryTiles.publish
        - deps.artifacts.foundationTectonicProvenanceTiles.publish
      rewrite_publishes:
        - deps.artifacts.mapFoundationPlates.publish
        - deps.artifacts.mapFoundationTileToCellIndex.publish
        - deps.artifacts.mapFoundationCrustTiles.publish
        - deps.artifacts.mapFoundationTectonicHistoryTiles.publish
        - deps.artifacts.mapFoundationTectonicProvenanceTiles.publish
      evidence_lines: [105, 106, 107, 108, 109]

  tests_and_guardrails_to_rewire:
    - path: mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts
      action: update assertions to ban old foundation projection ids and enforce single-lane map ids
      evidence_lines: [24, 54, 55, 56]
    - path: mods/mod-swooper-maps/test/morphology/contract-guard.test.ts
      action: swap expected required ids from foundation projection ids to map projection ids
      evidence_lines: [253, 258, 259, 260, 261]
    - path: mods/mod-swooper-maps/test/standard-run.test.ts
      action: replace required artifact presence assertion from foundationArtifacts.plates to map lane id
      evidence_lines: [231, 232]
    - path: mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
      action: migrate artifact-id/tag assertions away from foundation projection ids
      evidence_lines: [118, 119, 120, 124, 142]
    - path: mods/mod-swooper-maps/test/support/validation-harness.ts
      action: move tier-1 projection artifact ids to map namespace
      evidence_lines: [43, 50, 51]
    - path: mods/mod-swooper-maps/test/support/foundation-invariants.ts
      action: replace history/provenance tile artifact lookups with map namespace ids
      evidence_lines: [480, 485, 590, 595, 678, 683]
    - path: mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts
      action: update fixture artifact keys to map namespace ids for history/provenance tile checks
      evidence_lines: [55, 83]
    - path: mods/mod-swooper-maps/test/pipeline/mountains-nonzero-probe.test.ts
      action: update runtime probe to read map namespace history tiles
      evidence_lines: [128]
```

#### Explicit no-dual-publish / no-bridge acceptance criteria
```yaml
no_bridge_acceptance:
  - id: AC-M4-004-01
    requirement: projection publisher has exactly one namespace (`artifact:map.foundation*`) and zero legacy projection ids
    fail_if:
      - projection contract provides both foundation and map projection ids
      - runtime publish block emits any foundation projection id
  - id: AC-M4-004-02
    requirement: no downstream morphology or plate-topology contract requires legacy projection ids
    fail_if:
      - any `foundationArtifacts.(plates|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles|tileToCellIndex)` appears in downstream contracts
  - id: AC-M4-004-03
    requirement: no runtime fallback/alias branches for old projection ids
    fail_if:
      - conditional reads like `mapArtifact ?? foundationArtifact`
      - adapter/registry aliasing from map ids back to foundation ids
  - id: AC-M4-004-04
    requirement: old projection ids are absent from mapgen-core tag constants and recipe artifact catalogs
    fail_if:
      - old ids remain exported as active runtime tags
  - id: AC-M4-004-05
    requirement: guardrail/test suite enforces map-only projection lane after cutover
    fail_if:
      - old-id references survive in contract guard tests, validation harnesses, or invariant suites
```

#### Cutover verification commands and contract checks
```bash
# Global required gates (M4/G3 posture)
bun run build
bun run lint
bun run test:ci
bun run lint:adapter-boundary
REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
bun run check

# Focused structural checks for M4-004
bun run --cwd mods/mod-swooper-maps test test/pipeline/map-stamping.contract-guard.test.ts
bun run --cwd mods/mod-swooper-maps test test/morphology/contract-guard.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts

# Legacy projection id must be gone from src + tests
rg -n "artifact:foundation\.(plates|tileToCellIndex|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles)" mods/mod-swooper-maps/src mods/mod-swooper-maps/test

# Morphology runtime should not read foundation projection deps anymore
rg -n "deps\.artifacts\.foundation(Plates|CrustTiles|TectonicHistoryTiles|TectonicProvenanceTiles|TileToCellIndex)" mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features

# New map projection ids must exist exactly once in map artifact catalog + consumer contracts
rg -n "artifact:map\.foundation(Plates|TileToCellIndex|CrustTiles|TectonicHistoryTiles|TectonicProvenanceTiles)" mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts mods/mod-swooper-maps/src/recipes/standard/stages
```

```yaml
command_expectations:
  legacy_projection_id_scan:
    command: rg -n "artifact:foundation\.(plates|tileToCellIndex|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles)" mods/mod-swooper-maps/src mods/mod-swooper-maps/test
    expected: no_matches
  morphology_runtime_legacy_reads_scan:
    command: rg -n "deps\.artifacts\.foundation(Plates|CrustTiles|TectonicHistoryTiles|TectonicProvenanceTiles|TileToCellIndex)" mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features
    expected: no_matches
  new_map_projection_id_scan:
    command: rg -n "artifact:map\.foundation(Plates|TileToCellIndex|CrustTiles|TectonicHistoryTiles|TectonicProvenanceTiles)" mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts mods/mod-swooper-maps/src/recipes/standard/stages
    expected: matches_present
```

## Proposed target
- M4-004 executes as one hard cut: all Foundation projection outputs move to `artifact:map.foundation*`, all runtime + test consumers are rewired in the same stack, and legacy projection IDs are fully removed.

## Changes landed
- Added a decision-locked M4-004 lane split plan with explicit old->new artifact mapping, full downstream rewiring inventory (runtime + guardrails/tests), and executable cutover verification commands.

## Open risks
- `map-stamping.contract-guard.test.ts` currently bans `artifact:map.*` usage across physics-stage contracts; this must be intentionally rewritten in M4-005-precondition form so M4-004 can pass without introducing ad-hoc exceptions.
- `plate-topology` is still coupled to projected plates and will fail cutover if not rewired in the same commit as projection publisher changes.
- Validation/invariant suites currently treat history/provenance tile projections as Foundation-owned and will produce false negatives until moved to map namespace in lockstep.

## Decision asks
- none
