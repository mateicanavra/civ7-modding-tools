# Domino 093: Move Structural Test Debt Into Habitat Authority

Status: active sequence record

Source: captured during Domain Model Config Law and public-domain-test import
closure.

## Detail

#### Domino 93: Move Structural Test Debt Into Habitat Authority

Status: tracked follow-up before final Habitat authority initiative closure.

Purpose: prevent package behavior tests from remaining the owner of source
shape, topology, or structural law after import-boundary cleanup has made static
test module imports green.

Current proof:

- `require_public_domain_surfaces_in_tests` is enforced green for static module
  imports.
- `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` still reads
  source files by path and asserts structural source shape with `readFileSync`.

Why this is not the same domino:

- Static module imports from tests into domain internals are closed by
  `require_public_domain_surfaces_in_tests`.
- Source-text inspection inside behavior tests is not a module import and is not
  caught by that rule.
- The owner of source shape and topology law is Habitat rules/patterns, not
  package behavior tests.

Required later move:

1. Inventory tests that use source-file reads or path walks to enforce
   topology, source shape, import law, artifact shape, operation contract shape,
   or stage authoring shape.
2. Classify each assertion as already owned by an existing Habitat rule,
   requiring a new Habitat rule/pattern, or invalid/deletable.
3. Move retained structural assertions into Habitat authority.
4. Delete package-test structural assertions after Habitat proof exists.
5. Keep behavior tests focused on public runtime behavior and public output
   contracts.

Closure:

This domino closes only when structural source-shape assertions have an
enforced Habitat owner or are deleted with proof, and package tests no longer
act as fallback topology law.
