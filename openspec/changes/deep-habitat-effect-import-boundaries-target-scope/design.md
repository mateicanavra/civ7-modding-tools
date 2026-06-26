# Design: Import Boundaries Target Scope

## System Boundary

Project-plane import law remains an Nx boundary. Habitat can select, report, and
compose that law, but it does not own the legality algorithm.

The boundary gate has two parts:

- **Full project-plane gate:** `@internal/habitat-harness:boundaries`, backed by
  `eslint.boundaries.config.mjs` and `@nx/enforce-module-boundaries`.
- **Habitat diagnostic surface:** `habitat check` reports the selected rule and
  its normalized diagnostics without pretending the broad gate is a cheap local
  source-shape check.

## Target Shape

The `boundaries` target reads import-bearing source roots and root source files,
not the entire repository. Its Nx inputs include:

- the boundary ESLint config;
- Nx and package-manager root config;
- the habitat taxonomy document that defines `kind:*` semantics;
- package manifests that carry tags and dependency metadata;
- TS/JS source files under `apps`, `mods`, `packages`, `tools`, and `scripts`.

Docs outside the taxonomy are not boundary target inputs. Habitat rule metadata,
baselines, Grit artifacts, and unrelated docs do not invalidate this target
unless the boundary rule actually consumes them.

The command still invokes the boundary-only ESLint config over `.` because local
measurement showed explicit path lists were slower for this workspace. The
target enables ESLint's content cache at `.nx/cache/eslint-boundaries`, so
unchanged source files do not pay repeated parser and import-graph cost when the
Nx target must execute after a relevant source edit.

## Biome Execution

`format-ci` is a Biome rule, not a graph-boundary rule. The structural-check
domain therefore calls `BiomeProvider.run({ kind: "ci" })` directly for that
rule. Nx still exposes the `biome:ci` target for graph-owned root gates, hooks,
and CI composition, but Habitat diagnostics do not pay Nx orchestration for a
single Biome command.

## Topology-Test Drain

Rows whose `ownerTool` is `target-check` and whose target is a Vitest
architecture test are not the desired steady state for structural enforcement.
They fall into three groups:

- invariants already represented by source-check/file-layer rules and eligible
  for removal from Habitat rule execution;
- invariants that must move into source-check/Grit/file-layer ownership before
  the test row is removed;
- actual behavioral or generated-bundle tests that belong under package `test`
  or `build` targets rather than Habitat structural rows.

This packet starts the target-scope repair and records the drain criteria. The
follow-on `deep-habitat-effect-target-check-drain` slice removes the active
`target-check` rows from Habitat structural execution. It does not replace Nx
import-boundary semantics with a second graph legality engine.

Inventory from this slice:

- `arch-test-core-purity`, `arch-test-rng-authority`,
  `arch-test-ecology-step-imports`, and `arch-test-cutover` are source-shape or
  topology rules and should migrate to Grit/source-check/file-layer ownership or
  be removed after equivalent rules are confirmed.
- `arch-test-map-bundle-runtime-imports` and
  `arch-test-intelligence-bridge-bundle-runtime-imports` are generated bundle
  checks and belong under package build/test ownership rather than the Habitat
  structural rule loop.
- `arch-test-m11-projection-band` is a domain correctness regression and should
  stay a package test, not a Habitat structural rule.

## Failure Model

The target fails closed when ESLint, Nx graph resolution, or source parsing
fails. It does not silently downgrade to a planned/receipt-only state. Fast
receipt behavior belongs to `habitat verify --json`, not the full boundary gate.
