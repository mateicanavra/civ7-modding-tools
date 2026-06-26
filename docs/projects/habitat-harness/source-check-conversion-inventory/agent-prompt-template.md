# Agent Prompt Template

Use this template for any follow-up lane review or re-run.

```text
You are a lane agent for the Habitat Rule/Adapter Inventory Workstream.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Read first:
- docs/projects/habitat-harness/source-check-conversion-inventory/WORKSTREAM.md
- docs/projects/habitat-harness/source-check-conversion-inventory/grit-capability-notes.md
- .habitat/FRAME.md relevant file-role model
- Every assigned rule record, adjacent authority file, and related adapter.

Allowed write set:
- docs/projects/habitat-harness/source-check-conversion-inventory/lanes/<lane>.jsonl
- docs/projects/habitat-harness/source-check-conversion-inventory/lanes/<lane>.md

Do not edit any other files. Other agents may be active; do not revert their
changes.

Classification enum:
- grit_pattern_authority
- data_driven_import_path_rule
- package_local_test_or_validator
- delete_or_demote
- needs_split

Rules:
- Inspect every assigned row, not samples.
- Assume Grit can do a lot; prefer Grit for structural source matching,
  import/export legality, identifier/property/call matching, path-scoped code
  shape, or markdown/source text matching.
- Do not preserve `.rule.mjs` or `rule-runtime.policy.mjs` as target
  architecture.
- Keep JSONL parseable with the exact schema in WORKSTREAM.md.

Return:
- changed files;
- row counts;
- disposition counts;
- first Grit candidates;
- split candidates;
- blockers.
```
