# Strategy Config File

Status: active working reference

Subject:
`<operation>/strategies/<semantic-id>/config.ts`

Role:
the immutable semantic identity and authored configuration definition for one
strategy.

The file imports `defineStrategy` and TypeBox authoring contracts, defines the
strategy-specific config schema, and default-exports one definition. It does
not import the parent operation contract, implement execution, normalize
runtime values, or export detached schema/config authorities.
