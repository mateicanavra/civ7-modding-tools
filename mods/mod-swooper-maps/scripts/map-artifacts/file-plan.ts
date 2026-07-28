import type { GeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import {
  type RunCorrelation,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
  STUDIO_RUN_MOD_ID,
} from "@civ7/studio-run-workspace";
import {
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
  type StandardMapConfigEnvelope,
  type ValidatedMapConfig,
} from "../../src/maps/configs/canonical.js";
import { SWOOPER_MAPS_MOD_DEFINITION } from "../../src/mod-definition.js";
import { CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS } from "../../src/recipes/standard/stages/ecology/projection/model/policy/plot-effect-projection.js";

/** Admitted config and correlation used to render one request-local Studio run mod. */
export type SwooperRunGeneratedModPlanInput = Readonly<{
  correlation: RunCorrelation;
  config: StandardMapConfigEnvelope;
  seed: number;
}>;

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function mapLocalizationTag(id: string, field: "name" | "description"): string {
  const suffix = field === "name" ? "NAME" : "DESCRIPTION";
  return `LOC_MAP_${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${suffix}`;
}

function moduleLocalizationTag(field: "name" | "description"): string {
  const suffix = field === "name" ? "NAME" : "DESCRIPTION";
  return `LOC_MODULE_${SWOOPER_MAPS_MOD_DEFINITION.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${suffix}`;
}

function renderMapEntryArtifact(config: ValidatedMapConfig): string {
  const canonicalConfig = config.canonicalConfig;
  const configHash = canonicalMapConfigContentDigest(canonicalConfig);
  const envelopeHash = canonicalMapConfigDigest(canonicalConfig);
  return `/**
 * Generated from ../configs/${config.fileName}.
 * Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:maps\`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "../configs/canonical.js";
import standardRecipe, {
  projectStandardInitialSetup,
  STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
} from "../../recipes/standard/recipe.js";

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
  initialSetup: {
    requestedMapOptions: STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
    requestedGameOptions: STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
    requestedPlayerOptions: STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
    project: projectStandardInitialSetup,
  },
});
`;
}

/**
 * Renders the virtual TypeScript entrypoint compiled into one request-local Studio run mod.
 * The generator bundles this source in memory; it is not part of the generated mod tree.
 */
export function renderSwooperRunMapSource(input: SwooperRunGeneratedModPlanInput): string {
  const config = input.config;
  return `/**
 * Generated from a Studio Run in Game generation manifest.
 * Do not edit by hand; re-run the manifest generator.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "mod-swooper-maps/maps/configs/canonical";
import standardRecipe, {
  projectStandardInitialSetup,
  STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
} from "mod-swooper-maps/recipes/standard";

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
  initialSetup: {
    requestedMapOptions: STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
    requestedGameOptions: STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
    requestedPlayerOptions: STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
    project: projectStandardInitialSetup,
  },
});
`;
}

function renderConfigXml(
  configs: readonly StandardMapConfigEnvelope[],
  options: Readonly<{ moduleId?: string; outputFile?: string; mapRowId?: string }> = {}
): string {
  const moduleId = options.moduleId ?? SWOOPER_MAPS_MOD_DEFINITION.id;
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
      : CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS.map(
          ({ customHazard }) => `\t\t<Row Tag="${xmlEscape(customHazard.localizationTag)}">
\t\t\t<Text>${xmlEscape(customHazard.localizationText)}</Text>
\t\t</Row>`
        ).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<EnglishText>
${rows}${biomeHazardRows ? `\n${biomeHazardRows}` : ""}
\t</EnglishText>
</Database>
`;
}

function renderModuleText(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
	<EnglishText>
		<Row Tag="${moduleLocalizationTag("name")}">
			<Text>${xmlEscape(SWOOPER_MAPS_MOD_DEFINITION.name)}</Text>
		</Row>
		<Row Tag="${moduleLocalizationTag("description")}">
			<Text>${xmlEscape(SWOOPER_MAPS_MOD_DEFINITION.description)}</Text>
		</Row>
	</EnglishText>
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
  const typeRows = CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS.map(
    ({ engineKey }) => `    <Row Type="${xmlEscape(engineKey)}" Kind="KIND_PLOTEFFECT"/>`
  ).join("\n");
  const plotEffectRows = CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS.map(
    ({ engineKey, customHazard }) =>
      `    <Row PlotEffectType="${xmlEscape(engineKey)}" Name="${xmlEscape(customHazard.localizationTag)}" TimeDecay="${customHazard.timeDecay}" UnoccupiedDecay="${customHazard.unoccupiedDecay}" TimeValue="${customHazard.timeValue}" Damage="${customHazard.damage}" Defense="${customHazard.defense}" AllowOnWater="${customHazard.allowOnWater}"/>`
  ).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<Database>
  <Types>
${typeRows}
  </Types>
  <PlotEffects>
${plotEffectRows}
  </PlotEffects>
</Database>
`;
}

function renderModInfo(
  configs: readonly StandardMapConfigEnvelope[],
  mode: SwooperModRenderMode = { kind: "catalog" }
): string {
  const moduleId = mode.moduleId ?? SWOOPER_MAPS_MOD_DEFINITION.id;
  const criteriaId = mode.kind === "studio-run" ? `always-${moduleId}` : "always";
  const gameActionGroupId = `game-${moduleId}`;
  const shellActionGroupId = `shell-${moduleId}`;
  const dependencyModules =
    mode.kind === "studio-run" ? mode.dependencyModules : SWOOPER_MAPS_MOD_DEFINITION.dependencies;
  const dependencies = dependencyModules
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
<Mod id="${xmlEscape(moduleId)}" version="${SWOOPER_MAPS_MOD_DEFINITION.version}" xmlns="ModInfo">
\t<Properties>
\t\t<Name>${moduleLocalizationTag("name")}</Name>
\t\t<Description>${moduleLocalizationTag("description")}</Description>
\t\t<Authors>${xmlEscape(SWOOPER_MAPS_MOD_DEFINITION.authors.join(", "))}</Authors>
\t\t<Package>${SWOOPER_MAPS_MOD_DEFINITION.packageKind}</Package>
\t</Properties>
\t<Dependencies>
${dependencies}
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
  const values = configs.map((config) => config.canonicalConfig);
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

export const standardMapConfigs = ${JSON.stringify(values, null, 2)};
`;
}

function renderMapConfigsDts(): string {
  return `// This file is generated by scripts/generate-studio-map-catalog.ts
// Do not edit by hand; re-run \`nx run mod-swooper-maps:gen:studio-map-catalog\`.

import type { MapConfigEnvelope } from "@civ7/studio-contract";

/** Canonical envelopes in durable shipped catalog order; transient Studio deploy configs are absent. */
export const standardMapConfigs: ReadonlyArray<MapConfigEnvelope>;
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
): GeneratedFilePlan {
  const generatedMapFiles = options.configs.map((config) => ({
    relativePath: `src/maps/generated/${config.canonicalConfig.id}.ts`,
    content: renderMapEntryArtifact(config),
  }));
  return {
    exclusiveSets: [
      {
        relativeDir: "src/maps/generated",
        fileExtension: ".ts",
      },
    ],
    files: [
      ...generatedMapFiles,
      {
        relativePath: "mod/config/config.xml",
        content: renderConfigXml(options.configs.map((config) => config.canonicalConfig)),
      },
      {
        relativePath: `mod/${SWOOPER_MAPS_MOD_DEFINITION.id}.modinfo`,
        content: renderModInfo(options.configs.map((config) => config.canonicalConfig)),
      },
      {
        relativePath: "mod/data/biome-hazards.xml",
        content: renderBiomeHazardData(),
      },
      {
        relativePath: "mod/text/en_us/MapText.xml",
        content: renderMapText(options.configs.map((config) => config.canonicalConfig)),
      },
      {
        relativePath: "mod/text/en_us/ModuleText.xml",
        content: renderModuleText(),
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
): GeneratedFilePlan {
  return {
    exclusiveSets: [],
    files: [
      {
        relativePath: "dist/recipes/standard-map-config.schema.json",
        content: stableJson(options.envelopeSchema),
      },
      {
        relativePath: "dist/recipes/standard-map-configs.js",
        content: renderMapConfigsArtifact(options.configs),
      },
      {
        relativePath: "dist/recipes/standard-map-configs.d.ts",
        content: renderMapConfigsDts(),
      },
    ],
  };
}

/**
 * Builds the request-local generated mod tree from a Studio generation
 * manifest. The run mod owns only the generated map row, map script, and
 * request correlation; shared gameplay data stays owned by the durable
 * Swooper mod that this run depends on. The caller supplies the already-bundled
 * map script so compiler input never enters the product files; the replacement
 * set removes any interrupted predecessor source from a retried request root.
 */
export function buildSwooperRunGeneratedModFilePlan(
  input: SwooperRunGeneratedModPlanInput,
  bundledMapScript: string
): GeneratedFilePlan {
  if (canonicalMapConfigDigest(input.config) !== input.correlation.canonicalConfigDigest) {
    throw new Error("Studio run canonical config digest does not match the launch config.");
  }
  const config = input.config;
  const renderMode = {
    kind: "studio-run",
    dependencyModules: [
      {
        id: SWOOPER_MAPS_MOD_DEFINITION.id,
        title: moduleLocalizationTag("name"),
      },
    ],
    mapRowId: STUDIO_RUN_MAP_ROW_ID,
    moduleId: STUDIO_RUN_MOD_ID,
  } satisfies SwooperModRenderMode;
  return {
    exclusiveSets: [
      {
        relativeDir: ".source/maps",
        fileExtension: ".ts",
      },
    ],
    files: [
      {
        relativePath: STUDIO_RUN_MAP_SCRIPT_PATH,
        content: bundledMapScript,
      },
      {
        relativePath: "config/config.xml",
        content: renderConfigXml([config], {
          moduleId: STUDIO_RUN_MOD_ID,
          outputFile: STUDIO_RUN_MAP_SCRIPT_PATH,
          mapRowId: STUDIO_RUN_MAP_ROW_ID,
        }),
      },
      {
        relativePath: `${STUDIO_RUN_MOD_ID}.modinfo`,
        content: renderModInfo([config], renderMode),
      },
      {
        relativePath: "text/en_us/MapText.xml",
        content: renderMapText([config], renderMode),
      },
    ],
  };
}
