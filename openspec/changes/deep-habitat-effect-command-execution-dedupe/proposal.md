# Change: Deep Habitat Effect Command Execution Dedupe

## Why

Habitat should reduce work for humans and agents by turning repeated structure
into one owned operation. Several Habitat rules can intentionally share the same
command vector while interpreting the result through different rule contracts.
Running that command once per rule wastes time and hides the actual execution
shape.

## What Changes

- Group non-format, non-graph command rules by identical executable, argv, and
  cwd.
- Execute each command vector once.
- Project the shared command result back into each consuming rule.
- Mark multi-rule command groups with shared timing metadata.

## Non-Goals

- Do not change command rule diagnostics or baseline behavior.
- Do not dedupe Biome format checks in this slice.
- Do not change graph-backed Nx execution in this slice.
- Do not add topology tests.

## Validation

- Distinct command-check rules continue to execute independently.
- The three Habitat public-surface guard rules share one command execution.
- Root Habitat check remains passing.
