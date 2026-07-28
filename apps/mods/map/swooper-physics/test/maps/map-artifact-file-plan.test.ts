import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { STUDIO_RUN_MAP_SCRIPT_PATH } from "@civ7/studio-run-workspace";
import { standardMapConfigs } from "@swooper/swooper-physics/catalog";
import { SWOOPER_MAPS_MOD_DEFINITION } from "@swooper/swooper-physics/mod-definition";
import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "@swooper/swooper-physics/standard/artifacts";
import { CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS } from "@swooper/swooper-physics/standard/civ7-plot-effects";
import {
  type CanonicalMapConfigEnvelope,
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "@swooper/swooper-physics/standard/map-config";
import {
  loadSwooperMapConfigRegistry,
  loadSwooperStudioDeployConfigRegistry,
} from "../../scripts/generate-map-artifacts";
import {
  buildSwooperCatalogModFilePlan,
  buildSwooperRunGeneratedModFilePlan,
  renderSwooperRunMapSource,
} from "../../scripts/map-artifacts/file-plan";
import { TEST_MAP_SEED } from "../setup.js";

const recipeSchema = STANDARD_RECIPE_CONFIG_SCHEMA;
const fixtureRecipeConfig = STANDARD_RECIPE_CONFIG;
const DEFINITION_CONFIG_DIRECTORY = "plugins/mod/map/swooper-physics/src/maps/configs";

async function buildCurrentPlans() {
  const configs = await loadSwooperMapConfigRegistry();
  return {
    configs,
    modPlan: buildSwooperCatalogModFilePlan({ configs }),
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

async function writeDefinitionConfigFixture(args: {
  root: string;
  fileName: string;
  config: unknown;
}): Promise<void> {
  const configDir = resolve(args.root, DEFINITION_CONFIG_DIRECTORY);
  await mkdir(configDir, { recursive: true });
  await writeFile(resolve(configDir, args.fileName), JSON.stringify(args.config, null, 2));
}

function savedConfigFixture(id: string): unknown {
  const source = standardMapConfigs.find((config) => config.id === "swooper-earthlike");
  if (!source) throw new Error("Expected the shipped Swooper Earthlike catalog config");
  return {
    ...source,
    id,
    name: "Saved Config",
    description: "Saved operation config",
    sortIndex: 9021,
  };
}

describe("Swooper map artifact file plan", () => {
  it("renders every deployable catalog artifact as pure file-plan data", async () => {
    const { configs, modPlan } = await buildCurrentPlans();
    const files = modPlan.files;
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
    expect(files).toHaveLength(configs.length + 5);
    expect(files.every((file) => file.content.length > 0)).toBe(true);
  });

  it("feeds every schema-materialized catalog envelope directly into its generated artifact", async () => {
    const { configs, modPlan } = await buildCurrentPlans();

    for (const config of configs) {
      const generatedMap = plannedFile(
        modPlan,
        `src/maps/generated/${config.canonicalConfig.id}.ts`
      );
      expect(textContent(generatedMap), config.canonicalConfig.id).toContain(
        JSON.stringify(config.canonicalConfig, null, 2)
      );
    }
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
    const plan = buildSwooperCatalogModFilePlan({ configs: [fixtureConfig] });

    expect(plan.files.map((file) => file.relativePath)).toEqual([
      "src/maps/generated/fixture-map.ts",
      "mod/config/config.xml",
      `mod/${SWOOPER_MAPS_MOD_DEFINITION.id}.modinfo`,
      "mod/data/biome-hazards.xml",
      "mod/text/en_us/MapText.xml",
      "mod/text/en_us/ModuleText.xml",
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
  });

  it("projects every custom hazard definition into matching localization and gameplay rows", () => {
    const plan = buildSwooperCatalogModFilePlan({ configs: [buildFixtureConfig()] });
    const mapText = textContent(plannedFile(plan, "mod/text/en_us/MapText.xml"));
    const hazardData = textContent(plannedFile(plan, "mod/data/biome-hazards.xml"));

    for (const { customHazard } of CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS) {
      expect(mapText).toContain(`\t\t<Row Tag="${customHazard.localizationTag}">
\t\t\t<Text>${customHazard.localizationText}</Text>
\t\t</Row>`);
    }
    expect(hazardData).toBe(`<?xml version="1.0" encoding="utf-8"?>
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
`);
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
    const mapText = textContent(plannedFile(plan, "text/en_us/MapText.xml"));
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
    for (const { customHazard } of CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS) {
      expect(mapText).not.toContain(customHazard.localizationTag);
    }
  });

  it("keeps a deploy-only selected config outside durable catalog membership", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-deploy-config-repo-"));
    try {
      await writeDefinitionConfigFixture({
        root: fakeRepoRoot,
        fileName: "saved-config.config.json",
        config: savedConfigFixture("saved-config"),
      });

      const deployConfigs = await loadSwooperStudioDeployConfigRegistry({
        catalogConfigIds: [],
        deployConfigId: "saved-config",
        repoRoot: fakeRepoRoot,
      });

      expect(deployConfigs.map((config) => config.canonicalConfig.id)).toEqual(["saved-config"]);
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
    }
  });

  it("rejects a deploy config whose canonical id does not match its filename", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-deploy-id-mismatch-repo-"));
    try {
      await writeDefinitionConfigFixture({
        root: fakeRepoRoot,
        fileName: "other-config.config.json",
        config: savedConfigFixture("saved-config"),
      });

      await expect(
        loadSwooperStudioDeployConfigRegistry({
          catalogConfigIds: [],
          deployConfigId: "other-config",
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow(
        'Canonical map config id must match file stem "other-config", got "saved-config"'
      );
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
    }
  });

  it("rejects every explicitly malformed deploy config id", async () => {
    for (const deployConfigId of ["", "not a config id"]) {
      await expect(
        loadSwooperStudioDeployConfigRegistry({
          catalogConfigIds: [],
          deployConfigId,
        })
      ).rejects.toThrow("Invalid Swooper map catalog membership");
    }
  });
});
