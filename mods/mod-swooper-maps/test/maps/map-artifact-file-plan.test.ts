import { describe, expect, it } from "bun:test";
import { STUDIO_RUN_MAP_SCRIPT_PATH } from "@civ7/studio-run-workspace";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildSwooperCatalogMetadataFilePlan,
  buildSwooperCatalogModFilePlan,
  buildSwooperRunGeneratedModFilePlan,
  renderSwooperRunMapSource,
} from "../../scripts/map-artifacts/file-plan";
import {
  buildCanonicalMapConfigSchema,
  type CanonicalMapConfigEnvelope,
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import { SWOOPER_MAPS_MOD_DEFINITION } from "../../src/mod-definition";
import {
  buildStandardRecipeDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "../../src/recipes/standard/artifacts";
import { TEST_MAP_SEED } from "../setup.js";

const recipeSchema = STANDARD_RECIPE_CONFIG_SCHEMA;
const fixtureRecipeConfig = buildStandardRecipeDefaultConfig();
const fixtureEnvelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);

async function buildCurrentPlans() {
  const configs = await loadSwooperMapConfigRegistry();
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  return {
    configs,
    modPlan: buildSwooperCatalogModFilePlan({ configs }),
    metadataPlan: buildSwooperCatalogMetadataFilePlan({ configs, envelopeSchema }),
  };
}

function textContent(file: { content: string | Uint8Array }) {
  if (typeof file.content !== "string") {
    throw new Error("Expected text artifact content");
  }
  return file.content;
}

function plannedFile<
  const TFiles extends readonly Readonly<{
    relativePath: string;
    content: string | Uint8Array;
  }>[],
>(plan: Readonly<{ files: TFiles }>, relativePath: string): TFiles[number] {
  const file = plan.files.find((entry) => entry.relativePath === relativePath);
  if (!file) throw new Error(`Missing planned file ${relativePath}`);
  return file;
}

function buildFixtureConfig(): ValidatedMapConfig {
  return validateCanonicalMapConfig({
    fileName: "fixture-map.config.json",
    raw: {
      id: "fixture-map",
      name: "Fixture & Map <One>",
      description: "Wet & dry edge",
      recipe: "standard",
      sortIndex: 7,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -45 },
      config: fixtureRecipeConfig,
    },
    recipeSchema,
  });
}

describe("Swooper map artifact file plan", () => {
  it("renders every catalog artifact as pure file-plan data", async () => {
    const { configs, modPlan, metadataPlan } = await buildCurrentPlans();
    const files = [...modPlan.files, ...metadataPlan.files];
    const paths = new Set(files.map((file) => file.relativePath));

    expect(modPlan.exclusiveSets).toEqual([
      {
        relativeDir: "src/maps/generated",
        fileExtension: ".ts",
      },
    ]);
    for (const config of configs) {
      expect(paths.has(`src/maps/generated/${config.canonicalConfig.id}.ts`)).toBe(true);
    }
    expect(paths.has("mod/config/config.xml")).toBe(true);
    expect(paths.has(`mod/${SWOOPER_MAPS_MOD_DEFINITION.id}.modinfo`)).toBe(true);
    expect(paths.has("mod/data/biome-hazards.xml")).toBe(true);
    expect(paths.has("mod/text/en_us/MapText.xml")).toBe(true);
    expect(paths.has("mod/text/en_us/ModuleText.xml")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-config.schema.json")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-configs.js")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-configs.d.ts")).toBe(true);
    expect(files).toHaveLength(configs.length + 8);
    expect(files.every((file) => file.content.length > 0)).toBe(true);
  });

  it("feeds every schema-materialized catalog envelope into its generated artifact intact", async () => {
    const { configs, modPlan, metadataPlan } = await buildCurrentPlans();

    for (const config of configs) {
      const generatedMap = plannedFile(
        modPlan,
        `src/maps/generated/${config.canonicalConfig.id}.ts`
      );
      expect(textContent(generatedMap), config.canonicalConfig.id).toContain(
        JSON.stringify(config.canonicalConfig, null, 2)
      );
    }
    const expectedCatalogEntries = configs.map((config) => ({
      sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
      canonicalConfig: config.canonicalConfig,
    }));
    expect(
      textContent(plannedFile(metadataPlan, "dist/recipes/standard-map-configs.js"))
    ).toContain(JSON.stringify(expectedCatalogEntries, null, 2));
  });

  it("hashes every portable canonical-envelope field", async () => {
    const canonicalConfig = buildFixtureConfig().canonicalConfig;
    const baselineDigest = canonicalMapConfigDigest(canonicalConfig);
    const configVariant = (await loadSwooperMapConfigRegistry()).find(
      (candidate) =>
        canonicalMapConfigContentDigest(candidate.canonicalConfig) !==
        canonicalMapConfigContentDigest(canonicalConfig)
    );
    if (configVariant === undefined) {
      throw new Error("Expected at least one catalog config with distinct recipe values");
    }
    const variants: readonly CanonicalMapConfigEnvelope[] = [
      { ...canonicalConfig, id: "fixture-map-renamed" },
      { ...canonicalConfig, name: "Different fixture name" },
      { ...canonicalConfig, description: "Different fixture description" },
      { ...canonicalConfig, recipe: "other-recipe" },
      { ...canonicalConfig, sortIndex: canonicalConfig.sortIndex + 1 },
      {
        ...canonicalConfig,
        latitudeBounds: {
          topLatitude: 55,
          bottomLatitude: canonicalConfig.latitudeBounds.bottomLatitude,
        },
      },
      { ...canonicalConfig, config: configVariant.canonicalConfig.config },
    ];

    for (const variant of variants) {
      expect(canonicalMapConfigDigest(variant)).not.toBe(baselineDigest);
    }
  });

  it("renders exact file-plan content for a schema-valid fixture config", () => {
    const fixtureConfig = buildFixtureConfig();
    const modPlan = buildSwooperCatalogModFilePlan({ configs: [fixtureConfig] });
    const metadataPlan = buildSwooperCatalogMetadataFilePlan({
      configs: [fixtureConfig],
      envelopeSchema: fixtureEnvelopeSchema,
    });
    const plan = {
      files: [...modPlan.files, ...metadataPlan.files],
    };

    expect(plan.files.map((file) => file.relativePath)).toEqual([
      "src/maps/generated/fixture-map.ts",
      "mod/config/config.xml",
      `mod/${SWOOPER_MAPS_MOD_DEFINITION.id}.modinfo`,
      "mod/data/biome-hazards.xml",
      "mod/text/en_us/MapText.xml",
      "mod/text/en_us/ModuleText.xml",
      "dist/recipes/standard-map-config.schema.json",
      "dist/recipes/standard-map-configs.js",
      "dist/recipes/standard-map-configs.d.ts",
    ]);

    const generatedMap = plannedFile(plan, "src/maps/generated/fixture-map.ts");
    const generatedMapText = textContent(generatedMap);
    expect(generatedMapText).toContain(
      `configHash: ${JSON.stringify(canonicalMapConfigContentDigest(fixtureConfig.canonicalConfig))}`
    );
    expect(generatedMapText).toContain(
      `envelopeHash: ${JSON.stringify(canonicalMapConfigDigest(fixtureConfig.canonicalConfig))}`
    );
    expect(generatedMapText).toContain(JSON.stringify(fixtureConfig.canonicalConfig, null, 2));
    expect(generatedMapText).not.toContain("admitStandardMapConfig");
    expect(generatedMapText).toContain("initialSetup: {");
    expect(generatedMapText).toContain(
      "requestedMapOptions: STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS"
    );
    expect(generatedMapText).toContain("project: projectStandardInitialSetup");

    expect(
      textContent(plannedFile(plan, "mod/config/config.xml"))
    ).toBe(`<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<Maps>
\t\t<Row
\t\t\tFile="{${SWOOPER_MAPS_MOD_DEFINITION.id}}/maps/fixture-map.js"
\t\t\tName="LOC_MAP_FIXTURE_MAP_NAME"
\t\t\tDescription="LOC_MAP_FIXTURE_MAP_DESCRIPTION"
\t\t\tSortIndex="7"
\t\t/>
\t</Maps>
</Database>
`);
    const mapText = textContent(plannedFile(plan, "mod/text/en_us/MapText.xml"));
    expect(mapText).toContain("<Text>Fixture &amp; Map &lt;One&gt;</Text>");
    expect(mapText).toContain("<Text>Wet &amp; dry edge</Text>");
    expect(mapText).toContain("LOC_PLOTEFFECT_DESERT_HEAT_NAME");
    expect(mapText).toContain("LOC_PLOTEFFECT_FROSTBITE_NAME");
    expect(mapText).toContain("LOC_PLOTEFFECT_JUNGLE_FEVER_NAME");
    const modInfo = textContent(plannedFile(plan, `mod/${SWOOPER_MAPS_MOD_DEFINITION.id}.modinfo`));
    const moduleTag = SWOOPER_MAPS_MOD_DEFINITION.id.toUpperCase().replaceAll("-", "_");
    expect(modInfo).toContain(
      `<Mod id="${SWOOPER_MAPS_MOD_DEFINITION.id}" version="${SWOOPER_MAPS_MOD_DEFINITION.version}" xmlns="ModInfo">`
    );
    expect(modInfo).toContain(`<Name>LOC_MODULE_${moduleTag}_NAME</Name>`);
    expect(modInfo).toContain(`<Description>LOC_MODULE_${moduleTag}_DESCRIPTION</Description>`);
    expect(modInfo).toContain(
      `<Authors>${SWOOPER_MAPS_MOD_DEFINITION.authors.join(", ")}</Authors>`
    );
    expect(modInfo).toContain(`<Package>${SWOOPER_MAPS_MOD_DEFINITION.packageKind}</Package>`);
    for (const dependency of SWOOPER_MAPS_MOD_DEFINITION.dependencies) {
      expect(modInfo).toContain(`<Mod id="${dependency.id}" title="${dependency.title}"/>`);
    }
    expect(modInfo).toContain("<File>text/en_us/ModuleText.xml</File>");
    expect(modInfo).toContain("\t\t\t\t\t<Item>maps/fixture-map.js</Item>");
    expect(textContent(plannedFile(plan, "mod/data/biome-hazards.xml"))).toContain(
      '<Row PlotEffectType="PLOTEFFECT_DESERT_HEAT" Name="LOC_PLOTEFFECT_DESERT_HEAT_NAME"'
    );
    const moduleText = textContent(plannedFile(plan, "mod/text/en_us/ModuleText.xml"));
    expect(moduleText).toContain(
      `<Text>${SWOOPER_MAPS_MOD_DEFINITION.name.replaceAll("'", "&apos;")}</Text>`
    );
    expect(moduleText).toContain(`<Text>${SWOOPER_MAPS_MOD_DEFINITION.description}</Text>`);
    expect(
      JSON.parse(textContent(plannedFile(plan, "dist/recipes/standard-map-config.schema.json")))
    ).toEqual(JSON.parse(JSON.stringify(fixtureEnvelopeSchema)));

    const catalogModule = textContent(plannedFile(plan, "dist/recipes/standard-map-configs.js"));
    expect(catalogModule).toStartWith(
      "// This file is generated by scripts/generate-studio-map-catalog.ts"
    );
    expect(catalogModule).toContain(
      JSON.stringify(
        [
          {
            sourcePath: "mods/mod-swooper-maps/src/maps/configs/fixture-map.config.json",
            canonicalConfig: fixtureConfig.canonicalConfig,
          },
        ],
        null,
        2
      )
    );
  });

  it("renders Studio catalog metadata without runtime mod artifacts", () => {
    const fixtureConfig = buildFixtureConfig();
    const plan = buildSwooperCatalogMetadataFilePlan({
      configs: [fixtureConfig],
      envelopeSchema: fixtureEnvelopeSchema,
    });

    expect(plan.exclusiveSets).toEqual([]);
    expect(plan.files.map((file) => file.relativePath)).toEqual([
      "dist/recipes/standard-map-config.schema.json",
      "dist/recipes/standard-map-configs.js",
      "dist/recipes/standard-map-configs.d.ts",
    ]);
    expect(plan.files.map((file) => file.relativePath).join("\n")).not.toContain("mod/");
    expect(plan.files.map((file) => file.relativePath).join("\n")).not.toContain(
      "src/maps/generated"
    );
  });

  it("embeds catalog-only config identity in every generated map entry", async () => {
    const { modPlan } = await buildCurrentPlans();
    const generatedMapFiles = modPlan.files.filter(
      (file) =>
        file.relativePath.startsWith("src/maps/generated/") && file.relativePath.endsWith(".ts")
    );

    for (const file of generatedMapFiles) {
      expect(typeof file.content).toBe("string");
      const text = typeof file.content === "string" ? file.content : "";
      expect(text).toContain("configHash:");
      expect(text).toContain("envelopeHash:");
      expect(text).not.toContain("runCorrelation");
      expect(text).not.toContain("requestId:");
      expect(text).not.toContain("launchEnvelopeDigest");
      expect(text).not.toContain("generationManifestDigest");
    }
  });

  it("keeps transient Studio identity out of every shipped catalog artifact", async () => {
    const { modPlan } = await buildCurrentPlans();

    for (const file of modPlan.files) {
      const content = textContent(file);
      expect(content, file.relativePath).not.toContain("studio-current");
      expect(content, file.relativePath).not.toContain("STUDIO_CURRENT");
      expect(content, file.relativePath).not.toContain("launchEnvelopeDigest");
      expect(content, file.relativePath).not.toContain("generationManifestDigest");
    }
  });

  it("renders generated run mod action groups under the run mod namespace", () => {
    const fixtureConfig = buildFixtureConfig();
    const correlation = {
      requestId: "studio-run-in-game-action-groups",
      runArtifactId: "run-action-groups",
      canonicalConfigDigest: canonicalMapConfigDigest(fixtureConfig.canonicalConfig),
      launchEnvelopeDigest: "launch-envelope-digest",
      generationManifestDigest: "generation-manifest-digest",
    } as const;
    const input = {
      config: fixtureConfig.canonicalConfig,
      seed: TEST_MAP_SEED,
      correlation,
    } as const;
    const bundledMapScript = "// bundled Studio run map\n";
    const plan = buildSwooperRunGeneratedModFilePlan(input, bundledMapScript);

    const modInfo = textContent(plannedFile(plan, "mod-swooper-studio-run.modinfo"));
    const configXml = textContent(plannedFile(plan, "config/config.xml"));
    const mapScript = textContent(plannedFile(plan, STUDIO_RUN_MAP_SCRIPT_PATH));
    const mapSource = renderSwooperRunMapSource(input);
    expect(plan.files.map((file) => file.relativePath).sort()).toEqual([
      "config/config.xml",
      STUDIO_RUN_MAP_SCRIPT_PATH,
      "mod-swooper-studio-run.modinfo",
      "text/en_us/MapText.xml",
    ]);
    expect(plan.exclusiveSets).toEqual([{ relativeDir: ".source/maps", fileExtension: ".ts" }]);
    expect(mapScript).toBe(bundledMapScript);
    expect(modInfo).toContain('<Criteria id="always-mod-swooper-studio-run">');
    expect(modInfo).toContain(
      '<ActionGroup id="game-mod-swooper-studio-run" scope="game" criteria="always-mod-swooper-studio-run">'
    );
    expect(modInfo).toContain(
      '<ActionGroup id="shell-mod-swooper-studio-run" scope="shell" criteria="always-mod-swooper-studio-run">'
    );
    expect(modInfo).not.toContain('id="game-swooper-maps"');
    expect(modInfo).not.toContain('id="shell-swooper-maps"');
    expect(modInfo).toContain(
      `<Mod id="${SWOOPER_MAPS_MOD_DEFINITION.id}" title="LOC_MODULE_SWOOPER_MAPS_NAME"/>`
    );
    expect(modInfo).not.toContain('id="base-standard"');
    expect(configXml).toContain('File="{mod-swooper-studio-run}/maps/studio-run.js"');
    expect(configXml).toContain('Name="LOC_MAP_MAP_STUDIO_RUN_NAME"');
    expect(mapSource).toContain(JSON.stringify(fixtureConfig.canonicalConfig, null, 2));
    expect(mapSource).not.toContain("admitStandardMapConfig");
    expect(mapSource).not.toContain("@civ7/studio-contract");
    expect(mapSource).toContain("initialSetup: {");
    expect(mapSource).toContain("requestedGameOptions: STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS");
    expect(mapSource).toContain(
      "requestedPlayerOptions: STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS"
    );
    expect(mapSource).toContain("project: projectStandardInitialSetup");
    expect(mapSource).toContain(JSON.stringify(correlation, null, 2));
  });
});
