import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compile } from "json-schema-to-typescript";

type JsonObject = Record<string, unknown>;

function assertPlainObject(value: unknown, label: string): asserts value is JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
}

function stableJson(value: unknown): JsonObject {
  const text = JSON.stringify(value);
  if (!text) throw new Error("schema is not JSON-serializable");
  const parsed = JSON.parse(text) as unknown;
  assertPlainObject(parsed, "schema");
  return parsed;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const distBrowserTest = resolve(pkgRoot, "dist", "browser-test.js");

const mod = (await import(pathToFileURL(distBrowserTest).href)) as unknown as {
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA: unknown;
};

const schemaJson = stableJson(mod.BROWSER_TEST_RECIPE_CONFIG_SCHEMA);

await writeFile(resolve(pkgRoot, "dist", "browser-test.schema.json"), JSON.stringify(schemaJson, null, 2));

const configTypes = await compile(schemaJson, "BrowserTestRecipeConfig", {
  bannerComment: "",
  style: {
    singleQuote: false,
    semi: true,
  },
});

const recipeTypeExports = [
  `export type {`,
  `  BrowserTestFoundationStageAdvancedConfig,`,
  `  BrowserTestFoundationStageConfig,`,
  `  BrowserTestFoundationStageKnobsConfig,`,
  `  BrowserTestRecipeCompiledConfig,`,
  `} from "../../../mods/mod-swooper-maps/src/recipes/browser-test/recipe";`,
  ``,
];

const browserTestDts = [
  `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
  `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
  `import type { TSchema } from "typebox";`,
  ``,
  configTypes.trimEnd(),
  ``,
  ...recipeTypeExports,
  `export const BROWSER_TEST_RECIPE_CONFIG: Readonly<BrowserTestRecipeConfig>;`,
  `export const BROWSER_TEST_RECIPE_CONFIG_SCHEMA: TSchema;`,
  `export const compileOpsById: Readonly<Record<string, unknown>>;`,
  ``,
  `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<BrowserTestRecipeConfig>, unknown>;`,
  `export default recipe;`,
  ``,
].join("\n");

await writeFile(resolve(pkgRoot, "dist", "browser-test.d.ts"), browserTestDts);

const indexDts = [
  `export { default as browserTestRecipe } from "./browser-test.js";`,
  `export * from "./browser-test.js";`,
  ``,
].join("\n");

await writeFile(resolve(pkgRoot, "dist", "index.d.ts"), indexDts);
