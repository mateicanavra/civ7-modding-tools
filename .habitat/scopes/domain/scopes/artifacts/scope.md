# Domain Artifacts Scope

Status: active working reference

Subject:
`<domain>/artifacts/`

Ownership boundary:
artifact owner files plus one local aggregate. Each `*.artifact.ts` file defines
one canonical artifact with `defineArtifact({ name, id, schema, refine? })`.
That artifact owns identity, a private structural schema, and complete
publish-time admission. Its only runtime export is `artifact`; a private
`refine` callback may add relational or domain issues after Core admits
structure. `index.ts` may only named-import sibling artifacts and directly
export one `artifacts` catalog; it must not define payload schema, validation,
operation behavior, or parallel contract/validator/module maps.

Architectural evidence:
pipeline data products need explicit contracts consumed by stages, steps, or
artifact catalogs. Requirements and provisions use the same artifact authority.
The only accepted sibling to artifact owner files is the directory-local
aggregate index. Implementation belongs to operations/model/core, and
examples/notes belong to evidence, tests, or docs.

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
