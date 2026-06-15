## ADDED Requirements

### Requirement: Check Orchestration Runs Through Effect Services

`habitat check` SHALL build its report through Effect-backed rule registry,
rule selection, baseline application, rule execution, and reporting programs
while preserving the established `CheckReport` schema and human report text.

#### Scenario: JSON report contract is preserved
- **WHEN** an agent runs `bun run habitat:check -- --json`
- **THEN** the emitted report validates against the established `CheckReport`
  schema
- **AND** rule violations remain report data rather than infrastructure errors
- **AND** logs, lifecycle messages, and tool progress do not pollute JSON
  stdout

#### Scenario: Filtered checks preserve selection semantics
- **WHEN** an agent runs `habitat check` with `--rule`, `--owner`, `--tool`, or
  `--staged`
- **THEN** the Effect-backed rule selection and execution surface matches the
  current selected rule set, staged scope, diagnostics, and exit behavior

### Requirement: Grit Checks Preserve The Native Shared-Scan Model

Grit-backed full checks SHALL preserve one native Grit JSON scan per check
process, then project the shared Grit report into selected Habitat rules.

#### Scenario: Multiple Grit rules share one scan
- **WHEN** `habitat check` evaluates multiple Grit-backed rules
- **THEN** Habitat runs one native Grit JSON scan for that check process
- **AND** projects the shared report into matching rule-pack entries by the
  established `local_name` or `check_id` mapping
- **AND** applies each selected rule's baseline independently

#### Scenario: Grit invocation parity is pinned
- **WHEN** the Grit service performs the full-check scan
- **THEN** it preserves the current audit roots, `--level error`,
  `GRIT_CACHE_DIR`, `GRIT_TELEMETRY_DISABLED`, and stdout/stderr JSON parser
  attempts

### Requirement: Report Rendering And Output Boundaries Remain Deterministic

Habitat SHALL keep report stringification, schema validation, and human
rendering pure and deterministic across the Effect migration. Command adapters
or a narrowly scoped output-file capability SHALL own stdout/stderr and
`--output` writes.

#### Scenario: Output file and stdout behavior stay stable
- **WHEN** an agent runs `habitat check --json --output <path>`
- **THEN** the JSON report written to `<path>` and the command stdout behavior
  match the established command contract
- **AND** reusable check orchestration does not own stdout/stderr emission
- **AND** internal report-schema failures remain defects surfaced by the
  adapter rather than expected user or tool errors
