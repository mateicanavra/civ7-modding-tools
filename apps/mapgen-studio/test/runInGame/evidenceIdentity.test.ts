import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  RunInGameFileContentEvidence,
  RunInGameFileIdentity,
  RunInGameMaterializationStatus,
  RunInGameRequestStatus,
} from "@civ7/studio-server";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { describe, expect, it } from "vitest";
import {
  buildRunInGameExactAuthorshipEvidence,
  runInGameMaterializationScriptUnresolvedLinks,
} from "../../src/server/runInGame/authorshipEvidence";
import type { RunInGameDetailedExactAuthorshipEvidence } from "../../src/server/runInGame/evidenceTypes";
import {
  fileContentMarkerEvidence,
  fileIdentity,
  runInGameRequiredMaterializationMarkers,
} from "../../src/server/runInGame/fileEvidence";
import { parseSwooperMapgenLogEvidence } from "../../src/server/runInGame/swooperLogEvidence";

const requestId = "studio-run-in-game-test";
const configHash = "config-hash";
const launchEnvelopeDigest = "envelope-hash";
const mapScript = "{swooper-maps}/maps/studio-current.js";

describe("Run in Game exact authorship evidence identity", () => {
  it("hashes file content for deployed artifact identity", async () => {
    const dir = await mkdtemp(join(tmpdir(), "studio-evidence-"));
    try {
      const path = join(dir, "studio-current.js");
      await writeFile(path, "export const marker = 1;\n", "utf8");

      const identity = await fileIdentity({ repoRoot: dir, path });

      expect(identity.path).toBe("studio-current.js");
      expect(identity.sha256).toHaveLength(64);
      expect(identity.sizeBytes).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("proves required materialization markers from generated script content", async () => {
    const dir = await mkdtemp(join(tmpdir(), "studio-evidence-markers-"));
    try {
      const path = join(dir, "studio-current.js");
      await writeFile(
        path,
        [
          requestId,
          configHash,
          launchEnvelopeDigest,
          "map.rivers.authoredTerrainMaterialization",
          "POST-AUTHORED-RIVERS",
        ].join("\n"),
        "utf8"
      );

      const evidence = await fileContentMarkerEvidence({
        repoRoot: dir,
        path,
        markers: runInGameRequiredMaterializationMarkers({
          requestId,
          canonicalConfigDigest: configHash,
          launchEnvelopeDigest,
        }),
      });

      expect(evidence.path).toBe("studio-current.js");
      expect(evidence.markers.map((marker) => [marker.id, marker.present])).toEqual([
        ["run-request-id", true],
        ["run-canonical-config-digest", true],
        ["run-launch-envelope-digest", true],
        ["authored-river-materialization-trace", true],
        ["authored-river-materialization-checkpoint", true],
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("parses bounded Swooper evidence and completion log payloads for the same request chain", () => {
    const naturalWonderPlanInputPayload = {
      version: 2,
      plannerInput: {
        version: 1,
        dimensions: { width: 84, height: 54 },
        wondersCount: 7,
        engineConstants: {
          coastTerrainType: 3,
          mountainTerrainType: 0,
          iceFeatureType: 12,
          noFeatureType: -1,
        },
        featureCatalog: {
          count: 2,
          featureTypes: [35, 36],
          canonicalHash32: "abababab",
        },
        strategy: {
          id: "suitability-diversity",
          configCanonicalJson: '{"minSpacingTiles":6}',
          configHash32: "cdcdcdcd",
        },
        surfaceDigests: {
          version: 1,
          plotCount: 4536,
          landMaskHash32: "11111111",
          elevationHash32: "22222222",
          aridityIndexHash32: "33333333",
          riverClassHash32: "44444444",
          lakeMaskHash32: "55555555",
          vegetationDensityHash32: "66666666",
          effectiveMoistureHash32: "77777777",
          surfaceTemperatureHash32: "88888888",
          fertilityHash32: "99999999",
          dischargeHash32: "aaaaaaaa",
          slopeClassHash32: "bbbbbbbb",
          terrainTypeHash32: "cccccccc",
          biomeTypeHash32: "dddddddd",
          featureTypeHash32: "eeeeeeee",
          naturalWonderBlockedMaskHash32: "ffffffff",
        },
      },
      plannedCount: 2,
      rows: [
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
    };
    const logEvidence = parseSwooperMapgenLogEvidence({
      text: [
        `[mapgen-evidence] ${JSON.stringify({ requestId: "old", canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, dimensions: { width: 1, height: 1 } })}`,
        `[mapgen-evidence] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, mapSize: "MAPSIZE_STANDARD", dimensions: { width: 84, height: 54 } })}`,
        `[SWOOPER_MOD] FEATURE_APPLY_V1 ${JSON.stringify({
          attempted: 1434,
          applied: 1430,
          rejected: 4,
          rejectedCanHaveFeature: 4,
          attemptedByFeature: { FEATURE_TAIGA: 305, FEATURE_REEF: 11 },
          appliedByFeature: { FEATURE_TAIGA: 301, FEATURE_REEF: 11 },
          rejectedCanHaveFeatureByFeature: { FEATURE_TAIGA: 4 },
        })}`,
        `[SWOOPER_MOD] PLACEMENT_PARITY_V1 ${JSON.stringify({
          version: 1,
          waterDriftCount: 0,
          acceptedLakeTileCount: 63,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
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
          coordinateEvidence: {
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
          coordinateEvidence: {
            version: 1,
            plannedCount: 2,
            plannedHash32: "bbbbbbbb",
          },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V2 ${JSON.stringify(naturalWonderPlanInputPayload)}`,
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
          coordinateEvidence: {
            version: 1,
            placedCount: 6,
            placedHash32: "3c3530cb",
            rejectedCount: 1,
            rejectedHash32: "aaaaaaaa",
          },
          rejectedRows: [
            [
              "r",
              1320,
              60,
              15,
              35,
              0,
              120,
              "readback-mismatch",
              -1,
              1405,
              "partial-expected-footprint",
            ],
          ],
        })}`,
        `[mapgen-complete] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, mapSize: "MAPSIZE_STANDARD", dimensions: { width: 84, height: 54 } })}`,
      ].join("\n"),
      logPath: "/tmp/Scripting.log",
      observedAt: "2026-06-06T00:00:00.000Z",
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
    });

    expect(logEvidence).toMatchObject({
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      dimensions: { width: 84, height: 54 },
      matched: [
        "[mapgen-evidence]",
        requestId,
        configHash,
        launchEnvelopeDigest,
        "[mapgen-complete]",
      ],
    });
    expect(logEvidence?.featureApply).toMatchObject({
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
    expect(logEvidence?.placementParity).toMatchObject({
      marker: "PLACEMENT_PARITY_V1",
      version: 1,
      waterDriftCount: 0,
      acceptedLakeTileCount: 63,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 0,
    });
    expect(logEvidence?.resourcePlacement).toMatchObject({
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
      coordinateEvidence: {
        version: 1,
        placed: { count: 3, hash32: "3c3530cb" },
        rejected: { count: 1, hash32: "aaaaaaaa" },
      },
    });
    expect(logEvidence?.naturalWonderPlan).toMatchObject({
      marker: "NATURAL_WONDER_PLAN_V1",
      stats: {
        version: 1,
        wondersCount: 7,
        targetCount: 7,
        plannedCount: 2,
      },
      coordinateEvidence: {
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
    expect(logEvidence?.naturalWonderPlanInput).toEqual({
      marker: "NATURAL_WONDER_PLAN_INPUT_V2",
      payload: naturalWonderPlanInputPayload,
    });
    expect(logEvidence?.naturalWonderPlacement).toMatchObject({
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
      coordinateEvidence: {
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
    expect(
      parseSwooperMapgenLogEvidence({
        text: `[mapgen-evidence] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 41, dimensions: { width: 84, height: 54 } })}`,
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
    expect(
      parseSwooperMapgenLogEvidence({
        text: [
          `[mapgen-evidence] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, dimensions: { width: 84, height: 54 } })}`,
          `[mapgen-complete] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, dimensions: { width: 84, height: 55 } })}`,
        ].join("\n"),
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
    const lifecyclePayload = {
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      dimensions: { width: 84, height: 54 },
      recipePlan: {
        recipeId: "mod-swooper-maps/standard",
        planFingerprint: "plan-a",
        initialSetup: { definitionId: "mod-swooper-maps/standard", value: { gameSeed: 84 } },
      },
    };
    expect(
      parseSwooperMapgenLogEvidence({
        text: [
          `[mapgen-evidence] ${JSON.stringify(lifecyclePayload)}`,
          `[mapgen-complete] ${JSON.stringify({
            ...lifecyclePayload,
            recipePlan: { ...lifecyclePayload.recipePlan, planFingerprint: "plan-b" },
          })}`,
        ].join("\n"),
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
    expect(
      parseSwooperMapgenLogEvidence({
        text: [
          `[mapgen-evidence] ${JSON.stringify(lifecyclePayload)}`,
          `[mapgen-complete] ${JSON.stringify({
            ...lifecyclePayload,
            recipePlan: {
              ...lifecyclePayload.recipePlan,
              initialSetup: {
                ...lifecyclePayload.recipePlan.initialSetup,
                value: { gameSeed: 85 },
              },
            },
          })}`,
        ].join("\n"),
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
  });

  it("reassembles bounded lifecycle and product markers without crossing run boundaries", () => {
    const lifecyclePayload = {
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      dimensions: { width: 84, height: 54 },
      recipePlan: {
        initialSetup: {
          value: {
            aliveMajorPlayerIds: [7, 2, 11],
            options: {
              player: [7, 2, 11].map((playerId) => ({
                playerId,
                options: Array.from({ length: 32 }, (_, index) => ({
                  status: "unavailable",
                  key: `PlayerOption${index}`,
                  reason: "value-unavailable",
                })),
              })),
            },
          },
        },
      },
    };
    const featurePayload = {
      attempted: 1434,
      applied: 1430,
      rejected: 4,
      rejectedCanHaveFeature: 4,
      attemptedByFeature: Object.fromEntries(
        Array.from({ length: 64 }, (_, index) => [`FEATURE_TEST_${index}`, index + 1])
      ),
      appliedByFeature: { FEATURE_FOREST: 1430 },
      rejectedCanHaveFeatureByFeature: { FEATURE_FOREST: 4 },
    };
    const placementPayload = {
      version: 1,
      waterDriftCount: 0,
      acceptedLakeTileCount: 63,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 0,
    };
    const resourcePlacementPayload = {
      version: 1,
      plannedCount: 96,
      placedCount: 88,
      rejectedCount: 8,
      mismatchCount: 0,
      rejectionRows: Array.from({ length: 8 }, (_, index) => ({
        status: "rejected",
        resourceType: index + 1,
        resource: `RESOURCE_RUNTIME_IDENTITY_${index}_${"X".repeat(48)}`,
        plotIndex: 1_000 + index,
        x: 20 + index,
        y: 12 + index,
        reason: "can-have-resource-param-false",
      })),
    };
    const evidenceLines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "[mapgen-evidence]",
      payload: lifecyclePayload,
    });
    const completeLines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "[mapgen-complete]",
      payload: lifecyclePayload,
    });
    const featureLines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "FEATURE_APPLY_V1",
      payload: featurePayload,
    });
    const placementLines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "PLACEMENT_PARITY_V1",
      payload: placementPayload,
    });
    const resourcePlacementLines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "RESOURCE_PLACEMENT_V1",
      payload: resourcePlacementPayload,
    });
    const lines = [
      ...evidenceLines,
      ...featureLines,
      ...placementLines,
      ...resourcePlacementLines,
      ...completeLines,
    ];
    const engineObservedLines = lines.map((line) => line.slice(0, 1_022));

    const parsed = parseSwooperMapgenLogEvidence({
      text: engineObservedLines.join("\n"),
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
    });

    expect(evidenceLines.length).toBeGreaterThan(1);
    expect(featureLines.length).toBeGreaterThan(1);
    expect(resourcePlacementLines.length).toBeGreaterThan(1);
    expect(engineObservedLines).toEqual(lines);
    expect(parsed?.evidencePayload).toEqual(lifecyclePayload);
    expect(parsed?.completionPayload).toEqual(lifecyclePayload);
    expect(parsed?.featureApply?.payload).toEqual(featurePayload);
    expect(parsed?.placementParity?.payload).toEqual(placementPayload);
    expect(parsed?.resourcePlacement?.payload).toEqual(resourcePlacementPayload);

    const withoutOneEvidencePart = [
      evidenceLines[0]!,
      ...evidenceLines.slice(2),
      ...lines.slice(evidenceLines.length),
    ];
    expect(
      parseSwooperMapgenLogEvidence({
        text: withoutOneEvidencePart.join("\n"),
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
  });

  it("rejects the retired envelopeHash marker at the Swooper evidence boundary", () => {
    const retiredPayload = {
      requestId,
      canonicalConfigDigest: configHash,
      envelopeHash: launchEnvelopeDigest,
      seed: 42,
      dimensions: { width: 84, height: 54 },
    };

    expect(
      parseSwooperMapgenLogEvidence({
        text: [
          `[mapgen-evidence] ${JSON.stringify(retiredPayload)}`,
          `[mapgen-complete] ${JSON.stringify(retiredPayload)}`,
        ].join("\n"),
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
        seed: 42,
      })
    ).toBeUndefined();
  });

  it("ignores placement telemetry outside the matching evidence section", () => {
    const logEvidence = parseSwooperMapgenLogEvidence({
      text: [
        `[SWOOPER_MOD] PLACEMENT_PARITY_V1 ${JSON.stringify({
          version: 1,
          waterDriftCount: 0,
          acceptedLakeTileCount: 63,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        })}`,
        `[SWOOPER_MOD] FEATURE_APPLY_V1 ${JSON.stringify({
          attempted: 1,
          applied: 1,
          rejected: 0,
          rejectedCanHaveFeature: 0,
        })}`,
        `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify({
          version: 1,
          coordinateEvidence: { version: 1, placedCount: 4, placedHash32: "aaaaaaaa" },
        })}`,
        `[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify({
          version: 1,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          planRows: [["p", 0, 0, 0, 35, 0, 1, 1000000]],
          coordinateEvidence: { version: 1, plannedCount: 1, plannedHash32: "aaaaaaaa" },
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
        `[mapgen-evidence] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, dimensions: { width: 84, height: 54 } })}`,
        `[mapgen-complete] ${JSON.stringify({ requestId, canonicalConfigDigest: configHash, launchEnvelopeDigest, seed: 42, dimensions: { width: 84, height: 54 } })}`,
      ].join("\n"),
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
    });

    expect(logEvidence?.featureApply).toBeUndefined();
    expect(logEvidence?.placementParity).toBeUndefined();
    expect(logEvidence?.resourcePlacement).toBeUndefined();
    expect(logEvidence?.naturalWonderPlan).toBeUndefined();
    expect(logEvidence?.naturalWonderPlacement).toBeUndefined();
  });

  it("marks exact authorship complete only when every required identity and equality link resolves", () => {
    const evidence = buildRunInGameExactAuthorshipEvidence(completeEvidenceArgs());

    expect(evidence.status).toBe("complete");
    expect(evidence.unresolvedLinks).toEqual([]);
    expect(evidence.request).toMatchObject({ seed: 42, gameSeed: 84 });
    expect(evidence.civSetup).toMatchObject({ mapSeed: 42, gameSeed: 84 });
    expect(evidence.runtime).toMatchObject({
      seed: 42,
      width: 84,
      height: 54,
      gameHash: 123456,
      sourceSnapshotId: "live-runtime:abc",
    });
    expect(evidence).toMatchObject({
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest: launchEnvelopeDigest,
    });
    expect(Object.isFrozen(evidence)).toBe(true);
    expect(Object.isFrozen(evidence.request)).toBe(true);
    expect(Object.isFrozen(evidence.materialization)).toBe(true);
    expect(Object.isFrozen(evidence.log)).toBe(true);
    expect(Object.isFrozen(evidence.unresolvedLinks)).toBe(true);
  });

  it("requires the complete request-generated mod identity for exact authorship", () => {
    const args = completeEvidenceArgs();
    const evidence = buildRunInGameExactAuthorshipEvidence({
      ...args,
      materialization: {
        path: args.materialization.path,
        mapScript: args.materialization.mapScript,
        canonicalConfigDigest: args.materialization.canonicalConfigDigest,
        launchEnvelopeDigest: args.materialization.launchEnvelopeDigest,
        localModScript: args.materialization.localModScript,
        deployedModScript: args.materialization.deployedModScript,
        localModScriptContent: args.materialization.localModScriptContent,
        deployedModScriptContent: args.materialization.deployedModScriptContent,
      },
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toEqual(
      expect.arrayContaining([
        "materialization.generation-manifest-digest",
        "materialization.run-artifact-id",
        "materialization.generated-mod-root",
        "materialization.generated-mod-file-count",
        "materialization.generated-mod-digest",
        "materialization.map-row-id",
      ])
    );
  });

  it("keeps exact authorship unresolved when setup, runtime, log, or deployed content differs", () => {
    const args = completeEvidenceArgs();
    const evidence = buildRunInGameExactAuthorshipEvidence({
      ...args,
      lifecycleSetup: { ...args.lifecycleSetup, mapSeed: 43 },
      lifecycleRuntime: { ...args.lifecycleRuntime, seed: 43 },
      logEvidence: {
        ...args.logEvidence!,
        seed: 43,
        dimensions: { width: 84, height: 55 },
      },
      materialization: {
        ...args.materialization,
        deployedModScript: fileEvidence("deployed.js", "different-deployed-hash"),
      },
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toEqual(
      expect.arrayContaining([
        "civ-setup.map-seed-mismatch",
        "runtime.seed-mismatch",
        "swooper-log.seed-mismatch",
        "runtime.log-height-mismatch",
        "materialization.deployed-mod-script-hash-mismatch",
      ])
    );
  });

  it("keeps exact authorship unresolved when only the map-seed readback differs", () => {
    const args = completeEvidenceArgs();
    const evidence = buildRunInGameExactAuthorshipEvidence({
      ...args,
      lifecycleSetup: { ...args.lifecycleSetup, mapSeed: 43 },
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain("civ-setup.map-seed-mismatch");
    expect(evidence.unresolvedLinks).not.toContain("civ-setup.game-seed-mismatch");
  });

  it("keeps exact authorship unresolved when only the game-seed readback differs", () => {
    const args = completeEvidenceArgs();
    const evidence = buildRunInGameExactAuthorshipEvidence({
      ...args,
      lifecycleSetup: { ...args.lifecycleSetup, gameSeed: 85 },
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain("civ-setup.game-seed-mismatch");
    expect(evidence.unresolvedLinks).not.toContain("civ-setup.map-seed-mismatch");
  });

  it("keeps exact authorship unresolved when the deployed script lacks current river materialization markers", () => {
    const args = completeEvidenceArgs();
    const evidence = buildRunInGameExactAuthorshipEvidence({
      ...args,
      materialization: {
        ...args.materialization,
        deployedModScriptContent: contentEvidence(
          "/Users/test/Civ Mods/Swooper Maps/maps/studio-current.js",
          { "authored-river-materialization-checkpoint": false }
        ),
      },
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain(
      "materialization.deployed-mod-script-marker.authored-river-materialization-checkpoint"
    );
  });

  it("reports materialization script evidence gaps before starting Civ", () => {
    const args = completeEvidenceArgs();
    const links = runInGameMaterializationScriptUnresolvedLinks({
      materialization: {
        ...args.materialization,
        localModScriptContent: contentEvidence("different.js"),
        deployedModScriptContent: contentEvidence(
          "/Users/test/Civ Mods/Swooper Maps/maps/studio-current.js",
          { "run-request-id": false }
        ),
      },
      requiredMarkers: runInGameRequiredMaterializationMarkers({
        requestId,
        canonicalConfigDigest: configHash,
        launchEnvelopeDigest,
      }),
    });

    expect(links).toEqual(
      expect.arrayContaining([
        "materialization.local-mod-script-content-path-mismatch",
        "materialization.deployed-mod-script-marker.run-request-id",
      ])
    );
  });

  it("uses canonical lifecycle player count as exact-authorship readback", () => {
    const evidence = buildRunInGameExactAuthorshipEvidence(completeEvidenceArgs());

    expect(evidence.status).toBe("complete");
    expect(evidence.civSetup.playerCount).toBe(8);
    expect(evidence.unresolvedLinks).not.toContain("civ-setup.player-count-readback");
  });
});

function completeEvidenceArgs(): Parameters<typeof buildRunInGameExactAuthorshipEvidence>[0] {
  const request: RunInGameRequestStatus = {
    recipeId: "standard",
    seed: 42,
    gameSeed: 84,
    mapSize: "MAPSIZE_STANDARD",
    playerCount: 8,
    resources: "balanced",
    canonicalConfigDigest: configHash,
    launchEnvelopeDigest: launchEnvelopeDigest,
  };
  const materialization: RunInGameMaterializationStatus = {
    path: "plugins/mod/map/swooper-physics/src/maps/configs/studio-current.config.json",
    mapScript,
    canonicalConfigDigest: configHash,
    launchEnvelopeDigest,
    generationManifestDigest: "generation-manifest-digest",
    runArtifactId: "run-artifact-id",
    generatedModRoot: ".mapgen-studio/run-in-game/run-test/generated-mod",
    generatedModFileCount: 4,
    generatedModDigest: "generated-mod-digest",
    mapRowId: "MAP_STUDIO_RUN",
  };
  const localModScript = fileEvidence("mod/maps/studio-current.js", "same-deployed-js-hash");
  const deployedModScript = fileEvidence(
    "/Users/test/Civ Mods/Swooper Maps/maps/studio-current.js",
    localModScript.sha256
  );
  return {
    requestId,
    request,
    materialization: {
      ...materialization,
      localModScript,
      deployedModScript,
      localModScriptContent: contentEvidence(localModScript.path),
      deployedModScriptContent: contentEvidence(deployedModScript.path),
    },
    lifecycleSetup: {
      mapScript,
      mapSize: "MAPSIZE_STANDARD",
      mapSeed: 42,
      gameSeed: 84,
      playerCount: 8,
      targetModId: "mod-swooper-studio-run",
      mapRowFiles: [mapScript],
    },
    lifecycleRuntime: {
      seed: 42,
      mapSize: "MAPSIZE_STANDARD",
      width: 84,
      height: 54,
      plotCount: 4536,
      turn: 1,
      gameHash: 123456,
    },
    logEvidence: logEvidence(),
    liveRuntimeSnapshot: {
      snapshotId: "live-runtime:abc",
      snapshotHash: "live-runtime-hash",
      turn: 1,
      gameHash: 123456,
    },
    createdAt: "2026-06-06T00:00:00.000Z",
  };
}

function contentEvidence(
  path: string,
  overrides: Partial<Record<string, boolean>> = {}
): RunInGameFileContentEvidence {
  return {
    path,
    markers: runInGameRequiredMaterializationMarkers({
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
    }).map((marker) => ({
      id: marker.id,
      marker: marker.marker,
      present: overrides[marker.id] ?? true,
    })),
  };
}

function fileEvidence(path: string, sha256: string): RunInGameFileIdentity {
  return {
    path,
    sha256,
    sizeBytes: 100,
    mtimeMs: 1_780_704_000_000,
    mtimeIso: "2026-06-06T00:00:00.000Z",
  };
}

function logEvidence(): NonNullable<RunInGameDetailedExactAuthorshipEvidence["log"]> {
  return {
    logPath: "/tmp/Scripting.log",
    observedAt: "2026-06-06T00:00:00.000Z",
    requestId,
    canonicalConfigDigest: configHash,
    launchEnvelopeDigest,
    seed: 42,
    mapSize: "MAPSIZE_STANDARD",
    dimensions: { width: 84, height: 54 },
    evidencePayload: {
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
      dimensions: { width: 84, height: 54 },
    },
    completionPayload: {
      requestId,
      canonicalConfigDigest: configHash,
      launchEnvelopeDigest,
      seed: 42,
      dimensions: { width: 84, height: 54 },
    },
    matched: [
      "[mapgen-evidence]",
      requestId,
      configHash,
      launchEnvelopeDigest,
      "[mapgen-complete]",
    ],
  };
}
