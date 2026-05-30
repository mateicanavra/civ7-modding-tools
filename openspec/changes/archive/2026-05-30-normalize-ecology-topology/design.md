## Context

The packet rejects both extremes: a single ecology blob and one stage per
feature-family wrapper. The stage-promotion rule is the controlling test.
Pedology, biomes, and features have different input/handoff surfaces;
individual vegetation/ice/reef/wetland wrappers do not automatically have
stage-level identity.

## Goals / Non-Goals

**Goals:**

- Normalize ecology recipe topology to the accepted stage set.
- Preserve behavior with explicit equivalence evidence.
- Move stale hub code to real owners.
- Keep projection work in `map-ecology`.

**Non-Goals:**

- Redesign ecology algorithms.
- Add new feature-family public knobs just to justify stages.
- Change resource/discovery placement behavior.

## Decisions

### Stage Identity Follows Input And Handoff Surfaces

`ecology-pedology`, `ecology-biomes`, and `ecology-features` remain because
they own distinct input families and handoff artifacts. Feature-family logic
belongs inside `ecology-features` until it has stage-level triggers.

### map-ecology Is Projection

`map-ecology` may write engine biome IDs, feature types, plot effects,
diagnostics, and parity evidence. It must not own truth scoring or planning.

## Risks / Trade-offs

- Folding wrappers can change feature ordering or occupancy cascades. Golden
  or output-equivalence evidence is required.
- Configs and Studio metadata may still reference removed stage IDs.
- A shared ecology helper can become a new dumping ground if owner and
  consumers are not named.

## Review Lanes

- Architecture review: applies the stage-promotion rule.
- Product/DX review: checks config, Studio, trace, and docs impact.
- Adversarial review: searches for hidden truth in `map-ecology`, stale stage
  IDs, and behavior drift masked as topology cleanup.
