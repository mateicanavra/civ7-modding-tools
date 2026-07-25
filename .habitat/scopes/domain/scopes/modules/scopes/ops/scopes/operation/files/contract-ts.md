# Operation Contract File

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/<operation>/contract.ts`

Role:
the singular shared contract implemented by every strategy of the operation.

Required shape:

- defines one `defineOp(...)` authority and default-exports it;
- owns complete input and output envelopes as direct inline TypeBox schemas;
- imports strategy definitions directly from semantic strategy-leaf
  `config.ts` files;
- composes smaller atoms or policy from semantic ancestors when needed;
- exports no input/output types, detached schemas, strategy configs, or
  constituent contracts.

The contract does not borrow a complete artifact schema, create an operation
implementation, or import another operation's private surface.

Executable authority:
`.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`.
