# Source Synthesis - Recipe Imports In Domain

## Authority

The taxonomy names `scope:domain-surface` as the intra-project rule family for
domain and recipe boundaries. The invariant corpus records recipe import
boundaries as Grit-owned after H6, while the recovery reference records this row
as the candidate for detecting recipe imports from domain code.

## Current Source

The deterministic parser inventory scanned
`mods/mod-swooper-maps/src/domain` and found zero current import, re-export, or
dynamic import candidates from recipe modules.

## Predicate Boundary

The current native predicate covers explicit static import declarations,
dynamic import expressions, and export-from source declarations in Swooper
domain `.ts` files. It covers alias and relative `../recipes` source classes.
It does not claim semantic relative-resolution beyond source strings matched by
the predicate.
