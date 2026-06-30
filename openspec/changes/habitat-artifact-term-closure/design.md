# Design: Habitat Artifact Term Closure

## Closure Rule

Within Habitat authority, `artifact` is not a generic category, manifest field,
support-file class, path-root name, or project identity. The term is allowed
only when referring to the Civ7/MapGen product artifact concept.

## Authority Docs

`.habitat/ARTIFACT-KINDS.md` is replaced with rule operation kind authority.
Subject categories use `output`. Config and authority docs describe operation
kinds and support files.

## Existing Records

Older Habitat OpenSpec records that currently teach "authored artifact"
authority are repaired to "authored authority data/files" when they are active
implementation records or current public-surface references.

## Package Manager Cleanup

The package-manager rule uses `pnpm files` or `pnpm residue`, not `pnpm
artifacts`, because pnpm lockfiles and residue are not product artifacts.
