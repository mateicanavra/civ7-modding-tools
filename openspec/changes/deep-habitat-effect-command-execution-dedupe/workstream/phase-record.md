# Phase Record: Command Execution Dedupe

## Context

Slow-check investigation found that command-backed rules could share identical
command vectors but still execute as separate processes. The public-surface
guard rules were the immediate example.

## Decision

Dedupe command execution at the structural-check domain boundary by grouping
identical command vectors, running once, and projecting the result back to each
rule.

## Closure Notes

- This does not change rule identity or baseline behavior.
- This does not address the fixed Habitat startup/import tax.
- This does not change the native Grit-vs-SourceCheck enforcement decision.
