## Context

The packet rejects broad import bans because they would block legitimate
internals before public surfaces exist. The accepted direction is a narrow
first guard for recipe deep imports after remediation.

## Goals / Non-Goals

**Goals:**

- Make import policy explicit and enforceable.
- Repair only the public surfaces needed for the first recipe guard.
- Avoid encoding current folder topology as architecture.

**Non-Goals:**

- Move all domains into final colocation.
- Ban sanctioned domain package aliases.
- Solve core purity or Studio generated-contract ownership.

## Decisions

### Guard The Recipe Boundary First

The standard recipe is a high-leverage boundary: it should assemble public
domain/stage surfaces instead of deep-reaching into implementation files.

### Policy Before Broad Enforcement

The import matrix is policy. Only the first narrow guard is enforcement in this
change. Broader guards wait until their surfaces exist.

## Risks / Trade-offs

- A premature guard can red-bar later refactors.
- Public surfaces can become broad barrels if they are created without a named
  owner and consumers.

## Review Lanes

- Architecture review: confirms owner and forbidden-owner classifications.
- DX review: confirms imports are understandable for future recipe authors.
- Adversarial review: checks for broad bans, dumping-ground barrels, and guard
  rules that exceed the remediation.
