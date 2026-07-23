# Domain Blueprint

A domain is one public composition boundary over semantic modules.
Its source root has one closed spine:

```text
mods/<mod>/src/domain/<domain>/
  index.ts
  contract.ts
  router.ts
  model/                    # optional vocabulary shared by multiple modules
    atoms/
    policy/
  modules/
    <semantic-module>/
      index.ts
      contract.ts
      router.ts
      model/                # optional vocabulary local to this module
        atoms/
        policy/
      artifacts/
      ops/
```

The domain structure law owns only this root spine. `required` defines the
public aggregate, `allowed` admits optional capabilities and child
directories, and the closed scope excludes every other direct member. Modules
do not sit beside atoms or policy as though those were equivalent kinds:
`modules/` owns semantic routers, while `model/` owns shared vocabulary.

Every module is itself a semantic router. Its operations expose swappable
strategies; those strategies compose operation-local rules with model atoms and
policy owned by the nearest semantic ancestor. Vocabulary rises to the domain
model only when more than one module proves the shared edge. This keeps
authorship modular, dependency flow transparent, and strategy selection under
explicit control.

`model/` is the same optional kind slot at both levels, not a root-domain
default. An atom or policy descends to the module that fully owns its meaning;
it rises to the domain model only when multiple sibling modules consume the
same language or law. Empty model directories are not scaffolded.

MapGen Core and TypeScript own non-empty module identity, duplicate operation
refusal, and exact router alignment. Operation, atom, policy, and artifact
blueprints own their respective child kinds rather than duplicating those laws
here. Optional owner directories are not created as empty shells; they appear
only when the semantic module owns members of that kind.
