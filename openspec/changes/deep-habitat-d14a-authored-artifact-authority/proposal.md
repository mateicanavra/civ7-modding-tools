# Proposal: D14A Authored Artifact Authority

## Why

Habitat currently mixes SDK/managing code with repo-authored Habitat data. The
same package tree both implements rule management and stores the active rule
registry, baselines, and future patterns artifacts. That boundary makes
generators, registry loaders, tests, and future authoring work treat package
source layout as artifact authority.

## What Changes

- Introduce checked-in `.habitat/` as the repository-local home for authored
  Habitat artifacts.
- Move the active rule registry to `.habitat/rules/index.json` plus
  `.habitat/rules/<rule-id>/rule.json` files.
- Move explicit rule baselines to `.habitat/baselines/*.json`.
- Keep SDK/managing code, TypeBox schemas, CLI commands, Nx plugin
  code, generators, and validation logic under `tools/habitat-harness`.
- Remove package export/publish treatment of authored rule data as SDK internals.
- Move active pattern files to `.habitat/patterns/**`; keep any vendor-specific
  discovery shim as an executor detail that points back to Habitat-owned content.
- Move live current-checkout command/Grit validation out of Vitest unit files
  and into explicit validation scripts.

## Boundaries

- D14A owns the storage boundary between managing code and authored Habitat data.
- D13 remains the scaffold/refusal owner.
- D14 remains the MapGen authoring-topology fence.
- D8 remains pattern management owner.
- D5 remains baseline authority owner.

## Out Of Scope

- No MapGen authoring generator.
- No new vendor-named authored artifact hierarchy under `.habitat`.
- No schema rewrite beyond paths needed to read authored artifacts through
  existing TypeBox schemas.
