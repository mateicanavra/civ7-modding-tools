import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7CameraFocusFailedError,
  Civ7CameraFocusUnverifiedError,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type {
  Civ7ControlOrpcCameraFocusResult,
} from "../src/dependencies/direct-control";

describe("view.camera.focus control-oRPC procedure", () => {
  test("moves the camera and returns the flattened verified readback", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.view.camera.focus,
      { x: 12, y: 34, zoom: 0.25 },
      { context: fake.context },
    );
    expect(fake.cameraInputs).toEqual([{ x: 12, y: 34, zoom: 0.25 }]);
    expect(result).toEqual({
      target: { x: 12, y: 34 },
      zoom: 0.25,
      instantaneous: true,
      before: { zoomLevel: 0.25, centerPlot: { x: 0, y: 0 } },
      after: { zoomLevel: 0.25, centerPlot: { x: 12, y: 34 } },
      plotCursor: { x: 12, y: 34 },
      centerMatchesTarget: true,
    });
    // Endpoint/session identity never leaves the procedure boundary.
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("host");
    expect(serialized).not.toContain("port");
    expect(serialized).not.toContain("state");
  });

  test("passes instantaneous=false through and reports an unverified center as TRUTH, not an error", async () => {
    const fake = fakeContext({ cameraCenter: { x: 11, y: 34 } });
    const result = await call(
      Civ7ControlOrpcRouter.view.camera.focus,
      { x: 12, y: 34, instantaneous: false },
      { context: fake.context },
    );
    expect(fake.cameraInputs).toEqual([{ x: 12, y: 34, instantaneous: false }]);
    expect(result.centerMatchesTarget).toBe(false);
    expect(result.after.centerPlot).toEqual({ x: 11, y: 34 });
  });

  test("a move that never ran fails CAMERA_FOCUS_FAILED with the probe error", async () => {
    const fake = fakeContext({
      cameraLookAt: { ok: false, error: "Camera.lookAtPlot unavailable" },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.camera.focus,
        { x: 12, y: 34 },
        { context: fake.context },
      ),
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_FAILED",
      data: {
        procedureKey: "view.camera.focus",
        source: "direct-control-facade",
        detail: "Camera.lookAtPlot unavailable",
      },
    });
  });

  test("a facade error maps to CAMERA_FOCUS_FAILED with the message as detail", async () => {
    const fake = fakeContext({ cameraError: new Error("tuner socket closed") });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.camera.focus,
        { x: 12, y: 34 },
        { context: fake.context },
      ),
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_FAILED",
      data: { detail: "tuner socket closed" },
    });
  });

  test("rejects invalid plot/zoom input before any facade call", async () => {
    const invalidInputs = [
      { x: -1, y: 0 },
      { x: 0.5, y: 2 },
      { x: 12, y: 34, zoom: 1.5 },
      { x: 12 },
      { host: "127.0.0.1", x: 12, y: 34 },
    ];
    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(
          Civ7ControlOrpcRouter.view.camera.focus,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.cameraInputs).toEqual([]);
    }
  });

  test("publishes the contract-first camera leaf with typed errors", () => {
    expect(
      Civ7ControlOrpcContract.view.camera.focus["~orpc"],
    ).toMatchObject({
      meta: {
        family: "view",
        procedureKey: "view.camera.focus",
        proofBoundary: "local-package-test",
        risk: "runtime-support",
      },
    });
    const errorMap = Civ7ControlOrpcContract.view.camera.focus["~orpc"].errorMap;
    expect(errorMap).toHaveProperty("CAMERA_FOCUS_FAILED");
    expect(errorMap).toHaveProperty("CAMERA_FOCUS_UNVERIFIED");
    expect(Civ7CameraFocusFailedError.code).toBe("CAMERA_FOCUS_FAILED");
    expect(Civ7CameraFocusUnverifiedError.code).toBe("CAMERA_FOCUS_UNVERIFIED");
  });
});

function fakeContext(options: {
  cameraCenter?: { x: number; y: number } | null;
  cameraLookAt?: { ok: true; value: boolean } | { ok: false; error: string };
  cameraError?: Error;
} = {}): {
  context: Civ7ControlOrpcContext;
  cameraInputs: unknown[];
} {
  const cameraInputs: unknown[] = [];
  return {
    cameraInputs,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        focusCiv7Camera: async (input) => {
          cameraInputs.push(input);
          if (options.cameraError) throw options.cameraError;
          const target = { x: (input as { x: number }).x, y: (input as { y: number }).y };
          const zoom = (input as { zoom?: number }).zoom;
          const instantaneous = (input as { instantaneous?: boolean }).instantaneous ?? true;
          const center = options.cameraCenter === undefined ? target : options.cameraCenter;
          const snapshot = (plot: { x: number; y: number } | null) => ({
            exists: true,
            zoomLevel: { ok: true, value: zoom ?? 2 } as const,
            focusPoint: { ok: true, value: { x: 1.5, y: 2.5 } } as const,
            centerPlot: { ok: true, value: plot } as const,
          });
          const result: Civ7ControlOrpcCameraFocusResult = {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "65535", name: "App UI" },
            source: "app-ui-camera",
            target,
            targetIndex: { ok: true, value: target.y * 106 + target.x },
            options: {
              ...(zoom === undefined ? {} : { zoom }),
              instantaneous,
            },
            before: snapshot({ x: 0, y: 0 }),
            lookAt: options.cameraLookAt ?? { ok: true, value: true },
            plotCursor: { ok: true, value: target },
            after: snapshot(center),
            centerMatchesTarget: center !== null
              && center.x === target.x
              && center.y === target.y,
          };
          return result;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}
