# Round 2 Review Ledger

## Grit / Structure Review

Reviewer: Grit / Structure Reviewer.

Findings:

- P2: `require_ecology_canonical_op_module_topology.structure.toml` enumerated
  current ecology op directories instead of using a durable root pattern.
  Resolution: changed the root to
  `mods/mod-swooper-maps/src/domain/ecology/ops/!(*.*)` so new ecology op
  directories are checked automatically.
- P2: `prohibit_domain_artifacts_modules.structure.toml` enumerated current
  domain directories instead of using a durable root pattern.
  Resolution: changed the root to
  `mods/mod-swooper-maps/src/domain/**/!(*.*)` so all current and future domain
  directories are checked for forbidden `artifacts.ts` direct children.
- P2: `prohibit_legacy_morphology_module_imports.pattern.md` used broad
  file-wide `contains` for an import ban.
  Resolution: changed the pattern to `import_statement(source=$source)`.
- P2: `prohibit_morphology_stage_config_bag_imports.pattern.md` used broad
  file-wide `contains` for an import ban.
  Resolution: changed the pattern to `import_statement(source=$source)`.
- P2: `prohibit_morphology_overlay_implementation_reads.pattern.md` used broad
  file-wide `contains` for overlay reads.
  Resolution: changed the overlay-module branch to import-source matching and
  the `readOverlay` branch to call syntax matching.

Post-review focused proofs passed for the three tightened Morphology Grit rules
and for `prohibit_domain_artifacts_modules`. The ecology topology rule remains
red on real current-tree topology debt after the durable root-pattern fix.

## Proof / Closure Review

Reviewer: Proof / Closure Auditor.

Findings:

- P1: `proof-ledger.md` and `closure.md` still described pending work after the
  implementation diff existed.
  Resolution: updated the proof ledger and closure record with segment results,
  aggregate proof status, expected reds, final row accounting, and known
  residual owners.
- P2: two assertion rows map to one Grit packet:
  `milestone-prefixed-recipe-tag-catalogs` and
  `milestone-tag-catalog-name-ban`.
  Resolution: recorded the intentional shared coverage in the proof ledger and
  closure record. This is why 43 Grit assertion rows materialize as 42 new Grit
  packets.

No P1/P2 findings remain open.
