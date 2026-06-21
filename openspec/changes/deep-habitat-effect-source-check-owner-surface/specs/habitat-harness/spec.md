## MODIFIED Requirements

### Requirement: Habitat source-rule checks expose a Habitat-owned surface

Habitat source-rule execution SHALL be selected through the `source-check`
tool surface and the `source:check` Nx target. Active Habitat source-rule
records SHALL NOT require callers to know the underlying vendor implementation.

#### Scenario: CLI source-check selection

- **WHEN** a caller runs `habitat check --tool source-check`
- **THEN** Habitat selects registered source-rule checks
- **AND** the result is reported as Habitat source-check execution.

#### Scenario: Old Habitat-owned selector is not accepted

- **WHEN** a caller runs `habitat check --tool pattern-check`
- **THEN** Habitat refuses the unknown tool id
- **AND** no compatibility fallback is used.

#### Scenario: Nx exposes the Habitat source-rule target

- **WHEN** Nx loads the Habitat harness inferred targets
- **THEN** the harness project exposes `source:check`
- **AND** it does not expose `grit:check` as the active Habitat source-rule
  target.

### Requirement: Native Grit implementation remains enclosed

Habitat SHALL keep Grit-native command and fixture vocabulary inside the Grit
adapter and Grit pattern authoring surfaces, while exposing source-rule checks
to Habitat callers as source-check behavior.

#### Scenario: Adapter code invokes native Grit

- **WHEN** the enclosed Grit adapter constructs a native current-tree check
- **THEN** it may use Grit-native names and command kinds
- **AND** those names do not become public Habitat source-rule selectors.
