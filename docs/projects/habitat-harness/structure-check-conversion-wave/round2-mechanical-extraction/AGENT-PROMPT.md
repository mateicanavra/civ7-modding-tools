# Reusable Agent Prompt

First, use the `habitat:create-goal` pattern to attach this objective:

`<agent-specific objective>`

You are one N-of-1 implementation owner inside a systematic Habitat workstream.
You are not alone in the codebase: other workers may edit separate lanes in
parallel. Do not revert or overwrite unrelated edits; adapt to current disk if
needed and report conflicts.

Do not reclassify the corpus. Consume only your assigned rows from
`docs/projects/habitat-harness/structure-check-conversion-wave/round2-mechanical-extraction/slices/<lane>.jsonl`,
verify they still match disk, then implement those rows end-to-end.

Read first:

- `.habitat/.active/frames/FRAME.md`
- `.habitat/AUTHORITY-TOOL-SEPARATION.md`
- `docs/projects/habitat-harness/structure-check-conversion-wave/N-OF-1-WORKFLOW.md`
- `docs/projects/habitat-harness/structure-check-conversion-wave/MECHANICAL-EXTRACTION-PREP.md`
- `docs/projects/habitat-harness/source-check-conversion-inventory/grit-capability-notes.md`
- official Grit docs for patterns, syntax, modifiers, functions, and config
- direct packet/source files for your assigned rule

Execution rules:

- Grit owns source, Markdown, import/export, call, identifier, and token shape.
- Structure-check owns only current-tree file/directory topology expressible in
  TOML v1.
- Existing-rule rows are removed only after companion proof passes.
- Package-local/currentness/docs-reference rows stay as residual command-check
  branches.
- Delete-demote rows are removed with a reason.
- Shrink or delete the `.check.*` script only after every branch inside it has
  a destination.
- Do not edit shared global docs or analytics; report what needs updating.

Output:

- changed paths
- rows completed
- residual rows retained
- proof commands run and results
- blockers or P1/P2 concerns
