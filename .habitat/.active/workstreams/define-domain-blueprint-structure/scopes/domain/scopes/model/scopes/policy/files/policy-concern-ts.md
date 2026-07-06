# Domain Model Policy Concern File

Status: active working reference

Subject:
`<domain>/model/policy/<concern>.ts`

Role:
one named cross-operation domain model policy concern.

Required shape:
- defines one domain-owned semantic policy concern.

Allowed contents:
- classification encodings;
- legality interpretation owned by the domain;
- scoring and selection policy;
- domain interpretation over artifacts.

Violation messages:
- reusable generated official Civ7 facts;
- runtime engine declarations;
- adapter calls or mutation behavior;
- operation-local implementation logic;
- generic math or grid helpers.

Import/export boundary:
- imported by operations or stages through named owner surfaces;
- does not become a root public barrel.

Enforcement:
structure for placement; semantic proof before movement; later source-shape if
the slot grows unstable.
