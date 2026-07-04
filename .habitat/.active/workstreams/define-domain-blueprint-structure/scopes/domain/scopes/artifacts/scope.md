# Domain Artifacts Scope

Status: active working reference

Subject:
`<domain>/artifacts/`

Ownership boundary:
artifact files only. Each file defines one pipeline truth product contract and
its schema, artifact definition, publish-time validator, and any narrow
assertion surface justified by direct operation-boundary use.

Architectural evidence:
pipeline truth products need explicit contracts consumed by stages, steps, or
artifact assemblers. No accepted sibling class needs to live under
`artifacts/`: implementation belongs to operations/model/core, aggregation
belongs to recipe or registry surfaces, and examples/notes belong to evidence,
tests, or docs.

Controlling rationale:
the scope is closed to `*.artifact.ts` so every domain artifact surface is a
named artifact file. The filename shape is the opt-in enforcement boundary:
anything directly under a domain `artifacts/` directory with the
`*.artifact.ts` shape must obey the artifact file grammar, while unrelated
`contract.ts` files remain governed by their own operation or recipe scopes.

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
]
```

Nested scopes:
none

Files:
- `files/artifact-ts.md`

Patterns:
- `patterns/artifact-shape.md`
