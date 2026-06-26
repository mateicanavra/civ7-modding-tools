# Change: Deep Habitat Effect Source Check Rule Index

## Why

Source-check already reads each planned source file once, but dispatch still
recomputes rule/file applicability while walking the selected rule set. That
makes the local check path scale toward `files x rules` even when rule metadata
already says which files can matter.

## What Changes

- Compile each selected source-check rule into a file-plan matcher once.
- Read only files matched by supported source-check rules.
- Carry each file's matching rule plans with the file record.
- Dispatch diagnostics only to the matching plans for that file.

## Non-Goals

- Do not rewrite the generated source-check policy module in this slice.
- Do not replace source-check with native Grit.
- Do not add topology tests for check structure.

## Validation

- `bun run --cwd tools/habitat-harness check`
- `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- `bun run openspec -- validate deep-habitat-effect-source-check-rule-index --strict`
