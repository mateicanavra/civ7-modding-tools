# Enforce Domain Refactor Boundary Profile

Subject ID: `domain-refactor-guardrails`

Title: Enforce Domain Refactor Boundary Profile

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `structure`, `policy`

Artifact kind: `check`

Lifecycle: `transition`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/domain-refactor-guardrails`

Files:
- `domain-refactor-guardrails.baseline.json`
- `domain-refactor-guardrails.check.sh`
- `domain-refactor-guardrails.denylist.txt`
- `domain-refactor-guardrails.rule.json`

Evidence: The shell guardrail bundles migrated-domain checks for adapter/context reach, projection, config, cross-domain use, RNG, and module shape.

Notes:
- Aggregate/profile subject; split later into smaller packets if it remains long-lived.
