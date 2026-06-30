# Habitat Execution Support

This directory is a temporary support island for Habitat execution machinery that
must remain under `.habitat` during the authority-tree cleanup.

It is not a niche, blueprint, category, operation kind, or source of authored
policy authority. Packet directories remain the authoring sites for rule
metadata, patterns, baselines, command checks, and operation notes.

Current contents:

- `command-check/`: shared helper code used by command-check scripts.

The former `source-check/runtime/` and `source-check/adapters/` support surfaces
were deleted after the source-check predicates moved to Grit authority. The
remaining target end state is to remove this support island as command-check
compatibility surfaces are converted to durable Habitat execution models.
