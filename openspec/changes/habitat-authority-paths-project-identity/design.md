# Design: Habitat Authority Paths Project Identity

## Target Names

- `resources/artifact-paths.ts` becomes `resources/authority-paths.ts`.
- `habitatArtifactsRoot` becomes `habitatAuthorityRoot`.
- `habitatArtifactsProjectName` becomes `habitatAuthorityProjectName`.
- Nx inferred project name `habitat-artifacts` becomes `habitat-authority`.

## Connections

The authority-path constants feed registry discovery, cache paths, baseline
paths, generator paths, source-check scope exclusions, Nx project inference,
and boundary taxonomy validation. All consumers import the authority-path module
directly rather than carrying artifact vocabulary through local aliases.

## Policy Names

Rule changed-file routing names support-file relationships rather than artifact
relationships. Pattern fix policy names pattern authority paths rather than
pattern artifact paths.

## Public Surface

D0 public-surface rows and execution-surface records must be regenerated or
realigned when they name renamed source files.
