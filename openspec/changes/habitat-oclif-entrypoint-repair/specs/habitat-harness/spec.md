## ADDED Requirements

### Requirement: Canonical Habitat Entrypoints Render Truthful Help

The repository-local Habitat CLI SHALL render root and command-specific oclif
help from the canonical root script, the development runner, and the production
runner after a clean build. The canonical development path SHALL use oclif
command discovery rather than a manual command map that treats help flags as
command names.

#### Scenario: Contributor discovers commands from the root script
- **WHEN** a contributor runs `bun run habitat -- --help`
- **THEN** the command exits 0 and renders the Habitat command list including
  `check`, `fix`, `verify`, `graph`, `classify`, and `hook`

#### Scenario: Agent asks for check help from the root script
- **WHEN** an agent runs `bun run habitat -- check --help`
- **THEN** the command exits 0 and renders `check` help including `--json`,
  `--output`, `--owner`, `--rule`, `--tool`, `--expand-baseline`, `--staged`,
  and `--base`

#### Scenario: Production runner help is proven after build
- **WHEN** the harness package has been built from current source
- **THEN** `bun tools/habitat-harness/bin/run.js --help` and
  `bun tools/habitat-harness/bin/run.js check --help` exit 0 using generated
  production artifacts from that build

#### Scenario: Source runners do not use stale generated artifacts
- **WHEN** root and direct development runner help proof is recorded
- **THEN** `dist/**` and `oclif.manifest.json` for the harness have first been
  removed so the proof exercises source command discovery, not stale ignored
  production artifacts

### Requirement: Requested Rule Selectors Fail Truthfully

Habitat check SHALL validate requested `--owner`, `--rule`, and `--tool`
selectors before executing selected rules. A requested selector or selector
combination that matches no real rule SHALL fail explicitly and SHALL NOT
produce a successful report containing only `baseline-integrity`. The same
validation SHALL apply to baseline expansion authoring mode before any baseline
file is written.

#### Scenario: Unknown rule id is requested in JSON mode
- **WHEN** an agent runs
  `bun run habitat:check -- --json --rule definitely-not-a-rule`
- **THEN** the command exits non-zero and emits a schemaVersion 1 CheckReport
  whose `ok` field is false and whose diagnostics name the unknown rule id

#### Scenario: Unknown tool id is requested in JSON mode
- **WHEN** an agent runs
  `bun run habitat:check -- --json --tool definitely-not-a-tool`
- **THEN** the command exits non-zero and emits a schemaVersion 1 CheckReport
  whose `ok` field is false and whose diagnostics name the unknown tool id

#### Scenario: Unknown owner id is requested in JSON mode
- **WHEN** an agent runs
  `bun run habitat:check -- --json --owner definitely-not-a-project`
- **THEN** the command exits non-zero and emits a schemaVersion 1 CheckReport
  whose `ok` field is false and whose diagnostics name the unknown owner id

#### Scenario: Unknown rule id is requested in human mode
- **WHEN** an agent runs
  `bun run habitat:check -- --rule definitely-not-a-rule`
- **THEN** the command exits non-zero and prints a selector failure naming that
  the value was checked as a rule id

#### Scenario: Unknown tool id is requested in human mode
- **WHEN** an agent runs
  `bun run habitat:check -- --tool definitely-not-a-tool`
- **THEN** the command exits non-zero and prints a selector failure naming that
  the value was checked as a tool id

#### Scenario: Unknown owner id is requested in human mode
- **WHEN** an agent runs
  `bun run habitat:check -- --owner definitely-not-a-project`
- **THEN** the command exits non-zero and prints a selector failure naming that
  the value was checked as an owner id

#### Scenario: Tool name is mistakenly passed as a rule id
- **WHEN** an agent runs `bun run habitat:check -- --json --rule grit-check`
- **THEN** the command exits non-zero and emits a selector diagnostic explaining
  that `grit-check` is a tool selector rather than a registered rule id

#### Scenario: Valid selectors have no matching intersection
- **WHEN** an agent runs
  `bun run habitat:check -- --json --owner @civ7/control-orpc --tool biome`
- **THEN** the command exits non-zero and emits a schemaVersion 1 CheckReport
  whose selector diagnostics identify both valid selectors and the empty
  intersection, with no real rule execution and no green-only
  `baseline-integrity` report

#### Scenario: Invalid selector is requested during baseline expansion
- **WHEN** an agent runs
  `bun run habitat:check -- --expand-baseline --rule definitely-not-a-rule`
- **THEN** the command exits non-zero before baseline authoring and no baseline
  file is created or modified

#### Scenario: Unknown owner selector is requested during baseline expansion
- **WHEN** an agent runs
  `bun run habitat:check -- --expand-baseline --owner definitely-not-a-project`
- **THEN** the command exits non-zero before baseline authoring and no baseline
  file is created or modified

#### Scenario: Unknown tool selector is requested during baseline expansion
- **WHEN** an agent runs
  `bun run habitat:check -- --expand-baseline --tool definitely-not-a-tool`
- **THEN** the command exits non-zero before baseline authoring and no baseline
  file is created or modified

#### Scenario: Empty selector intersection is requested during baseline expansion
- **WHEN** an agent runs
  `bun run habitat:check -- --expand-baseline --owner @civ7/control-orpc --tool biome`
- **THEN** the command exits non-zero before baseline authoring and no baseline
  file is created or modified

#### Scenario: Invalid selector JSON honors output path
- **WHEN** an agent runs
  `bun run habitat:check -- --json --output /tmp/habitat-invalid-selector.json --rule definitely-not-a-rule`
- **THEN** the failing schemaVersion 1 CheckReport is written to the requested
  output path and stdout behavior remains consistent with valid JSON output

#### Scenario: Valid tool selector still runs matching rules
- **WHEN** an agent runs `bun run habitat:check -- --json --tool grit-check`
- **THEN** the emitted report includes the matching Grit rules plus the built-in
  baseline-integrity report and exits according to those rule results

### Requirement: Unknown Commands Fail Truthfully

Habitat SHALL distinguish help requests from unknown commands. After root and
subcommand help are repaired, unknown command names SHALL still exit non-zero
with an unknown-command diagnostic from a real root/development entrypoint.

#### Scenario: Unknown command is rejected from the root script
- **WHEN** an agent runs `bun run habitat -- definitely-not-a-command`
- **THEN** the command exits non-zero and emits an unknown-command diagnostic,
  not root help output and not a mocked command-class result

#### Scenario: Unknown command is rejected from the development runner
- **WHEN** an agent runs
  `bun tools/habitat-harness/bin/dev.ts definitely-not-a-command`
- **THEN** the command exits non-zero through oclif command handling, emits an
  unknown-command diagnostic, emits no CheckReport, and does not confuse the
  unknown command with a help request

#### Scenario: Unknown command is rejected from the production runner
- **WHEN** the harness package has been built from current source and an agent
  runs `bun tools/habitat-harness/bin/run.js definitely-not-a-command`
- **THEN** the command exits non-zero through oclif command handling, emits an
  unknown-command diagnostic, emits no CheckReport, and does not confuse the
  unknown command with a help request

### Requirement: Command Proof Uses Real Entrypoints

Habitat command-surface verification SHALL execute the same root, development,
and production entrypoints used by agents and contributors. Command-class tests
with mocked command-engine functions MAY remain as unit tests, but SHALL NOT be
recorded as proof of root, development, or production command behavior.

#### Scenario: Command tests cover root and development paths
- **WHEN** the Habitat command test suite verifies help and selector behavior
- **THEN** tests or smoke probes execute both the root package script and the
  direct development runner for root help and check help, asserting exit code
  plus output class for each path

#### Scenario: Command tests cover production path
- **WHEN** production runner behavior is claimed
- **THEN** the proof first builds the harness package, then executes
  `tools/habitat-harness/bin/run.js` and asserts exit code plus output class

#### Scenario: Production proof records artifact provenance
- **WHEN** production runner help is recorded as passing
- **THEN** the phase record names the build command, generated artifact paths,
  manifest/dist freshness evidence, runner argv, cwd, relevant env delta, exit
  code, stdout/stderr class, failure class, and non-claims

### Requirement: Stale Command Closure Records Are Reclassified

Historical Habitat records SHALL NOT continue to claim current root help,
subcommand help, selector truth, or H1-H8 local closure when current command
behavior contradicts them. Repair closure SHALL update downstream records so
old proof remains historical and current proof points to this repair.

#### Scenario: Historical help proof is contradicted
- **WHEN** an older phase record says root or check help passed but current
  repair evidence shows it did not
- **THEN** the older record is annotated or realigned as historical evidence,
  and the current proof is recorded in this repair workstream
