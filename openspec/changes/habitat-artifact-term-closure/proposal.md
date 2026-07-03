# Change: Habitat Artifact Term Closure

## Why

After the manifest and infrastructure migrations, Habitat docs and active
OpenSpec records must stop teaching agents that Habitat owns a generic
artifact concept. The only remaining intended artifact concept is the
Civ7/MapGen product concept that may later become an artifact blueprint kind.

## Boundaries

This change closes Habitat generic language. It deliberately preserves product
artifact language in MapGen/Civ7 contexts.

## Interfaces

- `.habitat` active authority docs.
- D0/public-surface rows and active Habitat OpenSpec records.
- Rule names/messages where the term is package-manager residue rather than
  product artifact authority.

## Forbidden

- No broad repo-wide `artifact` replacement.
- No mutation of product artifact concepts.
- No stale `ARTIFACT-KINDS.md` authority.
- No `authored artifact` Habitat authority phrase.

## Verification

- forbidden-term scan over Habitat scopes
- explicit product allowlist review
- OpenSpec validation
