# Branch Accounting Composition
Generated: `2026-06-08T00:29:49Z`
Scope: old source route closure audit, generated from Graphite cache plus `recovery-accounting-ledger.json`.

## Current Graphite Context
- Roots from `main`: `5`
- Cached branches including `main`: `865`
- Current `main`: `9d5ce882ef691291263abcef4024c0823eb07972`
- Prepared snapshot stale anchor warnings: `0`

| Root | Branches | Leaves |
|---|---:|---:|
| `codex/swooper-mapgen-recovery-drain` | 81 | 1 |
| `codex/stack-lineage-audit-reference` | 22 | 1 |
| `codex/live-play-settlement-reference` | 67 | 3 |
| `codex/local-catalog-enrichment` | 693 | 3 |
| `agent-watch-civ7-live-play-reference-assembly` | 1 | 1 |

## Old Source Route Result
- Source root: `codex/live-play-settlement-reference`
- Branches checked: `67`
- Split points checked: `2`
- Terminal leaves checked: `3`
- Unaccounted branches: `0`
- Closure result: `PASS`

## Split Points
| Split point | Children | Disposition |
|---|---|---|
| `codex/civ7-orpc-control-architecture-skill` | `codex/consolidate-play-agent-docs`<br>`codex/play-agent-hotseat-phase-packet` | `done-supersede-civ7-orpc-control-architecture-skill-live-control` |
| `codex/earthlike-natural-wonder-footprint-readback` | `codex/earthlike-natural-wonder-footprint-catalog-context`<br>`codex/earthlike-terrain-edge-diagnostics` | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |

## Terminal Leaves
| Leaf | Subject | Disposition |
|---|---|---|
| `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` | fix(mapgen): preserve earthlike floodplain surface | `done-adopt-earthlike-floodplain-config-leaf` |
| `codex/earthlike-terrain-edge-mock-terrain-materialization-repair` | fix(civ7): align mock terrain materialization | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/play-agent-hotseat-phase-packet` | docs(direct-control): frame hotseat proof phase | `done-adopt-hotseat-phase-packet-live-control` |

## Adversarial Misses Repaired
| Miss | Repair | Proof |
|---|---|---|
| `codex/play-agent-hotseat-phase-packet` | Exact cherry-pick to `codex/live-control-hotseat-phase-packet-adoption` | Packet file diff is empty. |
| `codex/civ7-orpc-control-architecture-skill` | `done/supersede` by package-owned `@civ7/control-orpc` on live-control | Stale embedded `packages/civ7-direct-control/src/orpc` surface intentionally not replayed. |
| Old control/intelligence documentation train | Ordered Graphite cherry-picks to `codex/live-control-source-route-docs-adoption` | `12` source branch-range commits represented by `12` sink commits. |

## Unaccounted Branches
- None.

## Branch-Level Audit
| Branch | Parent | Commits in Graphite branch | Disposition |
|---|---|---:|---|
| `codex/live-play-settlement-reference` | `main` | 1 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/unit-movement-api-investigation` | `codex/live-play-settlement-reference` | 1 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/play-agent-output-contract` | `codex/unit-movement-api-investigation` | 2 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/civ7-orpc-control-architecture-skill` | `codex/play-agent-output-contract` | 1 | `done-supersede-civ7-orpc-control-architecture-skill-live-control` |
| `codex/consolidate-play-agent-docs` | `codex/civ7-orpc-control-architecture-skill` | 1 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/frame-civ7-intelligence-layer` | `codex/consolidate-play-agent-docs` | 1 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/shape-civ7-intelligence-solution` | `codex/frame-civ7-intelligence-layer` | 1 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/investigate-civ7-intelligence-threads` | `codex/shape-civ7-intelligence-solution` | 5 | `done-adopt-civ7-intelligence-and-control-doc-train-live-control` |
| `codex/start-placement-viability` | `codex/investigate-civ7-intelligence-threads` | 1 | `done-adopt-start-placement-and-initial-resource-policy` |
| `codex/resource-initial-map-policy` | `codex/start-placement-viability` | 1 | `done-adopt-start-placement-and-initial-resource-policy` |
| `codex/studio-setup-config-sync` | `codex/resource-initial-map-policy` | 1 | `done-adopt-studio-setup-config-sync` |
| `06-05-fix_studio_validate_civ7_setup_seeds` | `codex/studio-setup-config-sync` | 12 | `done-adopt-studio-setup-config-sync` |
| `codex/swooper-dra-takeover-handoff` | `06-05-fix_studio_validate_civ7_setup_seeds` | 2 | `done-reference-swooper-recovery-planning-context` |
| `codex/swooper-recovery-openspec-plan` | `codex/swooper-dra-takeover-handoff` | 1 | `done-reference-swooper-recovery-planning-context` |
| `codex/studio-live-runtime-snapshot-completion` | `codex/swooper-recovery-openspec-plan` | 1 | `done-adopt-studio-live-runtime-snapshot-completion` |
| `codex/studio-civ7-exact-authorship-proof` | `codex/studio-live-runtime-snapshot-completion` | 1 | `done-adopt-studio-exact-authorship-proof` |
| `codex/civ7-map-policy-final-surface-parity` | `codex/studio-civ7-exact-authorship-proof` | 4 | `done-adopt-map-policy-final-surface-parity` |
| `codex/earthlike-live-feature-resource-legality-repair` | `codex/civ7-map-policy-final-surface-parity` | 3 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-adjacent-land-rerun-record` | `codex/earthlike-live-feature-resource-legality-repair` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-assignment-evidence` | `codex/earthlike-adjacent-land-rerun-record` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-feasibility-readback` | `codex/earthlike-resource-assignment-evidence` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-feasibility-classification` | `codex/earthlike-resource-feasibility-readback` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-feasibility-artifact` | `codex/earthlike-resource-feasibility-classification` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-feasibility-row-context` | `codex/earthlike-resource-feasibility-artifact` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-policy-spacing-context` | `codex/earthlike-resource-feasibility-row-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-live-plot-context` | `codex/earthlike-resource-policy-spacing-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-assignment-trace` | `codex/earthlike-resource-live-plot-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-builder-diagnostics` | `codex/earthlike-resource-assignment-trace` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-assignment-order-context` | `codex/earthlike-resource-builder-diagnostics` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-builder-subclassification` | `codex/earthlike-resource-assignment-order-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-builder-policy-context` | `codex/earthlike-resource-builder-subclassification` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-assignment-class-summary` | `codex/earthlike-resource-builder-policy-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-distribution-context` | `codex/earthlike-resource-assignment-class-summary` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-position-context` | `codex/earthlike-resource-distribution-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-local-materialization-context` | `codex/earthlike-resource-position-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-placement-coordinate-proof` | `codex/earthlike-resource-local-materialization-context` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-resource-coordinate-proof-intake` | `codex/earthlike-resource-placement-coordinate-proof` | 1 | `done-adopt-earthlike-feature-resource-proof-stack` |
| `codex/earthlike-feature-delta-context` | `codex/earthlike-resource-coordinate-proof-intake` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-feature-local-evidence-context` | `codex/earthlike-feature-delta-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-feature-live-feasibility-readback` | `codex/earthlike-feature-local-evidence-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-feature-footprint-direction-context` | `codex/earthlike-feature-live-feasibility-readback` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-footprint-readback` | `codex/earthlike-feature-footprint-direction-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-footprint-catalog-context` | `codex/earthlike-natural-wonder-footprint-readback` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-live-proof-boundary` | `codex/earthlike-natural-wonder-footprint-catalog-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-terrain-edge-stack-integration` | `codex/earthlike-natural-wonder-live-proof-boundary` | 9 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-natural-wonder-live-telemetry` | `codex/earthlike-terrain-edge-stack-integration` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-coordinate-proof` | `codex/earthlike-natural-wonder-live-telemetry` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-source-classification` | `codex/earthlike-natural-wonder-coordinate-proof` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/workspace-source-package-resolution` | `codex/earthlike-natural-wonder-source-classification` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-materialization-repair` | `codex/workspace-source-package-resolution` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-repair-proof-record` | `codex/earthlike-natural-wonder-materialization-repair` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-feature-post-wonder-repair-context` | `codex/earthlike-natural-wonder-repair-proof-record` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-feature-proof-correction` | `codex/earthlike-feature-post-wonder-repair-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-deploy-proof-gap` | `codex/earthlike-feature-proof-correction` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-named-rejection-proof` | `codex/earthlike-natural-wonder-deploy-proof-gap` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-readback-mismatch-context` | `codex/earthlike-natural-wonder-named-rejection-proof` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-postwrite-footprint-proof` | `codex/earthlike-natural-wonder-readback-mismatch-context` | 1 | `done-adopt-earthlike-natural-wonder-stack-through-footprint-proof` |
| `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` | `codex/earthlike-natural-wonder-postwrite-footprint-proof` | 2 | `done-adopt-earthlike-floodplain-config-leaf` |
| `codex/earthlike-terrain-edge-diagnostics` | `codex/earthlike-natural-wonder-footprint-readback` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-local-mask-context` | `codex/earthlike-terrain-edge-diagnostics` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-live-readback` | `codex/earthlike-terrain-edge-local-mask-context` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-validation-boundary` | `codex/earthlike-terrain-edge-live-readback` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-mock-lake-classification` | `codex/earthlike-terrain-edge-validation-boundary` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-mock-materialization-repair` | `codex/earthlike-terrain-edge-mock-lake-classification` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-coast-materialization-context` | `codex/earthlike-terrain-edge-mock-materialization-repair` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/earthlike-terrain-edge-mock-terrain-materialization-repair` | `codex/earthlike-terrain-edge-coast-materialization-context` | 1 | `done-adopt-earthlike-terrain-edge-stack` |
| `codex/play-agent-hotseat-phase-packet` | `codex/civ7-orpc-control-architecture-skill` | 1 | `done-adopt-hotseat-phase-packet-live-control` |
