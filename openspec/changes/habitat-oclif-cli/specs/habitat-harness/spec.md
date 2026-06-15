## ADDED Requirements

### Requirement: The Habitat CLI Uses The Repo-Standard Oclif Surface

The repository-local Habitat CLI SHALL be implemented as an oclif command
package, using command classes, typed flags/args, generated help, and the
repo's established CLI package conventions. The oclif surface SHALL preserve
the normative Habitat command set and command semantics defined by the
scaffolded harness spec.

#### Scenario: Contributor discovers Habitat commands through help
- **WHEN** a contributor runs `bun run habitat -- --help`
- **THEN** oclif renders the Habitat command list with `check`, `fix`,
  `verify`, `graph`, `classify`, and `hook`

#### Scenario: Agent asks for command-specific help
- **WHEN** an agent runs `bun run habitat -- check --help`
- **THEN** the help output lists the supported `check` flags, including
  `--json`, `--output`, `--owner`, `--rule`, `--expand-baseline`, and `--base`

### Requirement: Machine Output Remains Stable Across The Oclif Migration

The oclif migration SHALL NOT change the Habitat diagnostic schema, ratchet
semantics, rule selection semantics, or success/failure exit semantics for
existing commands except for standard oclif help and parse-error formatting.

#### Scenario: Agent consumes JSON diagnostics
- **WHEN** an agent runs `bun run habitat:check -- --json --output <file>`
- **THEN** the emitted report validates against the existing Habitat
  `CheckReport` schema and the command exits non-zero only when enforced
  rules fail

#### Scenario: Agent filters a single rule
- **WHEN** an agent runs `bun run habitat:check -- --rule biome-ci --json`
- **THEN** only the selected rule plus the built-in baseline-integrity report
  participate in the emitted check report

### Requirement: Oclif Commands Fully Own CLI Lifecycle Boundaries

Each Habitat oclif command SHALL await all child processes and resourceful
programs before `Command.run()` resolves. Reusable rule/check libraries SHALL
return structured results rather than exiting the process directly.

#### Scenario: Verify runs affected targets
- **WHEN** `habitat verify --base <ref>` runs the Habitat check and Nx affected
  targets
- **THEN** the command waits for every child process, forwards stdout/stderr,
  and exits with the resulting failure code only after those processes finish

#### Scenario: Future Effect internals acquire resources
- **WHEN** a future Habitat command uses Effect layers or scoped resources
- **THEN** the command runs the Effect program from the oclif command adapter
  and closes acquired scopes before `Command.run()` resolves
