# 00 Plan — M4 Foundation Domain Axe Cutover

## Charter
Execute the M4 planning-phase deliverables into implementation-ready artifacts:
- hardened milestone,
- local issue pack,
- stack ledger with Graphite slices and gates,
- prework sweep outcomes,
- orchestrator + agent scratchpads.

## Locked Decisions
1. 3-stage topology is fixed:
   - `foundation-substrate-kinematics`
   - `foundation-tectonics-history`
   - `foundation-projection`
2. Lane split is phased, but final state allows no bridges/shims.
3. Dead/inert config and strategy knobs are removed now.
4. Structure-first execution, then dedicated tuning slice.
5. Immediate strict core guardrails (CI/lint/test) posture.

## Required Sequence
1. Draft M4 milestone from spike outcomes.
2. Harden milestone into decision-complete parent issues.
3. Break milestone into local issue docs.
4. Sweep unresolved prework prompts into findings/explicit decisions.
5. Lock milestone as source-of-truth index and issue docs as execution units.

## Output Paths
```yaml
artifacts:
  milestone_doc: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  issues_root: docs/projects/pipeline-realism/issues
  scratch_root: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  stack_ledger: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  decision_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
```

## Validation Gates
```yaml
gates:
  G0:
    - bun run build
    - bun run lint
    - bun run test:ci
  G1:
    - bun run lint
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run check
  G2:
    - no-op-calls-op scan
    - no-dual-contract-path scan
    - no-shim-surface scan
    - topology-lock scan
  G3:
    - downstream compile success after lane rewires
  G4:
    - deterministic seed suite + intent-fit checks for presets
  G5:
    - no legacy/shadow paths
    - docs/comments/schema parity
    - bun run test:ci
```

## Working Rules
1. All scratch files are append-only.
2. Path-heavy evidence must be represented in YAML blocks.
3. Each scratch file ends with required sections:
   - `Proposed target`
   - `Changes landed`
   - `Open risks`
   - `Decision asks`

## Proposed target
- M4 milestone + issue pack is decision-complete and implementation-ready.

## Changes landed
- This execution charter has been initialized in the execution worktree.

## Open risks
- New top-of-stack branches may appear during planning artifact generation.

## Decision asks
- none
