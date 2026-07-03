# Change: Habitat Authority Paths Project Identity

## Why

Habitat infrastructure currently calls the `.habitat` authority root
`habitat-artifacts` and exposes constants from `artifact-paths.ts`. That keeps
the old generic artifact concept alive even after rule manifests move to v2.

This change renames Habitat infrastructure vocabulary to authority-path and
authority-project language.

## Boundaries

This is a naming and interface cleanup for Habitat infrastructure. It does not
change the `.habitat` root path and does not change Civ7/MapGen product artifact
terms.

## Interfaces

- `tools/habitat/src/resources/authority-paths.ts` owns `.habitat` authority
  paths.
- Nx inferred project metadata uses `habitat-authority`.
- Rule changed-file routing uses authority/support-file path wording.
- Pattern fix policy uses pattern authority path wording.

## Affected Owners

- `tools/habitat/src/resources/**`
- `tools/habitat/src/nx-plugin.ts`
- `tools/habitat/src/service/model/rules/policy/**`
- `tools/habitat/src/service/model/validation/policy/**`
- `tools/habitat/src/service/modules/fix/model/policy/**`
- boundary taxonomy tests and D0 public-surface rows

## Forbidden

- No `artifact-paths` module.
- No `habitatArtifacts*` constants.
- No `habitat-artifacts` project identity.
- No hand-edits to generated `dist` or Oclif manifest files.

## Verification

- focused path/project identity tests
- `nx show project habitat`
- forbidden-term scan for infrastructure artifact vocabulary
