## ADDED Requirements

### Requirement: Pipeline Defaults Have A Single Source Of Truth

The studio SHALL NOT carry hard-coded duplicates of pipeline default config
values; defaults flow only from generated recipe artifacts
(`STANDARD_RECIPE_CONFIG` et al.) through the config builders, and tests
assert default-config shape against those artifacts rather than against
hand-maintained copies.

#### Scenario: No hand-maintained default-config module exists
- **WHEN** the studio source is searched for pipeline default values
- **THEN** no app module duplicates the recipe artifact's default config (the former `src/ui/data/defaultConfig.ts` is gone)

#### Scenario: Shape guards target the generated artifact
- **WHEN** the default-config shape tests run
- **THEN** they assert stage-config key shapes (semantic surfaces, no raw op envelopes, no legacy stage keys) against `STANDARD_RECIPE_CONFIG`

#### Scenario: Round-trip fixtures remain user data, not defaults
- **WHEN** persistence/preset/migration tests construct config fixtures
- **THEN** those fixtures represent user-authored or legacy persisted payloads under test, and no fixture mirrors the recipe's default values as an expected default
