import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";

import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";
import {
  buildCanonicalMapConfigSchema,
  mapLocalizationTag,
  validateCanonicalMapConfig,
  type ValidatedMapConfig,
} from "../src/maps/configs/canonical.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const repoRoot = resolve(pkgRoot, "../..");

const configsDir = resolve(pkgRoot, "src/maps/configs");
const generatedEntriesDir = resolve(pkgRoot, "src/maps/generated");
const modConfigDir = resolve(pkgRoot, "mod/config");
const modTextDir = resolve(pkgRoot, "mod/text/en_us");
const distRecipesDir = resolve(pkgRoot, "dist/recipes");

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function configHashFor(config: ValidatedMapConfig): string {
  return stableHash(config.config);
}

function envelopeHashFor(config: ValidatedMapConfig, configHash: string): string {
  return stableHash({
    id: config.id,
    recipe: config.recipe,
    latitudeBounds: config.latitudeBounds ?? null,
    configHash,
  });
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function loadRegistry(): Promise<ValidatedMapConfig[]> {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const entries = await readdir(configsDir, { withFileTypes: true });
  const configs: ValidatedMapConfig[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".config.json")) continue;
    const raw = JSON.parse(await readFile(resolve(configsDir, entry.name), "utf-8")) as unknown;
    configs.push(
      validateCanonicalMapConfig({
        fileName: entry.name,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      })
    );
  }

  configs.sort((a, b) => a.sortIndex - b.sortIndex || a.id.localeCompare(b.id));

  const seen = new Set<string>();
  for (const config of configs) {
    if (seen.has(config.id)) throw new Error(`Duplicate map config id "${config.id}"`);
    seen.add(config.id);
  }
  if (configs.length === 0) throw new Error(`No canonical map configs found in ${configsDir}`);

  return configs;
}

function renderMapEntry(config: ValidatedMapConfig): string {
  const configHash = configHashFor(config);
  const envelopeHash = envelopeHashFor(config, configHash);
  const requestId = process.env.SWOOPER_STUDIO_RUN_ID;
  const latitudeBounds = config.latitudeBounds
    ? `\n  latitudeBounds: ${JSON.stringify(config.latitudeBounds, null, 2).replace(/\n/g, "\n  ")},`
    : "";
  const logPrefix = config.logPrefix ? `\n  logPrefix: ${JSON.stringify(config.logPrefix)},` : "";
  const requestIdLine = requestId ? `\n  requestId: ${JSON.stringify(requestId)},` : "";
  return `/**
 * Generated from ../configs/${config.fileName}.
 * Do not edit by hand; re-run \`bun run gen:maps\`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/${config.fileName}";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,${latitudeBounds}${logPrefix}
  sourceConfigId: ${JSON.stringify(config.id)},
  configHash: ${JSON.stringify(configHash)},
  envelopeHash: ${JSON.stringify(envelopeHash)},${requestIdLine}
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
`;
}

function renderConfigXml(configs: readonly ValidatedMapConfig[]): string {
  const rows = configs
    .map(
      (config) => `\t\t<Row
\t\t\tFile="{swooper-maps}/maps/${config.outputFile}"
\t\t\tName="${config.localizationNameTag}"
\t\t\tDescription="${config.localizationDescriptionTag}"
\t\t\tSortIndex="${config.sortIndex}"
\t\t/>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<Maps>
${rows}
\t</Maps>
</Database>
`;
}

function renderMapText(configs: readonly ValidatedMapConfig[]): string {
  const rows = configs
    .flatMap((config) => [
      `\t\t<Row Tag="${config.localizationNameTag}">
\t\t\t<Text>${xmlEscape(config.name)}</Text>
\t\t</Row>`,
      `\t\t<Row Tag="${config.localizationDescriptionTag}">
\t\t\t<Text>${xmlEscape(config.description)}</Text>
\t\t</Row>`,
    ])
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<EnglishText>
${rows}
\t</EnglishText>
</Database>
`;
}

function renderModInfo(configs: readonly ValidatedMapConfig[]): string {
  const imports = configs.map((config) => `\t\t\t\t\t<Item>maps/${config.outputFile}</Item>`).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Mod id="swooper-maps" version="1" xmlns="ModInfo">
\t<Properties>
\t\t<Name>LOC_MODULE_SWOOPER_MAPS_NAME</Name>
\t\t<Description>LOC_MODULE_SWOOPER_MAPS_DESCRIPTION</Description>
\t\t<Authors>Matei Canavra</Authors>
\t\t<Package>Mod</Package>
\t</Properties>
\t<Dependencies>
\t\t<Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/>
\t</Dependencies>
\t<ActionCriteria>
\t\t<Criteria id="always">
\t\t\t<AlwaysMet></AlwaysMet>
\t\t</Criteria>
\t</ActionCriteria>
\t<ActionGroups>
\t\t<ActionGroup id="game-swooper-maps" scope="game" criteria="always">
\t\t\t<Actions>
\t\t\t\t<UpdateText>
\t\t\t\t\t<Item>text/en_us/MapText.xml</Item>
\t\t\t\t</UpdateText>
\t\t\t\t<ImportFiles>
${imports}
\t\t\t\t</ImportFiles>
\t\t\t</Actions>
\t\t</ActionGroup>
\t\t<ActionGroup id="shell-swooper-maps" scope="shell" criteria="always">
\t\t\t<Actions>
\t\t\t\t<UpdateDatabase>
\t\t\t\t\t<Item>config/config.xml</Item>
\t\t\t\t</UpdateDatabase>
\t\t\t\t<UpdateText>
\t\t\t\t\t<Item>text/en_us/MapText.xml</Item>
\t\t\t\t</UpdateText>
\t\t\t</Actions>
\t\t</ActionGroup>
\t</ActionGroups>
\t<LocalizedText>
\t\t<File>text/en_us/ModuleText.xml</File>
\t</LocalizedText>
</Mod>
`;
}

function renderMapConfigsArtifact(configs: readonly ValidatedMapConfig[]): string {
  const values = configs.map((config) => ({
    id: config.id,
    label: config.name,
    name: config.name,
    description: config.description,
    recipe: config.recipe,
    sortIndex: config.sortIndex,
    latitudeBounds: config.latitudeBounds,
    configHash: configHashFor(config),
    envelopeHash: envelopeHashFor(config, configHashFor(config)),
    sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
    config: config.config,
  }));
  return `// This file is generated by scripts/generate-map-artifacts.ts
// Do not edit by hand; re-run \`bun run gen:maps\`.

export const standardMapConfigs = ${JSON.stringify(values, null, 2)};
`;
}

function renderMapConfigsDts(): string {
  return `// This file is generated by scripts/generate-map-artifacts.ts
// Do not edit by hand; re-run \`bun run gen:maps\`.

export type StudioMapConfig = Readonly<{
  id: string;
  label: string;
  name: string;
  description: string;
  recipe: "standard";
  sortIndex: number;
  configHash: string;
  envelopeHash: string;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  sourcePath: string;
  config: unknown;
}>;

export const standardMapConfigs: ReadonlyArray<StudioMapConfig>;
`;
}

async function main(): Promise<void> {
  const configs = await loadRegistry();
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);

  await mkdir(generatedEntriesDir, { recursive: true });
  await mkdir(modConfigDir, { recursive: true });
  await mkdir(modTextDir, { recursive: true });
  await mkdir(distRecipesDir, { recursive: true });

  for (const entry of await readdir(generatedEntriesDir, { withFileTypes: true }).catch(() => [])) {
    if (entry.isFile() && entry.name.endsWith(".ts")) {
      await rm(resolve(generatedEntriesDir, entry.name));
    }
  }

  for (const config of configs) {
    await writeFile(resolve(generatedEntriesDir, `${config.id}.ts`), renderMapEntry(config));
  }

  await writeFile(resolve(modConfigDir, "config.xml"), renderConfigXml(configs));
  await writeFile(resolve(pkgRoot, "mod/swooper-maps.modinfo"), renderModInfo(configs));
  await writeFile(resolve(modTextDir, "MapText.xml"), renderMapText(configs));
  await writeFile(resolve(distRecipesDir, "standard-map-config.schema.json"), stableJson(envelopeSchema));
  await writeFile(resolve(distRecipesDir, "standard-map-configs.js"), renderMapConfigsArtifact(configs));
  await writeFile(resolve(distRecipesDir, "standard-map-configs.d.ts"), renderMapConfigsDts());

  const rel = (path: string) => path.replace(`${repoRoot}/`, "");
  console.log(
    `Generated ${configs.length} Swooper map configs from ${rel(configsDir)}: ${configs
      .map((config) => config.id)
      .join(", ")}`
  );
}

await main();
