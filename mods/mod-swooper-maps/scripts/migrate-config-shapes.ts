/**
 * Generic, schema-driven map-config migrator.
 *
 * Reconciles every `src/maps/configs/*.config.json` to the CURRENT recipe
 * schema (`deriveRecipeConfigSchema(STANDARD_STAGES)`) — no per-field values are
 * hard-coded here; everything is pulled from the schema's own `required` lists
 * and `default` values. Run it after any recipe schema change to migrate the
 * shipped configs forward.
 *
 * Policy (value-preserving, unlike TypeBox `Value.Repair`, which drops
 * incomplete optional objects and so loses authored partial values):
 *   - PRUNE keys the schema no longer knows (e.g. a retired `placement.discoveries`)
 *     via `Value.Clean`.
 *   - COMPLETE every present-but-incomplete object: add each missing REQUIRED key
 *     using the schema's `default` (recursively for nested required objects),
 *     while preserving every value the author already set.
 *
 * What it intentionally does NOT do:
 *   - carry retired authoring surfaces or compatibility translations. Those
 *     migrations are one-shot source edits and must not remain in this durable
 *     generator path.
 *
 * Output is written 2-space JSON (matching gen:maps). Idempotent: a no-op on
 * already-conformant configs.
 *
 * Usage:
 *   bun ./scripts/migrate-config-shapes.ts          # apply
 *   bun ./scripts/migrate-config-shapes.ts --dry     # report only, exit 1 if drift
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configsDir = resolve(__dirname, "../src/maps/configs");
const transientStudioCurrent = "studio-current.config.json";

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Unwrap to the object-shaped schema variant (handles anyOf/oneOf unions). */
function objectSchema(schema: unknown): any {
  if (!schema || typeof schema !== "object") return schema;
  const s = schema as any;
  if (s.type === "object" && s.properties) return s;
  const variants = [...(s.anyOf ?? []), ...(s.oneOf ?? [])];
  return variants.find((v: any) => v?.type === "object" && v.properties) ?? s;
}

/** Build the default value for a required key purely from its schema. */
function schemaDefault(childSchema: unknown): unknown {
  const s = objectSchema(childSchema);
  if (s && "const" in s) return s.const;
  if (s && "default" in s) return s.default;
  if (s?.type === "object" && s.properties) {
    const out: Json = {};
    for (const key of s.required ?? []) out[key] = schemaDefault(s.properties[key]);
    return out;
  }
  if (s?.type === "array") return [];
  return undefined;
}

function objectSchemaForData(schema: unknown, data: unknown): any {
  if (!schema || typeof schema !== "object") return schema;
  const s = schema as any;
  const variants = [...(s.anyOf ?? []), ...(s.oneOf ?? [])];
  if (variants.length > 0 && isObject(data) && typeof data.strategy === "string") {
    const strategyVariant = variants.find((variant: any) => {
      return variant?.properties?.strategy?.const === data.strategy;
    });
    if (strategyVariant) return objectSchema(strategyVariant);
  }
  return objectSchema(schema);
}

/** Add missing REQUIRED keys (schema defaults) to PRESENT objects; preserve existing. */
function completeRequired(schema: unknown, data: unknown): unknown {
  const s = objectSchemaForData(schema, data);
  if (s?.type === "object" && data && typeof data === "object" && !Array.isArray(data)) {
    const src = data as Json;
    const out: Json = {};
    for (const key of Object.keys(src)) {
      const childSchema = s.properties?.[key];
      out[key] = childSchema ? completeRequired(childSchema, src[key]) : src[key];
    }
    for (const key of s.required ?? []) {
      if (!(key in out)) out[key] = schemaDefault(s.properties?.[key]);
    }
    return out;
  }
  if (s?.type === "array" && Array.isArray(data) && s.items) {
    return data.map((item) => completeRequired(s.items, item));
  }
  return data;
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const entries = (await readdir(configsDir)).filter(
    (f) => f.endsWith(".config.json") && f !== transientStudioCurrent
  );

  let drifted = 0;
  for (const fileName of entries.sort()) {
    const path = resolve(configsDir, fileName);
    const raw = JSON.parse(await readFile(path, "utf-8")) as Json;
    const before = JSON.stringify(raw.config);

    const pruned = Value.Clean(schema, raw.config);
    raw.config = completeRequired(schema, pruned) as Json;

    const after = JSON.stringify(raw.config);
    if (before === after) {
      console.log(`ok    ${fileName}`);
      continue;
    }
    drifted++;
    const valid = Value.Check(schema, raw.config);
    console.log(`${dry ? "DRIFT" : "fixed"} ${fileName}  (schema-valid after: ${valid})`);
    if (!dry) await writeFile(path, `${JSON.stringify(raw, null, 2)}\n`);
  }

  if (dry && drifted > 0) {
    console.log(
      `\n${drifted} config(s) drift from the recipe schema. Run this script without --dry after intentional schema changes.`
    );
    process.exit(1);
  }
  console.log(
    drifted === 0
      ? "\nAll configs conform to the current recipe schema."
      : `\nUpdated ${drifted} config(s). Next: format and regenerate map artifacts.`
  );
}

await main();
