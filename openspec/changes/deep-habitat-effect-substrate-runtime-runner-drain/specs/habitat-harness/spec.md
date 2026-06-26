## MODIFIED Requirements

### Requirement: Habitat Substrate Runtime Exposes Layers Only

Habitat substrate runtime modules SHALL expose layer composition for service
runtime assembly, not a generic Effect execution helper.

#### Scenario: Substrate runtime has no generic runner

- **GIVEN** callers import `@internal/habitat-harness/substrate/runtime/index`
- **WHEN** they inspect the exported runtime surface
- **THEN** it SHALL expose `HabitatSubstrateLive`
- **AND** it SHALL NOT expose `runHabitatEffect` or another generic runner
- **AND** `src/substrate/runtime/run.ts` SHALL remain deleted

#### Scenario: Tests run programs at the test edge

- **GIVEN** a provider test composes fake provider layers
- **WHEN** it runs an Effect program
- **THEN** it SHALL call `Effect.runPromise` at the test edge
- **AND** it SHALL explicitly provide the required fake layer
- **AND** it SHALL NOT use the assembled live substrate layer as a broad test
  harness
