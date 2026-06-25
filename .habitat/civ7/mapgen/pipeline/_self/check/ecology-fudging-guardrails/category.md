# ecology-fudging-guardrails

Primary category: `domain-policy`

Secondary categories: `execution-context`, `boundaries`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `ecology-fudging-guardrails.baseline.json`
- `ecology-fudging-guardrails.check.ts`
- `ecology-fudging-guardrails.rule.json`

Evidence: The check forbids fudge/chance/RNG terms in authored planning surfaces and also blocks legacy generator calls in runtime-adjacent placement/hydrology code.

Notes:
- Mixed packet: semantic generation policy is primary, with execution-context and boundary concerns also present. Avoid promoting ecology to a universal category.
