# Mechanical Extraction Prep

Status: Round 1 prep reviewed and shored up.

## What This Prep Covers

This prep packet covers the retained mixed command-check rows from
`docs/projects/habitat-harness/command-check-split-systematic-wave/closure.md`:

- `enforce_domain_refactor_boundary_profile`
- `preserve_decomposed_foundation_contract_surfaces`
- `preserve_morphology_contracts_and_overlay_ownership`
- `require_owned_domain_config_catalog_surfaces`
- `validate_mapgen_docs_anchors_and_references`

It does not implement code changes. It turns the already-classified assertion
corpus into extraction-ready rows for the next turn.

## Canonical Prep Corpus

Use `mechanical-extraction-inputs.jsonl`.

Rows: 74.

By segment:

- `domain-aggregate-profile`: 35
- `foundation-contract-surfaces`: 16
- `morphology-contract-overlay-ownership`: 14
- `domain-config-catalog-surfaces`: 4
- `mapgen-docs-reference-quality`: 5

By final owner:

- `grit-check`: 43
- `package-local-validator`: 12
- `existing-rule`: 12
- `structure-check`: 3
- `needs-split`: 1
- `delete-demote`: 3

By prep status:

- `ready-for-implementation`: 61
- `ready-for-split-implementation`: 1
- `ready-to-retain-or-move`: 12

## What Changed From The Prior Corpus

The prior corpus already had the classification substance. This prep adds the
implementation-facing fields:

- `finalOwner`
- `prepStatus`
- `nextRoundAction`
- `targetPacketHint`
- `extractionInputs`
- `commandScript`
- `commandBranchLocator`
- `currentEvidenceCommands`
- `futureProofCommands`
- `proposedRuleId`

The main correction is that prior `data-driven-topology` rows are no longer
treated as one bucket:

- pure file/directory topology becomes `structure-check`;
- exact positive token/currentness checks become `package-local-validator`;
- mixed file-shape plus schema/JSDoc quality becomes `needs-split`.

The fresh review pass also split coarse rows that were previously too broad for
mechanical extraction:

- `foundation-full-profile-cleanup`
- `hydrology-narrative-cleanup`
- `removed-foundation-surface-token-sweep`
- `foundation-tectonics-strategy-imports`
- `focused-tectonics-op-contracts`
- `runtime-continent-token-bans`
- `morphology-dual-read-and-overlay-implementation-bans`
- `global-full-profile-source-bans`

The prep now also includes current aggregate-script branches that were missing
from the older corpus:

- `milestone-prefixed-recipe-tag-catalogs`
- `domain-refactor-example-heightfield-buffer`
- `domain-refactor-example-map-artifacts-effects`

## Round 2 Ready Rows

The next implementation turn can mechanically execute rows marked
`ready-for-implementation`:

- create narrow Grit packets for `grit-check` rows;
- create TOML structure packets for `structure-check` rows;
- remove duplicate aggregate branches for `existing-rule` rows after companion
  proof;
- delete/demote the profile wrapper branch;
- keep package-local/currentness rows as honest residual command checks unless
  an accepted package-local or manifest-backed owner already exists.

The one `ready-for-split-implementation` row is
`enforce_domain_refactor_boundary_profile:ecology-canonical-module-shape`; it
must split file-tree topology from schema-description/JSDoc quality before any
code edit.

All `ready-for-implementation` rows include a command branch locator and future
proof command/template. Placeholder `<new-...-rule-id>` values must be replaced
with the actual new rule id during Round 2 implementation.

## Review Questions

Fresh reviewers should check:

1. Does `mechanical-extraction-inputs.jsonl` cover every branch of the five
   retained command checks?
2. Are any `structure-check` rows actually source/currentness/package behavior?
3. Are any `grit-check` rows too broad to implement as useful Grit authority?
4. Are retained `package-local-validator` rows honestly non-Grit/non-structure,
   or are any ready for extraction now?
5. Are the next-round actions specific enough that an implementation agent can
   edit files without another classification pass?
