import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  createRunArtifactId,
  readStudioRunGenerationManifest,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
  STUDIO_RUN_MOD_ID,
  type StudioRunGenerationManifestInput,
  writeStudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";
import { parseSwooperRunManifestPathArg } from "../../scripts/generate-run-manifest";
import { generateSwooperRunGeneratedModFromManifestPath } from "../../scripts/run-manifest-generator";

describe("Swooper run manifest generator", () => {
  test("requires exactly one manifest path", () => {
    expect(() => parseSwooperRunManifestPathArg([])).toThrow("Usage:");
    expect(() => parseSwooperRunManifestPathArg(["one.json", "two.json"])).toThrow("Usage:");
    expect(parseSwooperRunManifestPathArg(["generation-manifest.json"])).toBe(
      "generation-manifest.json"
    );
  });

  test("generates the stable Studio run mod tree from a valid Studio manifest", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-generator-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      const generated = await generateSwooperRunGeneratedModFromManifestPath(manifestRef.path);
      const runArtifactId = createRunArtifactId(manifest.payload.requestId);
      const mapRowId = STUDIO_RUN_MAP_ROW_ID;

      expect(generated).toMatchObject({
        requestId: manifest.payload.requestId,
        runArtifactId,
        generatedModRoot: resolve(workspaceRoot, manifest.payload.requestId, "generated-mod"),
        mapRowId: STUDIO_RUN_MAP_ROW_ID,
        mapScriptPath: STUDIO_RUN_MAP_SCRIPT_PATH,
        fileCount: 5,
      });
      expect(
        await readFile(resolve(generated.generatedModRoot, `${STUDIO_RUN_MOD_ID}.modinfo`), "utf8")
      ).toContain(`<Mod id="${STUDIO_RUN_MOD_ID}"`);
      const modInfo = await readFile(
        resolve(generated.generatedModRoot, `${STUDIO_RUN_MOD_ID}.modinfo`),
        "utf8"
      );
      expect(modInfo).toContain(`<Mod id="swooper-maps" title="LOC_MODULE_SWOOPER_MAPS_NAME"/>`);
      expect(modInfo).not.toContain("data/biome-hazards.xml");
      expect(
        await readFile(resolve(generated.generatedModRoot, "config/config.xml"), "utf8")
      ).toContain(`File="{${STUDIO_RUN_MOD_ID}}/${STUDIO_RUN_MAP_SCRIPT_PATH}"`);
      const mapText = await readFile(
        resolve(generated.generatedModRoot, "text/en_us/MapText.xml"),
        "utf8"
      );
      expect(mapText).toContain(`LOC_MAP_${mapRowId}_NAME`);
      expect(mapText).not.toContain("LOC_PLOTEFFECT_DESERT_HEAT_NAME");
      await expect(
        readFile(resolve(generated.generatedModRoot, "data/biome-hazards.xml"), "utf8")
      ).rejects.toThrow();
      await expect(
        readFile(resolve(generated.generatedModRoot, "text/en_us/ModuleText.xml"), "utf8")
      ).rejects.toThrow();
      const mapScript = await readFile(
        resolve(generated.generatedModRoot, STUDIO_RUN_MAP_SCRIPT_PATH),
        "utf8"
      );
      expect(mapScript).toContain(manifest.payload.requestId);
      expect(mapScript).toContain(runArtifactId);
      expect(mapScript).toContain(manifest.generationManifestDigest);
      expect(mapScript).toContain("runCorrelation");
      await expect(
        readFile(resolve(generated.generatedModRoot, ".source/maps", `${runArtifactId}.ts`), "utf8")
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("rejects an invalid manifest before writing a generated mod tree", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-invalid-"));
    try {
      const requestRoot = resolve(workspaceRoot, "studio-run-in-game-invalid");
      const manifestPath = resolve(requestRoot, "generation-manifest.json");
      await mkdir(requestRoot, { recursive: true });
      await writeFile(manifestPath, JSON.stringify({ invalid: true }));

      await expect(generateSwooperRunGeneratedModFromManifestPath(manifestPath)).rejects.toThrow(
        "Invalid StudioRunGenerationManifest"
      );
      await expect(
        readFile(resolve(requestRoot, "generated-mod/config/config.xml"), "utf8")
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("rejects a non-standard recipe manifest before writing a generated mod tree", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-wrong-recipe-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput({
          recipeId: "other-mod/other-recipe",
          envelopeRecipe: "other-mod/other-recipe",
        }),
        workspaceRoot,
      });

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow("only supports mod-swooper-maps/standard");
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      await expect(
        readFile(
          resolve(workspaceRoot, manifest.payload.requestId, "generated-mod/config/config.xml"),
          "utf8"
        )
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("rejects a manifest whose config digest does not match the launch config", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-digest-mismatch-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput({ configContentDigest: "b".repeat(64) }),
        workspaceRoot,
      });

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow("config digest does not match");
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      await expect(
        readFile(
          resolve(workspaceRoot, manifest.payload.requestId, "generated-mod/config/config.xml"),
          "utf8"
        )
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked generated-mod root before writing through it", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-root-link-"));
    const outsideRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-root-link-outside-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      const generatedModRoot = resolve(workspaceRoot, manifest.payload.requestId, "generated-mod");
      const outsideMarker = resolve(outsideRoot, "marker.txt");
      await writeFile(outsideMarker, "outside");
      await symlink(outsideRoot, generatedModRoot);

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow("output root must not be a symlink");
      expect(await readFile(outsideMarker, "utf8")).toBe("outside");
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });
});

function manifestInput(
  options: Readonly<{
    recipeId?: string;
    envelopeRecipe?: string;
    configContentDigest?: string;
  }> = {}
): StudioRunGenerationManifestInput {
  const launchEnvelopeDigest = "a".repeat(64);
  const config = standardMapConfigs.find((entry) => entry.id === "latest-juicy")?.config;
  if (!config) throw new Error("latest-juicy config fixture is missing");
  const recipeId = options.recipeId ?? "mod-swooper-maps/standard";
  const envelopeRecipe = options.envelopeRecipe ?? recipeId;
  return {
    requestId: "studio-run-in-game-generator-test",
    request: {
      recipeId,
      seed: 1538316418,
      mapSize: "MAPSIZE_STANDARD",
      selectedConfigId: "latest-juicy",
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
      materializationMode: "disposable",
    },
    resolvedLaunchSource: {
      kind: "catalog",
      catalogSourceId: "latest-juicy",
      catalogSourcePath: "mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json",
      config,
      label: "Latest Juicy",
      description: "Packet 8 generated map",
      sortIndex: 1900,
    },
    launchEnvelope: {
      recipeSettings: {
        recipe: envelopeRecipe,
        seed: 1538316418,
      },
      worldSettings: {
        mapSize: "MAPSIZE_STANDARD",
      },
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
      source: {
        kind: "catalog",
        id: "latest-juicy",
        label: "Latest Juicy",
        description: "Packet 8 generated map",
        mapScript: "{swooper-maps}/maps/latest-juicy.js",
        sortIndex: 1900,
      },
      config,
    },
    launchSourceDigest: {
      configContentDigest: options.configContentDigest ?? stableHash(config),
      launchEnvelopeDigest,
    },
    launchEnvelopeDigest,
  };
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
