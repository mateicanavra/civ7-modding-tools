# Phase Record: Target Check Drain

## Context

Review lanes classified the seven active `arch-test-*` rows into source-shape
rules, generated-bundle regressions, and domain correctness tests. The slow
check behavior came from the wrong ownership model: Habitat was pulling package
architecture tests into the structural rule loop.

## Decision

Drain active `target-check` rows from Habitat structural execution. Move
source-shape constraints into source-check. Leave package build/runtime/domain
regressions in package targets.

## Review Notes

- Core purity could not be removed until `mapgen-core-runtime-civ7` matched the
  production-source scope.
- RNG authority, ecology imports, and cutover source terms needed replacement
  source-check rules.
- Generated-bundle checks and the M11 projection band are not Habitat
  structural rules.
