# Domain Model Atoms Scope

Status: active working reference

Subjects:

- `<domain>/model/atoms/`
- `<domain>/modules/<module>/model/atoms/`

Ownership boundary:
small composable TypeBox schema primitives and their derived types. Atoms name
domain concepts that multiple contracts or artifacts compose; they do not
stand in for any consumer's complete envelope.

The closed directory contains `index.ts` and `*.schema.ts` atom owners. It does
not contain full operation input/output schemas, full artifact payload schemas,
validation callbacks, policy, runtime logic, or generic config bags.

Executable authority:

- `.habitat/blueprints/domain-atom/require_domain_atom_source_topology/`
- `.habitat/blueprints/domain-atom/require_domain_atom_owner_shape/`
