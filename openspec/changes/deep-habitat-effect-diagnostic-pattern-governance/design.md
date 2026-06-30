# Design: Diagnostic Pattern Governance

## Owner

Diagnostic catalog and pattern governance domains.

## Target Files

```text
tools/habitat-harness/src/domains/diagnostic-pattern-catalog/index.ts
tools/habitat-harness/src/domains/diagnostic-pattern-catalog/command.ts
tools/habitat-harness/src/domains/diagnostic-pattern-catalog/outcomes.ts
tools/habitat-harness/src/domains/diagnostic-pattern-catalog/identity.ts
tools/habitat-harness/src/domains/pattern-governance/index.ts
tools/habitat-harness/src/domains/pattern-governance/schema.ts
tools/habitat-harness/src/domains/pattern-governance/validation.ts
tools/habitat-harness/src/domains/pattern-governance/admissions.ts
tools/habitat-harness/src/rules/patterns/**       # drained by this packet
```

## Required State-Space Reductions

- Diagnostic identity is domain data, not a vendor command side effect.
- Pattern admissions distinguish authored authority data validity from Grit execution
  validity.
- Expected governance refusals are tagged domain errors or refusal records.

## Stop Conditions

- Grit provider owns Habitat diagnostic identity.
- Pattern governance imports live provider implementations.
- `.habitat/patterns/**` admits executable TypeScript or unmanaged topology.
