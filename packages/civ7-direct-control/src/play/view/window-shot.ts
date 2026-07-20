import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

import { type Static, Type } from "typebox";

import { Civ7DirectControlError } from "../../direct-control-error.js";

const execFile = promisify(execFileCallback);

// Window-scoped capture of the Civ7 game window. Settled platform facts
// (live-probed 2026-06; see the cli-command-taxonomy workstream record):
//   - the Mac Steam build ships NO programmatic capture: no XR console (zero
//     XR strings in the binary), no settings toggle, and the only native
//     integration is Steam F12 (ISteamScreenshots — human keypress only),
//   - `screencapture` grabs the whole display, so desktops/overlays leak into
//     "game" captures,
//   - ScreenCaptureKit window capture (SCContentFilter(desktopIndependentWindow:)
//     + SCScreenshotManager) captures exactly one window at native pixel
//     scale, even when occluded. It requires a one-time Screen Recording
//     (TCC) grant for the app hosting this process.
//
// The Swift helper below is the whole OS surface: compiled once per source
// hash with the system toolchain and cached under the OS temp dir. It always
// emits a single JSON object on stdout — `ok: true` rows or
// `ok: false, error: <kind>` rows that this atom maps to typed errors.

export const CIV7_WINDOW_SHOT_SWIFT_SOURCE = `import CoreGraphics
import CoreImage
import CoreMedia
import Foundation
import ImageIO
import ScreenCaptureKit
import UniformTypeIdentifiers

func emit(_ object: [String: Any], code: Int32) -> Never {
  let data = try! JSONSerialization.data(withJSONObject: object)
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data([0x0a]))
  exit(code)
}

func fail(_ kind: String, _ message: String) -> Never {
  emit(["ok": false, "error": kind, "message": message], code: 1)
}

let permissionMessage = "Screen Recording permission is not granted for the app running this command. Open System Settings -> Privacy & Security -> Screen & System Audio Recording, enable the host app (the OS prompt has already registered it in that list), then retry."

var mode: String? = nil
var appNeedle = "civilization"
var windowId: UInt32? = nil
var outPath: String? = nil
var arguments = CommandLine.arguments.dropFirst().makeIterator()
while let argument = arguments.next() {
  switch argument {
  case "capture":
    mode = argument
  case "--app":
    guard let value = arguments.next() else { fail("usage", "--app requires a value") }
    appNeedle = value.lowercased()
  case "--window-id":
    guard let value = arguments.next(), let parsed = UInt32(value) else { fail("usage", "--window-id requires an integer") }
    windowId = parsed
  case "--out":
    guard let value = arguments.next() else { fail("usage", "--out requires a path") }
    outPath = value
  default:
    fail("usage", "unknown argument: " + argument)
  }
}
guard let selectedMode = mode else {
  fail("usage", "usage: civ7-window-shot capture [--app substring] [--window-id id] --out path.png")
}

if !CGPreflightScreenCaptureAccess() {
  // Fires the one-time OS permission prompt and registers this app in the
  // System Settings list even when the prompt is dismissed.
  CGRequestScreenCaptureAccess()
  fail("permission-required", permissionMessage)
}

@available(macOS 14.0, *)
func windowRow(_ window: SCWindow) -> [String: Any] {
  return [
    "windowId": Int(window.windowID),
    "app": window.owningApplication?.applicationName ?? "",
    "bundleId": window.owningApplication?.bundleIdentifier ?? "",
    "title": window.title ?? "",
    "width": Int(window.frame.width),
    "height": Int(window.frame.height),
    "onScreen": window.isOnScreen,
  ]
}

@available(macOS 14.0, *)
func matches(_ window: SCWindow, needle: String) -> Bool {
  let haystack = [
    window.owningApplication?.applicationName ?? "",
    window.owningApplication?.bundleIdentifier ?? "",
    window.title ?? "",
  ].joined(separator: " ").lowercased()
  return haystack.contains(needle)
}

@available(macOS 14.0, *)
func shareableWindows() async -> [SCWindow] {
  do {
    let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
    return content.windows
  } catch {
    let nsError = error as NSError
    if nsError.code == -3801 { fail("permission-required", permissionMessage) }
    fail("capture-failed", "could not enumerate windows: " + nsError.localizedDescription)
  }
}

@available(macOS 14.0, *)
func pickWindow(from windows: [SCWindow], appNeedle: String, windowId: UInt32?) -> SCWindow? {
  let candidates = windows.filter { window in
    if let windowId = windowId { return window.windowID == windowId }
    // Ignore tiny chrome (tooltips, status items); the game window is large.
    return matches(window, needle: appNeedle) && window.frame.width >= 200 && window.frame.height >= 200
  }
  return candidates.max(by: { left, right in
    left.frame.width * left.frame.height < right.frame.width * right.frame.height
  })
}

// Latest-frame sink for the stream-forced capture path. All mutation happens
// on the sample-handler queue; readers hop onto that queue.
@available(macOS 14.0, *)
final class FrameSink: NSObject, SCStreamOutput {
  let ciContext = CIContext()
  var latest: CGImage? = nil
  var frameCount = 0
  func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
    guard type == .screen, let pixelBuffer = sampleBuffer.imageBuffer else { return }
    guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sampleBuffer, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
          let statusRaw = attachments.first?[.status] as? Int,
          statusRaw == SCFrameStatus.complete.rawValue else { return }
    let ci = CIImage(cvPixelBuffer: pixelBuffer)
    guard let cg = ciContext.createCGImage(ci, from: ci.extent) else { return }
    latest = cg
    frameCount += 1
  }
}

// Freshness for off-screen windows: a window on another Space (or minimized)
// stops compositing, so its backing store is STALE. A running SCStream forces
// the window server to composite fresh frames WITHOUT activating the game or
// touching the user's focus (live-verified: 43 distinct frames over 4s from a
// fullscreen window on an inactive Space). Early frames can replay the stale
// store, so the capture takes the latest frame after a short warm-up.
@available(macOS 14.0, *)
func captureViaStream(filter: SCContentFilter, configuration: SCStreamConfiguration) async -> CGImage? {
  configuration.minimumFrameInterval = CMTime(value: 1, timescale: 10)
  configuration.queueDepth = 5
  let sinkQueue = DispatchQueue(label: "civ7-window-shot-sink")
  let sink = FrameSink()
  let stream = SCStream(filter: filter, configuration: configuration, delegate: nil)
  do {
    try stream.addStreamOutput(sink, type: .screen, sampleHandlerQueue: sinkQueue)
    try await stream.startCapture()
  } catch {
    let nsError = error as NSError
    if nsError.code == -3801 { fail("permission-required", permissionMessage) }
    return nil
  }
  var image: CGImage? = nil
  let warmedUpAt = Date().addingTimeInterval(0.8)
  let deadline = Date().addingTimeInterval(3.0)
  while Date() < deadline {
    try? await Task.sleep(nanoseconds: 200_000_000)
    let snapshot: (CGImage?, Int) = await withCheckedContinuation { continuation in
      sinkQueue.async { continuation.resume(returning: (sink.latest, sink.frameCount)) }
    }
    if Date() >= warmedUpAt, snapshot.1 >= 3, let latest = snapshot.0 {
      image = latest
      break
    }
  }
  try? await stream.stopCapture()
  return image
}

@available(macOS 14.0, *)
func run(mode: String, appNeedle: String, windowId: UInt32?, outPath: String?) async {
  let windows = await shareableWindows()

  guard let outPath = outPath else { fail("usage", "capture requires --out <path.png>") }
  guard let window = pickWindow(from: windows, appNeedle: appNeedle, windowId: windowId) else {
    fail("window-not-found", "no window matched app substring '" + appNeedle + "'; adjust --app or pass --window-id")
  }

  let filter = SCContentFilter(desktopIndependentWindow: window)
  let configuration = SCStreamConfiguration()
  let scale = CGFloat(filter.pointPixelScale)
  configuration.width = Int(filter.contentRect.width * scale)
  configuration.height = Int(filter.contentRect.height * scale)
  configuration.showsCursor = false
  configuration.ignoreShadowsSingleWindow = true
  configuration.captureResolution = .best

  // On-screen windows composite continuously: the one-shot screenshot is
  // fresh and fastest. Off-screen windows MUST go through the stream-forced
  // path — their backing store is stale, so a one-shot would silently capture
  // old pixels. No fallback: if the stream yields nothing, fail honestly.
  var image: CGImage? = nil
  var frameSource = "screenshot"
  if !window.isOnScreen {
    guard let streamed = await captureViaStream(filter: filter, configuration: configuration) else {
      fail("capture-failed", "the window is off-screen (another Space or minimized) and no fresh frame could be forced via a capture stream; bring the game window on screen and retry")
    }
    image = streamed
    frameSource = "stream"
  }
  if image == nil {
    do {
      image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: configuration)
    } catch {
      let nsError = error as NSError
      if nsError.code == -3801 { fail("permission-required", permissionMessage) }
      fail("capture-failed", "ScreenCaptureKit capture failed: " + nsError.localizedDescription)
    }
  }
  guard let image = image else { fail("capture-failed", "no frame was produced") }

  let url = URL(fileURLWithPath: outPath) as CFURL
  guard let destination = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil) else {
    fail("capture-failed", "could not open PNG destination: " + outPath)
  }
  CGImageDestinationAddImage(destination, image, nil)
  guard CGImageDestinationFinalize(destination) else {
    fail("capture-failed", "could not finalize PNG: " + outPath)
  }
  var row = windowRow(window)
  row["ok"] = true
  row["mode"] = "capture"
  row["path"] = outPath
  row["pixelWidth"] = image.width
  row["pixelHeight"] = image.height
  row["frameSource"] = frameSource
  emit(row, code: 0)
}

if #available(macOS 14.0, *) {
  // Force CoreGraphics window-server initialization on the main thread BEFORE
  // any ScreenCaptureKit capture work, and keep the main thread servicing a
  // run loop (not semaphore-blocked) while the capture runs -- otherwise the
  // SCK capture path trips the CGS_REQUIRE_INIT assertion in CLI processes.
  // emit()/fail() exit the process, so the run loop never needs stopping.
  _ = CGMainDisplayID()
  Task.detached {
    await run(mode: selectedMode, appNeedle: appNeedle, windowId: windowId, outPath: outPath)
    fail("capture-failed", "capture task ended without emitting a result")
  }
  RunLoop.main.run()
} else {
  fail("unsupported-macos", "window-scoped capture requires macOS 14+ (ScreenCaptureKit SCScreenshotManager)")
}
`;

/** Substring matched against app name / bundle id / window title. */
export const DEFAULT_CIV7_WINDOW_MATCH = "civilization";

export const Civ7CaptureWindowRowSchema = Type.Object(
  {
    windowId: Type.Integer({ minimum: 0 }),
    app: Type.String(),
    bundleId: Type.String(),
    title: Type.String(),
    width: Type.Integer({ minimum: 0 }),
    height: Type.Integer({ minimum: 0 }),
    onScreen: Type.Boolean(),
  },
  { additionalProperties: false }
);

export type Civ7CaptureWindowRow = Readonly<Static<typeof Civ7CaptureWindowRowSchema>>;

export type Civ7WindowShotCaptureInput = Readonly<{
  /** PNG output path; defaults under the OS temp dir. */
  outputPath?: string;
  /** Case-insensitive substring of app name / bundle id / window title. */
  appName?: string;
  /** Exact window id — overrides appName matching. */
  windowId?: number;
}>;

export const Civ7WindowShotFileSchema = Type.Object(
  {
    path: Type.String(),
    byteSize: Type.Integer({ minimum: 0 }),
    sha256: Type.String(),
    mediaType: Type.Literal("image/png"),
    dimensions: Type.Optional(
      Type.Object(
        {
          width: Type.Integer({ minimum: 0 }),
          height: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

export const Civ7WindowShotFrameSourceSchema = Type.Union([
  /** Window was on screen and compositing: one-shot screenshot, fresh. */
  Type.Literal("screenshot"),
  /** Off-screen window: a temporary stream forced fresh compositing. */
  Type.Literal("stream"),
]);

export type Civ7WindowShotFrameSource = Static<typeof Civ7WindowShotFrameSourceSchema>;

export const Civ7WindowShotCaptureResultSchema = Type.Object(
  {
    captureMode: Type.Literal("window-scoped-screencapturekit"),
    requestedAt: Type.String(),
    frameSource: Civ7WindowShotFrameSourceSchema,
    window: Civ7CaptureWindowRowSchema,
    file: Civ7WindowShotFileSchema,
  },
  { additionalProperties: false }
);

export type Civ7WindowShotCaptureResult = Readonly<{
  captureMode: "window-scoped-screencapturekit";
  requestedAt: string;
  /** How freshness was obtained — never via app activation/focus changes. */
  frameSource: Civ7WindowShotFrameSource;
  window: Civ7CaptureWindowRow;
  file: Readonly<{
    path: string;
    byteSize: number;
    sha256: string;
    mediaType: "image/png";
    dimensions?: Readonly<{ width: number; height: number }>;
  }>;
}>;

export type WindowShotDependencies = Readonly<{
  execFile: (
    file: string,
    args: readonly string[]
  ) => Promise<Readonly<{ stdout: string; stderr: string }>>;
  mkdir: typeof mkdir;
  now: () => Date;
  readdir: (path: string) => Promise<string[]>;
  readFile: (path: string) => Promise<Buffer>;
  rm: (path: string, options: Readonly<{ force: boolean }>) => Promise<void>;
  stat: typeof stat;
  tmpdir: () => string;
  writeFile: typeof writeFile;
}>;

const defaultWindowShotDependencies: WindowShotDependencies = {
  execFile,
  mkdir,
  now: () => new Date(),
  readdir: (path) => readdir(path),
  readFile,
  rm: (path, options) => rm(path, options),
  stat,
  tmpdir,
  writeFile,
};

/**
 * Compiles the Swift capture helper once per source revision and caches the
 * binary under the OS temp dir (keyed by source hash, so package upgrades
 * recompile automatically). Compiling a new revision prunes the previous
 * revisions' binaries and sources, so the cache never accumulates.
 */
export async function ensureCiv7WindowShotHelper(
  dependencies: WindowShotDependencies = defaultWindowShotDependencies
): Promise<string> {
  const sourceHash = createHash("sha256")
    .update(CIV7_WINDOW_SHOT_SWIFT_SOURCE)
    .digest("hex")
    .slice(0, 12);
  const cacheRoot = join(dependencies.tmpdir(), "civ7-direct-control");
  const binaryPath = join(cacheRoot, `civ7-window-shot-${sourceHash}`);
  if (await pathExists(dependencies, binaryPath)) return binaryPath;
  await dependencies.mkdir(cacheRoot, { recursive: true });
  const sourcePath = `${binaryPath}.swift`;
  await dependencies.writeFile(sourcePath, CIV7_WINDOW_SHOT_SWIFT_SOURCE, "utf8");
  try {
    await dependencies.execFile("/usr/bin/xcrun", ["swiftc", "-O", sourcePath, "-o", binaryPath]);
  } catch (error) {
    throw new Civ7DirectControlError(
      "window-shot-helper-unavailable",
      "Failed to compile the ScreenCaptureKit capture helper (xcrun swiftc). " +
        "Install the Xcode command line tools (xcode-select --install) and retry: " +
        errorMessage(error),
      { cause: error }
    );
  }
  await pruneStaleHelperRevisions(dependencies, cacheRoot, basename(binaryPath));
  return binaryPath;
}

/** Best-effort: drop binaries/sources from previous helper revisions. */
async function pruneStaleHelperRevisions(
  dependencies: WindowShotDependencies,
  cacheRoot: string,
  keepBasename: string
): Promise<void> {
  try {
    const entries = await dependencies.readdir(cacheRoot);
    await Promise.all(
      entries
        .filter(
          (name) =>
            name.startsWith("civ7-window-shot-") &&
            name !== keepBasename &&
            name !== `${keepBasename}.swift`
        )
        .map((name) => dependencies.rm(join(cacheRoot, name), { force: true }))
    );
  } catch {
    // Cache pruning never blocks a capture.
  }
}

/**
 * Captures the Civ7 game window — and only that window — to a PNG at native
 * pixel scale via ScreenCaptureKit. Works even when the window is occluded.
 * Throws typed errors: `window-shot-permission-required` (one-time Screen
 * Recording TCC grant missing; the helper has already fired the OS prompt),
 * `window-shot-window-not-found`, `window-shot-helper-unavailable`, or
 * `window-shot-failed`.
 */
export async function captureCiv7WindowShot(
  input: Civ7WindowShotCaptureInput = {},
  dependencies: WindowShotDependencies = defaultWindowShotDependencies
): Promise<Civ7WindowShotCaptureResult> {
  const requestedAt = dependencies.now();
  const outputPath = resolve(
    input.outputPath ?? defaultWindowShotPath(requestedAt, dependencies.tmpdir())
  );
  await dependencies.mkdir(dirname(outputPath), { recursive: true });
  // Retention loop for the managed destination only — explicit outputPath
  // directories belong to the caller and are never touched.
  if (input.outputPath === undefined) {
    await pruneStaleAppshots(dependencies, dirname(outputPath), requestedAt);
  }
  const payload = (await runWindowShotHelper(dependencies, [
    "capture",
    "--out",
    outputPath,
    "--app",
    input.appName ?? DEFAULT_CIV7_WINDOW_MATCH,
    ...(input.windowId === undefined ? [] : ["--window-id", String(input.windowId)]),
  ])) as Readonly<{
    windowId: number;
    app: string;
    bundleId: string;
    title: string;
    width: number;
    height: number;
    onScreen: boolean;
    path: string;
    pixelWidth: number;
    pixelHeight: number;
    frameSource: string;
  }>;

  const bytes = await dependencies.readFile(outputPath);
  const fileStat = await dependencies.stat(outputPath);
  const dimensions = pngDimensions(bytes);
  return {
    captureMode: "window-scoped-screencapturekit",
    requestedAt: requestedAt.toISOString(),
    frameSource: payload.frameSource === "stream" ? "stream" : "screenshot",
    window: {
      windowId: payload.windowId,
      app: payload.app,
      bundleId: payload.bundleId,
      title: payload.title,
      width: payload.width,
      height: payload.height,
      onScreen: payload.onScreen,
    },
    file: {
      path: outputPath,
      byteSize: fileStat.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      mediaType: "image/png",
      ...(dimensions === undefined ? {} : { dimensions }),
    },
  };
}

async function runWindowShotHelper(
  dependencies: WindowShotDependencies,
  args: readonly string[]
): Promise<unknown> {
  const helperPath = await ensureCiv7WindowShotHelper(dependencies);
  let stdout: string;
  try {
    ({ stdout } = await dependencies.execFile(helperPath, args));
  } catch (error) {
    // The helper exits non-zero for structured failures but still emits its
    // JSON row on stdout; only an empty stdout means it actually crashed.
    stdout = (error as { stdout?: string }).stdout ?? "";
    if (stdout.trim() === "") {
      throw new Civ7DirectControlError(
        "window-shot-failed",
        `Capture helper crashed: ${errorMessage(error)}`,
        { cause: error }
      );
    }
  }
  let payload: unknown;
  try {
    payload = JSON.parse(stdout.trim());
  } catch {
    throw new Civ7DirectControlError(
      "window-shot-failed",
      `Capture helper emitted invalid JSON: ${stdout.slice(0, 200)}`
    );
  }
  const row = payload as Readonly<{ ok?: boolean; error?: string; message?: string }>;
  if (row.ok !== true) {
    const code =
      row.error === "permission-required"
        ? ("window-shot-permission-required" as const)
        : row.error === "window-not-found"
          ? ("window-shot-window-not-found" as const)
          : ("window-shot-failed" as const);
    throw new Civ7DirectControlError(code, row.message ?? row.error ?? "window capture failed", {
      details: payload,
    });
  }
  return payload;
}

async function pathExists(
  dependencies: Pick<WindowShotDependencies, "stat">,
  path: string
): Promise<boolean> {
  try {
    await dependencies.stat(path);
    return true;
  } catch {
    return false;
  }
}

function defaultWindowShotPath(date: Date, tmp: string): string {
  return join(tmp, "civ7-appshots", `civ7-appshot-${date.toISOString().replace(/[:.]/g, "-")}.png`);
}

/**
 * Retention for the managed default destination: appshots older than 7 days
 * are dropped on each capture, so the directory is self-cleaning. The OS temp
 * dir's own purge is the backstop. Best-effort — retention never blocks a
 * capture.
 */
const CIV7_APPSHOT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

async function pruneStaleAppshots(
  dependencies: WindowShotDependencies,
  directory: string,
  now: Date
): Promise<void> {
  try {
    const cutoff = now.getTime() - CIV7_APPSHOT_RETENTION_MS;
    const entries = await dependencies.readdir(directory);
    await Promise.all(
      entries
        .filter((name) => name.startsWith("civ7-appshot-") && name.endsWith(".png"))
        .map(async (name) => {
          const path = join(directory, name);
          const fileStat = await dependencies.stat(path);
          if (fileStat.mtimeMs < cutoff) {
            await dependencies.rm(path, { force: true });
          }
        })
    );
  } catch {
    // Retention never blocks a capture.
  }
}

function pngDimensions(bytes: Buffer): { width: number; height: number } | undefined {
  const pngSignature = "89504e470d0a1a0a";
  if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== pngSignature) return undefined;
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") return undefined;
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
