# cutover-source-guardrails

Blueprint: `standard-pipeline`

Primary category: `structure`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `transition`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/standard-pipeline/structure/check/cutover-source-guardrails`

Files:
- `cutover-source-guardrails.baseline.json`
- `cutover-source-guardrails.check.mjs`
- `cutover-source-guardrails.pattern.md`
- `cutover-source-guardrails.rule.json`
- `cutover-source-guardrails.rule.mjs`

Evidence: The check scans runtime source for shim, shadow, comparison, dual-path, and legacy stage-token surfaces after cutover.

Notes:
- Lifecycle is transition because this prevents regression to retired paths; transition is not a primary category.
