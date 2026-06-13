## Why

After `mapgen-studio-root-load-followup`, the H4 full root-test proof no
longer fails through `mapgen-studio:test`. The next deterministic blocker is
`mod-swooper-maps:test`:

- `test/morphology/catalog-ownership.test.ts` checks that the morphology domain
  config facade stays limited to recipe-facing knob exports.
- The source facade still exports exactly the allowed modules, but Biome import
  organization sorted them in the opposite order from the test's literal
  string.

The ownership invariant is correct; the order-sensitive assertion is not. H4
needs the proof to enforce facade membership exactly without fighting the
formatter.

## What Changes

- Make the morphology catalog ownership proof parse/export the facade as a set
  of export lines.
- Keep the allowed export set exact: no strategy schemas, ops, or extra domain
  modules may enter the domain config facade.
- Record the full-root blocker and verification boundary in the H4 workstream
  evidence.

## What Does Not Change

- No Swooper Maps runtime behavior, recipes, morphology implementation, or
  generated `mod/` output changes.
- No weakening of the facade ownership invariant: the test still fails for any
  missing or extra export.
- No Biome/taxonomy/Habitat rule weakening.

## Affected Owners

- `mods/mod-swooper-maps/test/morphology/catalog-ownership.test.ts`
- Habitat H4 proof records

## Verification Gates

- Focused morphology catalog ownership test from the package.
- Direct `mod-swooper-maps` project test through Nx.
- OpenSpec validation for this change and H4.
- `git diff --check`
- Generated/protected drift grep.

## Stop Conditions

- The facade ownership assertion stops rejecting extra exports.
- Source/runtime files must change to satisfy formatter-controlled ordering.
- `mod-swooper-maps:test` remains red in the same catalog ownership class.
