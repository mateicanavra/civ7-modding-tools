# Closure

Status: closed

## Current State

- `enforce_domain_refactor_boundary_profile` packet deleted.
- `verify_studio_recipe_artifacts_are_current` packet deleted.
- `validate_ecology_op_contract_quality` created as a package-local validator.
- `require_ecology_canonical_op_module_topology` is green.
- `validate_mapgen_docs_anchors_and_references` implementation moved to docs tooling and is green.
- `validate_boundary_taxonomy_against_workspace_graph` implementation moved to Habitat Toolkit tooling and is green.
- Remaining command-check packets are labeled by residual owner class in packet metadata.
- Root `ci:architecture-strict-core` no longer invokes the deleted aggregate packet; it now runs explicit Grit, structure, and command owner checks.

## Retained Owner Rationale

- Package-local validators remain for package behavior, generated-output correctness, and contract parity.
- Docs validators remain for link/anchor/reference policy that needs filesystem resolution and warning modes.
- Workspace graph validators remain for cross-resource consistency across manifests, Nx metadata, boundary config, and taxonomy docs.
- Future owner gaps remain labeled where the packet should later move to Grit, structure-check, or a generic import/topology owner.

## Deleted Owner Rationale

- The old domain aggregate shell was a no-op by default and only retained an ecology quality branch in a hidden profile. That branch now has a narrow package-local owner.
- Studio artifact freshness duplicated Nx/package build ordering and preflight behavior, so Habitat no longer owns it as authority.

## Next Dominoes

- Convert labeled future owner gaps in remaining command-check packets: Studio topology to structure-check, pure source predicates to Grit, and import-boundary rows to Grit or a generic import-boundary owner.
- Decide whether package-local validator rows need package scripts/targets rather than Habitat command delegation.
- Continue shrinking command-check only when each remaining assertion has a proven owner.

## Stale Reference Boundary

Current scripts, rule records, category paths, and execution-surface analytics no
longer treat the deleted aggregate/profile or Studio freshness packets as live.
Historical project corpora may still mention deleted packet ids as extraction
evidence.
