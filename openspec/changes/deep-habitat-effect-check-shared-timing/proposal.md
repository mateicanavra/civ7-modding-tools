# Change: Deep Habitat Effect Check Shared Timing

## Why

Habitat checks should help humans and agents understand repository health
without inventing noise. Pattern and graph-backed checks often run shared work
once, then project the result across many rules. Reporting the shared duration
as though every rule performed a separate expensive run makes the toolkit feel
slower and more confusing than it is.

## What Changes

- Add structured timing metadata to rule reports.
- Mark grouped source-check pattern execution as shared work.
- Mark grouped graph-backed Nx execution as shared work.
- Render shared work once in human output while preserving per-rule status and
  diagnostics.

## Non-Goals

- Do not change rule selection, baseline application, or pass/fail behavior.
- Do not add structural topology tests.
- Do not decide the native Grit-vs-SourceCheck enforcement question.
- Do not optimize the fixed Habitat startup/process tax in this slice.

## Validation

- Shared timing must validate through the existing check report schema.
- Single-rule checks must continue rendering a concrete duration.
- Multi-rule shared checks must render a shared-work summary.
- Root Habitat check must remain passing.
