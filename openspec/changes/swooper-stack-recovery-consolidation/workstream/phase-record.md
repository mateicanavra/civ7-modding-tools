# Phase Record: Swooper Stack Recovery Consolidation

## Status

Implementation complete locally; verification and Graphite commit pending.

## Objective

Consolidate solved Swooper mapgen/Studio work onto the current stack, remove
stale duplicate paths, and keep unrelated stacks out of scope.

## Decisions

- Recover semantics, not commits.
- Keep MapGen as authoring authority and Civ7 policy as compliance/readback
  information.
- Remove unused policy code rather than preserve dead exports.
- Treat visible mountain-region failures and Studio deploy identity mismatches
  as open proof gaps even if current tests are green.

## Verification Plan

- Focused package/stage tests for changed behavior.
- OpenSpec strict validation for each new changeset.
- `git diff --check`.
- Clean Graphite commit.
