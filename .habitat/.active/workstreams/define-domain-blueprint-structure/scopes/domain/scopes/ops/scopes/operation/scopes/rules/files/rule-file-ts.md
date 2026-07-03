# Operation Rule File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/rules/*.ts`

Role:
operation-local pure implementation rule.

Required shape:
- implements a pure rule used by the owning operation.

Allowed contents:
- deterministic operation-local implementation logic;
- single-operation helper functions.

Violation messages:
- official Civ7 policy tables;
- adapter/runtime reads or writes;
- cross-operation shared helpers;
- domain-wide model policy.

Import/export boundary:
- consumed through the owning operation implementation surface.

Enforcement:
later operation-internal slice.
