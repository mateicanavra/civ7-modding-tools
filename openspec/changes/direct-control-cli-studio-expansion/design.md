## Design

CLI and Studio are presentation/transport consumers. `@civ7/direct-control`
owns command construction, state-role targeting, parsing, validation, catalog
schema, and proof helpers.

## CLI Shape

Add or extend `civ7 game` commands so developers can:

- check role-aware status;
- read map, plot, player, unit, city, visibility, and GameInfo facts;
- control bounded autoplay;
- reveal/explore map for a player with explicit mutation warning in command
  naming/help;
- validate unit/city/player operations;
- request operations through validator-first package wrappers;
- generate/print capability catalog snapshots.

## Studio Shape

Studio server code may expose package-backed endpoints for:

- playable status;
- map summary and bounded map grid;
- runtime catalog/reference reads used by developer panels.

The Studio UI is not required to add a new broad debug console.

## Cleanup

Remove or update docs/scripts/tests that imply repo-owned FireTuner/Windows
bridge runtime behavior for covered capabilities. Preserve historical archive
docs and official FireTuner binaries as evidence/tools when they are clearly
not active runtime guidance.

## Review Lanes Required

- Product/DX review for command ergonomics.
- Architecture review for no duplicate package behavior.
- Adversarial cleanup review for accidental deletion of official tools or
  archive evidence.
