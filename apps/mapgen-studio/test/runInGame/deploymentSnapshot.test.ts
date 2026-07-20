import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createStudioOperationRuntimePorts } from "../../src/server/studio/engines";

type DeployRunInGameArgs = Parameters<
  ReturnType<typeof createStudioOperationRuntimePorts>["deployRunInGame"]
>[0];

const tempRoots: string[] = [];
const previousHome = process.env.HOME;
const previousScriptingLog = process.env.CIV7_SCRIPTING_LOG;

afterEach(async () => {
  process.env.HOME = previousHome;
  process.env.CIV7_SCRIPTING_LOG = previousScriptingLog;
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Run in Game deployment snapshot", () => {
  it("copies the generated mod to the stable Studio-run mod id and records the deployed snapshot", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-run-deploy-snapshot-"));
    tempRoots.push(root);
    process.env.HOME = root;
    process.env.CIV7_SCRIPTING_LOG = join(root, "Logs", "script.log");
    await mkdir(join(root, "Logs"), { recursive: true });
    await writeFile(process.env.CIV7_SCRIPTING_LOG, "", "utf8");

    const generatedModRoot = join(root, "generated-mod");
    await writeGeneratedRunMod(generatedModRoot);
    const generatedTree = await digestFileTree(generatedModRoot);
    const ports = createStudioOperationRuntimePorts({ repoRoot: root });

    const deployment = await ports.deployRunInGame({
      requestId: "run-deploy-snapshot",
      prepared: preparedRequest(),
      signal: new AbortController().signal,
      generatedMod: {
        materialization: {
          path: "generated-mod",
          mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
          canonicalConfigDigest: "config-hash-test",
          launchEnvelopeDigest: "envelope-hash-test",
          generationManifestDigest: "generation-manifest-digest-test",
          runArtifactId: "run-test",
          generatedModRoot,
          generatedModFileCount: generatedTree.fileCount,
          generatedModDigest: generatedTree.digest,
          mapRowId: "MAP_STUDIO_RUN",
        },
      },
    });

    const targetRoot = join(root, "Library", "Application Support", "Civilization VII", "Mods");
    const deployedScript = join(targetRoot, "mod-swooper-studio-run", "maps", "studio-run.js");
    await expect(readFile(deployedScript, "utf8")).resolves.toContain("run-deploy-snapshot");
    expect(deployment.runDeployment).toMatchObject({
      requestId: "run-deploy-snapshot",
      deployedModId: "mod-swooper-studio-run",
      generatedModRoot,
      generatedModDigest: generatedTree.digest,
      targetRoot: join(targetRoot, "mod-swooper-studio-run"),
      filesCopied: 2,
    });
    expect(deployment.deployedSnapshot).toMatchObject({
      requestId: "run-deploy-snapshot",
      deployedModId: "mod-swooper-studio-run",
      fileCount: generatedTree.fileCount,
      digest: generatedTree.digest,
      files: expect.arrayContaining([
        expect.objectContaining({
          path: "maps/studio-run.js",
          sizeBytes: expect.any(Number),
        }),
      ]),
    });
  });
});

async function writeGeneratedRunMod(root: string): Promise<void> {
  const script = [
    "run-deploy-snapshot",
    "config-hash-test",
    "envelope-hash-test",
    "map.rivers.authoredTerrainMaterialization",
    "POST-AUTHORED-RIVERS",
  ].join("\n");
  await mkdir(join(root, "maps"), { recursive: true });
  await mkdir(join(root, "config"), { recursive: true });
  await writeFile(join(root, "maps", "studio-run.js"), script, "utf8");
  await writeFile(join(root, "config", "run-test.json"), '{"id":"run-deploy-snapshot"}\n', "utf8");
}

async function digestFileTree(root: string): Promise<{ fileCount: number; digest: string }> {
  const files = await listFiles(root);
  const hash = createHash("sha256");
  for (const file of files) {
    const relativePath = relative(root, file).replaceAll("\\", "/");
    hash.update(relativePath, "utf8");
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return { fileCount: files.length, digest: hash.digest("hex") };
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = resolve(root, entry.name);
      if (entry.isDirectory()) return listFiles(absolute);
      return entry.isFile() ? [absolute] : [];
    })
  );
  return files.flat().sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
}

function preparedRequest(): DeployRunInGameArgs["prepared"] {
  const setupConfig = {
    gameOptions: {},
    playerOptions: [{ playerId: 0, options: {} }],
  };
  const launchEnvelope = {
    seed: 12345,
    worldSettings: { mapSize: "MAPSIZE_STANDARD" },
    setupConfig,
    canonicalConfig: {
      id: "studio-current",
      name: "Studio Current",
      description: "Deployment snapshot fixture.",
      recipe: "standard",
      sortIndex: 9999,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: {},
    },
  } satisfies DeployRunInGameArgs["prepared"]["launchEnvelope"];
  return {
    request: {
      recipeId: launchEnvelope.canonicalConfig.recipe,
      seed: launchEnvelope.seed,
      mapSize: launchEnvelope.worldSettings.mapSize,
      setupConfig,
    },
    launchEnvelope,
    canonicalConfigDigest: "config-hash-test",
    launchEnvelopeDigest: "envelope-hash-test",
  };
}
