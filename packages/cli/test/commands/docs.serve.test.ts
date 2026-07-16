import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const spawn = vi.fn((options: { cmd: string[] }) => ({
  kill: vi.fn(),
  exited: Promise.resolve(0),
  options,
}));

vi.mock("@civ7/plugin-files", () => ({
  unzipResources: vi.fn(async () => {}),
}));

vi.mock("@civ7/config", async () => {
  const actual = await vi.importActual<typeof import("@civ7/config")>("@civ7/config");
  return {
    ...actual,
    findProjectRoot: vi.fn(() => "/project"),
  };
});

vi.mock("node:fs", () => ({
  existsSync: vi.fn((p: string) => p.includes("/apps/docs")),
  promises: {
    mkdir: vi.fn(async () => {}),
    stat: vi.fn(async (_path: string) => ({ isFile: () => true, isDirectory: () => false })),
    rm: vi.fn(async () => {}),
    cp: vi.fn(async () => {}),
    copyFile: vi.fn(async () => {}),
    readFile: vi.fn(async () => Buffer.from("index")),
  },
}));

import * as fs from "node:fs";
import { unzipResources } from "@civ7/plugin-files";
import DocsServe from "../../src/commands/docs/serve";

describe("docs serve command", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.CI = "1";
    // Minimal Bun mock for bunx mint
    spawn.mockClear();
    vi.stubGlobal("Bun", { spawn });
  });
  afterEach(() => {
    process.env = OLD_ENV;
    vi.unstubAllGlobals();
  });

  test("serves docs and syncs resources by default", async () => {
    await DocsServe.run([]);
    expect(fs.existsSync).toHaveBeenCalled();
    expect(unzipResources).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
    const call = spawn.mock.calls[0][0];
    expect(call.cmd[0]).toBe("bunx");
    expect(call.cmd.includes("mint")).toBe(true);
  });

  test("supports --engine docsify", async () => {
    await DocsServe.run(["--engine", "docsify"]);
    const call = spawn.mock.calls[0][0];
    expect(call.cmd.includes("docsify-cli")).toBe(true);
  });

  test("supports --skipSync to avoid syncing", async () => {
    await DocsServe.run(["--skipSync"]);
    expect(unzipResources).not.toHaveBeenCalled();
    expect(spawn).toHaveBeenCalled();
  });

  test("errors when siteDir missing", async () => {
    vi.mocked(fs.existsSync).mockImplementationOnce(() => false);
    await expect(DocsServe.run(["--siteDir", "/missing"])).rejects.toThrow();
  });
});
