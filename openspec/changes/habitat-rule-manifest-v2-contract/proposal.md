# Change: Habitat Rule Manifest V2 Contract

## Why

Habitat rule manifests currently use the term `artifact` for two unrelated
things: rule-category placement and rule-owned support files. That collides
with the Civ7/MapGen product meaning of artifact, which remains the only
intended future artifact authority.

This change makes the rule manifest contract explicit:

- `placement.category: "artifact"` becomes `placement.category: "output"`.
- `placement.artifactKind` is removed.
- rule operation mode moves to top-level `operation.kind`.
- `artifacts.baseline` becomes `supportFiles.baseline`.
- current manifests and `.habitat/index.json` move to schema version 2.

## Boundaries

This is a hard contract migration. Habitat does not accept both v1 and v2
current manifests after the change lands.

This change does not create the Civ7 artifact blueprint kind. It also does not
rename product artifact concepts such as `artifact:*`, recipe artifacts,
`defineArtifact`, `deps.artifacts`, or generated map artifacts.

## Interfaces

- Producer interface: `.habitat/**/rule.json`, `.habitat/index.json`, and the
  pattern generator must emit v2 manifests.
- Consumer interface: registry parsing, baseline facts, target routing, Nx
  inputs, hooks, and focused tests must read `operation` and `supportFiles`.
- Schema interface: `tools/habitat/src/service/model/rules/dto/registry.schema.ts`
  owns the closed current manifest schema.

## Affected Owners

- `.habitat/**/rule.json`
- `.habitat/index.json`
- `tools/habitat/src/service/model/rules/**`
- `tools/habitat/src/nx-plugin.ts`
- `tools/habitat/src/generators/**`
- `tools/habitat/test/**`

## Forbidden

- No compatibility shim for v1 current manifests.
- No `placement.artifactKind` alias.
- No current `artifacts` manifest field.
- No `triage` operation kind.
- No repo-wide product artifact rename.

## Verification

- `bun run openspec -- validate habitat-rule-manifest-v2-contract --strict`
- `bun run openspec:validate`
- focused Habitat registry, baseline, generator, hook, routing, and structure
  tests
- `bun run --cwd tools/habitat check`
- `bun habitat classify .habitat`
- `bun habitat check --owner habitat --json`
- final forbidden-term scan for v1 contract terms
