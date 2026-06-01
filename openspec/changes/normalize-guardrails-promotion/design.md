## Context

The normalization packet names G1-G9 guardrails, but it also states they should
be added after cleanup. This slice turns implemented structure into durable
mechanical checks and long-lived docs.

## Goals / Non-Goals

**Goals:**

- Enable relapse guards only after corresponding cleanup is complete.
- Promote implemented decisions into durable docs/specs.
- Archive completed OpenSpec changes with evidence.
- Keep proof claims scoped.

**Non-Goals:**

- Implement the primary refactor slices.
- Use guards to force unfinished architecture through red CI.
- Archive proposal-only change specs.

## Decisions

### Guardrails Are Closure Evidence

A guard is enabled only when it proves achieved structure. If a guard is useful
earlier, it must be scoped to behavior that already passes and state what it
does not prove.

### Promotion Follows Implementation

OpenSpec specs and evergreen docs are promoted after source behavior and tests
exist. They do not replace the packet as authority for unimplemented target
shape.

### Promotion Ceremony Names The New Authority

Promotion requires four things: accepted implementation evidence, evergreen
doc/ADR/OpenSpec spec update, packet status or cross-reference update naming
the superseding authority, and OpenSpec archive for the completed change.
Archiving without those records is history, not authority promotion.

## Risks / Trade-offs

- Enabling guards too early creates pressure for shims or broad exceptions.
- Promoting target architecture before implementation recreates the original
  doc-gravity problem.
- OpenSpec validation can be overclaimed as behavioral proof.
- Archiving a change can be mistaken for promotion unless the superseding
  authority is named.

## Review Lanes

- Architecture review: maps each guard to achieved owner boundaries.
- Product/proof review: checks docs and proof claims.
- Adversarial review: checks red-bar risk, broad exceptions, and premature
  archive/promotion.
