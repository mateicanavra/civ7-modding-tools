# Strategy Implementation File

Status: active working reference

Subject:
`<operation>/strategies/<semantic-id>/index.ts`

Role:
one deterministic implementation of the parent operation contract using the
leaf's strategy configuration.

The file binds its local definition to the parent operation contract through
the SDK strategy constructor and may compose operation-local rules plus
ancestor model atoms and policy. It does not redefine input/output contracts,
own artifacts, call adapters, import recipes, or reach into sibling operation
implementations.

Executable authority:
`.habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_import_boundaries/`.
