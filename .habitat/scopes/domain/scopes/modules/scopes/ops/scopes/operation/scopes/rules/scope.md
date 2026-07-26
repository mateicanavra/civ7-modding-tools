# Operation Rules Scope

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/<operation>/rules/`

Ownership boundary:
pure implementation helpers used only by the owning operation's strategies.

Rules may compose ancestor model atoms and policy. They do not import the
complete operation contract to derive working types, duplicate generic MapGen
utilities, define strategy configuration, access adapters, or reach into
sibling operations.

Reusable semantic computation rises to the nearest model `rules/`; reusable
generic math, grid, hash, clamp, or vector mechanics move to MapGen Core.

Executable authority:
`.habitat/blueprints/domain-operation/require_domain_operation_rule_import_boundaries/`.
