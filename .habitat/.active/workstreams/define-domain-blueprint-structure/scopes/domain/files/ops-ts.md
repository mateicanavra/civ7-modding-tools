# Domain Root Ops File

Status: active working reference

Subject:
`<domain>/ops.ts`

Role:
domain implementation binding surface.

Ownership boundary:
root `ops.ts` owns the binding between a domain contract and the operation
implementation registry. Config schemas, constants, rule helpers, operation
bodies, stage logic, and public convenience exports route to their owning
scopes.

Architectural evidence:
- current domain roots already bind runtime/compile operations through
  `createDomain(...)` here;
- recipe assembly imports domain `/ops` modules for compile/runtime operation
  registration;
- source evidence shows `collectCompileOps(...)` and `createRecipe(...)` consume
  the domain operation surface rather than root helper files.
- observed source metrics: `7/7` current domain runtime modules use
  `createDomain(...)`; morphology is the known content violation because it also
  exports config schemas/constants from the binding surface.

Evidence command:

```bash
rg -n --glob 'mods/mod-swooper-maps/src/domain/*/ops.ts' \
  'createDomain|^import |^export ' \
  mods/mod-swooper-maps/src/domain
```

Controlling rationale:
`ops.ts` is a compile/runtime binding point. Keeping it narrow
prevents moved operation-family config or helper logic from being preserved in
the runtime surface just because the filename is selected.

Required shape:
- imports `createDomain` from `@swooper/mapgen-core/authoring`;
- imports the domain contract surface from `./index.js`;
- imports operation implementations from `./ops/index.js`;
- default-exports `createDomain(domain, implementations)`.

Allowed contents:
- imports of the domain contract surface;
- imports of the domain operation implementation registry;
- the binding expression.

Violation messages:
- config objects;
- policy definitions;
- operation implementation bodies;
- artifact contracts;
- recipe or stage logic.

Import/export boundary:
- this file binds domain contract to implementation registry;
- displaced exports are slice inventory rows, not reasons to widen this file.

Enforcement:
Grit/source-shape gate.
