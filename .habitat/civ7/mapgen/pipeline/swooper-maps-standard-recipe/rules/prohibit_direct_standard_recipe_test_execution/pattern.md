---
level: error
---
# Prohibit Direct Standard Recipe Test Execution

Only the Standard recipe's product-test fixture may invoke the complete recipe.
Focused operation, artifact, and step tests use their narrower production-owned
surfaces, while whole-recipe product tests inherit one canonical Civ7 preset and
admitted map configuration from the fixture.

```grit
language js(typescript)

predicate standard_recipe_module($source) {
  $source <: r"^[\"']?(?:mod-swooper-maps/recipes/standard|(?:\.\./)+src/recipes/standard/recipe(?:\.js)?)[\"']?$"
}

or {
  `$recipe.run($args)` where {
    $filename <: r".*mods/mod-swooper-maps/test/.*\.tsx?$",
    not { $filename <: r".*mods/mod-swooper-maps/test/recipes/swooper-physics-standard/fixtures/standard-recipe\.ts$" },
    $program <: contains `import $recipe from $source` where { standard_recipe_module($source) }
  },
  `$recipe.run($args)` where {
    $filename <: r".*mods/mod-swooper-maps/test/.*\.tsx?$",
    not { $filename <: r".*mods/mod-swooper-maps/test/recipes/swooper-physics-standard/fixtures/standard-recipe\.ts$" },
    $program <: contains `import { $imported as $recipe } from $source` where { standard_recipe_module($source) }
  },
  `$recipe.run($args)` where {
    $filename <: r".*mods/mod-swooper-maps/test/.*\.tsx?$",
    not { $filename <: r".*mods/mod-swooper-maps/test/recipes/swooper-physics-standard/fixtures/standard-recipe\.ts$" },
    $program <: contains `import { $recipe } from $source` where { standard_recipe_module($source) }
  },
  `$module.default.run($args)` where {
    $filename <: r".*mods/mod-swooper-maps/test/.*\.tsx?$",
    not { $filename <: r".*mods/mod-swooper-maps/test/recipes/swooper-physics-standard/fixtures/standard-recipe\.ts$" },
    $program <: contains `import * as $module from $source` where { standard_recipe_module($source) }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/execution.test.ts
import authoredRecipe from "../../../src/recipes/standard/recipe.js";

await authoredRecipe.run(context, config);

// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/composition.test.ts
import { default as selectedRecipe } from "mod-swooper-maps/recipes/standard";

selectedRecipe?.run(context, config);

// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/namespace.test.ts
import * as recipeModule from "../../../src/recipes/standard/recipe.js";

items.map(() => recipeModule.default.run(context, config));
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/fixtures/standard-recipe.ts
import standardRecipe from "../../../../src/recipes/standard/recipe.js";

standardRecipe.run(context, config);

// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/composition.test.ts
import standardRecipe from "../../../src/recipes/standard/recipe.js";

expect(standardRecipe.id).toBe("standard");

// @filename: mods/mod-swooper-maps/test/recipes/swooper-physics-standard/step.test.ts
step.run(context, config, operations, dependencies);

// @filename: packages/mapgen-core/test/recipe.test.ts
import standardRecipe from "mod-swooper-maps/recipes/standard";

standardRecipe.run(context, config);
```
