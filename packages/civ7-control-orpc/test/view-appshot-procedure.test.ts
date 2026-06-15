import { CIV7_CLEAN_FRAME_VIEW_NAME, Civ7DirectControlError } from "@civ7/direct-control";
import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import type {
  Civ7ControlOrpcCameraFocusResult,
  Civ7ControlOrpcCleanFrameEnterResult,
  Civ7ControlOrpcCloseDisplaysResult,
  Civ7ControlOrpcWindowShotCaptureResult,
} from "../src/dependencies/direct-control";
import {
  Civ7AppshotCaptureFailedError,
  Civ7AppshotCleanFrameUnverifiedError,
  Civ7AppshotPermissionRequiredError,
  Civ7AppshotWindowNotFoundError,
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
} from "../src/index";

// The procedure sleeps for real (Effect.sleep); pin settleMs to zero.
const fastSettle = { settleMs: 0 } as const;

describe("view.appshot.capture control-oRPC procedure", () => {
  test("suspends, purges, hides, captures the window, then restores — in that order", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.view.appshot.capture,
      { ...fastSettle },
      { context: fake.context }
    );

    // The clean frame is fully verified BEFORE any pixel is captured, and the
    // restore (view + queue) runs inline after the capture so its readback
    // lands in the result.
    expect(fake.calls).toEqual([
      "suspend",
      "close",
      "enterCleanFrame",
      "capture",
      "exitCleanFrame",
      "resume",
    ]);
    expect(result).toMatchObject({
      captureMode: "window-scoped-screencapturekit",
      settleMs: 0,
      frameSource: "screenshot",
      window: {
        windowId: 4242,
        app: "CivilizationVII",
        title: "Sid Meier's Civilization VII",
        onScreen: true,
      },
      file: {
        path: "/tmp/civ7-frame.png",
        mediaType: "image/png",
        dimensions: { width: 3456, height: 2160 },
      },
      cleanFrame: {
        viewBefore: "World",
        viewDuringCapture: CIV7_CLEAN_FRAME_VIEW_NAME,
        harnessHidden: true,
        hideUnits: false,
        suspendVerified: true,
        suppressedDisplays: [{ category: "UnlockPopup", closed: 2 }],
        restored: { view: "World", harnessHidden: false, queueResumed: true },
      },
    });
    expectSafeAppshotOutput(result);
  });

  test("passes hideUnits and capture targeting through to the atoms", async () => {
    const fake = fakeContext();
    await call(
      Civ7ControlOrpcRouter.view.appshot.capture,
      {
        hideUnits: true,
        outputPath: "/tmp/custom.png",
        appName: "civ",
        windowId: 7,
        ...fastSettle,
      },
      { context: fake.context }
    );
    expect(fake.enterInputs).toEqual([{ hideUnits: true }]);
    expect(fake.captureInputs).toEqual([
      { outputPath: "/tmp/custom.png", appName: "civ", windowId: 7 },
    ]);
  });

  test("target plot: verified camera focus runs BEFORE any clean-frame work and lands in result.camera", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.view.appshot.capture,
      { target: { x: 12, y: 34 }, zoom: 0.25, ...fastSettle },
      { context: fake.context }
    );
    expect(fake.calls).toEqual([
      "cameraFocus",
      "suspend",
      "close",
      "enterCleanFrame",
      "capture",
      "exitCleanFrame",
      "resume",
    ]);
    expect(fake.cameraInputs).toEqual([{ x: 12, y: 34, zoom: 0.25 }]);
    expect(result.camera).toMatchObject({
      target: { x: 12, y: 34 },
      zoom: 0.25,
      instantaneous: true,
      after: { centerPlot: { x: 12, y: 34 } },
      centerMatchesTarget: true,
    });
    expectSafeAppshotOutput(result);
  });

  test("without a target the camera is never touched and result.camera is absent", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.view.appshot.capture,
      { ...fastSettle },
      { context: fake.context }
    );
    expect(fake.calls).not.toContain("cameraFocus");
    expect(result.camera).toBeUndefined();
  });

  test("zoom without a target fails CAMERA_FOCUS_FAILED before any facade call", async () => {
    const fake = fakeContext();
    await expect(
      call(
        Civ7ControlOrpcRouter.view.appshot.capture,
        { zoom: 0.25, ...fastSettle },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_FAILED",
      data: { detail: expect.stringContaining("zoom requires a target plot") },
    });
    expect(fake.calls).toEqual([]);
  });

  test("a center-readback miss fails CAMERA_FOCUS_UNVERIFIED without touching the display queue", async () => {
    const fake = fakeContext({ cameraCenter: { x: 11, y: 34 } });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.appshot.capture,
        { target: { x: 12, y: 34 }, ...fastSettle },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_UNVERIFIED",
      data: {
        procedureKey: "view.appshot.capture",
        detail: expect.stringContaining("target=(12,34) center=(11,34)"),
      },
    });
    // Nothing was suspended or hidden, so there is nothing to restore.
    expect(fake.calls).toEqual(["cameraFocus"]);
  });

  test("a camera move that never ran fails CAMERA_FOCUS_FAILED with the probe error", async () => {
    const fake = fakeContext({
      cameraLookAt: { ok: false, error: "Camera.lookAtPlot unavailable" },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.appshot.capture,
        { target: { x: 12, y: 34 }, ...fastSettle },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_FAILED",
      data: { detail: "Camera.lookAtPlot unavailable" },
    });
    expect(fake.calls).toEqual(["cameraFocus"]);
  });

  test("a camera facade error maps to CAMERA_FOCUS_FAILED", async () => {
    const fake = fakeContext({ cameraError: new Error("tuner socket closed") });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.appshot.capture,
        { target: { x: 12, y: 34 }, ...fastSettle },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "CAMERA_FOCUS_FAILED",
      data: { detail: "tuner socket closed" },
    });
    expect(fake.calls).toEqual(["cameraFocus"]);
  });

  test("fails APPSHOT_CLEAN_FRAME_UNVERIFIED when queue suspension readback fails", async () => {
    const fake = fakeContext({ suspendIsSuspended: false });
    await expect(
      call(Civ7ControlOrpcRouter.view.appshot.capture, { ...fastSettle }, { context: fake.context })
    ).rejects.toMatchObject({
      code: "APPSHOT_CLEAN_FRAME_UNVERIFIED",
      data: {
        procedureKey: "view.appshot.capture",
        source: "direct-control-facade",
      },
    });
    expect(fake.calls).not.toContain("capture");
    expect(fake.calls).not.toContain("enterCleanFrame");
  });

  test("fails APPSHOT_CLEAN_FRAME_UNVERIFIED and restores when the view readback fails", async () => {
    const fake = fakeContext({
      enterResult: {
        switched: true,
        viewBefore: "World",
        view: "World",
        harnessHidden: false,
        hideUnits: false,
      },
    });
    await expect(
      call(Civ7ControlOrpcRouter.view.appshot.capture, { ...fastSettle }, { context: fake.context })
    ).rejects.toMatchObject({ code: "APPSHOT_CLEAN_FRAME_UNVERIFIED" });
    expect(fake.calls).not.toContain("capture");
    // The release finalizer still restores both the view and the queue.
    expect(fake.calls.slice(-2)).toEqual(["exitCleanFrame", "resume"]);
  });

  test("maps the missing Screen Recording grant to APPSHOT_PERMISSION_REQUIRED and restores", async () => {
    const fake = fakeContext({
      captureError: new Civ7DirectControlError(
        "window-shot-permission-required",
        "Screen Recording permission is not granted for the app running this command."
      ),
    });
    await expect(
      call(Civ7ControlOrpcRouter.view.appshot.capture, { ...fastSettle }, { context: fake.context })
    ).rejects.toMatchObject({
      code: "APPSHOT_PERMISSION_REQUIRED",
      data: {
        procedureKey: "view.appshot.capture",
        detail: expect.stringContaining("Screen Recording"),
      },
    });
    expect(fake.calls).toEqual([
      "suspend",
      "close",
      "enterCleanFrame",
      "capture",
      "exitCleanFrame",
      "resume",
    ]);
  });

  test("maps a missing window to APPSHOT_WINDOW_NOT_FOUND", async () => {
    const fake = fakeContext({
      captureError: new Civ7DirectControlError(
        "window-shot-window-not-found",
        "no window matched app substring 'nope'"
      ),
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.view.appshot.capture,
        { appName: "nope", ...fastSettle },
        { context: fake.context }
      )
    ).rejects.toMatchObject({ code: "APPSHOT_WINDOW_NOT_FOUND" });
  });

  test("maps any other capture failure to APPSHOT_CAPTURE_FAILED and restores", async () => {
    const fake = fakeContext({ captureError: new Error("disk full") });
    await expect(
      call(Civ7ControlOrpcRouter.view.appshot.capture, { ...fastSettle }, { context: fake.context })
    ).rejects.toMatchObject({
      code: "APPSHOT_CAPTURE_FAILED",
      data: { detail: "disk full" },
    });
    expect(fake.calls.slice(-2)).toEqual(["exitCleanFrame", "resume"]);
  });

  test("rejects raw endpoint/session/command input before facade reads", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { rawCommand: "ViewManager.setCurrentByName" },
      { settleMs: 60_001 },
      { windowId: -1 },
      { target: { x: -1, y: 0 } },
      { target: { x: 0.5, y: 2 } },
      { target: { x: 12, y: 34 }, zoom: 1.5 },
    ];
    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(Civ7ControlOrpcRouter.view.appshot.capture, input as never, { context: fake.context })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("publishes the contract-first view leaf with typed errors", () => {
    expect(Civ7ControlOrpcContract.view.appshot.capture["~orpc"]).toMatchObject({
      meta: {
        family: "view",
        procedureKey: "view.appshot.capture",
        proofBoundary: "local-package-test",
        risk: "runtime-support",
      },
    });
    const errorMap = Civ7ControlOrpcContract.view.appshot.capture["~orpc"].errorMap;
    expect(errorMap).toHaveProperty("APPSHOT_PERMISSION_REQUIRED");
    expect(errorMap).toHaveProperty("APPSHOT_WINDOW_NOT_FOUND");
    expect(errorMap).toHaveProperty("APPSHOT_CLEAN_FRAME_UNVERIFIED");
    expect(errorMap).toHaveProperty("APPSHOT_CAPTURE_FAILED");
    expect(errorMap).toHaveProperty("CAMERA_FOCUS_FAILED");
    expect(errorMap).toHaveProperty("CAMERA_FOCUS_UNVERIFIED");
    expect(Civ7AppshotPermissionRequiredError.code).toBe("APPSHOT_PERMISSION_REQUIRED");
    expect(Civ7AppshotWindowNotFoundError.code).toBe("APPSHOT_WINDOW_NOT_FOUND");
    expect(Civ7AppshotCleanFrameUnverifiedError.code).toBe("APPSHOT_CLEAN_FRAME_UNVERIFIED");
    expect(Civ7AppshotCaptureFailedError.code).toBe("APPSHOT_CAPTURE_FAILED");
  });
});

type EnterPayload = Omit<Civ7ControlOrpcCleanFrameEnterResult, "host" | "port" | "state">;

function fakeContext(
  options: {
    suspendIsSuspended?: boolean;
    enterResult?: EnterPayload;
    captureError?: Error;
    cameraCenter?: { x: number; y: number } | null;
    cameraLookAt?: { ok: true; value: boolean } | { ok: false; error: string };
    cameraError?: Error;
  } = {}
): {
  context: Civ7ControlOrpcContext;
  calls: string[];
  enterInputs: unknown[];
  captureInputs: unknown[];
  cameraInputs: unknown[];
} {
  const calls: string[] = [];
  const enterInputs: unknown[] = [];
  const captureInputs: unknown[] = [];
  const cameraInputs: unknown[] = [];
  const enterPayload: EnterPayload = options.enterResult ?? {
    switched: true,
    viewBefore: "World",
    view: CIV7_CLEAN_FRAME_VIEW_NAME,
    harnessHidden: true,
    hideUnits: false,
  };

  return {
    calls,
    enterInputs,
    captureInputs,
    cameraInputs,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        focusCiv7Camera: async (input) => {
          calls.push("cameraFocus");
          cameraInputs.push(input);
          if (options.cameraError) throw options.cameraError;
          const target = { x: (input as { x: number }).x, y: (input as { y: number }).y };
          const zoom = (input as { zoom?: number }).zoom;
          const center = options.cameraCenter === undefined ? target : options.cameraCenter;
          return cameraFocusResult({
            target,
            center,
            ...(zoom === undefined ? {} : { zoom }),
            ...(options.cameraLookAt === undefined ? {} : { lookAt: options.cameraLookAt }),
          });
        },
        suspendCiv7DisplayQueue: async () => {
          calls.push("suspend");
          return {
            ...appUiEnvelope(),
            isSuspended: options.suspendIsSuspended ?? true,
          };
        },
        resumeCiv7DisplayQueue: async () => {
          calls.push("resume");
          return { ...appUiEnvelope(), isSuspended: false };
        },
        closeCiv7Displays: async () => {
          calls.push("close");
          return closeDisplaysResult([{ category: "UnlockPopup", closed: 2 }]);
        },
        enterCiv7CleanFrame: async (input) => {
          calls.push("enterCleanFrame");
          enterInputs.push(input);
          return {
            ...appUiEnvelope(),
            ...enterPayload,
            hideUnits: (input as { hideUnits?: boolean }).hideUnits === true,
          };
        },
        exitCiv7CleanFrame: async () => {
          calls.push("exitCleanFrame");
          return {
            ...appUiEnvelope(),
            switched: true,
            view: "World",
            harnessHidden: false,
          };
        },
        captureCiv7WindowShot: async (input) => {
          calls.push("capture");
          captureInputs.push(input);
          if (options.captureError) throw options.captureError;
          return windowShotResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function cameraFocusResult(
  input: Readonly<{
    target: { x: number; y: number };
    center: { x: number; y: number } | null;
    zoom?: number;
    lookAt?: { ok: true; value: boolean } | { ok: false; error: string };
  }>
): Civ7ControlOrpcCameraFocusResult {
  const snapshot = (center: { x: number; y: number } | null) => ({
    exists: true,
    zoomLevel: { ok: true, value: input.zoom ?? 0.4 } as const,
    focusPoint: { ok: true, value: { x: 1.5, y: 2.5 } } as const,
    centerPlot: { ok: true, value: center } as const,
  });
  return {
    ...appUiEnvelope(),
    source: "app-ui-camera",
    target: input.target,
    targetIndex: { ok: true, value: input.target.y * 106 + input.target.x },
    options: {
      ...(input.zoom === undefined ? {} : { zoom: input.zoom }),
      instantaneous: true,
    },
    before: snapshot({ x: 0, y: 0 }),
    lookAt: input.lookAt ?? { ok: true, value: true },
    after: snapshot(input.center),
    centerMatchesTarget:
      input.center !== null &&
      input.center.x === input.target.x &&
      input.center.y === input.target.y,
  };
}

function windowShotResult(): Civ7ControlOrpcWindowShotCaptureResult {
  return {
    captureMode: "window-scoped-screencapturekit",
    requestedAt: "2026-06-11T12:00:00.000Z",
    frameSource: "screenshot",
    window: {
      windowId: 4242,
      app: "CivilizationVII",
      bundleId: "com.aspyr.civ7.steam",
      title: "Sid Meier's Civilization VII",
      width: 1728,
      height: 1080,
      onScreen: true,
    },
    file: {
      path: "/tmp/civ7-frame.png",
      byteSize: 1_234_567,
      sha256: "ab".repeat(32),
      mediaType: "image/png",
      dimensions: { width: 3456, height: 2160 },
    },
  };
}

function closeDisplaysResult(
  closed: Array<{ category: string; closed: number }>
): Civ7ControlOrpcCloseDisplaysResult {
  return {
    ...appUiEnvelope(),
    closed,
    closedTotal: closed.reduce((total, row) => total + row.closed, 0),
    remainingActive: [],
    remainingSuspended: [],
  };
}

function appUiEnvelope(): Readonly<{
  host: string;
  port: number;
  state: { id: string; name: string };
}> {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
  };
}

function expectSafeAppshotOutput(output: unknown): void {
  const serialized = JSON.stringify(output);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("65535");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain("rawCommand");
  expect(serialized).not.toContain("bundleId");
}
