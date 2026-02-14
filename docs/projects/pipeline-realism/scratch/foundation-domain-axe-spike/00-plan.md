# 00 Plan — Foundation Domain Axe Spike

## Charter
Perform a research-only, no-shim, no-legacy investigation of Foundation domain architecture to define a decision-ready target model for:
- stage boundaries,
- step boundaries,
- op/strategy/rule boundaries,
- wiring/contracts,
- viz/tracing boundaries,
- testing/docs guardrails.

This spike explicitly allows breaking current contracts when required for architectural correctness.

## Scope
In scope:
- `mods/mod-swooper-maps/src/domain/foundation/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**`
- Downstream consumers of foundation artifacts where boundary pressure exists.
- Trace/viz surfaces that couple to foundation boundaries.

Out of scope:
- Implementing production refactors.
- Preserving legacy shims/dual paths.

## Acceptance Rubric
A valid spike output must provide:
1. Current-state inventory (stages/steps/ops/strategies/rules).
2. Explicit boundary violations and anti-patterns with evidence.
3. Target stage model options and a chosen recommendation.
4. Target op catalog with decomposition map.
5. Strategy/rules factoring model for major ops (esp. tectonic history).
6. Breaking-change matrix (ops/artifacts/steps/stage compile/public).
7. No-legacy cutover posture (0 shims, 0 dual paths).
8. Test/guardrail and docs plan to enforce architecture.
9. Migration risks + mitigations.
10. Execution-plan handoff inputs.

## Team Axes
- Agent A: boundaries/structure.
- Agent B: op decomposition and strategy/rules factoring.
- Agent C: stage topology and ordering options.
- Agent D: integration/wiring/contracts and break matrix.
- Agent E: visualization/tracing boundary model.
- Agent F: test/docs/guardrails and no-shim enforcement.

## Operating Constraints
- Append-only notes in agent files.
- Every non-obvious claim must include evidence paths.
- No recommendations that preserve compatibility shims.
- Keep proposals pragmatic and implementable.

## Parseability Addendum (YAML)

```yaml
scope_paths:
  foundation_domain:
    - mods/mod-swooper-maps/src/domain/foundation/**
  foundation_stage:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**
  downstream_pressure:
    - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-*/**
  spec_source:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md

deliverable_paths:
  plan: docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/00-plan.md
  master: docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md
  final_spike_doc: docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md

agent_axes:
  A: boundaries-structure
  B: ops-strategies-rules
  C: stage-topology
  D: integration-wiring-contracts
  E: viz-tracing-boundaries
  F: testing-docs-guardrails
```
