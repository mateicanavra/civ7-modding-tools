# Habitat Authored Artifacts

This directory contains checked-in Habitat data authored for this repository.
The Habitat SDK code under `tools/habitat-harness` manages, validates, and
reads these artifacts, but the package source tree is not the owner of the
authored rule pack, patterns, or baselines.

Current artifact planes:

- `rules/index.json`: shared rule registry metadata.
- `rules/<rule-id>/rule.json`: one self-contained record per registered Habitat
  rule, parsed through the
  TypeBox registry schema in `tools/habitat-harness/src/rules/registry`.
- `baselines/*.json`: explicit baseline files for registered rules, parsed
  through the baseline contract.
- `patterns/checks/*.md`: active Habitat check patterns.
- `patterns/apply/*.md`: active Habitat apply patterns.

Executor compatibility views are outside this authored artifact tree. Habitat
owns the rule, pattern, and baseline hierarchy here; adapter-specific paths are
implementation details.
