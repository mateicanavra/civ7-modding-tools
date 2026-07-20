# Domain Artifacts Scope

Status: active working reference

Subject:
`<domain>/artifacts/`

Ownership boundary:
artifact owner files plus one optional local aggregate. Each `*.artifact.ts`
file defines one pipeline data-product contract and its schema, artifact
definition, publish-time validator, and any narrow assertion surface justified
by direct operation-boundary use. `index.ts` may only aggregate those owner
modules through one `defineArtifactCatalog` call and expose the catalog-derived
`artifactModules` and `artifacts`; it must not define artifact payload schema,
artifact validation logic, operation behavior, or parallel contract/validator
maps.

Architectural evidence:
pipeline data products need explicit contracts consumed by stages, steps, or
artifact assemblers. The only accepted sibling to artifact owner files is a
directory-local aggregate index for importing the artifact surface as one
source. Implementation belongs to operations/model/core, and examples/notes
belong to evidence, tests, or docs.

Controlling rationale:
the scope is closed to `*.artifact.ts` owner files plus a narrow `index.ts`
aggregate. The filename shape is the artifact-owner enforcement boundary:
anything directly under a domain `artifacts/` directory with the
`*.artifact.ts` shape must obey the artifact file grammar, while `index.ts`
may only aggregate existing artifact owners.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-artifacts-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/artifacts"
kind = "directory"
mode = "closed"
allowed = [
  # Blueprint integration seam: the domain blueprint owns artifact placement
  # and names artifact files here. Source-shape enforcement owns the artifact
  # file grammar.
  "*.artifact.ts",
  "index.ts",
]
```

Nested scopes:
none

Files:
- `files/artifact-ts.md`
- `files/index-ts.md`

Patterns:
- `patterns/artifact-shape.md`
