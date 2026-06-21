# Change: Deep Habitat Effect Source Check Rule Modules

## Why

Source-check still represents every native rule implementation as one policy
module. That shape makes a single rule edit invalidate unrelated rule targets
and keeps Habitat's rule catalog as a switch-driven blob instead of named rule
capabilities.

## What Changes

- Replace the monolithic source-check policy file with source-owned per-rule
  implementation modules under
  `tools/habitat-harness/src/domains/source-check/rules/`.
- Keep common TypeScript/text helper logic in one shared source-check runtime
  module.
- Load only the selected rule modules during source-check execution.
- Scope Nx direct rule target inputs to the selected rule module plus the shared
  runtime instead of the old all-rules policy file.
- Register `.habitat` as the Habitat artifact project so top-level Habitat
  artifacts have an explicit project owner in the Nx graph.

## Non-Goals

- Do not preserve the old policy file as a compatibility bridge.
- Do not keep executable source-check rule logic under `.habitat`.
- Do not add structural topology tests.
- Do not change registered rule semantics, baselines, or diagnostics.
- Do not solve generic `check` target expansion for Habitat artifact edits in
  this slice.
