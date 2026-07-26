# Domain Model Scope

Status: active working reference

Subjects:

- `<domain>/model/`
- `<domain>/modules/<module>/model/`

Ownership boundary:
level-appropriate semantic vocabulary. A module model owns language and laws
used only by that module. A domain model exists only for vocabulary shared by
multiple sibling modules.

Allowed children:

- `atoms/`: composable TypeBox schema primitives and derived types;
- `policy/`: semantic decisions, thresholds, classifications, and selection law;
- `rules/`: pure reusable domain computation shared at that exact level.

The model is not a general-purpose `shared`, `support`, `data`, `schemas`, or
config directory. Full operation envelopes, full artifact schemas and
validation, runtime wiring, recipe logic, adapters, and generic math helpers
remain with their respective owners.

Executable authority:
`.habitat/blueprints/domain/require_domain_model_source_topology/`.
