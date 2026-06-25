# domain-refactor-guardrails

Primary category: `boundaries`

Secondary categories: `structure`, `domain-policy`

Lifecycle: `transition`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `domain-refactor-guardrails.baseline.json`
- `domain-refactor-guardrails.check.sh`
- `domain-refactor-guardrails.denylist.txt`
- `domain-refactor-guardrails.rule.json`

Evidence: The shell guardrail bundles migrated-domain checks for adapter/context reach, projection, config, cross-domain use, RNG, and module shape.

Notes:
- Aggregate/profile subject; split later into smaller packets if it remains long-lived.
