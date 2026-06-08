import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  RunInGameExactAuthorshipProof,
  RunInGameFileIdentity,
  RunInGameMaterializationStatus,
  RunInGameRequestStatus,
  RunInGameSourceSnapshotProof,
} from "../../src/features/runInGame/status";
import {
  buildRunInGameExactAuthorshipProof,
  buildRunInGameSourceSnapshotProof,
  fileIdentity,
  parseDeployTargetDir,
  parseSwooperMapgenLogProof,
} from "../../src/server/runInGame/proofIdentity";

const requestId = "studio-run-in-game-test";
const configHash = "config-hash";
const envelopeHash = "envelope-hash";
const mapScript = "{swooper-maps}/maps/studio-current.js";

describe("Run in Game exact authorship proof identity", () => {
  it("hashes file content and parses the deployed target directory", async () => {
    const dir = await mkdtemp(join(tmpdir(), "studio-proof-"));
    try {
      const path = join(dir, "studio-current.js");
      await writeFile(path, "export const marker = 1;\n", "utf8");

      const identity = await fileIdentity({ repoRoot: dir, path });

      expect(identity.path).toBe("studio-current.js");
      expect(identity.sha256).toHaveLength(64);
      expect(identity.sizeBytes).toBeGreaterThan(0);
      expect(parseDeployTargetDir("ok\nDeployed to: /tmp/Civ Mods/Swooper Maps\n")).toBe("/tmp/Civ Mods/Swooper Maps");
      expect(parseDeployTargetDir("ok\n")).toBeNull();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("builds stable source snapshot identity from Studio-authored visible state", () => {
    const first = buildRunInGameSourceSnapshotProof({
      requestId,
      sourceSnapshot: {
        recipeSettings: { seed: 42, mapSize: "MAPSIZE_STANDARD" },
        worldSettings: { resources: "balanced" },
        pipelineConfig: { continents: { knobs: { landmassRatio: 0.42 } } },
      },
      configHash,
      envelopeHash,
    });
    const second = buildRunInGameSourceSnapshotProof({
      requestId,
      sourceSnapshot: {
        worldSettings: { resources: "balanced" },
        pipelineConfig: { continents: { knobs: { landmassRatio: 0.42 } } },
        recipeSettings: { mapSize: "MAPSIZE_STANDARD", seed: 42 },
      },
      configHash,
      envelopeHash,
    });

    expect(first?.identityHash).toBe(second?.identityHash);
    expect(first).toMatchObject({
      requestId,
      configHash,
      envelopeHash,
      recipeSettings: { seed: 42, mapSize: "MAPSIZE_STANDARD" },
      pipelineConfig: { continents: { knobs: { landmassRatio: 0.42 } } },
    });
    expect(buildRunInGameSourceSnapshotProof({
      requestId,
      sourceSnapshot: {
        recipeSettings: { seed: 42, mapSize: "MAPSIZE_STANDARD" },
        worldSettings: { resources: "balanced" },
        pipelineConfig: { continents: { knobs: { landmassRatio: 0.5 } } },
      },
      configHash,
      envelopeHash,
    })?.identityHash).not.toBe(first?.identityHash);
    expect(buildRunInGameSourceSnapshotProof({ requestId, sourceSnapshot: undefined, configHash, envelopeHash })).toBeUndefined();
  });

  it("parses bounded Swooper proof and completion log payloads for the same request chain", () => {
    const logProof = parseSwooperMapgenLogProof({
      text: [
        `[mapgen-proof] ${JSON.stringify({ requestId: "old", configHash, envelopeHash, seed: 42, dimensions: { width: 1, height: 1 } })}`,
        `[mapgen-proof] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, mapSize: "MAPSIZE_STANDARD", dimensions: { width: 84, height: 54 } })}`,
        `[SWOOPER_MOD] FEATURE_APPLY_V1 ${JSON.stringify({
          attempted: 1434,
          applied: 1430,
          rejected: 4,
          rejectedCanHaveFeature: 4,
          attemptedByFeature: { FEATURE_TAIGA: 305, FEATURE_REEF: 11 },
          appliedByFeature: { FEATURE_TAIGA: 301, FEATURE_REEF: 11 },
          rejectedCanHaveFeatureByFeature: { FEATURE_TAIGA: 4 },
        })}`,
        `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify({
          version: 1,
          plannedCount: 4,
          placedCount: 3,
          rejectedCount: 1,
          mismatchCount: 0,
          rejectionExampleCount: 1,
          rejectionExamples: [
            "status=rejected resource=RESOURCE_WINE resourceType=16 plot=67 x=12 y=3 reason=cannot-have-resource observed=-1",
          ],
          rejectionRows: [
            {
              status: "rejected",
              resourceType: 16,
              resource: "RESOURCE_WINE",
              plotIndex: 67,
              x: 12,
              y: 3,
              reason: "cannot-have-resource",
              observedResourceType: -1,
              phase: "scarce-floor",
              order: 9,
              initial: 16,
              preferred: 13,
              countBefore: 2,
              legalPlots: 128,
              targetMin: 7,
            },
          ],
          coordinateProof: {
            version: 1,
            placedCount: 3,
            placedHash32: "3c3530cb",
            rejectedCount: 1,
            rejectedHash32: "aaaaaaaa",
          },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify({
          version: 1,
          wondersCount: 7,
          targetCount: 7,
          plannedCount: 2,
          planRows: [
            ["p", 1320, 60, 15, 35, 0, 120, 610000],
            ["p", 1405, 61, 16, 36, 0, 90, 420000],
          ],
          coordinateProof: {
            version: 1,
            plannedCount: 2,
            plannedHash32: "bbbbbbbb",
          },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V1 ${JSON.stringify({
          version: 1,
          plannedCount: 2,
          inputRows: [
            ["p", 1320, 60, 15, 35, 2, 5, -1, 120, 330000, 1, 0, 0, 1],
            ["p", 1405, 61, 16, 36, 3, 5, -1, 90, 660000, 0, 1, 0, 1],
          ],
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify({
          version: 1,
          plannedCount: 7,
          targetCount: 7,
          placedCount: 7,
          terrainAdjustedCount: 0,
          skippedOutOfBoundsCount: 0,
          rejectedCount: 1,
          shortfallCount: 0,
          rejectionExampleCount: 1,
          rejectionExamples: ["feature=35 plot=1320 reason=adapter-rejected"],
          coordinateProof: {
            version: 1,
            placedCount: 6,
            placedHash32: "3c3530cb",
            rejectedCount: 1,
            rejectedHash32: "aaaaaaaa",
          },
          rejectedRows: [
            ["r", 1320, 60, 15, 35, 0, 120, "readback-mismatch", -1, 1405, "partial-expected-footprint"],
          ],
        })}`,
        `[mapgen-complete] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } })}`,
      ].join("\n"),
      logPath: "/tmp/Scripting.log",
      observedAt: "2026-06-06T00:00:00.000Z",
      requestId,
      configHash,
      envelopeHash,
      seed: 42,
    });

    expect(logProof).toMatchObject({
      requestId,
      configHash,
      envelopeHash,
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      dimensions: { width: 84, height: 54 },
      matched: ["[mapgen-proof]", requestId, configHash, envelopeHash, "[mapgen-complete]"],
    });
    expect(logProof?.featureApply).toMatchObject({
      marker: "FEATURE_APPLY_V1",
      stats: {
        attempted: 1434,
        applied: 1430,
        rejected: 4,
        rejectedCanHaveFeature: 4,
        attemptedByFeature: { FEATURE_REEF: 11, FEATURE_TAIGA: 305 },
        appliedByFeature: { FEATURE_REEF: 11, FEATURE_TAIGA: 301 },
        rejectedCanHaveFeatureByFeature: { FEATURE_TAIGA: 4 },
      },
    });
    expect(logProof?.resourcePlacement).toMatchObject({
      marker: "RESOURCE_PLACEMENT_V1",
      stats: {
        version: 1,
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        mismatchCount: 0,
        rejectionExampleCount: 1,
        rejectionExamples: [
          "status=rejected resource=RESOURCE_WINE resourceType=16 plot=67 x=12 y=3 reason=cannot-have-resource observed=-1",
        ],
        rejectionRows: [
          {
            status: "rejected",
            resourceType: 16,
            resource: "RESOURCE_WINE",
            plotIndex: 67,
            x: 12,
            y: 3,
            reason: "cannot-have-resource",
            observedResourceType: -1,
            assignmentPhase: "scarce-floor",
            assignmentOrder: 9,
            initialResourceType: 16,
            preferredResourceType: 13,
            perTypeCountBefore: 2,
            legalPlotCountForResource: 128,
            targetMinPerType: 7,
          },
        ],
      },
      coordinateProof: {
        version: 1,
        placed: { count: 3, hash32: "3c3530cb" },
        rejected: { count: 1, hash32: "aaaaaaaa" },
      },
    });
    expect(logProof?.naturalWonderPlan).toMatchObject({
      marker: "NATURAL_WONDER_PLAN_V1",
      stats: {
        version: 1,
        wondersCount: 7,
        targetCount: 7,
        plannedCount: 2,
      },
      coordinateProof: {
        version: 1,
        planned: { count: 2, hash32: "bbbbbbbb" },
      },
      planRows: [
        {
          plotIndex: 1320,
          x: 60,
          y: 15,
          featureType: 35,
          direction: 0,
          elevation: 120,
          priorityPpm: 610000,
        },
        {
          plotIndex: 1405,
          x: 61,
          y: 16,
          featureType: 36,
          direction: 0,
          elevation: 90,
          priorityPpm: 420000,
        },
      ],
    });
    expect(logProof?.naturalWonderPlanInput).toMatchObject({
      marker: "NATURAL_WONDER_PLAN_INPUT_V1",
      stats: {
        version: 1,
        plannedCount: 2,
        rowCount: 2,
      },
      inputRows: [
        {
          plotIndex: 1320,
          x: 60,
          y: 15,
          featureType: 35,
          terrainType: 2,
          biomeType: 5,
          occupiedFeatureType: -1,
          elevation: 120,
          aridityPpm: 330000,
          riverClass: 1,
          lakeMask: 0,
          blockedMask: 0,
          landMask: 1,
        },
        {
          plotIndex: 1405,
          x: 61,
          y: 16,
          featureType: 36,
          terrainType: 3,
          biomeType: 5,
          occupiedFeatureType: -1,
          elevation: 90,
          aridityPpm: 660000,
          riverClass: 0,
          lakeMask: 1,
          blockedMask: 0,
          landMask: 1,
        },
      ],
    });
    expect(logProof?.naturalWonderPlacement).toMatchObject({
      marker: "NATURAL_WONDER_PLACEMENT_V1",
      stats: {
        version: 1,
        plannedCount: 7,
        targetCount: 7,
        placedCount: 7,
        terrainAdjustedCount: 0,
        skippedOutOfBoundsCount: 0,
        rejectedCount: 1,
        shortfallCount: 0,
        rejectionExampleCount: 1,
        rejectionExamples: ["feature=35 plot=1320 reason=adapter-rejected"],
      },
      coordinateProof: {
        version: 1,
        placed: { count: 6, hash32: "3c3530cb" },
        rejected: { count: 1, hash32: "aaaaaaaa" },
      },
      coordinateRows: [
        {
          status: "rejected",
          featureType: 35,
          plotIndex: 1320,
          x: 60,
          y: 15,
          direction: 0,
          elevation: 120,
          reason: "readback-mismatch",
          observedFeatureType: -1,
          observedPlotIndex: 1405,
          expectedFootprintReadbackStatus: "partial-expected-footprint",
        },
      ],
    });
    expect(parseSwooperMapgenLogProof({
      text: `[mapgen-proof] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 41, dimensions: { width: 84, height: 54 } })}`,
      requestId,
      configHash,
      envelopeHash,
      seed: 42,
    })).toBeUndefined();
    expect(parseSwooperMapgenLogProof({
      text: [
        `[mapgen-proof] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } })}`,
        `[mapgen-complete] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 55 } })}`,
      ].join("\n"),
      requestId,
      configHash,
      envelopeHash,
      seed: 42,
    })).toBeUndefined();
  });

  it("ignores placement telemetry outside the matching proof section", () => {
    const logProof = parseSwooperMapgenLogProof({
      text: [
        `[SWOOPER_MOD] FEATURE_APPLY_V1 ${JSON.stringify({
          attempted: 1,
          applied: 1,
          rejected: 0,
          rejectedCanHaveFeature: 0,
        })}`,
        `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify({
          version: 1,
          coordinateProof: { version: 1, placedCount: 4, placedHash32: "aaaaaaaa" },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify({
          version: 1,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          planRows: [["p", 0, 0, 0, 35, 0, 1, 1000000]],
          coordinateProof: { version: 1, plannedCount: 1, plannedHash32: "aaaaaaaa" },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify({
          version: 1,
          plannedCount: 1,
          targetCount: 1,
          placedCount: 1,
          terrainAdjustedCount: 0,
          skippedOutOfBoundsCount: 0,
          rejectedCount: 0,
          shortfallCount: 0,
        })}`,
        `[mapgen-proof] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } })}`,
        `[mapgen-complete] ${JSON.stringify({ requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } })}`,
      ].join("\n"),
      requestId,
      configHash,
      envelopeHash,
      seed: 42,
    });

    expect(logProof?.featureApply).toBeUndefined();
    expect(logProof?.resourcePlacement).toBeUndefined();
    expect(logProof?.naturalWonderPlan).toBeUndefined();
    expect(logProof?.naturalWonderPlacement).toBeUndefined();
  });

  it("marks exact authorship complete only when every required identity and equality link resolves", () => {
    const proof = buildRunInGameExactAuthorshipProof(completeProofArgs());

    expect(proof.status).toBe("complete");
    expect(proof.unresolvedLinks).toEqual([]);
    expect(proof.runtime).toMatchObject({
      seed: 42,
      width: 84,
      height: 54,
      gameHash: 123456,
      sourceSnapshotId: "live-runtime:abc",
    });
  });

  it("keeps exact authorship unresolved when source snapshot body is not auditable", () => {
    const proof = buildRunInGameExactAuthorshipProof({
      ...completeProofArgs(),
      sourceSnapshot: {
        identityHash: "source-snapshot-hash",
        requestId,
        configHash,
        envelopeHash,
      },
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toEqual(expect.arrayContaining([
      "source-snapshot.recipe-settings",
      "source-snapshot.world-settings",
      "source-snapshot.pipeline-config",
      "source-snapshot.setup-config",
      "source-snapshot.materialization-mode",
      "source-snapshot.selected-config",
    ]));
  });

  it("keeps exact authorship unresolved when setup, runtime, log, or deployed content differs", () => {
    const args = completeProofArgs();
    const proof = buildRunInGameExactAuthorshipProof({
      ...args,
      setupSnapshot: setupSnapshot({ mapSeed: 43 }),
      startMapSummary: mapSummary({ seed: 43 }),
      logProof: {
        ...args.logProof!,
        seed: 43,
        dimensions: { width: 84, height: 55 },
      },
      deployedModScript: fileProof("deployed.js", "different-deployed-hash"),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toEqual(expect.arrayContaining([
      "civ-setup.map-seed-mismatch",
      "runtime.seed-mismatch",
      "swooper-log.seed-mismatch",
      "runtime.log-height-mismatch",
      "materialization.deployed-mod-script-hash-mismatch",
    ]));
  });

  it("uses setup config player count as exact-authorship readback", () => {
    const proof = buildRunInGameExactAuthorshipProof({
      ...completeProofArgs(),
      setupSnapshot: setupSnapshot({ includePlayerCountParameter: false }),
    });

    expect(proof.status).toBe("complete");
    expect(proof.civSetup.playerCount).toBe(8);
    expect(proof.unresolvedLinks).not.toContain("civ-setup.player-count-readback");
  });
});

function completeProofArgs(): Parameters<typeof buildRunInGameExactAuthorshipProof>[0] {
  const request: RunInGameRequestStatus = {
    recipeId: "mod-swooper-maps/standard",
    seed: 42,
    mapSize: "MAPSIZE_STANDARD",
    playerCount: 8,
    resources: "balanced",
    selectedConfigId: "studio-current",
    setupConfigSource: "request",
    fingerprint: "request-fingerprint",
  };
  const sourceSnapshot: RunInGameSourceSnapshotProof = {
    identityHash: "source-snapshot-hash",
    requestId,
    recipeSettings: {
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
    },
    worldSettings: {
      resources: "balanced",
    },
    pipelineConfig: {
      continents: {
        knobs: {
          landmassRatio: 0.42,
        },
      },
    },
    setupConfig: {
      gameOptions: {
        StartAge: "AGE_ANTIQUITY",
      },
    },
    materializationMode: "disposable",
    selectedConfig: {
      id: "studio-current",
      label: "Studio Current",
    },
    configHash,
    envelopeHash,
  };
  const materialization: RunInGameMaterializationStatus = {
    mode: "disposable",
    path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
    mapScript,
    configHash,
    envelopeHash,
  };
  const localModScript = fileProof("mod/maps/studio-current.js", "same-deployed-js-hash");
  return {
    requestId,
    request,
    sourceSnapshot,
    materialization,
    sourceConfig: fileProof("configs/studio-current.config.json", "source-config-hash"),
    generatedSourceScript: fileProof("generated/studio-current.ts", "generated-source-hash"),
    localModScript,
    deployedModScript: fileProof("/Users/test/Civ Mods/Swooper Maps/maps/studio-current.js", localModScript.sha256),
    rowProof: { rows: [{ file: mapScript }] },
    setupSnapshot: setupSnapshot(),
    startMapSummary: mapSummary(),
    logProof: logProof(),
    liveRuntimeSnapshot: {
      snapshotId: "live-runtime:abc",
      snapshotHash: "live-runtime-hash",
      turn: 1,
      gameHash: 123456,
    },
    createdAt: "2026-06-06T00:00:00.000Z",
  };
}

function fileProof(path: string, sha256: string): RunInGameFileIdentity {
  return {
    path,
    sha256,
    sizeBytes: 100,
    mtimeMs: 1_780_704_000_000,
    mtimeIso: "2026-06-06T00:00:00.000Z",
  };
}

function setupSnapshot(overrides: { mapSeed?: number; includePlayerCountParameter?: boolean } = {}): unknown {
  const parameters = [
    { id: "Map", exists: true, value: mapScript },
    { id: "MapSize", exists: true, value: "MAPSIZE_STANDARD" },
    { id: "MapRandomSeed", exists: true, value: overrides.mapSeed ?? 42 },
    { id: "GameRandomSeed", exists: true, value: 42 },
  ];
  if (overrides.includePlayerCountParameter !== false) {
    parameters.push({ id: "PlayerCount", exists: true, value: 8 });
  }
  return {
    setup: {
      parameters,
    },
    config: {
      playerCount: { ok: true, value: 8 },
    },
  };
}

function mapSummary(overrides: { seed?: number } = {}): unknown {
  return {
    map: {
      randomSeed: { ok: true, value: overrides.seed ?? 42 },
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
    },
    game: {
      turn: { ok: true, value: 1 },
      hash: { ok: true, value: 123456 },
    },
  };
}

function logProof(): NonNullable<RunInGameExactAuthorshipProof["log"]> {
  return {
    logPath: "/tmp/Scripting.log",
    observedAt: "2026-06-06T00:00:00.000Z",
    requestId,
    configHash,
    envelopeHash,
    seed: 42,
    mapSize: "MAPSIZE_STANDARD",
    dimensions: { width: 84, height: 54 },
    proofPayload: { requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } },
    completionPayload: { requestId, configHash, envelopeHash, seed: 42, dimensions: { width: 84, height: 54 } },
    matched: ["[mapgen-proof]", requestId, configHash, envelopeHash, "[mapgen-complete]"],
  };
}
