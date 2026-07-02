# Domain Model Data File

Status: active working reference

Subject:
`<domain>/model/data/<collection>/*.ts`

Role:
domain-owned authored data or expectation table.

Required shape:
- contributes to the named collection only.

Allowed contents:
- domain-owned planning data;
- authored expectation tables;
- typed rows and local validation required to express that collection.

Violation messages:
- generated official Civ7 policy catalogs;
- runtime ID materialization against engine APIs;
- adapter behavior;
- algorithm helper storage;
- unlabeled evidence dumps.

Import/export boundary:
- consumed through named domain model owner surfaces.

Enforcement:
structure for placement; semantic proof before movement.
