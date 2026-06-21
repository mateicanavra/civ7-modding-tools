## ADDED Requirements

### Requirement: Boundary Target Uses Boundary-Relevant Inputs

Habitat SHALL expose project-plane import boundaries through the Nx `boundaries`
target with inputs limited to files that can affect boundary outcomes.

#### Scenario: Boundary target inputs are evaluated

- **WHEN** Nx hashes `@internal/habitat-harness:boundaries`
- **THEN** the target inputs include boundary config, Nx/root package config,
  package manifests, the Habitat taxonomy document, and import-bearing source
  files
- **AND** unrelated docs and Habitat rule artifacts do not invalidate the target

#### Scenario: Boundary target executes

- **WHEN** `@internal/habitat-harness:boundaries` runs
- **THEN** it invokes ESLint with the boundary-only config
- **AND** it uses ESLint's content cache under `.nx/cache` for repeated local runs
- **AND** unrelated docs, generated output, dependency folders, and Habitat rule
  artifacts are not target inputs unless they can change project-plane boundary
  outcomes

### Requirement: Biome Diagnostics Use Biome Provider

Habitat SHALL run Biome-owned structural diagnostics through `BiomeProvider`
instead of re-entering Nx for a single Biome command.

#### Scenario: Format rule is selected

- **WHEN** `format-ci` is selected by `habitat check`
- **THEN** structural-check execution calls `BiomeProvider` with a CI request
- **AND** Nx `biome:ci` remains available for graph-owned root gates and hook
  composition

### Requirement: Structural Topology Is Not Test-Owned

Habitat SHALL NOT use package test targets as the long-term owner for topology
or import-shape enforcement when Biome, Nx, Grit/source-check, or file-layer
rules can own the invariant.

#### Scenario: Structural invariant is migrated

- **WHEN** a Habitat rule wraps a Vitest architecture test that only scans source
  shape or file topology
- **THEN** the rule is migrated to the owning structural tool layer or removed
  when an equivalent structural rule already exists
- **AND** package tests remain for behavioral and generated-artifact regression
  checks
