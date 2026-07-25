# Strategy Implementation Aggregate

Status: active working reference

Subject:
`<operation>/strategies/index.ts`

Role:
the singular implementation aggregate for semantic strategy leaves.

The file imports each leaf implementation from `./<semantic-id>/index.js` and
default-exports one readonly tuple in authored selection order. It does not
aggregate strategy definitions, configs, contracts, policy, or rules.
