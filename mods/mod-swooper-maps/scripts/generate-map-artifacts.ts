import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import {
  buildCanonicalMapConfigSchema,
  mapLocalizationTag,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const repoRoot = resolve(pkgRoot, "../..");

const configsDir = resolve(pkgRoot, "src/maps/configs");
const generatedEntriesDir = resolve(pkgRoot, "src/maps/generated");
const modConfigDir = resolve(pkgRoot, "mod/config");
const modTextDir = resolve(pkgRoot, "mod/text/en_us");
const modDataDir = resolve(pkgRoot, "mod/data");
const distRecipesDir = resolve(pkgRoot, "dist/recipes");
const transientStudioCurrentConfig = "studio-current.config.json";
const includeTransientStudioCurrent = process.env.SWOOPER_INCLUDE_STUDIO_CURRENT === "1";

type StudioRunProofEnv =
  | Readonly<{ kind: "none" }>
  | Readonly<{
      kind: "run";
      requestId: string;
      launchConfigId: string;
      launchEnvelopeDigest: string;
    }>;

const studioRunProofEnv = readStudioRunProofEnv();

function readStudioRunProofEnv(env: NodeJS.ProcessEnv = process.env): StudioRunProofEnv {
  const requestId = env.SWOOPER_STUDIO_RUN_ID;
  const launchConfigId = env.SWOOPER_STUDIO_LAUNCH_CONFIG_ID;
  const launchEnvelopeDigest = env.SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST;
  if (
    requestId === undefined &&
    launchConfigId === undefined &&
    launchEnvelopeDigest === undefined
  ) {
    return { kind: "none" };
  }
  if (!requestId || !launchConfigId || !launchEnvelopeDigest) {
    throw new Error(
      "Studio run proof env must set SWOOPER_STUDIO_RUN_ID, SWOOPER_STUDIO_LAUNCH_CONFIG_ID, and SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST together"
    );
  }
  return { kind: "run", requestId, launchConfigId, launchEnvelopeDigest };
}

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
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
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
    if (!includeTransientStudioCurrent && entry.name === transientStudioCurrentConfig) continue;
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
  const isSelectedProofConfig =
    studioRunProofEnv.kind === "run" && studioRunProofEnv.launchConfigId === config.id;
  const envelopeHash = isSelectedProofConfig
    ? studioRunProofEnv.launchEnvelopeDigest
    : envelopeHashFor(config, configHash);
  const requestId = isSelectedProofConfig ? studioRunProofEnv.requestId : undefined;
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
\t\t<Row Tag="LOC_PLOTEFFECT_DESERT_HEAT_NAME">
\t\t\t<Text>Deep Desert Heat</Text>
\t\t</Row>
\t\t<Row Tag="LOC_PLOTEFFECT_FROSTBITE_NAME">
\t\t\t<Text>Killing Frost</Text>
\t\t</Row>
\t\t<Row Tag="LOC_PLOTEFFECT_JUNGLE_FEVER_NAME">
\t\t\t<Text>Jungle Fever</Text>
\t\t</Row>
\t</EnglishText>
</Database>
`;
}

// Biome attrition hazards. Custom, permanent, damaging PlotEffects — the data-defined twin
// of the engine-internal ocean damage. PROVEN LIVE (a stationary unit on a DESERT_HEAT tile
// took exactly 11 HP across one turn): a PlotEffects row with Damage>0 and no TriggerOnEnter
// inflicts that Damage on ANY unit occupying the tile, every turn — the "crossing here is
// dangerous" model. Each is permanent (TimeDecay/UnoccupiedDecay=false) and land-only
// (AllowOnWater=false). They are placed by the ecology plot-effect plan on the most
// physically EXTREME tiles of each biome (highest climate-stress score), not by geometry:
//   - DESERT_HEAT  — deepest/hottest/driest desert (sand stress: aridity + heat)
//   - FROSTBITE    — deepest/coldest tundra (snow stress: freeze + elevation, temp ≤ max)
//   - JUNGLE_FEVER — deepest/hottest-wettest rainforest (jungle stress: heat + humidity)
// This fills a real gap: NO base plot effect is both permanent AND damages occupants per
// turn (permanent ones — FLOODED, SNOW_*_PERMANENT — deal 0; STONE_TRAP/DIGSITE are
// permanent but RemoveOnEnter one-shots; the per-turn damagers — IS_BURNING/PLAGUE/FALLOUT —
// all TimeDecay away).
//
// NO WORLD-VISUAL for custom types (the visual name is "VFX_ADDED_TO_MAP_"+PlotEffectType,
// with no asset for ours; even base PLOTEFFECT_SAND has only a one-shot animation, no
// persistent decal). A missing VFX does NOT gate placement, so the damage still applies; the
// hazard is surfaced via the plot TOOLTIP (the Name) + terrain reading. (Frostbite tiles do
// carry permanent snow, which renders via the terrain material, so cold hazards read
// naturally.) A guaranteed overlay would need the art pipeline / a feature — future work.
//
// Gameplay-DB table form: a ROOT <Database> with raw <Row> entries (Types + PlotEffects).
// Loaded via a gameplay-scope UpdateDatabase action in the modinfo. (Contrast the high-level
// <GameEffects xmlns="GameEffects"> <Modifier> form — a DIFFERENT root that rolls back if
// nested in <Database>. No modifier needed here: PlotEffects.Damage is the whole mechanism.)
function renderBiomeHazardData(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
  <Types>
    <Row Type="PLOTEFFECT_DESERT_HEAT" Kind="KIND_PLOTEFFECT"/>
    <Row Type="PLOTEFFECT_FROSTBITE" Kind="KIND_PLOTEFFECT"/>
    <Row Type="PLOTEFFECT_JUNGLE_FEVER" Kind="KIND_PLOTEFFECT"/>
  </Types>
  <PlotEffects>
    <Row PlotEffectType="PLOTEFFECT_DESERT_HEAT" Name="LOC_PLOTEFFECT_DESERT_HEAT_NAME" TimeDecay="false" UnoccupiedDecay="false" TimeValue="1" Damage="11" Defense="0" AllowOnWater="false"/>
    <Row PlotEffectType="PLOTEFFECT_FROSTBITE" Name="LOC_PLOTEFFECT_FROSTBITE_NAME" TimeDecay="false" UnoccupiedDecay="false" TimeValue="1" Damage="11" Defense="0" AllowOnWater="false"/>
    <Row PlotEffectType="PLOTEFFECT_JUNGLE_FEVER" Name="LOC_PLOTEFFECT_JUNGLE_FEVER_NAME" TimeDecay="false" UnoccupiedDecay="false" TimeValue="1" Damage="11" Defense="0" AllowOnWater="false"/>
  </PlotEffects>
</Database>
`;
}

function renderModInfo(configs: readonly ValidatedMapConfig[]): string {
  const imports = configs
    .map((config) => `\t\t\t\t\t<Item>maps/${config.outputFile}</Item>`)
    .join("\n");
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
\t\t\t\t<UpdateDatabase>
\t\t\t\t\t<Item>data/biome-hazards.xml</Item>
\t\t\t\t</UpdateDatabase>
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
  await mkdir(modDataDir, { recursive: true });
  await mkdir(distRecipesDir, { recursive: true });

  for (const entry of await readdir(generatedEntriesDir, { withFileTypes: true }).catch(() => [])) {
    if (entry.isFile() && entry.name.endsWith(".ts")) {
      await rm(resolve(generatedEntriesDir, entry.name), { force: true });
    }
  }

  for (const config of configs) {
    await writeFile(resolve(generatedEntriesDir, `${config.id}.ts`), renderMapEntry(config));
  }

  await writeFile(resolve(modConfigDir, "config.xml"), renderConfigXml(configs));
  await writeFile(resolve(pkgRoot, "mod/swooper-maps.modinfo"), renderModInfo(configs));
  await writeFile(resolve(modDataDir, "biome-hazards.xml"), renderBiomeHazardData());
  await writeFile(resolve(modTextDir, "MapText.xml"), renderMapText(configs));
  await writeFile(
    resolve(distRecipesDir, "standard-map-config.schema.json"),
    stableJson(envelopeSchema)
  );
  await writeFile(
    resolve(distRecipesDir, "standard-map-configs.js"),
    renderMapConfigsArtifact(configs)
  );
  await writeFile(resolve(distRecipesDir, "standard-map-configs.d.ts"), renderMapConfigsDts());

  const rel = (path: string) => path.replace(`${repoRoot}/`, "");
  console.log(
    `Generated ${configs.length} Swooper map configs from ${rel(configsDir)}: ${configs
      .map((config) => config.id)
      .join(", ")}`
  );
}

await main();
