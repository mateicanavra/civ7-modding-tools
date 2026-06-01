## Context

The packet identifies old single-stage roots and centralized catalogs as
ownership drift. Ecology has a dedicated topology slice, but morphology hubs,
recipe tags, and broad config/catalog files still need a non-overlapping owner
cleanup.

## Goals / Non-Goals

**Goals:**

- Move morphology hub code to the nearest real owner.
- Decompose multi-owner catalogs.
- Make tag ownership final enough for G1/G2.
- Preserve legitimate shared config surfaces when their invariant and
  consumers are explicit.

**Non-Goals:**

- Ban every `config.ts` file.
- Fold Ecology feature-family wrappers.
- Change hydrography or placement behavior.

## Decisions

### Catalogs Are Allowed Only With Named Ownership

A catalog may remain only when it is a thin barrel or an explicit shared
surface with a named invariant and concrete consumers. Otherwise, entries move
to their owning stage/domain/step.

### Domain Config Is Not Categorically Forbidden

Domain-level config can be legitimate when truly shared. The smell is a
multi-owner dumping ground, not the filename itself.

## Risks / Trade-offs

- Over-banning shared surfaces can duplicate config and weaken DX.
- Under-classifying catalogs leaves G1/G2 unenforceable.
- Tag edits can conflict with Ecology topology work; coordinate shared files.

## Review Lanes

- Architecture review: confirms nearest-owner placement and shared-surface
  invariants.
- Product/DX review: checks tag/config readability.
- Adversarial review: searches for new dumping grounds and false bans on
  legitimate shared config.
