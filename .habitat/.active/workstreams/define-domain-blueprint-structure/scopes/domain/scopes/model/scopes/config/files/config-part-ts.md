# Domain Model Config Part File

Status: active working reference

Subject:
`<domain>/model/config/<part>.config.ts`

Role:
one exported domain authoring config object.

Required shape:
- one exported config object or config contract per file.

Allowed contents:
- schema, type, defaults, deterministic compile, and normalization transforms
  local to that config object;
- config-facing constants that exist only to define that object.

Violation messages:
- policy definitions;
- runtime algorithms;
- operation implementation logic;
- external official Civ7 facts;
- adapter behavior;
- broad config barrels.

Import/export boundary:
- consumed by domain authoring, operation contracts, or stage bindings only
  through named owner surfaces.

Enforcement:
structure for placement; later Grit/source-shape if needed.
