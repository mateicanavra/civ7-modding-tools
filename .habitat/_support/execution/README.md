# Habitat Execution Support

This directory is a temporary support island for Habitat execution machinery that
must remain under `.habitat` during the authority-tree cleanup.

It is not a niche, blueprint, category, artifact kind, or source of authored
policy authority. Packet directories remain the authoring sites for rule
metadata, patterns, baselines, command checks, and operation notes.

Current contents:

- `source-check/runtime/`: shared legacy source-check runtime helpers.
- `source-check/adapters/`: transitional `.rule.mjs` adapters loaded by the
  source-check runner.
- `command-check/`: shared helper code used by command-check scripts.

The target end state is to remove this support island as source-check and
command-check compatibility surfaces are converted to durable Habitat execution
models.
