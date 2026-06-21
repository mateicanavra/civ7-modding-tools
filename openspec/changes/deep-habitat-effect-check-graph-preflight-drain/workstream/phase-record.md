# Phase Record: Check Graph Preflight Drain

## Context

Import-boundaries remained slow after switching from single-target `run-many` to
direct single-target execution. Measurement showed direct Nx target execution was
materially faster than Habitat's wrapped path, and graph generation itself was a
large cost.

## Decision

Remove the structural-check graph preflight. Check execution now relies on the
owning provider target to run or fail.

## Closure Notes

- This reduces avoidable check-time graph work.
- This does not change classify or verify graph planning.
- This keeps graph metadata as routing data instead of preflight execution
  authority.
