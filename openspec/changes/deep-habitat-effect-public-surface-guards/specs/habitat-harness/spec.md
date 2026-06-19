## ADDED Requirements

### Requirement: Effect Train Ends With Public Surface Guards

Habitat SHALL narrow public exports and add guards that prevent regression to
direct side effects, generic `src/lib` growth, provider leaks, and
authored-artifact boundary drift.

#### Scenario: Package exports are inspected

- **WHEN** `tools/habitat-harness/src/index.ts` and package exports are
  inspected after the cutover train
- **THEN** public exports are explicit contracts
- **AND** internal runtime/provider/domain modules are not leaked through broad
  barrels

#### Scenario: A new direct side effect is added

- **WHEN** a new direct process, fs, env, time, runtime, or authored-artifact
  boundary violation is introduced
- **THEN** Habitat guardrails report it through the owning enforcement layer
