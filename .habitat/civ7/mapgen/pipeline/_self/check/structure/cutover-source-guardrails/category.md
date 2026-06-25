# cutover-source-guardrails

Primary category: `structure`

Secondary categories: `boundaries`

Lifecycle: `transition`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `cutover-source-guardrails.baseline.json`
- `cutover-source-guardrails.check.mjs`
- `cutover-source-guardrails.pattern.md`
- `cutover-source-guardrails.rule.json`
- `cutover-source-guardrails.rule.mjs`

Evidence: The check scans runtime source for shim, shadow, comparison, dual-path, and legacy stage-token surfaces after cutover.

Notes:
- Lifecycle is transition because this prevents regression to retired paths; transition is not a primary category.
