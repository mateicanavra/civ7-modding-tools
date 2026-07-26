# Domain Scope Tree

Status: active working reference

This scope tree explains the generic MapGen domain blueprint. Executable
authority lives under `.habitat/blueprints/`; these references must teach the
same kind model rather than preserve historical source layouts.

```text
domain/<domain>/
  contract.ts
  router.ts
  index.ts
  model/                         # optional, shared by multiple modules
    atoms/
    policy/
    rules/
  modules/
    <module>/
      contract.ts
      router.ts
      index.ts
      model/                     # optional, local to this module
        atoms/
        policy/
        rules/
      artifacts/                 # optional products of this module
        index.ts
        *.artifact.ts
      ops/
        <operation>/
          contract.ts
          index.ts
          rules/                 # optional, private implementation rules
          strategies/
            index.ts
            <semantic-id>/
              config.ts
              index.ts
```

The hierarchy encodes ownership:

- a domain composes semantic module contracts and routers;
- a module is the direct owner of its operations, artifacts, and local model;
- an operation defines one contract implemented by every one of its strategies;
- a strategy leaf owns one semantic configuration definition and implementation;
- model vocabulary lives at the lowest level that owns its meaning and rises
  only when sibling modules genuinely share it.

There is no root `ops.ts`, flat domain `ops/`, root artifact catalog,
`model/schemas`, or flat strategy-file alternative.
