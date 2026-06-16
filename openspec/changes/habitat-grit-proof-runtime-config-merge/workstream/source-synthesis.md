# Source Synthesis - Runtime Config Merge Active Check

## Row Obligation

Runtime step and domain-op paths should not hide config defaulting through
`?? {}` or `Value.Default(...)`. Runtime handlers consume canonical config;
normalization belongs to compiler-owned surfaces, policy helpers, or explicit
compile-time resolvers.

## Normative And Proving Sources

- `taxonomy.md` lists config merges in the runtime-purity family.
- `lint-domain-refactor-guardrails.sh` is the retired full-profile proving
  source for config merge/defaulting searches.
- Recipe-compile architecture records establish the runtime-handler boundary:
  `step.run` and `strategy.run` do not default, clean, or normalize configs.
- The corpus ledger and recovery reference keep runtime config merge as a Grit
  enforcement row, while retired full-profile parity remains separate.

## Predicate And Scope

The active predicate covers:

- runtime recipe step `.ts` files under `stages/**/steps`;
- domain-op `.ts` files under `domain/**/ops`;
- exact `?? {}` nullish object fallback;
- exact `Value.Default(...)` calls.

The retired stage-root scan is broader and remains context only. It catches
stage `index.ts` and public config files that may be compile-time shaping
rather than runtime-handler violations.

## Current Corpus

The previous blocker inventory found five live intended current-predicate
`?? {}` candidates and no `Value.Default(...)` candidates. This closure row
remediates those five candidates by moving default ownership into map-policy
and mountain-family helper boundaries.

Post-remediation parser inventory records zero current-predicate `?? {}` or
`Value.Default(...)` candidates. Retired stage-root context still includes 30
`?? {}` matches; those remain contextual and are not treated as exact
runtime-handler closure.

## Active Proof Boundary

The row now owns active Grit registration, native fixture proof, parser
zero-candidate inventory, wrapper selector proof, explicit empty baseline
ownership, and injected probe metadata/proof for the RCM rule.

## Non-Claims

This checkpoint does not claim raw direct Grit acquisition, source remediation
beyond the five recorded candidates, apply safety, classify/generator behavior,
retired parity, broader runtime-purity closure, or product/runtime proof.
