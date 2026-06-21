# Change: Deep Habitat Effect Source Check Rule Extension Plans

## Why

Source-check rule execution still uses one global candidate extension set for
every selected rule. That makes JSON-capable rules widen the scan surface for
rules that can only diagnose TypeScript source, and it keeps rule behavior
partly hidden in central scan-root code instead of named rule capabilities.

## What Changes

- Add explicit candidate-extension metadata to every source-check rule module.
- Require rule modules to export their candidate extensions.
- Use selected rule-module extensions when collecting source paths.
- Keep staged hook path eligibility unchanged in this slice.

## Non-Goals

- Do not change rule diagnostics or baselines.
- Do not move rule modules back under `.habitat`.
- Do not add structural topology tests.
