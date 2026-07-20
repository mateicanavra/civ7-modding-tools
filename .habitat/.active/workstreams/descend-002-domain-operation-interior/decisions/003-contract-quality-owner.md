# Decision 003: Contract Quality Owner

Status: sealed by later user authority

## Question And Provenance

Who owns the requirement that operation contract schemas carry useful
`description:` metadata?

The ecology-only `validate_ecology_op_contract_quality` script mixed three
unrelated clauses: schema descriptions, exported-function JSDoc, and a stale
recipe path. Schema metadata and meaningful exported-value documentation are
both durable pressure, but neither is honestly owned by an Ecology-only mixed
checker.

## Evidence

- Contracts are TypeBox values registered and consumed by the package and
  Studio.
- A text pattern cannot reliably understand composed, spread, or imported
  schema metadata.
- No operation generator exists that could own currentness without adding a
  new tooling system.

## Alternatives Considered

1. Package verification over the registered contract surface.
2. A Habitat/Grit text pattern over `contract.ts`.
3. A new generator plus generated-currentness check.

The pattern is structurally brittle and the generator is unjustified scope.

## Ruling

Schema-description quality is package-owned and exterior to A.2 topology.
Habitat may route the owning package gate; it does not duplicate the semantic
check as domain-operation file authority.

Schema-description gaps are not A.2 migration rows. Exported functions,
variables, classes, and other runtime value declarations with consumers require
concise definition-site JSDoc that preserves purpose, behavior, invariants, and
material gotchas. Habitat/Grit owns that generic declaration-site syntax rail
through `require_mapgen_exported_value_declarations_have_jsdoc`; review owns
semantic quality, and Knip/review own whether the export should exist.

The exported-function proxy, stale recipe-path inventory, and Ecology-only
schema-description scanner retire rather than move. Current schema descriptions
were repaired semantically. Any future enforcement must observe the registered
contract value surface honestly; a source parser and a product test for that
parser are not acceptable substitutes.

## Boundary And Falsifier

D3 does not authorize a TypeScript compiler-API verifier, operation generator,
or metadata completion inside the topology descent. If the package registry
cannot observe every operation contract, that is a package-verification gap to
resolve outside A.2, not a reason to reopen the operation shape.
