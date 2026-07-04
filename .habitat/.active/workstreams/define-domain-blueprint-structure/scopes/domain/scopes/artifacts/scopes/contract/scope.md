# Artifact Contract Scope

Status: active working reference

Subject:
`<domain>/artifacts/contract/`

Ownership boundary:
artifact contract files only. Each file defines one pipeline truth product
contract and its schema, artifact definition, publish-time validator, and any
narrow assertion surface justified by direct operation-boundary use.

Architectural evidence:
the source tree already distinguishes artifact contracts from notes and helper
material; reviewer findings confirmed markdown notes inside artifact contract
folders require explicit disposition.

Controlling rationale:
the scope is closed to `*.contract.ts` so every artifact surface is a named
contract file and non-contract material goes red. The filename shape is also
the opt-in enforcement boundary: any file under a nested `artifacts/contract/`
directory must obey the artifact contract shape, while unrelated `contract.ts`
files outside artifact contract directories are governed by their own scopes.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-artifact-contract-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/artifacts/contract"
kind = "directory"
mode = "closed"
allowed = [
  # Blueprint integration seam: the domain blueprint owns the artifact contract
  # container and names artifact contract files here. Source-shape enforcement
  # owns the artifact contract file grammar.
  "*.contract.ts",
]
```

Nested scopes:
none

Files:
- `files/artifact-contract-ts.md`

Patterns:
- `patterns/artifact-contract-shape.md`
