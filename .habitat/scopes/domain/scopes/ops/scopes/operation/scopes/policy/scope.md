# Operation Policy Scope

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/policy/`

Ownership boundary:
policy used by one operation only. Cross-operation semantic policy belongs to
the domain model policy scope, and official Civ7 facts belong to external Civ7
owners.

Architectural evidence:
operation-local `policy/` folders contain intent acceptance and substrate rules
that serve one operation and route to operation-local policy.

Controlling rationale:
operation-local policy belongs under the operation that owns it. This keeps
operation-specific rules on the operation-local surface.

Owns:
operation-local policy concern files.

Required children:
none

Optional children:
- `*.ts`

Closed:
yes

Nested scopes:
none

Files:
- `files/policy-file-ts.md`

Patterns:
none
