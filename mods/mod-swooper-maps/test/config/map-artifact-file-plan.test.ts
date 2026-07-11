import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  buildCompleteSchemaDefaults,
  deriveRecipeConfigSchema,
} from "@swooper/mapgen-core/authoring";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildSwooperCatalogMetadataFilePlan,
  buildSwooperMapArtifactFilePlan,
  buildSwooperRunGeneratedModFilePlan,
  type SwooperMapArtifactFilePlan,
} from "../../scripts/map-artifacts/file-plan";
import { writeSwooperMapArtifactFilePlan } from "../../scripts/map-artifacts/write-file-plan";
import {
  buildCanonicalMapConfigSchema,
  canonicalMapConfigDigest,
  type MaterializedCanonicalMapConfig,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
const fixtureRecipeConfig = buildCompleteSchemaDefaults(recipeSchema) as Record<string, unknown>;
const fixtureEnvelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);

async function buildCurrentPlan() {
  const configs = await loadSwooperMapConfigRegistry();
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  return {
    configs,
    plan: buildSwooperMapArtifactFilePlan({ configs, envelopeSchema }),
  };
}

function textContent(file: { content: { kind: "text"; text: string } | { kind: "bytes" } }) {
  if (file.content.kind !== "text") {
    throw new Error("Expected text artifact content");
  }
  return file.content.text;
}

function artifactEnvelope(config: ValidatedMapConfig): MaterializedCanonicalMapConfig {
  return config.canonicalConfig;
}

function plannedFile(
  plan: ReturnType<typeof buildSwooperMapArtifactFilePlan>,
  relativePath: string
) {
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
      logPrefix: "[fixture]",
      config: fixtureRecipeConfig,
    },
    recipeSchema,
  });
}

describe("Swooper map artifact file plan", () => {
  it("renders every catalog artifact as pure file-plan data", async () => {
    const { configs, plan } = await buildCurrentPlan();
    const paths = new Set(plan.files.map((file) => file.relativePath));

    expect(plan.exclusiveSets).toEqual([
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
    expect(plan.files).toHaveLength(configs.length + 7);
    expect(
      plan.files.every((file) =>
        file.content.kind === "text" ? file.content.text.length > 0 : file.content.bytes.length > 0
      )
    ).toBe(true);
  });

  it("feeds every schema-materialized catalog envelope into its generated artifact intact", async () => {
    const { configs, plan } = await buildCurrentPlan();

    for (const config of configs) {
      const generatedMap = plannedFile(plan, `src/maps/generated/${config.canonicalConfig.id}.ts`);
      expect(textContent(generatedMap), config.canonicalConfig.id).toContain(
        JSON.stringify(artifactEnvelope(config), null, 2)
      );
    }
    expect(plan.metadata.configProjections).toEqual(
      configs.map((config) => ({
        sourceKind: "catalog",
        sourcePath: `mods/mod-swooper-maps/src/maps/configs/${config.fileName}`,
        canonicalConfig: config.canonicalConfig,
      }))
    );
  });

  it("hashes every portable canonical-envelope field", () => {
    const canonicalConfig = artifactEnvelope(buildFixtureConfig());
    const baselineDigest = canonicalMapConfigDigest(canonicalConfig);
    const variants: readonly MaterializedCanonicalMapConfig[] = [
      { ...canonicalConfig, id: "fixture-map-renamed" },
      { ...canonicalConfig, name: "Different fixture name" },
      { ...canonicalConfig, description: "Different fixture description" },
      { ...canonicalConfig, recipe: "other-recipe" as never },
      { ...canonicalConfig, sortIndex: canonicalConfig.sortIndex + 1 },
      {
        ...canonicalConfig,
        latitudeBounds: {
          topLatitude: 55,
          bottomLatitude: canonicalConfig.latitudeBounds.bottomLatitude,
        },
      },
      { ...canonicalConfig, logPrefix: "[different-fixture]" },
      { ...canonicalConfig, config: { ...canonicalConfig.config, fixtureVariant: true } },
    ];

    for (const variant of variants) {
      expect(canonicalMapConfigDigest(variant)).not.toBe(baselineDigest);
    }
  });

  it("renders exact file-plan content for a schema-valid fixture config", () => {
    const fixtureConfig = buildFixtureConfig();
    const plan = buildSwooperMapArtifactFilePlan({
      configs: [fixtureConfig],
      envelopeSchema: fixtureEnvelopeSchema,
    });

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
    expect(plan.metadata.configProjections).toEqual([
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
    const { plan } = await buildCurrentPlan();
    const generatedMapFiles = plan.files.filter((file) => file.kind === "generated-map-entry");

    for (const file of generatedMapFiles) {
      expect(file.markerMetadata).toHaveProperty("configHash");
      expect(file.markerMetadata).toHaveProperty("envelopeHash");
      expect(file.markerMetadata).not.toHaveProperty("requestId");
      expect(file.markerMetadata).not.toHaveProperty("launchEnvelopeDigest");
      expect(file.content.kind).toBe("text");
      const text = file.content.kind === "text" ? file.content.text : "";
      expect(text).not.toContain("runCorrelation");
      expect(text).not.toContain("requestId:");
      expect(text).not.toContain("launchEnvelopeDigest");
      expect(text).not.toContain("generationManifestDigest");
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
        launchSourceDigest: {
          canonicalConfigDigest: canonicalMapConfigDigest(fixtureConfig.canonicalConfig),
          launchEnvelopeDigest: "launch-envelope-digest",
        },
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

  it("writes a file plan under the supplied output root and removes stale generated entries", async () => {
    const { plan } = await buildCurrentPlan();
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-plan-"));
    try {
      const staleGenerated = resolve(outputRoot, "src/maps/generated/stale.ts");
      await mkdir(resolve(outputRoot, "src/maps/generated"), { recursive: true });
      await writeFile(staleGenerated, "stale");

      await writeSwooperMapArtifactFilePlan(plan, { outputRoot });

      await expect(readFile(staleGenerated, "utf8")).rejects.toThrow();
      const firstPlannedFile = plan.files[0];
      expect(await readFile(resolve(outputRoot, firstPlannedFile.relativePath), "utf8")).toBe(
        firstPlannedFile.content.kind === "text"
          ? firstPlannedFile.content.text
          : Buffer.from(firstPlannedFile.content.bytes).toString("utf8")
      );
      const modInfoFile = plan.files.find(
        (file) => file.relativePath === "mod/swooper-maps.modinfo"
      );
      expect(await readFile(resolve(outputRoot, "mod/swooper-maps.modinfo"), "utf8")).toBe(
        modInfoFile?.content.kind === "text" ? modInfoFile.content.text : undefined
      );
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects escaped file-plan paths before deleting stale generated entries", async () => {
    const { plan } = await buildCurrentPlan();
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-plan-invalid-"));
    try {
      const staleGenerated = resolve(outputRoot, "src/maps/generated/stale.ts");
      await mkdir(resolve(outputRoot, "src/maps/generated"), { recursive: true });
      await writeFile(staleGenerated, "stale");
      const invalidPlan: SwooperMapArtifactFilePlan = {
        metadata: plan.metadata,
        exclusiveSets: plan.exclusiveSets,
        files: [
          {
            relativePath: "../outside.ts",
            kind: "mod-info",
            content: { kind: "text", text: "escape" },
          },
          ...plan.files,
        ],
      };

      await expect(writeSwooperMapArtifactFilePlan(invalidPlan, { outputRoot })).rejects.toThrow(
        "escapes output root"
      );
      expect(await readFile(staleGenerated, "utf8")).toBe("stale");
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects symlinked plan paths before deleting outside generated entries", async () => {
    const { plan } = await buildCurrentPlan();
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-plan-symlink-"));
    const outsideRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-plan-outside-"));
    try {
      const outsideGenerated = resolve(outsideRoot, "stale.ts");
      await mkdir(resolve(outputRoot, "src/maps"), { recursive: true });
      await writeFile(outsideGenerated, "outside");
      await symlink(outsideRoot, resolve(outputRoot, "src/maps/generated"));

      await expect(writeSwooperMapArtifactFilePlan(plan, { outputRoot })).rejects.toThrow(
        "traverses symlink"
      );
      expect(await readFile(outsideGenerated, "utf8")).toBe("outside");
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("rejects a symlinked output root before deleting outside generated entries", async () => {
    const { plan } = await buildCurrentPlan();
    const outputRootParent = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-root-link-"));
    const outsideRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-root-link-outside-"));
    const outputRoot = resolve(outputRootParent, "generated-mod");
    try {
      const outsideGenerated = resolve(outsideRoot, "src/maps/generated/stale.ts");
      await mkdir(resolve(outsideRoot, "src/maps/generated"), { recursive: true });
      await writeFile(outsideGenerated, "outside");
      await symlink(outsideRoot, outputRoot);

      await expect(writeSwooperMapArtifactFilePlan(plan, { outputRoot })).rejects.toThrow(
        "output root must not be a symlink"
      );
      expect(await readFile(outsideGenerated, "utf8")).toBe("outside");
    } finally {
      await rm(outputRootParent, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("rejects symlinked write paths before deleting stale generated entries", async () => {
    const { plan } = await buildCurrentPlan();
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-map-artifact-plan-write-link-"));
    const outsideRoot = await mkdtemp(
      resolve(tmpdir(), "swooper-map-artifact-plan-write-outside-")
    );
    try {
      const staleGenerated = resolve(outputRoot, "src/maps/generated/stale.ts");
      await mkdir(resolve(outputRoot, "src/maps/generated"), { recursive: true });
      await writeFile(staleGenerated, "stale");
      await symlink(outsideRoot, resolve(outputRoot, "mod"));

      await expect(writeSwooperMapArtifactFilePlan(plan, { outputRoot })).rejects.toThrow(
        "traverses symlink"
      );
      expect(await readFile(staleGenerated, "utf8")).toBe("stale");
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });
});
