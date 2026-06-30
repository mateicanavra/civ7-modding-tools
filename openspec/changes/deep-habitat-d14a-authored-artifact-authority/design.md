# Design: D14A Authored Artifact Authority

## Domain Boundary

Habitat has two separate domains:

| Domain | Owner | Responsibilities |
| --- | --- | --- |
| Habitat SDK/managing code | `tools/habitat-harness` | CLI commands, generators, registry loaders, TypeBox schemas, views, baseline engine, Nx plugin, command adapters. |
| Authored Habitat authority data | `.habitat` | Checked-in rule registry, explicit baselines, and active pattern records. |

The SDK reads `.habitat` artifacts as external serialized input and validates
them with TypeBox at the read edge. The SDK package no longer exports or
publishes authored rule data as package internals.

## Artifact Layout

```text
.habitat/
  README.md
  rules/
    index.json
    <rule-id>/
      rule.json
  baselines/
    <rule-id>.json
  patterns/
    checks/
      <pattern-name>.md
    apply/
      <pattern-name>.md
```

The root `.grit/` directory is a thin executor compatibility view for the Grit
CLI. It does not own authored pattern content; its pattern path points back to
`.habitat/patterns`.

## Implementation Decisions

- `tools/habitat-harness/src/lib/authority-paths.ts` is the single code owner for
  repo-relative authored authority data paths.
- `tools/habitat-harness/src/lib/paths.ts` derives absolute repo paths from that
  authored-artifact contract.
- Registry loading, baseline integrity, the Nx plugin, and pattern candidate
  generation consume the same path constants.
- `@internal/habitat-harness/rules` is removed because package subpath export is
  the wrong surface for repository-authored data.
- Active pattern files live under `.habitat/patterns/**`; the Grit adapter loads
  them through the executor compatibility view.

## Test Design

Vitest must cover SDK product behavior with injected inputs and in-memory
trees. It must not crawl the current checkout, mutate live baselines, or run the
entire external Grit corpus as a unit test.

Live toolchain checks are explicit validation scripts:

- `bun run --cwd tools/habitat-harness validate:cli-smoke`
- `bun run --cwd tools/habitat-harness validate:grit-patterns`

## Stop Conditions

- Any new `tools/habitat-harness/src/rules/rules.json` or
  `tools/habitat-harness/baselines/**` runtime dependency is rejected.
- Any new test that shells out over the current repo for ordinary unit coverage
  is rejected unless it is an explicit validation script or Nx target.
- Any `.habitat` artifact shape without TypeBox-backed read validation is
  rejected.
