# Rule Remediation: MapGen Docs Anchor Rail

Status: closed on `codex/habitat-mapgen-docs-anchor-rail`

## Slice

Selected rule:

- `validate_mapgen_docs_anchors_and_references`

Input action class: split by owner.

## Decision

The row did not require a semantic split before progress. The current failure
was a stale authority-tree anchor in a canonical MapGen docs policy file.

The existing native docs validator remains the right rail for MapGen canonical
docs anchor/reference hardening.

## Mutation

- Updated the stale anchor in
  `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md` from the old
  `_blueprints/civ7-adapter` packet path to the current
  `civ7/platform/adapter/rules` path.

## Proof

- `bun habitat check --rule validate_mapgen_docs_anchors_and_references --json`
  passed after the anchor repair.

## Proof Limit

This slice does not split warning policies into separate validators. It only
repairs the blocking stale anchor and closes the stale split-by-owner
classification for this row.
