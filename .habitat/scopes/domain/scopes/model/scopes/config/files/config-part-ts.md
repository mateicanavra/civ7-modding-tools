# Domain Model Config Part File

Status: active working reference

Subject:
`<domain>/model/config/<part>.config.ts`

Role:
one exported reusable domain primitive or config contract.

Required shape:
- one exported reusable schema fragment, enum, type, invariant, defaults object,
  object-local normalizer, or config contract per file;
- no stage authoring surface, stage public schema, or public-to-internal compile
  mapping.

Allowed contents:
- schema, type, enum, defaults, and invariant constants local to the primitive
  or contract;
- deterministic mapping functions only when they are object-local invariants or
  normalizers for the primitive or contract;
- config-facing constants that exist only to define that primitive or contract.

Violation messages:
- stage authoring public schemas;
- stage `knobsSchema` surfaces;
- public-to-internal stage compile mappings;
- broad config barrels;
- reusable semantic policy definitions;
- runtime algorithms;
- operation implementation logic;
- external official Civ7 facts;
- adapter behavior;

Import/export boundary:
- consumed by operation contracts, domain policy, or stage authoring surfaces as
  a primitive input;
- not consumed as a domain-owned public authoring config surface.

Enforcement:
structure for placement; later Grit/source-shape if needed.
