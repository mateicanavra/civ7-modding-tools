# Operation Strategy Leaf Scope

Status: active working reference

Subject:
`<operation>/strategies/<semantic-id>/`

Ownership boundary:
one semantically named implementation of the parent operation contract.

The closed leaf contains only `config.ts` and `index.ts`. The identity names
the actual behavior or profile; `default` is not a semantic identity. A
single-strategy operation may infer that strategy as its default, while a
multi-strategy operation explicitly selects among semantic IDs.

All strategies satisfy the same parent operation input/output contract.
Strategy-specific variability belongs only to the leaf configuration.
