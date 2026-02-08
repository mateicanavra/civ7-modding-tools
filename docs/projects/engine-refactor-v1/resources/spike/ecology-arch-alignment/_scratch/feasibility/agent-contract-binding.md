# Agent A: Step↔Op Contract Feasibility

## Objective

Produce concrete, behavior-preserving recommendations to eliminate any step↔op binding drift (especially `features-plan`), including:
- schema merge implications (`defineStep` op config merging),
- compile-time normalization expectations,
- and how to avoid manual op selection schema duplication.

## Constraints / Guidance

- Do **not** propose production refactor code in this stage; propose contract-level fixes and feasibility notes.
- Ops must remain pure; orchestration stays in steps.
- Steps must not import op implementations directly.
- Do not reindex Narsil MCP.

## Deliverable

Write findings + recommendations here, with file pointers and “why it matters”.

## Findings

TBD.

