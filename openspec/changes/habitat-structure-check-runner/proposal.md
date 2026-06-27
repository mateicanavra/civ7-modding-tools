# Change: Habitat Structure Check Runner

## Why

Habitat still has command-check scripts whose only durable claim is file-tree
topology. Those scripts mix filesystem shape with source parsing, graph
currentness, and package semantics, which keeps the authority tree in a
bespoke-script state.

This change adds a native `structure-check` runner for filesystem topology
only. It gives topology assertions one declarative TOML surface and prevents
them from being routed through command scripts, Grit, Nx, or package validators.

## What Changes

- Add `ownerTool: "structure-check"` and `structureFile` registry metadata.
- Add structure rule facts to the rule catalog and selector vocabulary.
- Add TOML v1 parsing and evaluation for scoped root globs, direct-child
  required/allowed/forbidden globs, open/closed directory scopes, and file-root
  presence.
- Execute structure rules through native Habitat service-model code in
  `executeSelectedRulesEffect()`.
- Keep filesystem access behind the existing platform resource/provider
  boundary.
- Split `preserve_standard_stage_topology_and_path_invariants` so file-tree
  topology moves to `structure-check` and literal recipe stage-key order remains
  command-owned.

## What Does Not Change

- No new CLI subcommand.
- No source regex, import/export analysis, graph traversal, package execution,
  freshness, or generated-equivalence logic in `structure-check`.
- No reuse of the retired `source-check` runner for topology.
- No broad conversion wave beyond the one canary.

## Verification

- `bun install`
- `bun run --cwd tools/habitat test`
- `bun run --cwd tools/habitat check`
- `nx run habitat:build`
- `bun tools/habitat/bin/dev.ts check --tool structure-check --json`
- `bun tools/habitat/bin/dev.ts check --rule preserve_standard_stage_topology_and_path_invariants --json`
- companion proofs for retained source/order owners
- `bun run openspec -- validate habitat-structure-check-runner --strict`
- `git diff --check`
