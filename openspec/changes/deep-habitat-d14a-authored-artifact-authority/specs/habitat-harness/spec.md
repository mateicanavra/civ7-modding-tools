## ADDED Requirements

### Requirement: Authored Habitat Artifacts Live Outside The SDK Package Source

Habitat SHALL store repository-authored rule and baseline artifacts under
checked-in `.habitat/` paths, not under `tools/habitat-harness/src` or the
package baseline directory.

#### Scenario: The rule registry is loaded

- **WHEN** Habitat loads the active rule registry
- **THEN** it reads `.habitat/rules/index.json` and `.habitat/rules/<rule-id>/rule.json`
- **AND** validates it through the `RuleRegistryDocument` TypeBox schema
- **AND** projects consumer-specific facts from the parsed registry

#### Scenario: Baselines are loaded or written

- **WHEN** Habitat reads or writes explicit rule baselines
- **THEN** it uses `.habitat/baselines/<rule-id>.json`
- **AND** applies the existing baseline authority rules
- **AND** does not use `tools/habitat-harness/baselines/**`

### Requirement: SDK Package Exports Do Not Expose Authored Rule Data

The Habitat package SHALL expose managing code surfaces, not the repository's
authored rule registry as a package subpath.

#### Scenario: Package exports are inspected

- **WHEN** `tools/habitat-harness/package.json` is inspected
- **THEN** it does not export `./rules`
- **AND** it does not include authored registry or baseline directories in the
  package files list

### Requirement: Live Current-Checkout Validation Is Not A Unit Test

Habitat SHALL keep live CLI and native Grit corpus validation out of Vitest unit
tests unless a test is explicitly scoped to a fake/injected backend.

#### Scenario: Unit tests run

- **WHEN** the Habitat Vitest suite runs
- **THEN** it does not run the real Habitat CLI repeatedly through
  `spawnSync`
- **AND** it does not mutate checked-in baseline files
- **AND** it does not run `grit patterns test` over the whole current checkout

#### Scenario: Toolchain smoke validation is needed

- **WHEN** command entrypoint or native Grit catalog validation is needed
- **THEN** it runs through explicit validation scripts outside the unit suite
