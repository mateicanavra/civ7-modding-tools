# Operation Strategies Scope

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/strategies/`

Ownership boundary:
strategy implementations for one operation. Strategies preserve the operation
contract and may use only approved local surfaces and accepted external owners.

Architectural evidence:
the operation architecture uses contract-first operations with implementation
variants selected through strategy surfaces.

Controlling rationale:
strategies are the variability point for an operation, not a place to smuggle
new contracts, public exports, or cross-operation helpers.

Owns:
operation-local strategy implementations.

Required children:
none

Optional children:
- `*.ts`

Closed:
yes

Nested scopes:
none

Files:
- `files/strategy-file-ts.md`

Patterns:
- `patterns/strategy-uses-approved-local-surfaces.md`
