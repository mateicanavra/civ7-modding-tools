import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { JsonWireObject } from "@civ7/studio-contract";
import { describe, expect, test } from "vitest";
import {
  buildStudioRunGenerationManifest,
  buildStudioRunGenerationManifestPayload,
  canonicalSortedJson,
  canonicalValueDigest,
  createRunArtifactId,
  generationManifestDigest,
  parseStudioRunGenerationManifest,
  readStudioRunGenerationManifest,
  type StudioRunGenerationManifestInput,
  studioRunWorkspacePaths,
  writeStudioRunGenerationManifest,
} from "../src/index.js";

describe("Studio Run generation manifest", () => {
  test("allocates request workspace paths and a stable artifact id", () => {
    const paths = studioRunWorkspacePaths("studio-run-in-game-test", {
      workspaceRoot: "/tmp/studio-runs",
    });

    expect(createRunArtifactId("studio-run-in-game-test")).toMatch(/^run-[a-f0-9]{20}$/);
    expect(paths).toEqual({
      workspaceRoot: "/tmp/studio-runs",
      requestRoot: "/tmp/studio-runs/studio-run-in-game-test",
      generationManifestPath: "/tmp/studio-runs/studio-run-in-game-test/generation-manifest.json",
      generatedModRoot: "/tmp/studio-runs/studio-run-in-game-test/generated-mod",
    });
    expect(() =>
      studioRunWorkspacePaths("../escape", { workspaceRoot: "/tmp/studio-runs" })
    ).toThrow("safe storage key");
    expect(() => studioRunWorkspacePaths(".", { workspaceRoot: "/tmp/studio-runs" })).toThrow(
      "safe storage key"
    );
    expect(() => studioRunWorkspacePaths("..", { workspaceRoot: "/tmp/studio-runs" })).toThrow(
      "safe storage key"
    );
  });

  test("computes the manifest digest from canonical sorted payload JSON only", () => {
    const payload = buildStudioRunGenerationManifestPayload(
      manifestInput({
        config: { alpha: { z: 1, a: 2 } },
      })
    );
    const samePayloadDifferentKeyOrder = {
      ...payload,
      workspace: {
        generatedModRoot: payload.workspace.generatedModRoot,
        generationManifestPath: payload.workspace.generationManifestPath,
        requestRoot: payload.workspace.requestRoot,
      },
    };
    const manifest = buildStudioRunGenerationManifest(payload);
    const wrapperWithDifferentPersistedDigest = {
      ...manifest,
      generationManifestDigest: "not-part-of-payload",
    };

    expect(canonicalSortedJson(payload)).toContain('"alpha":{"a":2,"z":1}');
    expect(generationManifestDigest(samePayloadDifferentKeyOrder)).toBe(
      manifest.generationManifestDigest
    );
    expect(generationManifestDigest(wrapperWithDifferentPersistedDigest.payload)).toBe(
      manifest.generationManifestDigest
    );
    expect(parseStudioRunGenerationManifest(manifest)).toEqual(manifest);
    expect(() =>
      parseStudioRunGenerationManifest({
        ...manifest,
        payload: {
          ...manifest.payload,
          unexpected: true,
        },
      })
    ).toThrow("Invalid StudioRunGenerationManifest");
    expect(() =>
      parseStudioRunGenerationManifest({
        ...manifest,
        generationManifestDigest: "0".repeat(64),
      })
    ).toThrow("digest does not match payload");
    expect(() =>
      parseStudioRunGenerationManifest(
        buildStudioRunGenerationManifest({
          ...manifest.payload,
          runArtifactId: createRunArtifactId("other-request"),
        })
      )
    ).toThrow("runArtifactId does not match requestId");
    expect(() =>
      parseStudioRunGenerationManifest(
        buildStudioRunGenerationManifest({
          ...manifest.payload,
          workspace: {
            ...manifest.payload.workspace,
            requestRoot: ".mapgen-studio/run-in-game/other-request",
          },
        })
      )
    ).toThrow("requestRoot does not match requestId");
    expect(() =>
      parseStudioRunGenerationManifest(
        buildStudioRunGenerationManifest({
          ...manifest.payload,
          canonicalConfigDigest: "not-a-digest",
        })
      )
    ).toThrow("Invalid StudioRunGenerationManifest");
    const changedLaunchEnvelope = {
      ...manifest.payload.launchEnvelope,
      canonicalConfig: {
        ...manifest.payload.launchEnvelope.canonicalConfig,
        name: "Changed after admission",
      },
    };
    expect(() =>
      parseStudioRunGenerationManifest(
        buildStudioRunGenerationManifest({
          ...manifest.payload,
          launchEnvelope: changedLaunchEnvelope,
          canonicalConfigDigest: canonicalValueDigest(changedLaunchEnvelope.canonicalConfig),
        })
      )
    ).toThrow("launchEnvelopeDigest does not match launch envelope");
    const incompleteCanonicalConfig = {
      id: manifest.payload.launchEnvelope.canonicalConfig.id,
      recipe: manifest.payload.launchEnvelope.canonicalConfig.recipe,
      config: manifest.payload.launchEnvelope.canonicalConfig.config,
    };
    const incompleteLaunchEnvelope = {
      ...manifest.payload.launchEnvelope,
      canonicalConfig: incompleteCanonicalConfig,
    };
    const selfConsistentlyRehashedManifest = {
      payload: {
        ...manifest.payload,
        launchEnvelope: incompleteLaunchEnvelope,
        canonicalConfigDigest: canonicalValueDigest(incompleteCanonicalConfig),
        launchEnvelopeDigest: canonicalValueDigest(incompleteLaunchEnvelope),
      },
      generationManifestDigest: "",
    };
    selfConsistentlyRehashedManifest.generationManifestDigest = canonicalValueDigest(
      selfConsistentlyRehashedManifest.payload
    );
    expect(() => parseStudioRunGenerationManifest(selfConsistentlyRehashedManifest)).toThrow(
      "Invalid StudioRunGenerationManifest"
    );
    const rehashedPayloadWithSiblingRequest = {
      ...manifest.payload,
      request: {
        recipeId: manifest.payload.launchEnvelope.canonicalConfig.recipe,
        seed: manifest.payload.launchEnvelope.seed,
        mapSize: manifest.payload.launchEnvelope.worldSettings.mapSize,
        setupConfig: manifest.payload.launchEnvelope.setupConfig,
      },
    };
    expect(() =>
      parseStudioRunGenerationManifest({
        payload: rehashedPayloadWithSiblingRequest,
        generationManifestDigest: canonicalValueDigest(rehashedPayloadWithSiblingRequest),
      })
    ).toThrow("Invalid StudioRunGenerationManifest");
  });

  test("writes exactly one manifest under the request workspace", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-generation-manifest-"));
    try {
      const requestId = "studio-run-in-game-write";
      const written = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput({ requestId }),
        workspaceRoot,
      });

      expect(written.path).toBe(resolve(workspaceRoot, requestId, "generation-manifest.json"));
      expect(written.runArtifactId).toBe(createRunArtifactId(requestId));
      expect(written.correlation).toMatchObject({
        requestId,
        runArtifactId: written.runArtifactId,
        generationManifestDigest: written.generationManifestDigest,
      });
      const manifest = await readStudioRunGenerationManifest(written.path);
      expect(manifest.generationManifestDigest).toBe(written.generationManifestDigest);
      expect(JSON.parse(await readFile(written.path, "utf8"))).toEqual(manifest);
      expect(Object.isFrozen(manifest)).toBe(true);
      expect(Object.isFrozen(manifest.payload)).toBe(true);
      expect(Object.isFrozen(manifest.payload.launchEnvelope)).toBe(true);
      expect(Object.isFrozen(manifest.payload.launchEnvelope.canonicalConfig)).toBe(true);

      await expect(
        writeStudioRunGenerationManifest({
          manifestInput: manifestInput({ requestId }),
          workspaceRoot,
        })
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("gives sequential same-content requests fresh manifest identity", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-manifest-freshness-"));
    try {
      const firstWritten = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput({ requestId: "studio-run-first", resources: "balanced" }),
        workspaceRoot,
      });
      const repeatWritten = await writeStudioRunGenerationManifest({
        manifestInput: manifestInput({ requestId: "studio-run-repeat", resources: "balanced" }),
        workspaceRoot,
      });
      const first = await readStudioRunGenerationManifest(firstWritten.path);
      const repeat = await readStudioRunGenerationManifest(repeatWritten.path);

      expect(parseStudioRunGenerationManifest(first)).toEqual(first);
      expect(parseStudioRunGenerationManifest(repeat)).toEqual(repeat);
      expect(firstWritten.path).not.toBe(repeatWritten.path);
      expect(first.payload.requestId).not.toBe(repeat.payload.requestId);
      expect(first.payload.workspace.requestRoot).not.toBe(repeat.payload.workspace.requestRoot);
      expect(first.payload.runArtifactId).not.toBe(repeat.payload.runArtifactId);
      expect(first.generationManifestDigest).not.toBe(repeat.generationManifestDigest);
      expect(first.payload.canonicalConfigDigest).toBe(repeat.payload.canonicalConfigDigest);
      expect(first.payload.launchEnvelopeDigest).toBe(repeat.payload.launchEnvelopeDigest);
      expect(first.payload.launchEnvelope.worldSettings.resources).toBe("balanced");
      expect(repeat.payload.launchEnvelope.worldSettings.resources).toBe("balanced");
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("finalizes snapshot bytes and digest before filesystem awaits", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-manifest-snapshot-"));
    try {
      const mutableConfig = { nested: { label: "before" } };
      const input = manifestInput({
        config: mutableConfig,
        requestId: "studio-run-manifest-snapshot",
      });
      const writing = writeStudioRunGenerationManifest({
        manifestInput: input,
        workspaceRoot,
      });
      mutableConfig.nested.label = "after";

      const written = await writing;
      const serialized = await readFile(written.path, "utf8");
      const manifest = await readStudioRunGenerationManifest(written.path);

      expect(serialized).toContain('"label": "before"');
      expect(serialized).not.toContain('"label": "after"');
      expect(manifest.generationManifestDigest).toBe(written.generationManifestDigest);
      expect(manifest.payload.launchEnvelope.canonicalConfig.config).toEqual({
        nested: { label: "before" },
      });
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

function manifestInput(
  overrides: Readonly<{
    requestId?: string;
    config?: JsonWireObject;
    resources?: NonNullable<
      StudioRunGenerationManifestInput["launchEnvelope"]["worldSettings"]["resources"]
    >;
  }> = {}
): StudioRunGenerationManifestInput {
  const config = overrides.config ?? {};
  const canonicalConfig = {
    id: "studio-current",
    name: "Studio Current",
    description: "Current Studio editor configuration.",
    recipe: "standard" as const,
    sortIndex: 9999,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config,
  };
  const launchEnvelope = {
    seed: 43,
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
      ...(overrides.resources === undefined ? {} : { resources: overrides.resources }),
    },
    setupConfig: {
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    },
    canonicalConfig,
  };
  return {
    requestId: overrides.requestId ?? "studio-run-in-game-digest",
    launchEnvelope,
  };
}
