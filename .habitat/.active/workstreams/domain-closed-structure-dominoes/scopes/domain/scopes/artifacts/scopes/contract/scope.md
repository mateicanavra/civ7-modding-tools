# Artifact Contract Scope

Status: active working reference

Subject:
`<domain>/artifacts/contract/`

Ownership boundary:
artifact contract files only. Each file defines one pipeline truth product
contract and any schema/validator needed for that contract.

Architectural evidence:
the source tree already distinguishes artifact contracts from notes and helper
material; reviewer findings confirmed markdown notes inside artifact contract
folders require explicit disposition.

Controlling rationale:
the scope is closed to `*.contract.ts` so every artifact surface is a named
contract file and non-contract material goes red.

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
none
