# Source Synthesis - Runtime Config Merge Candidate

## Row Obligation

Runtime step and domain-op paths should not hide config defaulting through
`?? {}` or `Value.Default(...)`. Runtime handlers consume canonical config;
normalization belongs to compiler-owned surfaces or explicit compile-time
resolvers.

## Normative And Proving Sources

- `taxonomy.md` lists config merges in the runtime-purity family.
- `lint-domain-refactor-guardrails.sh` is the retired full-profile proving
  source for config merge/defaulting searches.
- Recipe-compile architecture records establish the runtime-handler boundary:
  `step.run` and `strategy.run` do not default, clean, or normalize configs.
- The corpus ledger and recovery reference keep this candidate in the Grit
  backlog while noting that examples and architecture decision are required.

## Predicate And Scope

The draft predicate covers:

- runtime recipe step `.ts` files under `stages/**/steps`;
- domain-op `.ts` files under `domain/**/ops`;
- exact `?? {}` nullish object fallback;
- exact `Value.Default(...)` calls.

The retired stage-root scan is broader and remains context only. It catches
stage `index.ts` and public config files that may be compile-time shaping
rather than runtime-handler violations.

## Current Corpus

Parser inventory found five live intended current-predicate `?? {}` candidates
and no `Value.Default(...)` candidates. Two candidates are under domain ops and
three under runtime step source. Retired stage-root context includes 30 `?? {}`
matches; those are not treated as exact current-row closure.

## Non-Claims

This checkpoint does not claim active Grit registration,
Habitat wrapper/current-tree proof, raw Grit acquisition, baseline behavior,
injected cleanup/path-control, source remediation, apply safety,
classify/generator behavior, retired parity, broader runtime-purity closure, or
product/runtime proof.
