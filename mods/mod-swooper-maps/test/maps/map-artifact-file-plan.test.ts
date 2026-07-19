import { describe, expect, it } from "bun:test";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildSwooperCatalogMetadataFilePlan,
  buildSwooperCatalogModFilePlan,
  buildSwooperRunGeneratedModFilePlan,
} from "../../scripts/map-artifacts/file-plan";
import {
  buildCanonicalMapConfigSchema,
  type CanonicalMapConfigEnvelope,
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
  type StandardMapConfigEnvelope,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import {
  buildStandardRecipeDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "../../src/recipes/standard/artifacts";

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

function artifactEnvelope(config: ValidatedMapConfig): StandardMapConfigEnvelope {
  return config.canonicalConfig;
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
        id: "generated-map-entrypoints",
        relativeDir: "src/maps/generated",
        fileExtension: ".ts",
        artifactKind: "generated-map-entry",
      },
    ]);
    for (const config of configs) {
      expect(paths.has(`src/maps/generated/${config.canonicalConfig.id}.ts`)).toBe(true);
    }
    expect(paths.has("mod/config/config.xml")).toBe(true);
    expect(paths.has("mod/swooper-maps.modinfo")).toBe(true);
    expect(paths.has("mod/data/biome-hazards.xml")).toBe(true);
    expect(paths.has("mod/text/en_us/MapText.xml")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-config.schema.json")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-configs.js")).toBe(true);
    expect(paths.has("dist/recipes/standard-map-configs.d.ts")).toBe(true);
    expect(files).toHaveLength(configs.length + 7);
    expect(files.every((file) => file.content.length > 0)).toBe(true);
  });

  it("feeds every schema-materialized catalog envelope into its generated artifact intact", async () => {
    const { configs, modPlan } = await buildCurrentPlans();

    for (const config of configs) {
      const generatedMap = plannedFile(
        modPlan,
        `src/maps/generated/${config.canonicalConfig.id}.ts`
      );
      expect(textContent(generatedMap), config.canonicalConfig.id).toContain(
        JSON.stringify(artifactEnvelope(config), null, 2)
      );
    }
    expect(modPlan.metadata.configProjections).toEqual(
      configs.map((config) => ({
        sourceKind: "catalog",
        sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
        canonicalConfig: config.canonicalConfig,
      }))
    );
  });

  it("hashes every portable canonical-envelope field", async () => {
    const canonicalConfig = artifactEnvelope(buildFixtureConfig());
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

    expect(plan.files.map((file) => [file.relativePath, file.kind])).toEqual([
      ["src/maps/generated/fixture-map.ts", "generated-map-entry"],
      ["mod/config/config.xml", "mod-config"],
      ["mod/swooper-maps.modinfo", "mod-info"],
      ["mod/data/biome-hazards.xml", "mod-data"],
      ["mod/text/en_us/MapText.xml", "mod-text"],
      ["dist/recipes/standard-map-config.schema.json", "recipe-schema"],
      ["dist/recipes/standard-map-configs.js", "studio-catalog-module"],
      ["dist/recipes/standard-map-configs.d.ts", "studio-catalog-types"],
    ]);

    const generatedMap = plannedFile(plan, "src/maps/generated/fixture-map.ts");
    if (!("markerMetadata" in generatedMap)) {
      throw new Error("Expected generated map fixture metadata");
    }
    const markerMetadata = generatedMap.markerMetadata;
    expect(markerMetadata?.configId).toBe("fixture-map");
    expect(markerMetadata?.configHash).toMatch(/^[a-f0-9]{64}$/);
    expect(markerMetadata?.envelopeHash).toMatch(/^[a-f0-9]{64}$/);
    const generatedMapText = textContent(generatedMap);
    expect(generatedMapText).toContain(JSON.stringify(artifactEnvelope(fixtureConfig), null, 2));
    expect(generatedMapText).not.toContain("admitStandardMapConfig");

    expect(
      textContent(plannedFile(plan, "mod/config/config.xml"))
    ).toBe(`<?xml version="1.0" encoding="utf-8"?>
<Database>
\t<Maps>
\t\t<Row
\t\t\tFile="{swooper-maps}/maps/fixture-map.js"
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
    expect(textContent(plannedFile(plan, "mod/swooper-maps.modinfo"))).toContain(
      "\t\t\t\t\t<Item>maps/fixture-map.js</Item>"
    );
    expect(textContent(plannedFile(plan, "mod/data/biome-hazards.xml"))).toContain(
      '<Row PlotEffectType="PLOTEFFECT_DESERT_HEAT" Name="LOC_PLOTEFFECT_DESERT_HEAT_NAME"'
    );
    expect(
      JSON.parse(textContent(plannedFile(plan, "dist/recipes/standard-map-config.schema.json")))
    ).toEqual(JSON.parse(JSON.stringify(fixtureEnvelopeSchema)));

    const catalogModule = textContent(plannedFile(plan, "dist/recipes/standard-map-configs.js"));
    expect(catalogModule).toStartWith(
      "// This file is generated by scripts/generate-studio-map-catalog.ts"
    );
    expect(metadataPlan.metadata.configProjections).toEqual([
      {
        sourceKind: "catalog",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/fixture-map.config.json",
        canonicalConfig: artifactEnvelope(fixtureConfig),
      },
    ]);
  });

  it("renders Studio catalog metadata without runtime mod artifacts", () => {
    const fixtureConfig = buildFixtureConfig();
    const plan = buildSwooperCatalogMetadataFilePlan({
      configs: [fixtureConfig],
      envelopeSchema: fixtureEnvelopeSchema,
    });

    expect(plan.exclusiveSets).toEqual([]);
    expect(plan.files.map((file) => [file.relativePath, file.kind])).toEqual([
      ["dist/recipes/standard-map-config.schema.json", "recipe-schema"],
      ["dist/recipes/standard-map-configs.js", "studio-catalog-module"],
      ["dist/recipes/standard-map-configs.d.ts", "studio-catalog-types"],
    ]);
    expect(plan.files.map((file) => file.relativePath).join("\n")).not.toContain("mod/");
    expect(plan.files.map((file) => file.relativePath).join("\n")).not.toContain(
      "src/maps/generated"
    );
  });

  it("emits catalog-only config identity for every catalog map entry", async () => {
    const { modPlan } = await buildCurrentPlans();
    const generatedMapFiles = modPlan.files.filter((file) => file.kind === "generated-map-entry");

    for (const file of generatedMapFiles) {
      if (!("markerMetadata" in file)) {
        throw new Error("Expected generated-map-entry metadata");
      }
      expect(file.markerMetadata).toHaveProperty("configHash");
      expect(file.markerMetadata).toHaveProperty("envelopeHash");
      expect(file.markerMetadata).not.toHaveProperty("requestId");
      expect(file.markerMetadata).not.toHaveProperty("launchEnvelopeDigest");
      expect(typeof file.content).toBe("string");
      const text = typeof file.content === "string" ? file.content : "";
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
    const plan = buildSwooperRunGeneratedModFilePlan({
      config: fixtureConfig.canonicalConfig,
      seed: 123,
      correlation: {
        requestId: "studio-run-in-game-action-groups",
        runArtifactId: "run-action-groups",
        canonicalConfigDigest: canonicalMapConfigDigest(fixtureConfig.canonicalConfig),
        launchEnvelopeDigest: "launch-envelope-digest",
        generationManifestDigest: "generation-manifest-digest",
      },
    });

    const modInfo = textContent(plannedFile(plan, "mod-swooper-studio-run.modinfo"));
    const configXml = textContent(plannedFile(plan, "config/config.xml"));
    const mapSource = textContent(plannedFile(plan, ".source/maps/run-action-groups.ts"));
    expect(modInfo).toContain('<Criteria id="always-mod-swooper-studio-run">');
    expect(modInfo).toContain(
      '<ActionGroup id="game-mod-swooper-studio-run" scope="game" criteria="always-mod-swooper-studio-run">'
    );
    expect(modInfo).toContain(
      '<ActionGroup id="shell-mod-swooper-studio-run" scope="shell" criteria="always-mod-swooper-studio-run">'
    );
    expect(modInfo).not.toContain('id="game-swooper-maps"');
    expect(modInfo).not.toContain('id="shell-swooper-maps"');
    expect(configXml).toContain('File="{mod-swooper-studio-run}/maps/studio-run.js"');
    expect(configXml).toContain('Name="LOC_MAP_MAP_STUDIO_RUN_NAME"');
    expect(mapSource).toContain(JSON.stringify(artifactEnvelope(fixtureConfig), null, 2));
    expect(mapSource).not.toContain("admitStandardMapConfig");
    expect(mapSource).not.toContain("@civ7/studio-contract");
    expect(plan.metadata.configProjections).toEqual([
      { sourceKind: "generated-run", canonicalConfig: fixtureConfig.canonicalConfig },
    ]);
  });
});
