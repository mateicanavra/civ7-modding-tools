# Decision 003: Contract Quality Owner

Status: sealed by later user authority

## Question And Provenance

Who owns the requirement that operation contract schemas carry useful
`description:` metadata?

The ecology-only `validate_ecology_op_contract_quality` script mixed three
unrelated clauses: schema descriptions, blanket exported-function JSDoc, and a
stale recipe path. Only schema metadata represented durable product pressure.

## Evidence

- 95 of 101 operation contracts carry description metadata.
- Six gaps remain: five Foundation contracts and Placement `plan-wonders`.
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

The six gaps are not A.2 migration rows. Blanket exported-function JSDoc and
the stale recipe-path clause retire categorically rather than move to another
rule. The mixed ecology rule retires when the surviving package-owned concern
has an honest owner and proof.

## Boundary And Falsifier

D3 does not authorize a TypeScript compiler-API verifier, operation generator,
or metadata completion inside the topology descent. If the package registry
cannot observe every operation contract, that is a package-verification gap to
resolve outside A.2, not a reason to reopen the operation shape.
