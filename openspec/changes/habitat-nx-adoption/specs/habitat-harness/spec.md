## ADDED Requirements

### Requirement: Nx Owns The Repository Graph

The repository SHALL use Nx as the single task orchestrator and project-graph
authority: project identity, dependency edges, affected-scope calculation,
target wiring, and cache policy. Turbo SHALL NOT remain installed or
configured after this change.

#### Scenario: Orchestrating a cross-workspace task
- **WHEN** a root workflow runs build/check/lint/test across workspaces
- **THEN** it runs through Nx (`bunx nx run-many` / `bunx nx affected`)
- **AND** no `turbo.json` or `turbo` dependency exists in the repository

#### Scenario: Querying the project graph
- **WHEN** an agent needs project identity or dependency edges
- **THEN** `bunx nx graph` and `bunx nx show project <name>` answer from the
  Nx graph covering every workspace project

### Requirement: Bun Remains The Package Manager With Nx On Node

Bun SHALL remain the only package manager and package-script runner. Nx SHALL
run on the Node runtime invoked through `bunx nx`. Both runtimes SHALL be
pinned in a committed `mise.toml`.

#### Scenario: Installing and running
- **WHEN** dependencies are installed or root scripts run
- **THEN** `bun install` / `bun run <script>` are used, and Nx commands execute
  via `bunx nx` on Node
- **AND** no workflow invokes Nx under the Bun runtime or from a bun
  `postinstall` hook

#### Scenario: CI reproducibility
- **WHEN** CI installs dependencies
- **THEN** it uses `bun install --frozen-lockfile` against the committed text
  `bun.lock`

### Requirement: Pipeline Parity Through Conversion

The Nx task configuration SHALL reproduce the retired turbo pipeline's
semantics: task dependency ordering, cacheability, declared outputs, and the
studio-recipes special dependency.

#### Scenario: Build output parity
- **WHEN** `bun run build` runs on an unchanged source tree before and after
  this change
- **THEN** `mods/mod-swooper-maps/mod/**` build outputs are byte-identical

#### Scenario: Studio dev dependency preserved
- **WHEN** `mapgen-studio` dev starts
- **THEN** Nx first ensures `mod-swooper-maps` studio recipes are built, as the
  turbo pipeline did
