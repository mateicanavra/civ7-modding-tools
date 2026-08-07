import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { access, mkdtemp, readFile, rm, stat, utimes, writeFile, writeFileSync } from "node:fs";
import { access as accessAsync, mkdtemp as mkdtempAsync, rm as rmAsync } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { PassThrough } from "node:stream";
import { crc32, deflateSync } from "node:zlib";

import { WindowCaptureFailure } from "@civ7/window-capture";
import { Effect } from "effect";
import { afterEach, describe, expect, test } from "vitest";
import {
  acquireMacosScreenCaptureKitWindowCaptureWithDependencies,
  defaultCaptureFileSystem,
  type WindowCaptureProviderDependencies,
} from "../../capture.js";
import {
  type MacosScreenCaptureKitWindowCaptureOptions,
  resolveMacosScreenCaptureKitWindowCaptureConfig,
} from "../../config.js";
import {
  defaultHelperFileSystem,
  prepareScreenCaptureKitHelper,
  WINDOW_CAPTURE_HELPER_SOURCE,
} from "../../helper.js";
import * as publicProvider from "../../index.js";
import {
  ProcessSupervisor,
  type SpawnChild,
  type SupervisedChildProcess,
} from "../../process-supervisor.js";
import {
  HELPER_PROBE_PROTOCOL,
  parseHelperCaptureEnvelope,
  parseHelperProbeEnvelope,
  parsePngDimensions,
} from "../../protocol.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rmAsync(root, { force: true, recursive: true })));
});

describe("macOS ScreenCaptureKit provider semantics", () => {
  test("keeps the public contract generic and the public provider surface narrow", async () => {
    const contractPath = resolve(import.meta.dirname, "../../../../contract.ts");
    const contractSource = await new Promise<string>((resolveRead, rejectRead) =>
      readFile(contractPath, "utf8", (error, contents) =>
        error === null ? resolveRead(contents) : rejectRead(error)
      )
    );

    expect(contractSource).not.toMatch(/civ(?:ilization)?\s*7/i);
    expect(Object.keys(publicProvider)).toEqual(["acquireMacosScreenCaptureKitWindowCapture"]);
  });

  test("preserves selected-window-only native-scale fresh-frame behavior", () => {
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain(
      "SCContentFilter(desktopIndependentWindow: window)"
    );
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("CGRequestScreenCaptureAccess()");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain(
      "window.frame.width >= minimumSelectableWindowDimension"
    );
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("return candidates.max");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("filter.pointPixelScale");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("configuration.showsCursor = false");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain(
      "configuration.ignoreShadowsSingleWindow = true"
    );
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("SCScreenshotManager.captureImage");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("if !window.isOnScreen");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).toContain("SCStream(filter: filter");
    expect(WINDOW_CAPTURE_HELPER_SOURCE.indexOf('if mode == "probe"')).toBeLessThan(
      WINDOW_CAPTURE_HELPER_SOURCE.indexOf("CGPreflightScreenCaptureAccess()")
    );
    expect(WINDOW_CAPTURE_HELPER_SOURCE).not.toContain("SCContentFilter(display:");
    expect(WINDOW_CAPTURE_HELPER_SOURCE).not.toContain("activate(options:");
  });

  test("validates a generic managed destination without inventing policy", () => {
    const config = resolveMacosScreenCaptureKitWindowCaptureConfig(
      {
        managedDestination: {
          root: "./captures",
          filePrefix: "window-",
          retentionMs: 5_000,
        },
      },
      "./helper-cache"
    );
    expect(config).toEqual({
      managedDestination: {
        root: resolve("./captures"),
        filePrefix: "window-",
        retentionMs: 5_000,
      },
      helperCacheRoot: resolve("./helper-cache"),
    });

    for (const options of [
      providerOptions({ filePrefix: "" }),
      providerOptions({ filePrefix: "nested/file-" }),
      providerOptions({ retentionMs: -1 }),
      providerOptions({ retentionMs: Number.NaN }),
    ]) {
      expect(() =>
        resolveMacosScreenCaptureKitWindowCaptureConfig(options, "./helper-cache")
      ).toThrow(WindowCaptureFailure);
    }
  });

  test("refuses unsupported or unidentifiable macOS releases before toolchain work", async () => {
    const root = await temporaryRoot();
    let spawns = 0;
    const base = providerDependencies(root, () => {
      spawns += 1;
      return new TestChild();
    });

    for (const dependencies of [
      { ...base, platform: "linux" as const },
      { ...base, darwinKernelRelease: () => "22.6.0" },
      { ...base, darwinKernelRelease: () => "unknown" },
    ]) {
      const failure = await Effect.runPromise(
        Effect.scoped(
          acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            providerOptions({ root: join(root, "managed") }),
            dependencies
          ).pipe(Effect.flip)
        )
      );
      expect(failure).toMatchObject({ operation: "acquire", reason: "unsupported-platform" });
    }
    expect(spawns).toBe(0);
  });

  test("turns malformed JavaScript requests into the typed invalid-request channel", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await seedCachedHelper(cacheRoot);
    let spawns = 0;
    const failure = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            {
              ...providerOptions({ root: join(root, "managed") }),
              helperCacheRoot: cacheRoot,
            },
            providerDependencies(root, () => {
              spawns += 1;
              return new TestChild();
            })
          );
          return yield* Effect.flip(
            // @ts-expect-error Runtime callers can cross the TypeScript contract unsafely.
            capture.capture({ selection: null })
          );
        })
      )
    );

    expect(failure).toMatchObject({ operation: "capture", reason: "invalid-request" });
    expect(spawns).toBe(0);
  });

  test("narrows opaque public window IDs to ScreenCaptureKit UInt32 values before spawning", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await seedCachedHelper(cacheRoot);
    let spawns = 0;
    const failures = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            {
              ...providerOptions({ root: join(root, "managed") }),
              helperCacheRoot: cacheRoot,
            },
            providerDependencies(root, () => {
              spawns += 1;
              return new TestChild();
            })
          );
          return yield* Effect.all(
            ["not-a-decimal-id", "4294967296"].map((windowId) =>
              Effect.flip(capture.capture({ selection: { _tag: "window-id", windowId } }))
            )
          );
        })
      )
    );

    expect(failures).toHaveLength(2);
    for (const failure of failures) {
      expect(failure).toMatchObject({ operation: "capture", reason: "invalid-request" });
    }
    expect(spawns).toBe(0);
  });

  test("strictly parses helper JSON and decodable PNG scanlines", () => {
    const probe = { ok: true, protocol: HELPER_PROBE_PROTOCOL };
    expect(parseHelperProbeEnvelope(JSON.stringify(probe))).toEqual(probe);
    expect(() =>
      parseHelperProbeEnvelope(JSON.stringify({ ...probe, unexpected: true }))
    ).toThrow();
    const good = helperSuccess("/tmp/frame.tmp");
    expect(parseHelperCaptureEnvelope(JSON.stringify(good))).toEqual(good);
    expect(() =>
      parseHelperCaptureEnvelope(JSON.stringify({ ...good, unexpected: true }))
    ).toThrow();
    expect(() =>
      parseHelperCaptureEnvelope(JSON.stringify({ ...good, frameSource: "fallback" }))
    ).toThrow();

    const png = pngBytes(3, 2);
    expect(parsePngDimensions(png)).toEqual({ width: 3, height: 2 });
    expect(() => parsePngDimensions(Buffer.from("not a png"))).toThrow(/PNG/);
    expect(() => parsePngDimensions(png.subarray(0, png.length - 1))).toThrow(/PNG/);
    const corrupt = Buffer.from(png);
    corrupt[30] = (corrupt[30] ?? 0) ^ 0xff;
    expect(() => parsePngDimensions(corrupt)).toThrow(/CRC/);

    expect(() =>
      parsePngDimensions(pngFromCompressedImageData(3, 2, Buffer.from("not zlib")))
    ).toThrow(/not decodable/);
    const shortScanlines = Buffer.alloc(2 * (1 + 3 * 4) - 1);
    expect(() => parsePngDimensions(pngFromScanlines(3, 2, shortScanlines))).toThrow(/cardinality/);
    const invalidFilter = Buffer.alloc(2 * (1 + 3 * 4));
    invalidFilter[0] = 5;
    expect(() => parsePngDimensions(pngFromScanlines(3, 2, invalidFilter))).toThrow(/filter/);
    expect(() => parsePngDimensions(pngFromScanlines(1, 1, Buffer.alloc(128)))).toThrow(/bounds/);
    expect(() => parsePngDimensions(pngFromScanlines(3, 2, Buffer.alloc(26), 1))).toThrow(
      /interlaced/
    );
  });

  test("compiles once per helper content and prunes only stable stale revisions", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await new Promise<void>((resolveMkdir, rejectMkdir) =>
      mkdtemp(join(root, "seed-"), (error) =>
        error === null ? resolveMkdir() : rejectMkdir(error)
      )
    );
    await defaultHelperFileSystem.mkdir(cacheRoot, { recursive: true });
    const staleBinary = join(cacheRoot, "window-capture-screencapturekit-0000000000000000");
    const concurrentSource = join(
      cacheRoot,
      "window-capture-screencapturekit-1111111111111111-concurrent.swift"
    );
    const concurrentTemporary = join(
      cacheRoot,
      "window-capture-screencapturekit-1111111111111111-concurrent.tmp"
    );
    await Promise.all([
      defaultHelperFileSystem.writeFile(staleBinary, "stale", "utf8"),
      defaultHelperFileSystem.writeFile(concurrentSource, "in-flight", "utf8"),
      defaultHelperFileSystem.writeFile(concurrentTemporary, "in-flight", "utf8"),
    ]);

    let compileCount = 0;
    let probeCount = 0;
    const spawnChild: SpawnChild = (_command, args) => {
      if (args.length === 1 && args[0] === "probe") {
        probeCount += 1;
        return successfulProbeChild();
      }
      compileCount += 1;
      const child = new TestChild();
      const outputPath = argumentValue(args, "-o");
      writeFileSync(outputPath, "compiled helper");
      queueMicrotask(() => child.complete(0, null));
      return child;
    };
    const supervisor = new ProcessSupervisor(spawnChild);
    const first = await Effect.runPromise(
      prepareScreenCaptureKitHelper(cacheRoot, supervisor, defaultHelperFileSystem)
    );
    const second = await Effect.runPromise(
      prepareScreenCaptureKitHelper(cacheRoot, supervisor, defaultHelperFileSystem)
    );
    await Effect.runPromise(supervisor.release());

    expect(first).toBe(second);
    expect(compileCount).toBe(1);
    expect(probeCount).toBe(2);
    await expect(accessAsync(staleBinary)).rejects.toThrow();
    await accessAsync(concurrentSource);
    await accessAsync(concurrentTemporary);
  });

  test("fails acquisition when a cached helper violates the readiness protocol", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await seedCachedHelper(cacheRoot);
    let probeCalls = 0;
    const dependencies: WindowCaptureProviderDependencies = {
      ...providerDependencies(root, () => new TestChild()),
      spawnChild: (_command, args) => {
        probeCalls += 1;
        expect(args).toEqual(["probe"]);
        const child = new TestChild();
        child.stdout.write(JSON.stringify({ ok: true, protocol: "wrong-protocol" }));
        queueMicrotask(() => child.complete(0, null));
        return child;
      },
    };

    const failure = await Effect.runPromise(
      Effect.scoped(
        acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
          {
            ...providerOptions({ root: join(root, "managed") }),
            helperCacheRoot: cacheRoot,
          },
          dependencies
        ).pipe(Effect.flip)
      )
    );

    expect(probeCalls).toBe(1);
    expect(failure).toMatchObject({ operation: "acquire", reason: "toolchain-unavailable" });
  });

  test("fails acquisition when a cached helper cannot execute", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await seedCachedHelper(cacheRoot);
    const dependencies: WindowCaptureProviderDependencies = {
      ...providerDependencies(root, () => new TestChild()),
      spawnChild: () => {
        const child = new TestChild();
        queueMicrotask(() => {
          child.emit("error", new Error("spawn EACCES"));
          child.complete(null, null);
        });
        return child;
      },
    };

    const failure = await Effect.runPromise(
      Effect.scoped(
        acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
          {
            ...providerOptions({ root: join(root, "managed") }),
            helperCacheRoot: cacheRoot,
          },
          dependencies
        ).pipe(Effect.flip)
      )
    );

    expect(failure).toMatchObject({ operation: "acquire", reason: "toolchain-unavailable" });
  });

  test("translates helper compilation failure into toolchain-unavailable", async () => {
    const root = await temporaryRoot();
    const child = new TestChild();
    const dependencies = providerDependencies(root, () => {
      child.stderr.write("swift compiler unavailable");
      queueMicrotask(() => child.complete(127, null));
      return child;
    });
    const failure = await Effect.runPromise(
      Effect.scoped(
        acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
          providerOptions({ root: join(root, "managed") }),
          dependencies
        ).pipe(Effect.flip)
      )
    );

    expect(failure).toMatchObject({
      _tag: "WindowCaptureFailure",
      operation: "acquire",
      reason: "toolchain-unavailable",
    });
  });

  test("translates a strict helper permission response", async () => {
    const root = await temporaryRoot();
    await seedCachedHelper(join(root, "helper-cache"));
    const spawnChild: SpawnChild = (_command, _args) => {
      const child = new TestChild();
      child.stdout.write(
        JSON.stringify({
          ok: false,
          error: "permission-required",
          message: "Screen Recording permission is required.",
        })
      );
      queueMicrotask(() => child.complete(1, null));
      return child;
    };
    const dependencies = providerDependencies(root, spawnChild);
    const failure = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            {
              ...providerOptions({ root: join(root, "managed") }),
              helperCacheRoot: join(root, "helper-cache"),
            },
            dependencies
          );
          return yield* Effect.flip(
            capture.capture({ selection: { _tag: "text-contains", text: "document" } })
          );
        })
      )
    );

    expect(failure).toMatchObject({ reason: "permission-required", operation: "capture" });
  });
});

class TestChild extends EventEmitter implements SupervisedChildProcess {
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  kill(): boolean {
    this.complete(null, "SIGTERM");
    return true;
  }
  complete(code: number | null, signal: NodeJS.Signals | null): void {
    this.stdout.end();
    this.stderr.end();
    this.emit("close", code, signal);
  }
}

function providerOptions(
  overrides: Partial<MacosScreenCaptureKitWindowCaptureOptions["managedDestination"]> = {}
): MacosScreenCaptureKitWindowCaptureOptions {
  return {
    managedDestination: {
      root: overrides.root ?? "/tmp/window-capture-managed",
      filePrefix: overrides.filePrefix ?? "window-",
      retentionMs: overrides.retentionMs ?? 60_000,
    },
  };
}

function providerDependencies(
  root: string,
  spawnChild: SpawnChild
): WindowCaptureProviderDependencies {
  let uniqueId = 0;
  return {
    platform: "darwin",
    darwinKernelRelease: () => "23.0.0",
    tmpdir: () => root,
    now: () => new Date("2026-08-06T12:00:00.000Z"),
    spawnChild: (command, args, options) =>
      args.length === 1 && args[0] === "probe"
        ? successfulProbeChild()
        : spawnChild(command, args, options),
    helperFileSystem: {
      ...defaultHelperFileSystem,
      uniqueId: () => `helper-${uniqueId++}`,
    },
    captureFileSystem: {
      ...defaultCaptureFileSystem,
      uniqueId: () => `capture-${uniqueId++}`,
    },
  };
}

function successfulProbeChild(): TestChild {
  const child = new TestChild();
  child.stdout.write(JSON.stringify({ ok: true, protocol: HELPER_PROBE_PROTOCOL }));
  queueMicrotask(() => child.complete(0, null));
  return child;
}

async function temporaryRoot(): Promise<string> {
  const root = await mkdtempAsync(join(tmpdir(), "window-capture-provider-"));
  roots.push(root);
  return root;
}

async function seedCachedHelper(cacheRoot: string): Promise<string> {
  await defaultHelperFileSystem.mkdir(cacheRoot, { recursive: true });
  const hash = createHash("sha256").update(WINDOW_CAPTURE_HELPER_SOURCE).digest("hex").slice(0, 16);
  const path = join(cacheRoot, `window-capture-screencapturekit-${hash}`);
  await defaultHelperFileSystem.writeFile(path, "cached helper", "utf8");
  return path;
}

function helperSuccess(path: string) {
  return {
    ok: true,
    path,
    pixelWidth: 3,
    pixelHeight: 2,
    frameSource: "screenshot",
    window: {
      windowId: 42,
      applicationName: "Editor",
      bundleIdentifier: "example.editor",
      title: "Document",
      width: 300,
      height: 200,
      onScreen: true,
    },
  } as const;
}

function pngBytes(width: number, height: number): Buffer {
  return pngFromScanlines(width, height, Buffer.alloc(height * (1 + width * 4)));
}

function pngFromScanlines(width: number, height: number, imageData: Buffer, interlace = 0): Buffer {
  return pngFromCompressedImageData(width, height, deflateSync(imageData), interlace);
}

function pngFromCompressedImageData(
  width: number,
  height: number,
  compressedImageData: Buffer,
  interlace = 0
): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[12] = interlace;
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressedImageData),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length);
  return chunk;
}

function argumentValue(args: readonly string[], flag: string): string {
  const index = args.indexOf(flag);
  const value = args[index + 1];
  if (index < 0 || value === undefined) throw new Error(`Missing ${flag} argument.`);
  return value;
}
