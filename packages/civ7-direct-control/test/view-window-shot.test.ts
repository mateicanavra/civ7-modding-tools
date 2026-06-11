import type { Stats } from "node:fs";

import { describe, expect, test } from "vitest";

import {
  captureCiv7WindowShot,
  CIV7_WINDOW_SHOT_SWIFT_SOURCE,
  ensureCiv7WindowShotHelper,
  listCiv7CaptureWindows,
  type WindowShotDependencies,
} from "../src/play/view/window-shot";
import { Civ7DirectControlError } from "../src/direct-control-error";

// 1x1 transparent PNG — real bytes so sha256/dimension extraction run on the
// same parsing path as production captures.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const CAPTURE_ROW = {
  ok: true,
  mode: "capture",
  windowId: 4242,
  app: "CivilizationVII",
  bundleId: "com.aspyr.civ7.steam",
  title: "Sid Meier's Civilization VII",
  width: 1728,
  height: 1080,
  onScreen: true,
  path: "/tmp/out.png",
  pixelWidth: 3456,
  pixelHeight: 2160,
  frameSource: "screenshot",
};

type FakeOptions = Readonly<{
  helperExists?: boolean;
  helperStdout?: string;
  helperFails?: boolean;
  compileFails?: boolean;
}>;

function fakeDependencies(options: FakeOptions = {}): {
  dependencies: WindowShotDependencies;
  execCalls: Array<{ file: string; args: readonly string[] }>;
  writes: string[];
} {
  const execCalls: Array<{ file: string; args: readonly string[] }> = [];
  const writes: string[] = [];
  const dependencies: WindowShotDependencies = {
    execFile: async (file, args) => {
      execCalls.push({ file, args });
      if (file === "/usr/bin/xcrun") {
        if (options.compileFails) throw new Error("swiftc: command not found");
        return { stdout: "", stderr: "" };
      }
      const stdout = options.helperStdout ?? `${JSON.stringify(CAPTURE_ROW)}\n`;
      if (options.helperFails) {
        const error = new Error("helper exited 1") as Error & { stdout: string };
        error.stdout = stdout;
        throw error;
      }
      return { stdout, stderr: "" };
    },
    mkdir: async () => undefined,
    now: () => new Date("2026-06-11T12:00:00.000Z"),
    readFile: (async () => PNG_1X1) as WindowShotDependencies["readFile"],
    stat: (async (path: string) => {
      if (options.helperExists === false && !String(path).endsWith(".png")) {
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      }
      return { size: PNG_1X1.byteLength } as Stats;
    }) as WindowShotDependencies["stat"],
    tmpdir: () => "/tmp/fake",
    writeFile: (async (path: string) => {
      writes.push(String(path));
    }) as WindowShotDependencies["writeFile"],
  };
  return { dependencies, execCalls, writes };
}

describe("window-shot helper lifecycle", () => {
  test("compiles the embedded Swift source once and caches by source hash", async () => {
    const { dependencies, execCalls, writes } = fakeDependencies({ helperExists: false });
    const binary = await ensureCiv7WindowShotHelper(dependencies);
    expect(binary).toContain("/tmp/fake/civ7-direct-control/civ7-window-shot-");
    expect(writes).toEqual([`${binary}.swift`]);
    expect(execCalls).toEqual([
      { file: "/usr/bin/xcrun", args: ["swiftc", "-O", `${binary}.swift`, "-o", binary] },
    ]);
  });

  test("reuses an existing binary without recompiling", async () => {
    const { dependencies, execCalls } = fakeDependencies({ helperExists: true });
    await ensureCiv7WindowShotHelper(dependencies);
    expect(execCalls).toEqual([]);
  });

  test("maps a missing toolchain to window-shot-helper-unavailable with setup guidance", async () => {
    const { dependencies } = fakeDependencies({ helperExists: false, compileFails: true });
    await expect(ensureCiv7WindowShotHelper(dependencies)).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "window-shot-helper-unavailable",
      message: expect.stringContaining("xcode-select --install"),
    });
  });

  test("the embedded helper is window-scoped ScreenCaptureKit with TCC prompt + structured errors", () => {
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("SCContentFilter(desktopIndependentWindow: window)");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("SCScreenshotManager.captureImage");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("CGPreflightScreenCaptureAccess()");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("CGRequestScreenCaptureAccess()");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("pointPixelScale");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("showsCursor = false");
    // CLI processes must service a run loop with CG initialized on the main
    // thread, or the SCK capture path trips CGS_REQUIRE_INIT (live-hit).
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("CGMainDisplayID()");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("RunLoop.main.run()");
    // Off-screen windows have stale backing stores: a temporary SCStream
    // forces fresh compositing WITHOUT activating the game or moving focus.
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("captureViaStream");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).toContain("SCStream(filter: filter, configuration: configuration, delegate: nil)");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).not.toContain("NSRunningApplication");
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).not.toContain("activate()");
    // The whole display is never a capture target.
    expect(CIV7_WINDOW_SHOT_SWIFT_SOURCE).not.toContain("SCContentFilter(display");
  });
});

describe("captureCiv7WindowShot", () => {
  test("captures the matched window and reports a hashable manifest", async () => {
    const { dependencies, execCalls } = fakeDependencies({ helperExists: true });
    const result = await captureCiv7WindowShot(
      { outputPath: "/tmp/out.png" },
      dependencies,
    );
    expect(execCalls[0]?.args.slice(0, 3)).toEqual(["capture", "--out", "/tmp/out.png"]);
    expect(execCalls[0]?.args).toContain("civilization");
    expect(result).toEqual({
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
        path: "/tmp/out.png",
        byteSize: PNG_1X1.byteLength,
        sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        mediaType: "image/png",
        dimensions: { width: 1, height: 1 },
      },
    });
  });

  test("passes an explicit window id through to the helper", async () => {
    const { dependencies, execCalls } = fakeDependencies({ helperExists: true });
    await captureCiv7WindowShot(
      { outputPath: "/tmp/out.png", windowId: 4242 },
      dependencies,
    );
    expect(execCalls[0]?.args).toContain("--window-id");
    expect(execCalls[0]?.args).toContain("4242");
  });


  test("maps the helper's structured TCC failure to window-shot-permission-required", async () => {
    const { dependencies } = fakeDependencies({
      helperExists: true,
      helperFails: true,
      helperStdout: JSON.stringify({
        ok: false,
        error: "permission-required",
        message: "Screen Recording permission is not granted",
      }),
    });
    await expect(
      captureCiv7WindowShot({ outputPath: "/tmp/out.png" }, dependencies),
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "window-shot-permission-required",
      message: expect.stringContaining("Screen Recording"),
    });
  });

  test("maps a missing window to window-shot-window-not-found", async () => {
    const { dependencies } = fakeDependencies({
      helperExists: true,
      helperFails: true,
      helperStdout: JSON.stringify({
        ok: false,
        error: "window-not-found",
        message: "no window matched app substring 'civilization'",
      }),
    });
    await expect(
      captureCiv7WindowShot({ outputPath: "/tmp/out.png" }, dependencies),
    ).rejects.toMatchObject({
      code: "window-shot-window-not-found",
    });
  });

  test("treats a crash without stdout as window-shot-failed", async () => {
    const { dependencies } = fakeDependencies({
      helperExists: true,
      helperFails: true,
      helperStdout: "",
    });
    await expect(
      captureCiv7WindowShot({ outputPath: "/tmp/out.png" }, dependencies),
    ).rejects.toMatchObject({ code: "window-shot-failed" });
  });

  test("rejects invalid helper output as window-shot-failed", async () => {
    const { dependencies } = fakeDependencies({
      helperExists: true,
      helperStdout: "not-json",
    });
    await expect(
      captureCiv7WindowShot({ outputPath: "/tmp/out.png" }, dependencies),
    ).rejects.toBeInstanceOf(Civ7DirectControlError);
  });
});

describe("listCiv7CaptureWindows", () => {
  test("returns the helper's window rows", async () => {
    const { dependencies, execCalls } = fakeDependencies({
      helperExists: true,
      helperStdout: JSON.stringify({
        ok: true,
        mode: "list",
        windows: [{
          windowId: 4242,
          app: "CivilizationVII",
          bundleId: "com.aspyr.civ7.steam",
          title: "Sid Meier's Civilization VII",
          width: 1728,
          height: 1080,
          onScreen: true,
        }],
      }),
    });
    const result = await listCiv7CaptureWindows({}, dependencies);
    expect(execCalls[0]?.args).toEqual(["list", "--app", "civilization"]);
    expect(result.windows).toHaveLength(1);
    expect(result.windows[0]?.windowId).toBe(4242);
  });
});
