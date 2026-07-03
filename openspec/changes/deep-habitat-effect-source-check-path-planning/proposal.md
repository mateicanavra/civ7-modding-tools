# Change: Deep Habitat Effect Source Check Path Planning

## Why

Habitat structural checks should reduce ambiguity by running only the rules
that apply to the files under inspection. Source-check already reads each file
once, but it invoked every selected pattern rule against every file under
overlapping scan roots and relied on generated policy code to reject irrelevant
paths. That kept broad roots expensive and made rule applicability live in the
wrong layer.

## What Changes

- Carry registry `pathCoverage` into pattern-rule execution facts.
- Move path-coverage glob matching into the rule-registry domain for reuse.
- Let source-check prefilter files by exact path coverage before invoking
  generated policy logic.
- Preserve scan-root fallback for unresolved, project-owner, and workspace-gate
  coverage.

## Non-Goals

- Do not change rule registry records or generated policy artifacts.
- Do not remove the fallback behavior for unresolved metadata.
- Do not add structural/topology tests.
- Do not reintroduce live Grit for ordinary structural checks.

## Validation

- Habitat structural check must still pass.
- Habitat package test/check/build must still pass.
- OpenSpec validation and whitespace checks must pass before closure.
