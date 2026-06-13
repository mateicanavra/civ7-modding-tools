import { describe, expect, test } from "vitest";
import { Civ7DirectControlError } from "../src/direct-control-error";
import { validateMapLocation } from "../src/play/map/validation";
import {
  type CameraFocusDependencies,
  type Civ7CameraFocusResult,
  focusCiv7CameraOnPlot,
} from "../src/play/view/camera";
import { jsLiteral } from "../src/runtime/command-serialization";
import { probeHelperSource } from "../src/runtime/probe";
import { jsonPayloadFromCommandResult } from "../src/session/command-result";
import type { Civ7CommandResult } from "../src/session/types";

function commandResult(payload: unknown): Civ7CommandResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    output: [JSON.stringify(payload)],
  };
}

function cameraPayload(
  overrides: Partial<{
    centerPlot: { x: number; y: number } | null;
    lookAt: { ok: true; value: boolean } | { ok: false; error: string };
    target: { x: number; y: number };
    zoomLevel: number;
  }> = {}
) {
  const target = overrides.target ?? { x: 12, y: 34 };
  const centerPlot = overrides.centerPlot === undefined ? target : overrides.centerPlot;
  const snapshot = {
    exists: true,
    zoomLevel: { ok: true, value: overrides.zoomLevel ?? 0.4 },
    focusPoint: { ok: true, value: { x: 1.5, y: 2.5 } },
    centerPlot: { ok: true, value: centerPlot },
  };
  return {
    source: "app-ui-camera",
    target,
    targetIndex: { ok: true, value: target.y * 106 + target.x },
    options: { instantaneous: true },
    before: snapshot,
    lookAt: overrides.lookAt ?? { ok: true, value: true },
    after: snapshot,
    centerMatchesTarget:
      centerPlot !== null && centerPlot.x === target.x && centerPlot.y === target.y,
  };
}

function fakeDependencies(payloads: ReadonlyArray<unknown>): {
  dependencies: CameraFocusDependencies;
  commands: string[];
} {
  const commands: string[] = [];
  const queue = [...payloads];
  const dependencies: CameraFocusDependencies = {
    executeAppUiCommand: async ({ command }) => {
      commands.push(command);
      const payload = queue.shift();
      if (payload === undefined) throw new Error("fake exec exhausted");
      return commandResult(payload);
    },
    jsLiteral,
    parseCameraFocus: (result, label) =>
      jsonPayloadFromCommandResult<Civ7CameraFocusResult>(result, label),
    probeHelperSource,
    validateMapLocation,
  };
  return { dependencies, commands };
}

describe("focusCiv7CameraOnPlot", () => {
  test("command drives the engine Camera API and verifies the center plot, never DOM selectors", async () => {
    const { dependencies, commands } = fakeDependencies([cameraPayload()]);
    const result = await focusCiv7CameraOnPlot({ x: 12, y: 34 }, {}, dependencies);

    expect(commands).toHaveLength(1);
    const command = commands[0]!;
    expect(command).toContain("Camera.lookAtPlot(target, options)");
    expect(command).toContain("PlotCursor.plotCursorCoords = target");
    expect(command).toContain("Camera.pickPlot(0.5, 0.5)");
    expect(command).toContain("Camera.getState()");
    expect(command).not.toContain("querySelector");
    expect(command).not.toContain("dispatchEvent");

    expect(result.centerMatchesTarget).toBe(true);
    expect(result.source).toBe("app-ui-camera");
    expect(result.target).toEqual({ x: 12, y: 34 });
  });

  test("instantaneous defaults to true; zoom is embedded only when provided", async () => {
    const plain = fakeDependencies([cameraPayload()]);
    await focusCiv7CameraOnPlot({ x: 12, y: 34 }, {}, plain.dependencies);
    expect(plain.commands[0]).toContain('"instantaneous":true');
    expect(plain.commands[0]).not.toContain('"zoom"');

    const zoomed = fakeDependencies([cameraPayload({ zoomLevel: 0.25 })]);
    await focusCiv7CameraOnPlot(
      { x: 12, y: 34, zoom: 0.25, instantaneous: false },
      {},
      zoomed.dependencies
    );
    expect(zoomed.commands[0]).toContain('"zoom":0.25');
    expect(zoomed.commands[0]).toContain('"instantaneous":false');
  });

  test("a pending zoom triggers settle re-reads until the level matches the request", async () => {
    // The engine applies zoom asynchronously even for instantaneous moves —
    // the same-command readback still reports the previous level.
    const { dependencies, commands } = fakeDependencies([
      cameraPayload({ zoomLevel: 1 }),
      cameraPayload({ zoomLevel: 1 }),
      cameraPayload({ zoomLevel: 0.25 }),
    ]);
    const result = await focusCiv7CameraOnPlot({ x: 12, y: 34, zoom: 0.25 }, {}, dependencies);
    expect(commands).toHaveLength(3);
    expect(result.centerMatchesTarget).toBe(true);
    expect(result.after.zoomLevel).toEqual({ ok: true, value: 0.25 });
  });

  test("an unsettled zoom returns the last readback truth after the retry budget", async () => {
    const { dependencies, commands } = fakeDependencies(
      Array.from({ length: 5 }, () => cameraPayload({ zoomLevel: 1 }))
    );
    const result = await focusCiv7CameraOnPlot({ x: 12, y: 34, zoom: 0.25 }, {}, dependencies);
    // 1 move + 4 settle reads, then the loop gives up and reports truth.
    expect(commands).toHaveLength(5);
    expect(result.centerMatchesTarget).toBe(true);
    expect(result.after.zoomLevel).toEqual({ ok: true, value: 1 });
  });

  test("animated miss re-reads the settled state and verifies against it", async () => {
    const target = { x: 12, y: 34 };
    const { dependencies, commands } = fakeDependencies([
      cameraPayload({ target, centerPlot: { x: 0, y: 0 } }),
      cameraPayload({ target }),
    ]);
    const result = await focusCiv7CameraOnPlot(
      { x: 12, y: 34, instantaneous: false },
      {},
      dependencies
    );
    expect(commands).toHaveLength(2);
    // The settle pass only reads state — it must not re-issue the move.
    expect(commands[1]).not.toContain("Camera.lookAtPlot(target, options)");
    expect(result.centerMatchesTarget).toBe(true);
  });

  test("center miss without a successful lookAt reports unverified, no settle retry", async () => {
    const { dependencies, commands } = fakeDependencies([
      cameraPayload({
        centerPlot: { x: 0, y: 0 },
        lookAt: { ok: false, error: "Camera.lookAtPlot unavailable" },
      }),
    ]);
    const result = await focusCiv7CameraOnPlot({ x: 12, y: 34 }, {}, dependencies);
    expect(commands).toHaveLength(1);
    expect(result.centerMatchesTarget).toBe(false);
    expect(result.lookAt).toEqual({ ok: false, error: "Camera.lookAtPlot unavailable" });
  });

  test("rejects out-of-range zoom and invalid plot coordinates before touching the game", async () => {
    const { dependencies, commands } = fakeDependencies([]);
    await expect(
      focusCiv7CameraOnPlot({ x: 12, y: 34, zoom: 1.5 }, {}, dependencies)
    ).rejects.toThrow(Civ7DirectControlError);
    await expect(focusCiv7CameraOnPlot({ x: -1, y: 34 }, {}, dependencies)).rejects.toThrow(
      Civ7DirectControlError
    );
    expect(commands).toHaveLength(0);
  });
});
