import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, test } from "bun:test";

import {
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "../../packages/civ7-map-policy/src/index.js";
import type { FinalSurfaceParityProof } from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";
import {
  buildRiverVisibleProofOutput,
  buildRiverVisibleProofOutputWithDirectControlCapture,
  extractFinalSurfaceParityProof,
} from "./verify-river-visible-proof";

describe("river visible proof verifier", () => {
  test("passes only when exact authorship, direct-control camera, closure-capable capture, and same-run river samples are bound", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "river.png");
      writeFileSync(screenshot, "fake image bytes");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 1],
          liveTerrain: [0, 1, 0, 1],
          liveNavigable: [0, 1, 0, 0],
        }),
        runIdentity: runIdentity(),
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: screenshot,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "fake image bytes",
        }),
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
      expect(output.proof.runIdentity).toMatchObject({
        status: "bound",
        manifest: {
          branch: "codex/river-visible-proof",
          commit: "abcdef1234567890",
          requestId: "studio-run-in-game-test",
          configHash: "config-hash",
          envelopeHash: "envelope-hash",
          seed: 42,
          mapSize: "Standard",
          dimensions: { width: 2, height: 2 },
          dirtyState: "clean",
        },
      });
      expect(output.proof.materialization).toEqual({
        disposition: "terrain-only",
        terrainReadbackStatus: "pass",
        metadataReadbackStatus: "unresolved",
        minorRiverClaim: "not-claimed",
        blockedBy: [],
      });
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
          riverType: RIVER_TYPE_NAVIGABLE,
          connectedToOcean: true,
          plotIndex: 1,
        },
      ]);
      expect(output.proof.camera).toMatchObject({
        status: "bound-to-sample",
        source: "direct-control",
        target: { x: 1, y: 0 },
        focusProof: {
          source: "app-ui-camera",
          target: { x: 1, y: 0 },
          lookAt: { ok: true, value: true },
          afterCenterPlot: { ok: true, value: { x: 1, y: 0 } },
        },
      });
      expect(output.proof.screenshots.status).toBe("bound");
      expect(output.proof.screenshots.items[0]).toMatchObject({
        path: screenshot,
        sha256: createHash("sha256").update("fake image bytes").digest("hex"),
        captureMode: "direct-control",
        target: { x: 1, y: 0 },
        dimensions: { width: 1280, height: 720 },
      });
      expect(output.proof.visualVerdict).toEqual({
        status: "visible",
        source: "manual-review",
      });
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("runs direct-control camera and native screenshot capture into closure artifacts", async () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "native-river.png");
      writeMinimalPng(screenshot, 1280, 720);
      const output = await buildRiverVisibleProofOutputWithDirectControlCapture({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 1],
          liveTerrain: [0, 1, 0, 1],
          liveNavigable: [0, 1, 0, 0],
        }),
        runIdentity: runIdentity(),
        artifactDir: temp,
        visibilityState: "revealed",
        verdict: "visible",
        verdictSource: "manual-review",
        now: () => new Date("2026-06-10T09:00:00.000Z"),
        dependencies: {
          now: () => new Date("2026-06-10T09:00:00.000Z"),
          focusCamera: async (input) => cameraProof({ x: input.x, y: input.y }),
          captureScreenshot: async (input) => screenshotCaptureResult({
            path: screenshot,
            target: input.target,
            cameraProofHash: input.cameraProofHash,
            status: "path-returned",
          }),
        },
      });

      expect(output.ok).toBe(true);
      expect(output.status).toBe("visible");
      expect(output.artifacts).toMatchObject({
        selectedTarget: { x: 1, y: 0 },
        nativeCaptureStatus: "path-returned",
        screenshotPath: screenshot,
      });
      expect(output.artifacts?.cameraProofPath && existsSync(output.artifacts.cameraProofPath)).toBe(true);
      expect(output.artifacts?.nativeCaptureResultPath && existsSync(output.artifacts.nativeCaptureResultPath)).toBe(true);
      expect(output.artifacts?.captureProofPath && existsSync(output.artifacts.captureProofPath)).toBe(true);
      expect(output.proof.screenshots.status).toBe("bound");
      expect(output.proof.screenshots.items[0]).toMatchObject({
        path: screenshot,
        captureMode: "direct-control",
        target: { x: 1, y: 0 },
        dimensions: { width: 1280, height: 720 },
      });
      expect(JSON.parse(readFileSync(output.artifacts!.captureProofPath!, "utf8"))).toMatchObject({
        path: screenshot,
        captureMode: "direct-control",
        target: { x: 1, y: 0 },
        dimensions: { width: 1280, height: 720 },
      });
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("keeps direct-control native screenshot requests blocked when Civ returns no file path", async () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const output = await buildRiverVisibleProofOutputWithDirectControlCapture({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 1],
          liveTerrain: [0, 1, 0, 1],
        }),
        runIdentity: runIdentity(),
        artifactDir: temp,
        verdict: "visible",
        verdictSource: "manual-review",
        dependencies: {
          now: () => new Date("2026-06-10T09:00:00.000Z"),
          focusCamera: async (input) => cameraProof({ x: input.x, y: input.y }),
          captureScreenshot: async (input) => screenshotCaptureResult({
            path: null,
            target: input.target,
            cameraProofHash: input.cameraProofHash,
            status: "path-unavailable",
          }),
        },
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.artifacts).toMatchObject({
        selectedTarget: { x: 1, y: 0 },
        nativeCaptureStatus: "path-unavailable",
      });
      expect(output.artifacts?.captureProofPath).toBeUndefined();
      expect(output.proof.blockedBy).toContain("river-visible.capture-proof");
      expect(output.proof.blockedBy).toContain("river-visible.screenshot");
      expect(output.proof.screenshots.status).toBe("missing");
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

  test("blocks when run identity conflicts with final-surface parity identity", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "wrong-run.png");
      writeFileSync(screenshot, "wrong run");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        runIdentity: {
          ...runIdentity(),
          requestId: "other-run",
        },
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: screenshot,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "wrong run",
        }),
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.runIdentity.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.run-identity.request-id-mismatch");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks run identity from the wrong generated seed", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "wrong-seed.png");
      writeFileSync(screenshot, "wrong seed");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        runIdentity: {
          ...runIdentity(),
          seed: 41,
        },
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: screenshot,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "wrong seed",
        }),
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.runIdentity.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.run-identity.seed-mismatch");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks run identity from the wrong generated map dimensions", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "wrong-map.png");
      writeFileSync(screenshot, "wrong map");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        runIdentity: {
          ...runIdentity(),
          dimensions: { width: 3, height: 2 },
        },
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: screenshot,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "wrong map",
        }),
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.runIdentity.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.run-identity.width-mismatch");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
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

  test("blocks minor-river claims when materialization is terrain-only", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "minor-claim.png");
      writeFileSync(screenshot, "minor claim");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        runIdentity: runIdentity(),
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: screenshot,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "minor claim",
        }),
        minorRiverClaim: "claimed",
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.materialization).toMatchObject({
        disposition: "terrain-only",
        minorRiverClaim: "claimed",
      });
      expect(output.proof.blockedBy).toContain("river-visible.minor-river-claim-metadata-evidence");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks direct-control camera labels without a direct-control camera proof packet", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "label-only.png");
      writeFileSync(screenshot, "label only");

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
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.camera.source).toBe("direct-control");
      expect(output.proof.blockedBy).toContain("river-visible.camera-proof");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks direct-control capture labels without a capture manifest", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "capture-label-only.png");
      writeFileSync(screenshot, "capture label only");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraProof: cameraProof({ x: 1, y: 0 }),
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.camera.source).toBe("direct-control");
      expect(output.proof.blockedBy).toContain("river-visible.capture-proof");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  test("blocks capture manifests that prove a different screenshot file", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "reviewed.png");
      const captured = join(temp, "captured.png");
      writeFileSync(screenshot, "reviewed bytes");
      writeFileSync(captured, "captured bytes");
      const focusProof = cameraProof({ x: 1, y: 0 });

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        runIdentity: runIdentity(),
        screenshots: [screenshot],
        cameraProof: focusProof,
        captureProof: captureProof({
          path: captured,
          target: { x: 1, y: 0 },
          cameraProof: focusProof,
          bytes: "captured bytes",
        }),
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.screenshots.status).toBe("capture-mismatch");
      expect(output.proof.screenshots.items[0]?.captureProofHash).toBeUndefined();
      expect(output.proof.blockedBy).toContain("river-visible.capture-proof-screenshot");
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

  test("blocks camera proof packets that are not centered on the sampled river target", () => {
    const temp = mkdtempSync(join(tmpdir(), "river-visible-proof-"));
    try {
      const screenshot = join(temp, "wrong-center.png");
      writeFileSync(screenshot, "wrong center");

      const output = buildRiverVisibleProofOutput({
        parity: parityProof({
          terrainReadbackStatus: "pass",
          exactAuthorshipStatus: "pass",
          projected: [0, 1, 0, 0],
          liveTerrain: [0, 1, 0, 0],
        }),
        screenshots: [screenshot],
        cameraTarget: { x: 1, y: 0 },
        cameraProof: {
          ...cameraProof({ x: 1, y: 0 }),
          after: {
            ...cameraProof({ x: 1, y: 0 }).after,
            centerPlot: { ok: true, value: { x: 0, y: 1 } },
          },
        },
        verdict: "visible",
        verdictSource: "manual-review",
        captureMode: "direct-control",
      });

      expect(output.ok).toBe(false);
      expect(output.status).toBe("blocked");
      expect(output.proof.blockedBy).toContain("river-visible.camera-proof-center-plot");
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
        riverType: {
          width,
          height,
          values: [RIVER_TYPE_MINOR, RIVER_TYPE_NAVIGABLE, RIVER_TYPE_MINOR, RIVER_TYPE_NAVIGABLE],
        },
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
                  riverType: RIVER_TYPE_NAVIGABLE,
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

function cameraProof(target: { x: number; y: number }) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    source: "app-ui-camera" as const,
    target,
    targetIndex: { ok: true as const, value: target.y * 2 + target.x },
    options: { instantaneous: true, zoom: 0.4 },
    before: {
      exists: true,
      zoomLevel: { ok: true as const, value: 1 },
      focusPoint: { ok: true as const, value: { x: 0, y: 0 } },
      centerPlot: { ok: true as const, value: { x: 0, y: 0 } },
    },
    lookAt: { ok: true as const, value: true },
    plotCursor: { ok: true as const, value: target },
    after: {
      exists: true,
      zoomLevel: { ok: true as const, value: 0.4 },
      focusPoint: { ok: true as const, value: target },
      centerPlot: { ok: true as const, value: target },
    },
  };
}

function captureProof(args: {
  path: string;
  target: { x: number; y: number };
  cameraProof: ReturnType<typeof cameraProof>;
  bytes: string;
}) {
  return {
    path: args.path,
    sha256: createHash("sha256").update(args.bytes).digest("hex"),
    sizeBytes: Buffer.byteLength(args.bytes),
    captureMode: "direct-control" as const,
    target: args.target,
    cameraProofHash: proofHash(args.cameraProof),
    capturedAt: "2026-06-09T20:00:01.000Z",
    tool: "@civ7/direct-control",
    dimensions: { width: 1280, height: 720 },
  };
}

function screenshotCaptureResult(args: {
  path: string | null;
  target: { x: number; y: number } | undefined;
  cameraProofHash: string | undefined;
  status: "path-returned" | "path-unavailable";
}) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    source: "app-ui-xr-world-screenshot",
    api: "XR.World.takeScreenshot",
    captureMode: "direct-control",
    requestedAt: "2026-06-10T09:00:00.000Z",
    ...(args.target === undefined ? {} : { target: args.target }),
    ...(args.cameraProofHash === undefined ? {} : { cameraProofHash: args.cameraProofHash }),
    availability: { ok: true, value: true },
    request: {
      ok: true,
      value: {
        returnedType: args.path === null ? "undefined" : "string",
        path: args.path,
      },
    },
    closureManifestStatus: args.status,
  } as const;
}

function writeMinimalPng(path: string, width: number, height: number): void {
  const bytes = Buffer.alloc(24);
  bytes[0] = 0x89;
  bytes[1] = 0x50;
  bytes[2] = 0x4e;
  bytes[3] = 0x47;
  bytes[4] = 0x0d;
  bytes[5] = 0x0a;
  bytes[6] = 0x1a;
  bytes[7] = 0x0a;
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  writeFileSync(path, bytes);
}

function runIdentity() {
  return {
    branch: "codex/river-visible-proof",
    commit: "abcdef1234567890",
    worktree: "/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mapgen-physical-rivers",
    dirtyState: "clean" as const,
    requestId: "studio-run-in-game-test",
    configHash: "config-hash",
    envelopeHash: "envelope-hash",
    seed: 42,
    mapSize: "Standard",
    dimensions: { width: 2, height: 2 },
    createdAt: "2026-06-09T20:00:02.000Z",
    source: "test-run-identity",
  };
}

function proofHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
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
