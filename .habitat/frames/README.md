# Habitat Method Frames

Status: index for reusable Habitat authority-tree method frames

This directory holds standalone method frames that are meant to survive
compaction and guide future agents through repeatable Habitat authority-tree
work. These frames do not replace the root authority documents. They compose
with them.

Use source order from `.habitat/dominoes.md` first. When a domino names one of
these method frames, read the named frame before selecting files or proposing
moves.

Current frames:

- `BLUEPRINT-KIND-GATHERING-FRAME.md`: use when the next move is to affirm one
  constructible blueprint kind, create its top-level blueprint lane, gather all
  whole-rule authority that belongs to that kind, and demote non-fitting
  evidence into honest `rules/` or `_remainder/` lanes.
- `NICHE-LANE-SHAPING-FRAME.md`: use when a parent niche `rules/` lane is
  acting as a semantic junk drawer and the next move is to shape honest child
  lanes before deeper blueprint, capability, projection, or cleanup work.
