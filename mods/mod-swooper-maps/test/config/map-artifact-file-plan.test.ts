import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildSwooperMapArtifactFilePlan,
  type StudioRunProofEnv,
  type SwooperMapArtifactFilePlan,
} from "../../scripts/map-artifacts/file-plan";
import { writeSwooperMapArtifactFilePlan } from "../../scripts/map-artifacts/write-file-plan";
import {
  buildCanonicalMapConfigSchema,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);

async function buildCurrentPlan(proofEnv?: StudioRunProofEnv) {
  const configs = await loadSwooperMapConfigRegistry();
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  return {
    configs,
    plan: buildSwooperMapArtifactFilePlan({ configs, envelopeSchema, proofEnv }),
  };
}

function textContent(file: { content: { kind: "text"; text: string } | { kind: "bytes" } }) {
  if (file.content.kind !== "text") {
    throw new Error("Expected text artifact content");
  }
  return file.content.text;
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
      config: {},
    },
    recipeSchema,
    stages: STANDARD_STAGES,
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
      expect(paths.has(`src/maps/generated/${config.id}.ts`)).toBe(true);
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

  it("renders exact file-plan content for a schema-valid fixture config", () => {
    const fixtureConfig = buildFixtureConfig();
    const plan = buildSwooperMapArtifactFilePlan({
      configs: [fixtureConfig],
      envelopeSchema: { fixture: true },
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
    expect(generatedMap.markerMetadata).toEqual({
      configId: "fixture-map",
      configHash: "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
      envelopeHash: "18bd0b122157d4016e96595991d558114e03a156d2c8bba1f6271c7766666cd6",
    });
    const generatedMapText = textContent(generatedMap);
    expect(generatedMapText).toContain(
      'import mapConfig from "../configs/fixture-map.config.json";'
    );
    expect(generatedMapText).toContain(`  latitudeBounds: {
    "topLatitude": 60,
    "bottomLatitude": -45
  },`);
    expect(generatedMapText).toContain('  logPrefix: "[fixture]",');
    expect(generatedMapText).toContain('  sourceConfigId: "fixture-map",');
    expect(generatedMapText).toContain(
      '  configHash: "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",'
    );
    expect(generatedMapText).toContain(
      '  envelopeHash: "18bd0b122157d4016e96595991d558114e03a156d2c8bba1f6271c7766666cd6",'
    );
    expect(generatedMapText).not.toContain("requestId");

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
    expect(textContent(plannedFile(plan, "dist/recipes/standard-map-config.schema.json"))).toBe(`{
  "fixture": true
}
`);

    const catalogModule = textContent(plannedFile(plan, "dist/recipes/standard-map-configs.js"));
    expect(catalogModule).toStartWith(
      "// This file is generated by scripts/generate-map-artifacts.ts"
    );
    const catalogJson = catalogModule
      .replace(/^.*export const standardMapConfigs = /s, "")
      .replace(/;\n$/, "");
    expect(JSON.parse(catalogJson)).toEqual([
      {
        id: "fixture-map",
        label: "Fixture & Map <One>",
        name: "Fixture & Map <One>",
        description: "Wet & dry edge",
        recipe: "standard",
        sortIndex: 7,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -45 },
        configHash: "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
        envelopeHash: "18bd0b122157d4016e96595991d558114e03a156d2c8bba1f6271c7766666cd6",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/fixture-map.config.json",
        config: {},
      },
    ]);
  });

  it("attaches run proof metadata only to the selected map entry", async () => {
    const selectedConfigId = "swooper-earthlike";
    const { plan } = await buildCurrentPlan({
      kind: "run",
      requestId: "studio-run-in-game-plan-test",
      launchConfigId: selectedConfigId,
      launchEnvelopeDigest: "launch-envelope-digest-plan-test",
    });
    const selectedFile = plan.files.find(
      (file) => file.relativePath === `src/maps/generated/${selectedConfigId}.ts`
    );
    const otherGeneratedFiles = plan.files.filter(
      (file) =>
        file.kind === "generated-map-entry" &&
        file.relativePath !== `src/maps/generated/${selectedConfigId}.ts`
    );

    expect(selectedFile?.markerMetadata).toMatchObject({
      configId: selectedConfigId,
      envelopeHash: "launch-envelope-digest-plan-test",
      requestId: "studio-run-in-game-plan-test",
    });
    expect(selectedFile?.content.kind).toBe("text");
    expect(selectedFile?.content.kind === "text" ? selectedFile.content.text : "").toContain(
      "studio-run-in-game-plan-test"
    );
    expect(selectedFile?.content.kind === "text" ? selectedFile.content.text : "").toContain(
      "launch-envelope-digest-plan-test"
    );
    for (const file of otherGeneratedFiles) {
      expect(file.markerMetadata).not.toHaveProperty("requestId");
      expect(file.content.kind).toBe("text");
      const text = file.content.kind === "text" ? file.content.text : "";
      expect(text).not.toContain("studio-run-in-game-plan-test");
      expect(text).not.toContain("launch-envelope-digest-plan-test");
    }
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
