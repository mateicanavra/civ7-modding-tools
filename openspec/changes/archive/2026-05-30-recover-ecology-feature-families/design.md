## Context

Vegetation scoring currently treats all visible vegetation as one planner
family, but the features represent different physical niches. Rainforest is
warm and wet closed canopy; taiga is cold but still forested; sagebrush steppe
is dry, open shrubland; savanna woodland is warm, seasonal, and patchy. A
single biomass multiplier and single planner threshold collapse those niches.

The right unit of ownership is still Ecology:

- each score op owns its habitat math;
- `features-plan-vegetation` owns score-to-intent admission and selection;
- shipped configs tune strategy contracts directly;
- `map-ecology` only projects accepted intents into Civ7.

## Design

Repair the family by separating stress from habitat identity. Cold and arid
features may use cold or aridity as positive habitat evidence instead of
receiving the same stress penalty twice. Forest and rainforest continue to use
biomass and moisture as strong canopy evidence.

Add explicit vegetation admission policy per feature inside the vegetation
planner. The policy is not a quota and not a fallback. It defines the minimum
confidence for each feature's own physical signal. If a feature's score does
not pass its own policy, the planner does not emit it.

The strategy should remain deterministic: compute candidates, filter by
feature-local admission, choose the best remaining physical candidate, then
claim occupancy. Do not add randomness to hide bad scoring.

## Product Targets

- Earthlike maps should show a latitudinal succession: rainforest, savanna
  shoulders, temperate forest, boreal/taiga, sparse tundra or ice where the
  map reaches polar/cold bands.
- Desert-mountain identities should show sagebrush/steppe or dry shrubland
  more readily than rainforest.
- Archipelago identities may emphasize warm wet vegetation but still must not
  erase all non-rainforest families unless their climate identity excludes
  them.

## Review Lanes

- Product/domain: feature presence matches physical habitat and map identity.
- Architecture: policies stay owner-local; shared helpers stay mechanical.
- DX: configs expose current strategy contracts without aliases.
- Adversarial: no compensation paths, no generic routing, no one-seed proof.
