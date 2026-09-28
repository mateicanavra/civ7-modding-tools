# Ecology measurements

**Executable authority:** [`families/ecology.ts`](../../families/ecology.ts)

This family measures biome diversity and dominance, row-wise biome variety,
adjacent-row rainforest-share transitions, cold-biome coverage, unclassified
modeled land, feature counts, wetland/reef/vegetation family coverage, cold
reefs on coast, feature-surface legality, broad habitat mismatches, and feature
attempt/rejection evidence.

Feature membership comes from the canonical captured Civ7 feature corpus. Counts
retain land, water, or coast populations as appropriate. Identity-specific
feature requirements and ecological share budgets remain target policy.

`biomeRows.dominantBiomeTiles` sums the modal classified-biome count separately
in each row with at least 20 modeled land tiles. Its population is all modeled
land in those same rows; its share is therefore land-weighted, not an unweighted
average of row shares. Biome IDs remain categories, and unclassified 255 is
excluded from modes while retained in the separate integrity count. No qualified
rows means an empty population, not zero dominance. The existing rainforest-row
qualification uses the same 20-land floor.
