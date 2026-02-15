# Remediate `compute-tectonic-history/index.ts`

## Plan
1. Validate boundary posture from spec + issue doc + active tectonics step to confirm that orchestration now belongs to the step layer and that this op should not remain a mega orchestrator.
2. Replace monolithic runtime implementation in `compute-tectonic-history/index.ts` with a strict guardrail implementation that prevents reintroduction of op-level orchestration.
3. Keep contract binding intact (same op id/surface) while making runtime failure explicit and actionable for future callers.
4. Run focused verification scans: file-level type lint sanity, call-site scan, and staged diff check to confirm only owned file changed.

## Evidence
```yaml
- source: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  finding: "Hard rule: steps orchestrate multiple ops; ops are pure focused contracts and must not own orchestration boundaries."
  relevance: "`compute-tectonic-history/index.ts` currently orchestrates multi-phase era pipeline and violates focused-op posture."

- source: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md
  finding: "Deliverable explicitly calls for decomposition of `compute-tectonic-history` and step-layer orchestration ownership."
  relevance: "Single-file remediation should remove monolithic orchestration behavior from this op surface."

- source: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
  finding: "Step already orchestrates atomic tectonics ops (`computeEraPlateMembership`, `computeSegmentEvents`, `computeTectonicHistoryRollups`, etc.)."
  relevance: "Legacy mega-op is redundant and should be guarded against use instead of continuing orchestration in op layer."
```

## Edits
- Replaced the monolithic tectonic-history runtime pipeline implementation in `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` with a focused guardrail implementation.
- Preserved the existing op contract/id binding while making runtime behavior fail-fast with an explicit migration hint to step-owned orchestration + atomic tectonics ops.
- Removed legacy imports and orchestration helpers from this file to eliminate mega-op posture at this boundary.

## Verification
```yaml
- command: rg -n "ops\\.computeTectonicHistory|computeTectonicHistory\\(" mods/mod-swooper-maps/src -g '*.ts'
  result: "No runtime/step call sites found for computeTectonicHistory; only computeTectonicHistoryRollups call sites remain."

- command: bun run --cwd mods/mod-swooper-maps check
  result: "pass (tsc --noEmit exited 0)"

- command: git diff -- mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
  result: "Owned file now contains only contract binding + fail-fast guardrail; mega-op orchestration body removed."
```
