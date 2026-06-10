import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, test } from "bun:test";

import type { FinalSurfaceParityProof } from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";
import {
  buildRiverVisibleProofOutput,
  extractFinalSurfaceParityProof,
} from "./verify-river-visible-proof";

describe("river visible proof verifier", () => {
  test("passes only when exact authorship, direct-control camera, closure-capable capture, and same-run river samples are bound", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "river.png");
      writeFileSync(screenshot, "fake image bytes");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 1],
          liveTerrain: [0, 1, 0, 1],
          liveNavigable: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 1, y: 0 },
        cameraSource: "direct-control",
        cameraZoom: "river-review",
        visibilityState: "revealed",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
        now: () => new Date("2026-06-09T20:00:00.000Z"),
      });

      expect(output.ok).toBe(true);
      expect(output.status).toBe("visible");
      expect(output.proof.blockedBy).toEqual([]);
      expect(output.proof.liveRiverSamples).toMatchObject({
        status: "selected",
        totalLiveTerrainNavigableRiverTiles: 2,
        totalProjectedNavigableTerrainTiles: 2,
        sampleCount: 2,
      });
      expect(output.proof.nativeRiverObjects).toMatchObject({
        status: "present",
        numRivers: 1,
        sampledPlotCount: 2,
        samplesWithPlots: 1,
      });
      expect(output.proof.liveRiverSamples.samples[0]?.nativeRiverObjects).toEqual([
        {
          riverIndex: 0,
          riverType: 1,
          connectedToOcean: true,
          plotIndex: 1,
        },
      ]);
      expect(output.proof.camera).toMatchObject({
        status: "bound-to-sample",
        source: "direct-control",
        target: { x: 1, y: 0 },
      });
      expect(output.proof.screenshots.status).toBe("bound");
      expect(output.proof.screenshots.items[0]).toMatchObject({
        path: screenshot,
        sha256: createHash("sha256").update("fake image bytes").digest("hex"),
        captureMode: "direct-control",
        target: { x: 1, y: 0 },
      });
      expect(output.proof.visualVerdict).toEqual({
        status: "visible",
        source: "manual-review",
      });
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks screenshots that are not tied to a sampled live river tile", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "off-target.png");
      writeFileSync(screenshot, "off target");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 0, y: 1 },
        cameraSource: "direct-control",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.camera.status).toBe("target-not-sampled");
      expect(output.proof.screenshots.status).toBe("target-not-sampled");
      expect(output.proof.blockedBy).toContain("river-visible.camera-target-sampled-live-river");
      expect(output.proof.blockedBy).toContain("river-visible.screenshot-target");
      expect(output.proof.screenshots.items).toEqual([]);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks when live terrain readback has no navigable river samples", () => {
    const output = buildRiverVisibleProofOutput({
      parity: parityProof({
        terrainReadbackStatus: "pass",
        exactAuthorshipStatus: "pass",
        projected: [0, 0, 0, 0],
        liveTerrain: [0, 0, 0, 0],
      }),
      cameraTarget: { x: 1, y: 0 },
      cameraSource: "direct-control",
      verdict: "visible",
      verdictSource: "manual-review",
      captureMode: "direct-control",
    });

    expect(output.ok).toBe(false);
    expect(output.status).toBe("blocked");
    expect(output.proof.liveRiverSamples.status).toBe("missing");
    expect(output.proof.blockedBy).toContain("river-visible.live-terrain-river-samples");
  });

  test("blocks when native MapRivers has no river objects for sampled river terrain", () => {
    const output = buildRiverVisibleProofOutput({
      parity: parityProof({
        terrainReadbackStatus: "pass",
        exactAuthorshipStatus: "pass",
        projected: [0, 1, 0, 0],
        liveTerrain: [0, 1, 0, 0],
        nativeRiverCount: 0,
      }),
      cameraTarget: { x: 1, y: 0 },
      cameraSource: "direct-control",
      verdict: "visible",
      verdictSource: "manual-review",
      captureMode: "direct-control",
    });

    expect(output.ok).toBe(false);
    expect(output.status).toBe("blocked");
    expect(output.proof.nativeRiverObjects).toMatchObject({
      status: "zero-rivers",
      numRivers: 0,
    });
    expect(output.proof.blockedBy).toContain("river-visible.native-river-objects-present");
  });

  test("blocks when camera target is live river terrain but not a native river object plot", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "unbound-native.png");
      writeFileSync(screenshot, "unbound native");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 1],
          liveTerrain: [0, 1, 0, 1],
          nativeRiverPlots: [3],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 1, y: 0 },
        cameraSource: "direct-control",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.camera.status).toBe("bound-to-sample");
      expect(output.proof.liveRiverSamples.samples[0]?.nativeRiverObjects).toEqual([]);
      expect(output.proof.blockedBy).toContain("river-visible.camera-target-native-river-object");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks when final-surface terrain readback did not pass", () => {
    const output = buildRiverVisibleProofOutput({
      parity: parityProof({
        terrainReadbackStatus: "fail",
        exactAuthorshipStatus: "pass",
        projected: [0, 1, 0, 0],
        liveTerrain: [0, 1, 0, 0],
      }),
      cameraTarget: { x: 1, y: 0 },
      cameraSource: "direct-control",
      verdict: "visible",
      verdictSource: "manual-review",
      captureMode: "direct-control",
    });

    expect(output.ok).toBe(false);
    expect(output.status).toBe("blocked");
    expect(output.proof.blockedBy).toContain("final-surface-parity.terrain-readback-pass");
  });

  test("blocks when exact authorship did not pass", () => {
    const output = buildRiverVisibleProofOutput({
      parity: parityProof({
        terrainReadbackStatus: "pass",
        exactAuthorshipStatus: "fail",
        projected: [0, 1, 0, 0],
        liveTerrain: [0, 1, 0, 0],
      }),
      cameraTarget: { x: 1, y: 0 },
      cameraSource: "direct-control",
      verdict: "visible",
      verdictSource: "manual-review",
      captureMode: "direct-control",
    });

    expect(output.ok).toBe(false);
    expect(output.status).toBe("blocked");
    expect(output.proof.blockedBy).toContain("final-surface-parity.exact-authorship-pass");
  });

  test("blocks manual-file capture as non-closure evidence", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "manual.png");
      writeFileSync(screenshot, "manual bytes");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 1, y: 0 },
        cameraSource: "direct-control",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "manual-file",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.capture-mode-closure-capable");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks non-direct-control camera sources for closure-capable proof", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "fallback.png");
      writeFileSync(screenshot, "fallback bytes");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 1, y: 0 },
        cameraSource: "manual",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "os-fallback",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.camera-source-direct-control");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("extracts proof from verifier output envelopes", () => {
    const proof = parityProof({
      terrainReadbackStatus: "pass",
      projected: [0, 1, 0, 0],
      liveTerrain: [0, 1, 0, 0],
    });

    expect(extractFinalSurfaceParityProof({ proof })).toBe(proof);
    expect(extractFinalSurfaceParityProof(proof)).toBe(proof);
  });
});

function parityProof(args: {
  terrainReadbackStatus: "pass" | "fail" | "unresolved" | "out-of-scope";
  exactAuthorshipStatus?: "pass" | "fail" | "unresolved" | "out-of-scope";
  projected: ReadonlyArray<number | null>;
  liveTerrain: ReadonlyArray<number | null>;
  liveNavigable?: ReadonlyArray<number | null>;
  nativeRiverCount?: number | null;
  nativeRiverBlockedBy?: ReadonlyArray<string>;
  nativeRiverPlots?: ReadonlyArray<number>;
}): FinalSurfaceParityProof {
  const width = 2;
  const height = 2;
  const nativeRiverCount = args.nativeRiverCount ?? (args.liveTerrain.includes(1) ? 1 : 0);
  const nativeRiverPlots = args.nativeRiverPlots ?? [1, 3];
  return {
    status: "complete",
    createdAt: "2026-06-09T20:00:00.000Z",
    exactAuthorshipSummary: {
      requestId: "studio-run-in-game-test",
      status: "complete",
      configHash: "config-hash",
      envelopeHash: "envelope-hash",
      seed: 42,
      mapSize: "Standard",
      dimensions: { width, height },
      runtime: { seed: 42, width, height, turn: 1, gameHash: 123 },
    },
    local: {
      source: "local-mapgen",
      width,
      height,
      seed: 42,
      configHash: "config-hash",
      envelopeHash: "envelope-hash",
      surfaces: emptySurfaces(width, height),
      riverMetadata: {
        width,
        height,
        projectedNavigableTerrain: { width, height, values: args.projected },
      },
    },
    live: {
      source: "live-civ7",
      width,
      height,
      seed: 42,
      configHash: "config-hash",
      envelopeHash: "envelope-hash",
      surfaces: emptySurfaces(width, height),
      riverMetadata: {
        width,
        height,
        terrainNavigableRiver: { width, height, values: args.liveTerrain },
        navigableRiver: { width, height, values: args.liveNavigable ?? args.liveTerrain },
        riverType: { width, height, values: [0, 1, 0, 1] },
      },
      nativeRiverObjects: {
        exists: args.nativeRiverBlockedBy === undefined,
        numRivers: args.nativeRiverBlockedBy === undefined ? nativeRiverCount : null,
        sampleCount: nativeRiverCount && nativeRiverCount > 0 ? 1 : 0,
        ...(nativeRiverCount && nativeRiverCount > 0
          ? {
              samples: [
                {
                  index: 0,
                  riverType: 1,
                  plotCount: nativeRiverPlots.length,
                  plotSampleCount: nativeRiverPlots.length,
                  plotTruncated: false,
                  plots: nativeRiverPlots.map((plotIndex) => ({
                    raw: plotIndex,
                    index: plotIndex,
                    location: { x: plotIndex % width, y: Math.floor(plotIndex / width) },
                  })),
                  connectedToOcean: true,
                },
              ],
            }
          : {}),
        ...(args.nativeRiverBlockedBy === undefined ? {} : { blockedBy: args.nativeRiverBlockedBy }),
      },
    },
    diffs: [],
    proofClaims: {
      version: 1,
      claims: {
        "exact-authorship": {
          label: "exact-authorship",
          status: args.exactAuthorshipStatus ?? "pass",
          reason: "test",
          evidenceLinks: [],
        },
        "hydrology-truth": {
          label: "hydrology-truth",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "projection-plan": {
          label: "projection-plan",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "terrain-readback": {
          label: "terrain-readback",
          status: args.terrainReadbackStatus,
          reason: "test",
          evidenceLinks: [],
        },
        "metadata-readback": {
          label: "metadata-readback",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "studio-visible": {
          label: "studio-visible",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "civ-rendered": {
          label: "civ-rendered",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "lake-final": {
          label: "lake-final",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "floodplain-active": {
          label: "floodplain-active",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
        "product-acceptance": {
          label: "product-acceptance",
          status: "unresolved",
          reason: "test",
          evidenceLinks: [],
        },
      },
    },
    residuals: [],
    unresolvedLinks: [],
  };
}

function emptySurfaces(width: number, height: number): FinalSurfaceParityProof["local"]["surfaces"] {
  const values = new Array<number>(width * height).fill(0);
  return {
    terrain: { width, height, values },
    biome: { width, height, values },
    feature: { width, height, values },
    resource: { width, height, values },
  };
}
