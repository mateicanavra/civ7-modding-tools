# Domain Root Index File

Status: active working reference

Subject:
`<domain>/index.ts`

Role:
domain public contract surface.

Ownership boundary:
root `index.ts` owns the domain identity and intentional public contract
surface. Config objects, policy tables, helper functions, operation
implementations, and displaced root-helper content route to their owning
scopes.

Architectural evidence:
- current domain roots already define domains through `defineDomain(...)` here;
- step and recipe-facing code resolve domain contracts through named public
  surfaces;
- root `index.ts` is the single domain contract owner;
- the evidence command below refreshes current domain contract-surface usage
  before enforcement implementation.

Evidence command:

```bash
rg -n --glob 'mods/mod-swooper-maps/src/domain/*/index.ts' \
  'defineDomain|^import |^export ' \
  mods/mod-swooper-maps/src/domain
```

Controlling rationale:
`index.ts` must stay thin because it is the most tempting contract filename for
semantic smuggling after root helpers go red. Displaced exports must move to the
owning scope or become explicit slice inventory rows. The file shape remains
the contract surface.

Required shape:
- imports `defineDomain` from `@swooper/mapgen-core/authoring/contracts`;
- imports the operation contract registry from `./ops/contracts.js`;
- defines one local domain value with `defineDomain({ id, ops } as const)`;
- default-exports that domain value.

Allowed contents:
- imports required for the domain contract surface;
- approved public model contract imports required by that contract.

Violation messages:
- config objects;
- operation implementation wiring;
- recipe or stage imports;
- runtime logic;
- policy tables;
- broad public barrels.

Import/export boundary:
- exports the domain contract surface and explicit public exports from accepted
  owner slots only;
- displaced public exports are slice inventory rows, not reasons to widen this
  file.

Enforcement:
Grit/source-shape gate.
