# Operation Strategies Scope

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/<operation>/strategies/`

Ownership boundary:
the swappable implementations of one operation contract.

The closed strategy root contains:

- `index.ts`: implementation-only aggregate;
- one or more semantically named strategy directories.

Each strategy leaf contains exactly:

- `config.ts`: strategy identity and authored configuration definition;
- `index.ts`: deterministic implementation of the parent operation contract.

There is no flat `strategies/*.ts` form, `default/` identity, detached
strategy-contract file, or strategy-root config registry. The parent operation
contract imports leaf definitions directly; the strategy index aggregates only
implementations.

Executable authority:
`.habitat/blueprints/domain-operation-strategy/`.
