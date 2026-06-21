# Change: Deep Habitat Effect Nx Rule Target Scope

## Why

Habitat exposes `habitat:rule:<id>` Nx targets so humans and agents can run the
smallest relevant structural check. Several rule categories still routed those
targets through broad aggregate sweeps, so a targeted rule command inherited the
cost and invalidation surface of the whole Habitat/Grit check plane.

That defeats Habitat's product purpose: precise structure should reduce
developer and agent labor. A rule target should be a concrete unit of work with
the rule's command and the rule's declared source coverage, not an alias for a
larger sweep.

## What Changes

- Pattern-check and file-layer rules infer direct `habitat:rule:<id>` targets.
- Direct rule targets receive inputs derived from the rule registry's
  `pathCoverage`, owner root, rule metadata, and owning Habitat/source-check
  implementation files.
- Baseline exception metadata is not used as a project-graph input; it is
  policy metadata, not scan coverage.
- The malformed `rng-authority-static` exception value is repaired to match the
  explicit empty baseline contract.

## Non-Goals

- Do not add topology or structure tests for generated Nx target shape.
- Do not claim all rules are narrow; `workspace-gate` and
  `unresolved-metadata` rules remain broad until their metadata is made precise.
- Do not replace SourceCheck with native Grit current-tree execution.
- Do not change root `check` orchestration or hook target composition in this
  slice.

## Validation

- `nx show project mod-swooper-maps --json` should show pattern/file rules as
  direct `bun tools/habitat-harness/bin/dev.ts check --rule <id>` targets.
- Representative scoped rule targets should pass through Nx.
- Habitat package checks, Biome, OpenSpec validation, and root checks must pass.
