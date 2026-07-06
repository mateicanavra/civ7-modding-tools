# Operation Strategy File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/strategies/*.ts`

Role:
operation-local strategy implementation.

Required shape:
- implements one strategy for the owning operation.

Allowed contents:
- strategy implementation logic;
- imports from approved operation-local contract, type, policy, and rule
  surfaces.

Violation messages:
- domain-wide policy definitions;
- direct official Civ7 fact table ownership;
- imports from another operation's private implementation surface.

Import/export boundary:
- consumed by the owning operation implementation.

Enforcement:
later operation-internal slice.
