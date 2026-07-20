import { createHash } from "node:crypto";

import {
  type RunCorrelation,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
  STUDIO_RUN_MOD_ID,
} from "@civ7/studio-run-workspace";
import { mapLocalizationTag, type ValidatedMapConfig } from "../../src/maps/configs/canonical.js";

export type StudioRunEvidenceEnv =
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

const DEFAULT_GENERATED_MAP_LATITUDE_BOUNDS = {
  topLatitude: 80,
  bottomLatitude: -80,
} as const;

type GeneratedMapLatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
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

function mapLatitudeBoundsFor(config: ValidatedMapConfig): GeneratedMapLatitudeBounds {
  return config.latitudeBounds ?? DEFAULT_GENERATED_MAP_LATITUDE_BOUNDS;
}

function latitudeBoundsProperty(config: ValidatedMapConfig): string {
  return `\n  latitudeBounds: ${JSON.stringify(mapLatitudeBoundsFor(config), null, 2).replace(/\n/g, "\n  ")},`;
}

function envelopeHashFor(config: ValidatedMapConfig, configHash: string): string {
  return stableHash({
    id: config.id,
    recipe: config.recipe,
    latitudeBounds: mapLatitudeBoundsFor(config),
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
  studioRunEvidenceEnv: StudioRunEvidenceEnv
): Pick<
  Extract<SwooperMapArtifactPlannedFile, { kind: "generated-map-entry" }>,
  "content" | "markerMetadata"
> {
  const configHash = configHashFor(config);
  const isSelectedRunConfig =
    studioRunEvidenceEnv.kind === "run" && studioRunEvidenceEnv.launchConfigId === config.id;
  const envelopeHash = isSelectedRunConfig
    ? studioRunEvidenceEnv.launchEnvelopeDigest
    : envelopeHashFor(config, configHash);
  const requestId = isSelectedRunConfig ? studioRunEvidenceEnv.requestId : undefined;
  const latitudeBounds = latitudeBoundsProperty(config);
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

type GeneratedMapConfig = Readonly<{
  id: string;
  name: string;
  description?: string;
  recipe: "standard";
  sortIndex: number;
  latitudeBounds?: Readonly<{ topLatitude: number; bottomLatitude: number }>;
  logPrefix?: string;
  config: unknown;
}>;

const mapConfig = ${JSON.stringify(
        {
          id: config.id,
          name: config.name,
          description: config.description,
          recipe: config.recipe,
          sortIndex: config.sortIndex,
          latitudeBounds: mapLatitudeBoundsFor(config),
          ...(config.logPrefix === undefined ? {} : { logPrefix: config.logPrefix }),
          config: config.config,
        },
        null,
        2
      )} as const satisfies GeneratedMapConfig;

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,${latitudeBounds}${logPrefix}
  sourceConfigId: ${JSON.stringify(config.id)},
  configHash: ${JSON.stringify(configHash)},
  envelopeHash: ${JSON.stringify(envelopeHash)},${requestIdLine}
  config: mapConfig.config as unknown as StandardRecipeConfig,
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
  const configHash = configHashFor(config);
  const latitudeBounds = latitudeBoundsProperty(config);
  const logPrefix = config.logPrefix ? `\n  logPrefix: ${JSON.stringify(config.logPrefix)},` : "";
  return {
    markerMetadata: {
      configId: input.selectedConfigId,
      configHash,
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

type GeneratedMapConfig = Readonly<{
  id: string;
  name: string;
  description?: string;
  recipe: "standard";
  sortIndex: number;
  latitudeBounds?: Readonly<{ topLatitude: number; bottomLatitude: number }>;
  logPrefix?: string;
  config: unknown;
}>;

const runCorrelation = ${JSON.stringify(input.correlation, null, 2)} as const;
const mapConfig = ${JSON.stringify(
        {
          id: config.id,
          name: config.name,
          description: config.description,
          recipe: config.recipe,
          sortIndex: config.sortIndex,
          latitudeBounds: mapLatitudeBoundsFor(config),
          ...(config.logPrefix === undefined ? {} : { logPrefix: config.logPrefix }),
          config: config.config,
        },
        null,
        2
      )} as const satisfies GeneratedMapConfig;

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,${latitudeBounds}${logPrefix}
  sourceConfigId: ${JSON.stringify(input.selectedConfigId)},
  runCorrelation,
  seed: ${JSON.stringify(input.seed)},
  config: mapConfig.config as unknown as StandardRecipeConfig,
});
`,
    },
  };
}

function renderConfigXml(
  configs: readonly ValidatedMapConfig[],
  options: Readonly<{ moduleId?: string; outputFile?: string; mapRowId?: string }> = {}
): string {
  const moduleId = options.moduleId ?? "swooper-maps";
  const rows = configs
    .map(
      (config) => `\t\t<Row
\t\t\tFile="{${moduleId}}/${options.outputFile ?? `maps/${config.outputFile}`}"
\t\t\tName="${options.mapRowId ? mapLocalizationTag(options.mapRowId, "name") : config.localizationNameTag}"
\t\t\tDescription="${options.mapRowId ? mapLocalizationTag(options.mapRowId, "description") : config.localizationDescriptionTag}"
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

type SwooperModRenderMode =
  | Readonly<{ kind: "catalog"; moduleId?: string }>
  | Readonly<{
      kind: "studio-run";
      moduleId: string;
      mapRowId: string;
      dependencyModules: readonly Readonly<{ id: string; title: string }>[];
    }>;

function renderMapText(
  configs: readonly ValidatedMapConfig[],
  mode: SwooperModRenderMode = { kind: "catalog" }
): string {
  const rows = configs
    .flatMap((config) => {
      const nameTag =
        mode.kind === "studio-run"
          ? mapLocalizationTag(mode.mapRowId, "name")
          : config.localizationNameTag;
      const descriptionTag =
        mode.kind === "studio-run"
          ? mapLocalizationTag(mode.mapRowId, "description")
          : config.localizationDescriptionTag;
      return [
        `\t\t<Row Tag="${nameTag}">
\t\t\t<Text>${xmlEscape(config.name)}</Text>
\t\t</Row>`,
        `\t\t<Row Tag="${descriptionTag}">
\t\t\t<Text>${xmlEscape(config.description)}</Text>
\t\t</Row>`,
      ];
    })
    .join("\n");
  const biomeHazardRows =
    mode.kind === "studio-run"
      ? ""
      : `\t\t<Row Tag="LOC_PLOTEFFECT_DESERT_HEAT_NAME">
\t\t\t<Text>Deep Desert Heat</Text>
\t\t</Row>
\t\t<Row Tag="LOC_PLOTEFFECT_FROSTBITE_NAME">
\t\t\t<Text>Killing Frost</Text>
\t\t</Row>
\t\t<Row Tag="LOC_PLOTEFFECT_JUNGLE_FEVER_NAME">
\t\t\t<Text>Jungle Fever</Text>
\t\t</Row>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<EnglishText>
${rows}${biomeHazardRows ? `\n${biomeHazardRows}` : ""}
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
  mode: SwooperModRenderMode = { kind: "catalog" }
): string {
  const moduleId = mode.moduleId ?? "swooper-maps";
  const criteriaId = mode.kind === "studio-run" ? `always-${moduleId}` : "always";
  const gameActionGroupId = mode.kind === "studio-run" ? `game-${moduleId}` : "game-swooper-maps";
  const shellActionGroupId =
    mode.kind === "studio-run" ? `shell-${moduleId}` : "shell-swooper-maps";
  const dependencyModules = mode.kind === "studio-run" ? mode.dependencyModules : [];
  const extraDependencies = dependencyModules
    .map(
      (dependency) =>
        `\t\t<Mod id="${xmlEscape(dependency.id)}" title="${xmlEscape(dependency.title)}"/>`
    )
    .join("\n");
  const biomeHazardDatabaseAction =
    mode.kind === "studio-run"
      ? ""
      : `\t\t\t\t<UpdateDatabase>
\t\t\t\t\t<Item>data/biome-hazards.xml</Item>
\t\t\t\t</UpdateDatabase>`;
  const localizedModuleText =
    mode.kind === "studio-run"
      ? ""
      : `\t<LocalizedText>
\t\t<File>text/en_us/ModuleText.xml</File>
\t</LocalizedText>
`;
  const importPath = mode.kind === "studio-run" ? STUDIO_RUN_MAP_SCRIPT_PATH : undefined;
  const imports = configs
    .map((config) => `\t\t\t\t\t<Item>${importPath ?? `maps/${config.outputFile}`}</Item>`)
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
\t\t<Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/>${extraDependencies ? `\n${extraDependencies}` : ""}
\t</Dependencies>
\t<ActionCriteria>
\t\t<Criteria id="${xmlEscape(criteriaId)}">
\t\t\t<AlwaysMet></AlwaysMet>
\t\t</Criteria>
\t</ActionCriteria>
\t<ActionGroups>
\t\t<ActionGroup id="${xmlEscape(gameActionGroupId)}" scope="game" criteria="${xmlEscape(criteriaId)}">
\t\t\t<Actions>
\t\t\t\t<UpdateText>
\t\t\t\t\t<Item>text/en_us/MapText.xml</Item>
\t\t\t\t</UpdateText>${biomeHazardDatabaseAction ? `\n${biomeHazardDatabaseAction}` : ""}
\t\t\t\t<ImportFiles>
${imports}
\t\t\t\t</ImportFiles>
\t\t\t</Actions>
\t\t</ActionGroup>
\t\t<ActionGroup id="${xmlEscape(shellActionGroupId)}" scope="shell" criteria="${xmlEscape(criteriaId)}">
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
${localizedModuleText}</Mod>
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
    latitudeBounds: mapLatitudeBoundsFor(config),
    configHash: configHashFor(config),
    envelopeHash: envelopeHashFor(config, configHashFor(config)),
    sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
    config: config.config,
  }));
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

export const standardMapConfigs = ${JSON.stringify(values, null, 2)};
`;
}

function renderMapConfigsDts(): string {
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

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
 * Builds the shipped/deployed Swooper mod artifact plan without touching disk.
 * Catalog source membership is supplied by the caller; this renderer only
 * turns validated configs into generated map entrypoints and Civ7 mod files.
 */
export function buildSwooperCatalogModFilePlan(
  options: Readonly<{
    configs: readonly ValidatedMapConfig[];
    envelopeSchema: unknown;
    evidenceEnv?: StudioRunEvidenceEnv;
  }>
): SwooperMapArtifactFilePlan {
  const evidenceEnv = options.evidenceEnv ?? { kind: "none" };
  const generatedMapFiles = options.configs.map((config) => {
    const entry = renderMapEntryArtifact(config, evidenceEnv);
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
    ],
  };
}

/**
 * Builds the Studio-facing catalog metadata plan without touching disk. These
 * files are enough for Studio to list and validate catalog configs; they do not
 * include generated runtime entrypoints, deployed mod files, or request-local
 * generated mod trees.
 */
export function buildSwooperCatalogMetadataFilePlan(
  options: Readonly<{
    configs: readonly ValidatedMapConfig[];
    envelopeSchema: unknown;
  }>
): SwooperMapArtifactFilePlan {
  return {
    exclusiveSets: [],
    files: [
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

/**
 * Builds the complete durable catalog artifact plan without touching disk.
 * Prefer the narrower catalog-mod or metadata plan when a target owns only one
 * output class.
 */
export function buildSwooperMapArtifactFilePlan(
  options: Readonly<{
    configs: readonly ValidatedMapConfig[];
    envelopeSchema: unknown;
    evidenceEnv?: StudioRunEvidenceEnv;
  }>
): SwooperMapArtifactFilePlan {
  const modPlan = buildSwooperCatalogModFilePlan(options);
  const metadataPlan = buildSwooperCatalogMetadataFilePlan(options);
  return {
    exclusiveSets: modPlan.exclusiveSets,
    files: [...modPlan.files, ...metadataPlan.files],
  };
}

/**
 * Builds the request-local generated mod tree from a Studio generation
 * manifest. The run mod owns only the generated map row, map script, and
 * request correlation; shared gameplay data stays owned by the durable
 * Swooper mod that this run depends on.
 */
export function buildSwooperRunGeneratedModFilePlan(
  input: SwooperRunGeneratedModPlanInput
): SwooperMapArtifactFilePlan {
  const configHash = configHashFor(input.config);
  if (configHash !== input.correlation.launchSourceDigest.configContentDigest) {
    throw new Error("Studio run config digest does not match the launch config.");
  }
  const entry = renderRunMapEntryArtifact(input);
  const config = input.config;
  const renderMode = {
    kind: "studio-run",
    dependencyModules: [{ id: "swooper-maps", title: "LOC_MODULE_SWOOPER_MAPS_NAME" }],
    mapRowId: STUDIO_RUN_MAP_ROW_ID,
    moduleId: STUDIO_RUN_MOD_ID,
  } satisfies SwooperModRenderMode;
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
          text: renderConfigXml([config], {
            moduleId: STUDIO_RUN_MOD_ID,
            outputFile: STUDIO_RUN_MAP_SCRIPT_PATH,
            mapRowId: STUDIO_RUN_MAP_ROW_ID,
          }),
        },
      },
      {
        relativePath: `${STUDIO_RUN_MOD_ID}.modinfo`,
        kind: "mod-info",
        content: {
          kind: "text",
          text: renderModInfo([config], renderMode),
        },
      },
      {
        relativePath: "text/en_us/MapText.xml",
        kind: "mod-text",
        content: { kind: "text", text: renderMapText([config], renderMode) },
      },
    ],
  };
}
