# Rule Remediation: Residual Cascade Re-Read

Status: closed on `codex/habitat-cascade-residual-reread`.

Canonical record:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`.

This file is a receipt only. It is not a second operational matrix.

## Purpose

Re-read the residual cascade state after Domino 87 and repair the canonical
blocker list so future resumes do not reprocess already-closed rows.

## Corpus Check

| Check | Result |
| --- | --- |
| Live rule manifests | 113 |
| Current JSON rows | 113 |
| Missing live rows | none |
| Stale current rows | none |
| Missing runner/support files | none |
| Implementation-ready queue | empty |

## Residual Rows Re-Read

| Rule id | Current conclusion | Why no Layer 3 slice was created |
| --- | --- | --- |
| `enforce_formatting_and_import_hygiene` | valid workspace hygiene gate; still red from broad Biome drift | Fixing formatter/import drift is a workspace cleanup, not authority-tree rule remediation. |
| `prohibit_ambient_rng_in_authored_generation` | deterministic authored-generation authority candidate | Needs exception policy and positive authority before proxy retention/deletion. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | hairy split-by-owner row | Mixes deterministic-generation, lexical cleanup, owner-specific generator, and projection/runtime clauses. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | helper/import positive authority candidate | Existing receipts require a named positive helper/import surface before admission or deletion. |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | tag/effect family positive authority candidate | Must be paired with catalog-family authority rather than opportunistic retired-token deletion. |
| `require_standard_recipe_tag_catalog_owner_tokens` | split-by-owner row over the standard tag catalog | Spans field, engine, map projection, and placement product tag ownership. |

The other residual blockers remain as previously sealed:

- morphology/story overlay ownership: `prohibit_morphology_hotspot_overlay_publishers`,
  `prohibit_morphology_story_overlay_contract_artifact`;
- recipe-step declared-dependency authority:
  `prohibit_morphology_overlay_implementation_reads`;
- public-domain test import authority or scan capability:
  `require_public_domain_surfaces_in_tests`;
- ecology operation contract quality positive authority:
  `validate_ecology_op_contract_quality`.

## Record Repair

- Pruned resolved row ids from the canonical sealed blocker list.
- Recomputed remaining packet-needed counts from current JSON rows.
- Preserved an empty implementation-ready queue.
- Recorded this re-read as an operator finding inside the canonical JSON.

## Closure

No authority-tree mutation was performed. The next deterministic move is a
semantic Layer 2 decision packet or user-owned architecture decision for one of
the remaining stop classes.
