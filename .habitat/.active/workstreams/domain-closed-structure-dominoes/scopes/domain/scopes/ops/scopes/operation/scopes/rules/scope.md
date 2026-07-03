# Operation Rules Scope

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/rules/`

Ownership boundary:
pure implementation rules for one operation. Reusable core mechanics,
cross-operation policy, and stage/projection behavior are exterior.

Architectural evidence:
operation-family shared folders currently mix rules, policy, config, and core
mechanics; decomposition requires op-local implementation to land under the
owning operation.

Controlling rationale:
rules are internal implementation, not public surfaces. Keeping them op-local
prevents shared helper folders from reappearing under a different name.

Owns:
operation-local pure implementation rule files.

Required children:
none

Optional children:
- `*.ts`

Closed:
yes

Nested scopes:
none

Files:
- `files/rule-file-ts.md`

Patterns:
none
