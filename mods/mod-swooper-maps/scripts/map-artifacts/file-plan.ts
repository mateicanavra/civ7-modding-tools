import { createHash } from "node:crypto";

import type { RunCorrelation } from "@civ7/studio-run-workspace";
import type { ValidatedMapConfig } from "../../src/maps/configs/canonical.js";

export type StudioRunProofEnv =
  | Readonly<{ kind: "none" }>
  | Readonly<{
      kind: "run";
      requestId: string;
      launchConfigId: string;
      launchEnvelopeDigest: string;
    }>;

export type SwooperRunGeneratedModPlanInput = Readonly<{
  selectedConfigId: string;
  correlation: RunCorrelation;
  config: ValidatedMapConfig;
  seed: number;
}>;

export type SwooperMapArtifactFileKind =
  | "generated-map-entry"
  | "mod-config"
  | "mod-info"
  | "mod-data"
  | "mod-text"
  | "mod-module-text"
  | "recipe-schema"
  | "studio-catalog-module"
  | "studio-catalog-types";

export type SwooperMapArtifactMarkerMetadata = Readonly<{
  configId: string;
  configHash: string;
  envelopeHash: string;
  requestId?: string;
}>;

export type SwooperMapArtifactFileContent =
  | Readonly<{ kind: "text"; text: string }>
  | Readonly<{ kind: "bytes"; bytes: Uint8Array }>;

type SwooperMapArtifactNonGeneratedFileKind = Exclude<
  SwooperMapArtifactFileKind,
  "generated-map-entry"
>;

export type SwooperMapArtifactPlannedFile =
  | Readonly<{
      relativePath: string;
      kind: "generated-map-entry";
      content: SwooperMapArtifactFileContent;
      markerMetadata: SwooperMapArtifactMarkerMetadata;
    }>
  | Readonly<{
      relativePath: string;
      kind: SwooperMapArtifactNonGeneratedFileKind;
      content: SwooperMapArtifactFileContent;
    }>;

export type SwooperMapArtifactExclusiveSet = Readonly<{
  id: "generated-map-entrypoints";
  relativeDir: string;
  fileExtension: ".ts";
  artifactKind: "generated-map-entry";
}>;

/**
 * Pure artifact intent for Swooper map generation. The renderer owns relative
 * paths, content, and marker metadata; the writer owns output-root resolution,
 * cleanup, directory creation, and filesystem writes.
 */
export type SwooperMapArtifactFilePlan = Readonly<{
  exclusiveSets: readonly SwooperMapArtifactExclusiveSet[];
  files: readonly SwooperMapArtifactPlannedFile[];
}>;

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

function renderMapEntryArtifact(
  config: ValidatedMapConfig,
  studioRunProofEnv: StudioRunProofEnv
): Pick<
  Extract<SwooperMapArtifactPlannedFile, { kind: "generated-map-entry" }>,
  "content" | "markerMetadata"
> {
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
  return {
    markerMetadata: {
      configId: config.id,
      configHash,
      envelopeHash,
      ...(requestId ? { requestId } : {}),
    },
    content: {
      kind: "text",
      text: `/**
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
`,
    },
  };
}

function renderRunMapEntryArtifact(
  input: SwooperRunGeneratedModPlanInput
): Pick<
  Extract<SwooperMapArtifactPlannedFile, { kind: "generated-map-entry" }>,
  "content" | "markerMetadata"
> {
  const config = input.config;
  const latitudeBounds = config.latitudeBounds
    ? `\n  latitudeBounds: ${JSON.stringify(config.latitudeBounds, null, 2).replace(/\n/g, "\n  ")},`
    : "";
  const logPrefix = config.logPrefix ? `\n  logPrefix: ${JSON.stringify(config.logPrefix)},` : "";
  return {
    markerMetadata: {
      configId: input.selectedConfigId,
      configHash: input.correlation.launchSourceDigest.configContentDigest,
      envelopeHash: input.correlation.launchEnvelopeDigest,
      requestId: input.correlation.requestId,
    },
    content: {
      kind: "text",
      text: `/**
 * Generated from a Studio Run in Game generation manifest.
 * Do not edit by hand; re-run the manifest generator.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "mod-swooper-maps/recipes/standard";
import standardRecipe from "mod-swooper-maps/recipes/standard";

const runCorrelation = ${JSON.stringify(input.correlation, null, 2)} as const;
const mapConfig = ${JSON.stringify(
        {
          id: config.id,
          name: config.name,
          description: config.description,
          recipe: config.recipe,
          sortIndex: config.sortIndex,
          ...(config.latitudeBounds === undefined ? {} : { latitudeBounds: config.latitudeBounds }),
          ...(config.logPrefix === undefined ? {} : { logPrefix: config.logPrefix }),
          config: config.config,
        },
        null,
        2
      )} as const;

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,${latitudeBounds}${logPrefix}
  sourceConfigId: ${JSON.stringify(input.selectedConfigId)},
  configHash: ${JSON.stringify(input.correlation.launchSourceDigest.configContentDigest)},
  envelopeHash: ${JSON.stringify(input.correlation.launchEnvelopeDigest)},
  runCorrelation,
  seed: ${JSON.stringify(input.seed)},
  config: mapConfig.config as StandardRecipeConfig,
});
`,
    },
  };
}

function renderConfigXml(
  configs: readonly ValidatedMapConfig[],
  options: Readonly<{ moduleId?: string }> = {}
): string {
  const moduleId = options.moduleId ?? "swooper-maps";
  const rows = configs
    .map(
      (config) => `\t\t<Row
\t\t\tFile="{${moduleId}}/maps/${config.outputFile}"
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

function renderModuleText(options: Readonly<{ name: string; description: string }>): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<EnglishText>
\t\t<Row Tag="LOC_MODULE_SWOOPER_MAPS_NAME">
\t\t\t<Text>${xmlEscape(options.name)}</Text>
\t\t</Row>
\t\t<Row Tag="LOC_MODULE_SWOOPER_MAPS_DESCRIPTION">
\t\t\t<Text>${xmlEscape(options.description)}</Text>
\t\t</Row>
\t</EnglishText>
</Database>
`;
}

// Biome attrition hazards. Custom, permanent, damaging PlotEffects - the data-defined twin
// of the engine-internal ocean damage. PROVEN LIVE (a stationary unit on a DESERT_HEAT tile
// took exactly 11 HP across one turn): a PlotEffects row with Damage>0 and no TriggerOnEnter
// inflicts that Damage on ANY unit occupying the tile, every turn - the "crossing here is
// dangerous" model. Each is permanent (TimeDecay/UnoccupiedDecay=false) and land-only
// (AllowOnWater=false). They are placed by the ecology plot-effect plan on the most
// physically EXTREME tiles of each biome (highest climate-stress score), not by geometry:
//   - DESERT_HEAT - deepest/hottest/driest desert (sand stress: aridity + heat)
//   - FROSTBITE - deepest/coldest tundra (snow stress: freeze + elevation, temp <= max)
//   - JUNGLE_FEVER - deepest/hottest-wettest rainforest (jungle stress: heat + humidity)
// This fills a real gap: NO base plot effect is both permanent AND damages occupants per
// turn (permanent ones - FLOODED, SNOW_*_PERMANENT - deal 0; STONE_TRAP/DIGSITE are
// permanent but RemoveOnEnter one-shots; the per-turn damagers - IS_BURNING/PLAGUE/FALLOUT -
// all TimeDecay away).
//
// NO WORLD-VISUAL for custom types (the visual name is "VFX_ADDED_TO_MAP_"+PlotEffectType,
// with no asset for ours; even base PLOTEFFECT_SAND has only a one-shot animation, no
// persistent decal). A missing VFX does NOT gate placement, so the damage still applies; the
// hazard is surfaced via the plot TOOLTIP (the Name) + terrain reading. (Frostbite tiles do
// carry permanent snow, which renders via the terrain material, so cold hazards read
// naturally.) A guaranteed overlay would need the art pipeline / a feature - future work.
//
// Gameplay-DB table form: a ROOT <Database> with raw <Row> entries (Types + PlotEffects).
// Loaded via a gameplay-scope UpdateDatabase action in the modinfo. (Contrast the high-level
// <GameEffects xmlns="GameEffects"> <Modifier> form - a DIFFERENT root that rolls back if
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

function renderModInfo(
  configs: readonly ValidatedMapConfig[],
  options: Readonly<{ moduleId?: string }> = {}
): string {
  const moduleId = options.moduleId ?? "swooper-maps";
  const imports = configs
    .map((config) => `\t\t\t\t\t<Item>maps/${config.outputFile}</Item>`)
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${xmlEscape(moduleId)}" version="1" xmlns="ModInfo">
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

/**
 * Builds the complete Swooper artifact manifest without touching disk. Packet 6
 * relies on this single plan as the source of truth for generated map entries,
 * mod files, Studio catalog files, and launch-proof marker metadata.
 */
export function buildSwooperMapArtifactFilePlan(
  options: Readonly<{
    configs: readonly ValidatedMapConfig[];
    envelopeSchema: unknown;
    proofEnv?: StudioRunProofEnv;
  }>
): SwooperMapArtifactFilePlan {
  const proofEnv = options.proofEnv ?? { kind: "none" };
  const generatedMapFiles = options.configs.map((config) => {
    const entry = renderMapEntryArtifact(config, proofEnv);
    return {
      relativePath: `src/maps/generated/${config.id}.ts`,
      kind: "generated-map-entry",
      content: entry.content,
      markerMetadata: entry.markerMetadata,
    } as const satisfies SwooperMapArtifactPlannedFile;
  });
  return {
    exclusiveSets: [
      {
        id: "generated-map-entrypoints",
        relativeDir: "src/maps/generated",
        fileExtension: ".ts",
        artifactKind: "generated-map-entry",
      },
    ],
    files: [
      ...generatedMapFiles,
      {
        relativePath: "mod/config/config.xml",
        kind: "mod-config",
        content: { kind: "text", text: renderConfigXml(options.configs) },
      },
      {
        relativePath: "mod/swooper-maps.modinfo",
        kind: "mod-info",
        content: { kind: "text", text: renderModInfo(options.configs) },
      },
      {
        relativePath: "mod/data/biome-hazards.xml",
        kind: "mod-data",
        content: { kind: "text", text: renderBiomeHazardData() },
      },
      {
        relativePath: "mod/text/en_us/MapText.xml",
        kind: "mod-text",
        content: { kind: "text", text: renderMapText(options.configs) },
      },
      {
        relativePath: "dist/recipes/standard-map-config.schema.json",
        kind: "recipe-schema",
        content: { kind: "text", text: stableJson(options.envelopeSchema) },
      },
      {
        relativePath: "dist/recipes/standard-map-configs.js",
        kind: "studio-catalog-module",
        content: { kind: "text", text: renderMapConfigsArtifact(options.configs) },
      },
      {
        relativePath: "dist/recipes/standard-map-configs.d.ts",
        kind: "studio-catalog-types",
        content: { kind: "text", text: renderMapConfigsDts() },
      },
    ],
  };
}

export const SWOOPER_STUDIO_RUN_MOD_ID = "mod-swooper-studio-run";

export function runMapRowIdForArtifact(runArtifactId: string): string {
  return `MAP_${runArtifactId.replace(/-/g, "_").toUpperCase()}`;
}

/**
 * Builds the request-local generated mod tree from a Studio generation
 * manifest. It deliberately shares the same mod file classes as catalog
 * generation while changing the identity axis to the manifest correlation.
 */
export function buildSwooperRunGeneratedModFilePlan(
  input: SwooperRunGeneratedModPlanInput
): SwooperMapArtifactFilePlan {
  const entry = renderRunMapEntryArtifact(input);
  const config = input.config;
  return {
    exclusiveSets: [
      {
        id: "generated-map-entrypoints",
        relativeDir: ".source/maps",
        fileExtension: ".ts",
        artifactKind: "generated-map-entry",
      },
    ],
    files: [
      {
        relativePath: `.source/maps/${input.correlation.runArtifactId}.ts`,
        kind: "generated-map-entry",
        content: entry.content,
        markerMetadata: entry.markerMetadata,
      },
      {
        relativePath: "config/config.xml",
        kind: "mod-config",
        content: {
          kind: "text",
          text: renderConfigXml([config], { moduleId: SWOOPER_STUDIO_RUN_MOD_ID }),
        },
      },
      {
        relativePath: `${SWOOPER_STUDIO_RUN_MOD_ID}.modinfo`,
        kind: "mod-info",
        content: {
          kind: "text",
          text: renderModInfo([config], { moduleId: SWOOPER_STUDIO_RUN_MOD_ID }),
        },
      },
      {
        relativePath: "data/biome-hazards.xml",
        kind: "mod-data",
        content: { kind: "text", text: renderBiomeHazardData() },
      },
      {
        relativePath: "text/en_us/MapText.xml",
        kind: "mod-text",
        content: { kind: "text", text: renderMapText([config]) },
      },
      {
        relativePath: "text/en_us/ModuleText.xml",
        kind: "mod-module-text",
        content: {
          kind: "text",
          text: renderModuleText({
            name: "Swooper Studio Run",
            description: "Request-local Swooper map generated by MapGen Studio.",
          }),
        },
      },
    ],
  };
}
