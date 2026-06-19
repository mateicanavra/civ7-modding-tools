# Design: Artifact Language Enforcement

## Guard Owners

- GritQL owns structural forbidden-call and vocabulary patterns.
- Biome owns formatting and lint hygiene.
- Nx owns resolved project and import boundary proof.
- Habitat owns file-layer, artifact placement, protected-zone, and public
  surface guard decisions.

## Guarded Areas

- `.habitat/rules/**`
- `.habitat/patterns/**`
- `.habitat/baselines/**`
- `tools/habitat-harness/src/public/**`
- `tools/habitat-harness/src/domains/**`
- `tools/habitat-harness/src/providers/**`

## Forbidden Drift

- executable TypeScript under authored `.habitat` artifacts;
- vendor-topology directories under `.habitat` without an accepted artifact
  packet;
- generic Habitat code that hardcodes Civ7, MapGen, recipe, stage, op, step, or
  product parser vocabulary;
- domain modules importing live provider implementation internals.
