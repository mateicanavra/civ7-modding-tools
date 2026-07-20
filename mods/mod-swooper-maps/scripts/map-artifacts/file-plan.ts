import type {
  GeneratedFilePlanExclusiveSet,
  GeneratedFilePlanFile,
} from "@civ7/plugin-files/generated-file-plan";
import {
  type RunCorrelation,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
  STUDIO_RUN_MOD_ID,
} from "@civ7/studio-run-workspace";
import {
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
  mapLocalizationTag,
  type StandardMapConfigEnvelope,
  type ValidatedMapConfig,
} from "../../src/maps/configs/canonical.js";

/** Admitted config and correlation used to render one request-local Studio run mod. */
export type SwooperRunGeneratedModPlanInput = Readonly<{
  correlation: RunCorrelation;
  config: StandardMapConfigEnvelope;
  seed: number;
}>;

type SwooperMapArtifactFileKind =
  | "generated-map-entry"
  | "mod-config"
  | "mod-info"
  | "mod-data"
  | "mod-text"
  | "recipe-schema"
  | "studio-catalog-module"
  | "studio-catalog-types";

type SwooperCatalogArtifactMarkerMetadata = Readonly<{
  configId: string;
  configHash: string;
  envelopeHash: string;
  launchEnvelopeDigest?: never;
  requestId?: never;
}>;

type SwooperRunArtifactMarkerMetadata = Readonly<{
  configId: string;
  configHash: string;
  envelopeHash?: never;
  launchEnvelopeDigest: string;
  requestId: string;
}>;

type SwooperMapArtifactMarkerMetadata =
  | SwooperCatalogArtifactMarkerMetadata
  | SwooperRunArtifactMarkerMetadata;

type SwooperMapArtifactNonGeneratedFileKind = Exclude<
  SwooperMapArtifactFileKind,
  "generated-map-entry"
>;

type SwooperMapArtifactPlannedFile =
  | Readonly<
      GeneratedFilePlanFile & {
        relativePath: string;
        kind: "generated-map-entry";
        markerMetadata: SwooperMapArtifactMarkerMetadata;
      }
    >
  | Readonly<
      GeneratedFilePlanFile & {
        relativePath: string;
        kind: SwooperMapArtifactNonGeneratedFileKind;
      }
    >;

type SwooperMapArtifactExclusiveSet = Readonly<
  GeneratedFilePlanExclusiveSet & {
    id: "generated-map-entrypoints";
    relativeDir: string;
    fileExtension: ".ts";
    artifactKind: "generated-map-entry";
  }
>;

type SwooperMapArtifactConfigProjection =
  | Readonly<{
      sourceKind: "catalog";
      sourcePath: string;
      canonicalConfig: StandardMapConfigEnvelope;
    }>
  | Readonly<{
      sourceKind: "generated-run";
      canonicalConfig: StandardMapConfigEnvelope;
    }>;

/**
 * Pure artifact intent for Swooper map generation. The renderer owns relative
 * paths, content, and marker metadata; `@civ7/plugin-files` owns generic
 * output-root admission, currentness inspection, cleanup, and writes.
 */
export type SwooperMapArtifactFilePlan = Readonly<{
  metadata: Readonly<{
    configProjections: readonly SwooperMapArtifactConfigProjection[];
  }>;
  exclusiveSets: readonly SwooperMapArtifactExclusiveSet[];
  files: readonly SwooperMapArtifactPlannedFile[];
}>;

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function configHashFor(config: StandardMapConfigEnvelope): string {
  return canonicalMapConfigContentDigest(config);
}

function envelopeHashFor(config: StandardMapConfigEnvelope): string {
  return canonicalMapConfigDigest(config);
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
  config: ValidatedMapConfig
): Pick<
  Extract<SwooperMapArtifactPlannedFile, { kind: "generated-map-entry" }>,
  "content" | "markerMetadata"
> {
  const canonicalConfig = config.canonicalConfig;
  const configHash = configHashFor(canonicalConfig);
  const envelopeHash = envelopeHashFor(canonicalConfig);
  return {
    markerMetadata: {
      configId: canonicalConfig.id,
      configHash,
      envelopeHash,
    },
    content: `/**
 * Generated from ../configs/${config.fileName}.
 * Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:maps\`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "../configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";

// The file plan only receives an admitted immutable envelope; this assertion
// projects its serialized data without adding a second runtime admission path.
const mapConfig = ${JSON.stringify(canonicalConfig, null, 2)} as unknown as StandardMapConfigEnvelope;

export default createMap({
  ...mapConfig,
  recipe: standardRecipe,
  sourceConfigId: ${JSON.stringify(canonicalConfig.id)},
  configHash: ${JSON.stringify(configHash)},
  envelopeHash: ${JSON.stringify(envelopeHash)},
  config: mapConfig.config,
});
`,
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
  return {
    markerMetadata: {
      configId: config.id,
      configHash,
      launchEnvelopeDigest: input.correlation.launchEnvelopeDigest,
      requestId: input.correlation.requestId,
    },
    content: `/**
 * Generated from a Studio Run in Game generation manifest.
 * Do not edit by hand; re-run the manifest generator.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "mod-swooper-maps/maps/configs/canonical";
import standardRecipe from "mod-swooper-maps/recipes/standard";

const runCorrelation = ${JSON.stringify(input.correlation, null, 2)} as const;
// The manifest generator admitted this envelope before building the file plan.
const mapConfig = ${JSON.stringify(config, null, 2)} as unknown as StandardMapConfigEnvelope;

export default createMap({
  ...mapConfig,
  recipe: standardRecipe,
  sourceConfigId: mapConfig.id,
  runCorrelation,
  seed: ${JSON.stringify(input.seed)},
  config: mapConfig.config,
});
`,
  };
}

function renderConfigXml(
  configs: readonly StandardMapConfigEnvelope[],
  options: Readonly<{ moduleId?: string; outputFile?: string; mapRowId?: string }> = {}
): string {
  const moduleId = options.moduleId ?? "swooper-maps";
  const rows = configs
    .map(
      (config) => `\t\t<Row
\t\t\tFile="{${moduleId}}/${options.outputFile ?? `maps/${config.id}.js`}"
\t\t\tName="${mapLocalizationTag(options.mapRowId ?? config.id, "name")}"
\t\t\tDescription="${mapLocalizationTag(options.mapRowId ?? config.id, "description")}"
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
  configs: readonly StandardMapConfigEnvelope[],
  mode: SwooperModRenderMode = { kind: "catalog" }
): string {
  const rows = configs
    .flatMap((config) => {
      const mapId = mode.kind === "studio-run" ? mode.mapRowId : config.id;
      const nameTag = mapLocalizationTag(mapId, "name");
      const descriptionTag = mapLocalizationTag(mapId, "description");
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
  configs: readonly StandardMapConfigEnvelope[],
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
    .map((config) => `\t\t\t\t\t<Item>${importPath ?? `maps/${config.id}.js`}</Item>`)
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
    sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
    canonicalConfig: config.canonicalConfig,
  }));
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

export const standardMapConfigs = ${JSON.stringify(values, null, 2)};
`;
}

function renderMapConfigsDts(): string {
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

import type { MapConfigEnvelope } from "@civ7/studio-contract";

export type StudioMapConfig = Readonly<{
  sourcePath: string;
  canonicalConfig: MapConfigEnvelope;
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
  }>
): SwooperMapArtifactFilePlan {
  const generatedMapFiles = options.configs.map((config) => {
    const entry = renderMapEntryArtifact(config);
    return {
      relativePath: `src/maps/generated/${config.canonicalConfig.id}.ts`,
      kind: "generated-map-entry",
      content: entry.content,
      markerMetadata: entry.markerMetadata,
    } as const satisfies SwooperMapArtifactPlannedFile;
  });
  return {
    metadata: {
      configProjections: options.configs.map((config) => ({
        sourceKind: "catalog",
        sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
        canonicalConfig: config.canonicalConfig,
      })),
    },
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
        content: renderConfigXml(options.configs.map((config) => config.canonicalConfig)),
      },
      {
        relativePath: "mod/swooper-maps.modinfo",
        kind: "mod-info",
        content: renderModInfo(options.configs.map((config) => config.canonicalConfig)),
      },
      {
        relativePath: "mod/data/biome-hazards.xml",
        kind: "mod-data",
        content: renderBiomeHazardData(),
      },
      {
        relativePath: "mod/text/en_us/MapText.xml",
        kind: "mod-text",
        content: renderMapText(options.configs.map((config) => config.canonicalConfig)),
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
    metadata: {
      configProjections: options.configs.map((config) => ({
        sourceKind: "catalog",
        sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
        canonicalConfig: config.canonicalConfig,
      })),
    },
    exclusiveSets: [],
    files: [
      {
        relativePath: "dist/recipes/standard-map-config.schema.json",
        kind: "recipe-schema",
        content: stableJson(options.envelopeSchema),
      },
      {
        relativePath: "dist/recipes/standard-map-configs.js",
        kind: "studio-catalog-module",
        content: renderMapConfigsArtifact(options.configs),
      },
      {
        relativePath: "dist/recipes/standard-map-configs.d.ts",
        kind: "studio-catalog-types",
        content: renderMapConfigsDts(),
      },
    ],
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
  if (canonicalMapConfigDigest(input.config) !== input.correlation.canonicalConfigDigest) {
    throw new Error("Studio run canonical config digest does not match the launch config.");
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
    metadata: {
      configProjections: [{ sourceKind: "generated-run", canonicalConfig: config }],
    },
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
        content: renderConfigXml([config], {
          moduleId: STUDIO_RUN_MOD_ID,
          outputFile: STUDIO_RUN_MAP_SCRIPT_PATH,
          mapRowId: STUDIO_RUN_MAP_ROW_ID,
        }),
      },
      {
        relativePath: `${STUDIO_RUN_MOD_ID}.modinfo`,
        kind: "mod-info",
        content: renderModInfo([config], renderMode),
      },
      {
        relativePath: "text/en_us/MapText.xml",
        kind: "mod-text",
        content: renderMapText([config], renderMode),
      },
    ],
  };
}
