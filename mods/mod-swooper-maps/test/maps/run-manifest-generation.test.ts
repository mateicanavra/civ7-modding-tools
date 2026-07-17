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
import {
  generateSwooperRunGeneratedModFromManifestPath,
  verifySwooperStandardRunManifest,
} from "../../scripts/run-manifest-generator";
import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "../../src/maps/configs/canonical";
import { expectCiv7MapScriptCompatibility } from "../support/civ7-map-script-compatibility";

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
      expect(modInfo.split(`id="always-${STUDIO_RUN_MOD_ID}"`).length - 1).toBe(1);
      expect(modInfo.split(`id="game-${STUDIO_RUN_MOD_ID}"`).length - 1).toBe(1);
      expect(modInfo.split(`id="shell-${STUDIO_RUN_MOD_ID}"`).length - 1).toBe(1);
      expect(modInfo).not.toContain('<Criteria id="always">');
      expect(modInfo).not.toContain('id="game-swooper-maps"');
      expect(modInfo).not.toContain('id="shell-swooper-maps"');
      expect(modInfo).not.toContain("data/biome-hazards.xml");
      const configXml = await readFile(
        resolve(generated.generatedModRoot, "config/config.xml"),
        "utf8"
      );
      expect(
        configXml.split(`File="{${STUDIO_RUN_MOD_ID}}/${STUDIO_RUN_MAP_SCRIPT_PATH}"`).length - 1
      ).toBe(1);
      expect(configXml.split(`Name="LOC_MAP_${mapRowId}_NAME"`).length - 1).toBe(1);
      expect(configXml.split(`Description="LOC_MAP_${mapRowId}_DESCRIPTION"`).length - 1).toBe(1);
      const mapText = await readFile(
        resolve(generated.generatedModRoot, "text/en_us/MapText.xml"),
        "utf8"
      );
      expect(mapText.split(`Tag="LOC_MAP_${mapRowId}_NAME"`).length - 1).toBe(1);
      expect(mapText.split(`Tag="LOC_MAP_${mapRowId}_DESCRIPTION"`).length - 1).toBe(1);
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
      expect(mapScript.length).toBeGreaterThan(0);
      expect(mapScript).toContain(manifest.payload.requestId);
      expect(mapScript).toContain(manifest.payload.canonicalConfigDigest);
      expect(mapScript).toContain(manifest.payload.launchEnvelopeDigest);
      expect(mapScript).not.toContain("configContentDigest");
      await expectCiv7MapScriptCompatibility(mapScript, STUDIO_RUN_MAP_SCRIPT_PATH);
      await expect(
        readFile(resolve(generated.generatedModRoot, ".source/maps", `${runArtifactId}.ts`), "utf8")
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("preserves the complete canonical config in a generated run manifest", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-config-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      await generateSwooperRunGeneratedModFromManifestPath(manifestRef.path);

      expect(manifest.payload.launchEnvelope.canonicalConfig).toMatchObject({
        id: "latest-juicy",
      });
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("returns a verified Standard render input from the deserialized manifest", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-verification-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);

      const verifiedRun = verifySwooperStandardRunManifest(manifest);

      expect(verifiedRun.manifest).toBe(manifest);
      expect(verifiedRun.renderInput.config).toEqual(
        admitStandardMapConfig(manifest.payload.launchEnvelope.canonicalConfig)
      );
      expect(verifiedRun.renderInput.seed).toBe(1538316418);
      expect(verifiedRun.renderInput.correlation.requestId).toBe(manifest.payload.requestId);
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
          recipe: "other-mod/other-recipe",
        }),
        workspaceRoot,
      });

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow(/recipe envelope must be standard/);
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

  test("rejects a manifest whose canonical-config digest does not authenticate the launch envelope config", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-digest-mismatch-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      const malformedManifest = {
        ...manifest,
        payload: {
          ...manifest.payload,
          canonicalConfigDigest: "b".repeat(64),
        },
      };
      await writeFile(manifestRef.path, `${JSON.stringify(malformedManifest, null, 2)}\n`);

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow("canonicalConfigDigest does not match canonical config");
      await expect(readStudioRunGenerationManifest(manifestRef.path)).rejects.toThrow(
        "canonicalConfigDigest does not match canonical config"
      );
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

  test("rejects a self-consistently rehashed manifest that fails Standard verification before writing", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "swooper-run-manifest-incomplete-recipe-"));
    try {
      const manifestRef = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput(),
        workspaceRoot,
      });
      const manifest = await readStudioRunGenerationManifest(manifestRef.path);
      const [, ...remainingRecipeEntries] = Object.entries(
        manifest.payload.launchEnvelope.canonicalConfig.config
      );
      const incompleteRecipeConfig = Object.fromEntries(remainingRecipeEntries);
      const incompleteCanonicalConfig = {
        ...manifest.payload.launchEnvelope.canonicalConfig,
        config: incompleteRecipeConfig,
      };
      const incompleteLaunchEnvelope = {
        ...manifest.payload.launchEnvelope,
        canonicalConfig: incompleteCanonicalConfig,
      };
      const payload = {
        ...manifest.payload,
        launchEnvelope: incompleteLaunchEnvelope,
        canonicalConfigDigest: stableHash(incompleteCanonicalConfig),
        launchEnvelopeDigest: stableHash(incompleteLaunchEnvelope),
      };
      const selfConsistentlyRehashedManifest = {
        payload,
        generationManifestDigest: stableHash(payload),
      };
      await writeFile(
        manifestRef.path,
        `${JSON.stringify(selfConsistentlyRehashedManifest, null, 2)}\n`
      );

      await expect(
        generateSwooperRunGeneratedModFromManifestPath(manifestRef.path)
      ).rejects.toThrow("complete recipe config JSON");
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
    recipe?: string;
  }> = {}
): StudioRunGenerationManifestInput {
  const sourceCanonicalConfig = standardMapConfigs.find(
    (entry) => entry.canonicalConfig.id === "latest-juicy"
  )?.canonicalConfig as StandardMapConfigEnvelope | undefined;
  if (!sourceCanonicalConfig) throw new Error("latest-juicy config fixture is missing");
  const canonicalConfig = sourceCanonicalConfig;
  const launchEnvelope = {
    seed: 1538316418,
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
    setupConfig: {
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    },
    canonicalConfig: { ...canonicalConfig, recipe: options.recipe ?? "standard" },
  };
  return {
    requestId: "studio-run-in-game-generator-test",
    launchEnvelope,
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
