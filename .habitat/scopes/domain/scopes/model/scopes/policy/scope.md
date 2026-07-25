# Domain Model Policy Scope

Status: active working reference

Subjects:

- `<domain>/model/policy/`
- `<domain>/modules/<module>/model/policy/`

Ownership boundary:
semantic policy at the lowest level that owns it. Module-local policy stays
with that module; only genuinely cross-module policy rises to the domain model.

Policy may define classifications, thresholds, scoring, selection, or
interpretation over domain concepts. Official Civ7 facts belong to Civ7 types
or policy, generic algorithms belong to MapGen Core, and executable operation
logic belongs to rules or strategies.

The closed directory contains named `*.ts` concerns and no `index.ts` barrel.

Executable authority:

- `.habitat/blueprints/domain-policy/require_domain_policy_source_topology/`
- `.habitat/blueprints/domain-policy/require_domain_policy_owner_shape/`
