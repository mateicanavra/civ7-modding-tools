# Phase Record: Check Shared Timing

## Context

Slow-check review showed the root check output repeating the same elapsed time
for every pattern rule. The implementation was already sharing work, but the
report shape made that shared work look like many independent expensive runs.

## Decision

Represent shared execution timing explicitly in rule reports and render it as a
group-level operation in human output.

## Closure Notes

- This slice improves the truthfulness and usability of Habitat check output.
- It does not optimize the fixed Habitat startup tax.
- It does not decide whether pattern enforcement should be native Grit or the
  current SourceCheck engine.
