## Design

`grit-recipe-imports-in-domain` is a check-only row for the Swooper domain
source tree.

The current predicate is:

- file scope: `mods/mod-swooper-maps/src/domain/**/*.ts`;
- source declarations: static import declarations, side-effect imports, named
  re-exports, and export-star declarations;
- forbidden source classes: `mod-swooper-maps/recipes`, `@mapgen/recipes`,
  `@mapgen/recipe`, `@swooper/recipes`, and relative `../recipes` reaches.

The predicate deliberately does not match `.tsx`, recipe-layer files, other
mods, string literals, dynamic imports, or recipe-looking source lookalikes such
as `@mapgen/recipes-extra` and `recipes-extra`.

## Corpus And False-Positive Classes

- Positive fixture classes: value import, type-only import, side-effect import,
  package-style recipe alias import, recipe alias import, named re-export, and
  export-star.
- Controls: public domain root imports, public domain `/ops`, ordinary domain
  relative imports, recipe-looking alias lookalikes, relative `recipes-extra`
  lookalikes, `.tsx`, other mods, recipe-layer files, source strings, and
  dynamic imports.
- Current parser inventory scans `mods/mod-swooper-maps/src/domain`, excludes
  `node_modules`, `dist`, and `mod`, and records import/export/dynamic/source
  lookalike buckets.

## Proof Boundary

The row can prove native fixture behavior, parser zero-candidate inventory,
Habitat wrapper/per-rule selector behavior, explicit baseline ownership, and an
injected violation/control path.

The row does not prove raw direct Grit acquisition, source remediation, dynamic
import closure, apply safety, classify/generator behavior, broader
domain-refactor closure, or product/runtime behavior.
