import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import type { RunInGamePreparedRequest } from "../src/operationRuntime/ports";
import {
  buildStudioRunGenerationManifest,
  buildStudioRunGenerationManifestPayload,
  canonicalSortedJson,
  createRunArtifactId,
  generationManifestDigest,
  parseStudioRunGenerationManifest,
  readStudioRunGenerationManifest,
  studioRunWorkspacePaths,
  writeStudioRunGenerationManifest,
} from "../src/operationRuntime/runWorkspace";

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
    const payload = buildStudioRunGenerationManifestPayload({
      requestId: "studio-run-in-game-digest",
      prepared: preparedRequest({
        config: { beta: undefined, alpha: { z: 1, a: 2 } },
      }),
    });
    const samePayloadDifferentKeyOrder = {
      ...payload,
      request: {
        setupConfig: payload.request.setupConfig,
        selectedConfigId: payload.request.selectedConfigId,
        seed: payload.request.seed,
        recipeId: payload.request.recipeId,
        mapSize: payload.request.mapSize,
        materializationMode: payload.request.materializationMode,
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
          launchSourceDigest: {
            ...manifest.payload.launchSourceDigest,
            launchEnvelopeDigest: "c".repeat(64),
          },
        })
      )
    ).toThrow("launchEnvelopeDigest is inconsistent");
    expect(() =>
      parseStudioRunGenerationManifest(
        buildStudioRunGenerationManifest({
          ...manifest.payload,
          request: {
            ...manifest.payload.request,
            setupConfig: {
              gameOptions: {},
              playerOptions: [{ playerId: 0, options: {} }],
              extra: true,
            },
          },
        })
      )
    ).toThrow("Invalid StudioRunGenerationManifest");
  });

  test("writes exactly one manifest under the request workspace", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-generation-manifest-"));
    try {
      const requestId = "studio-run-in-game-write";
      const written = await writeStudioRunGenerationManifest({
        requestId,
        prepared: preparedRequest(),
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

      await expect(
        writeStudioRunGenerationManifest({ requestId, prepared: preparedRequest(), workspaceRoot })
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

function preparedRequest(
  overrides: Readonly<{
    config?: Record<string, unknown>;
  }> = {}
): RunInGamePreparedRequest {
  const config = overrides.config ?? {};
  const launchEnvelope = {
    recipeSettings: {
      recipe: "mod-swooper-maps/standard",
      seed: 43,
    },
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
    setupConfig: {
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    },
    source: {
      kind: "editor" as const,
      id: "studio-current",
      label: "Studio Current",
      mapScript: "{swooper-maps}/maps/studio-current.js",
      sortIndex: 9999,
    },
    config,
  };
  const launchEnvelopeDigest = "a".repeat(64);
  return {
    correlationDigest: "prepared-correlation",
    request: {
      recipeId: "mod-swooper-maps/standard",
      seed: 43,
      mapSize: "MAPSIZE_STANDARD",
      selectedConfigId: "studio-current",
      setupConfig: launchEnvelope.setupConfig,
      materializationMode: "disposable",
      resolvedLaunchSource: {
        kind: "editor",
        editorSessionId: "manifest-test-editor",
        configId: "studio-current",
        label: "Studio Current",
        mapScript: "{swooper-maps}/maps/studio-current.js",
        sortIndex: 9999,
        config,
      },
      launchEnvelope,
      launchSourceDigest: {
        configContentDigest: "b".repeat(64),
        launchEnvelopeDigest,
      },
      launchEnvelopeDigest,
    },
    resolvedLaunchSource: {
      kind: "editor",
      editorSessionId: "manifest-test-editor",
      configId: "studio-current",
      label: "Studio Current",
      mapScript: "{swooper-maps}/maps/studio-current.js",
      sortIndex: 9999,
      config,
    },
    launchEnvelope,
    launchSourceDigest: {
      configContentDigest: "b".repeat(64),
      launchEnvelopeDigest,
    },
    launchEnvelopeDigest,
  };
}
