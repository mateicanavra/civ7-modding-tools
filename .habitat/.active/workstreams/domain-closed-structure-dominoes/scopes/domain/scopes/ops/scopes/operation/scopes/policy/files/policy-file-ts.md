# Operation Policy File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/policy/*.ts`

Role:
one operation-local policy concern.

Required shape:
- defines one named policy concern used by the owning operation.

Allowed contents:
- operation-local constants, predicates, and selection rules for the owning
  operation.

Violation messages:
- domain-wide model policy;
- official Civ7 facts;
- reusable helper libraries;
- adapter or runtime behavior.

Import/export boundary:
- imported by the owning operation only unless a later public surface law says
  otherwise.

Enforcement:
later operation-internal slice.
