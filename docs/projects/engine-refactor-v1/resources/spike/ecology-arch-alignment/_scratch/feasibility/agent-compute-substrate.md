# Agent B: Compute Substrate + Op Modularity

## Objective

Propose a compute-vs-plan op catalog for Ecology aligned to locked directives:
- shared compute substrate ops produce reusable layers,
- atomic per-feature plan ops consume compute outputs,
- maximize modularity.

Also provide a mapping:
- current ops -> target ops (compute vs plan),
- noting any likely “bridge” needs later for behavior preservation.

## Constraints / Guidance

- Ops should import **rules** for behavioral policies (thresholding, selection, spacing, constraints).
  - Rules are internal to ops; steps must not import rules.
- If a function is clearly generic (usable across many ops/domains), it should live in a shared lib:
  - First look in core shared libs (e.g. clamp variations) before inventing new helpers.
  - If missing, record a proposal to place it in shared core MapGen SDK libs (do not implement in feasibility).
- Do not reindex Narsil MCP.

## Findings

TBD.

