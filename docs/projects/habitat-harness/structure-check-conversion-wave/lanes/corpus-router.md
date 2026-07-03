# Corpus / Router Lane

Status: refreshed against current disk.

Key corrections:
- The old corpus row for `preserve_standard_stage_topology_and_path_invariants`
  is stale; that topology is already `structure-check`.
- Current `structure/check` paths include several false positives:
  graph/taxonomy, stage order, runtime parity, source-token bans, package JSON,
  Nx target shape, and evaluated config are not structure-check.
- The new corpus records assertion owners using the current owner model:
  `structure-check`, `grit-check`, `existing-rule`, `nx-data`,
  `package-local-validator`, and `delete-demote`.
