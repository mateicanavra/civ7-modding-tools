import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@civ7/plugin-files", () => ({
  unzipResources: vi.fn(async () => ({
    outputPath: "/out",
    archiveSizeBytes: 0,
    uncompressedSizeBytes: 0,
  })),
}));

vi.mock("@civ7/config", () => ({
  loadConfig: vi.fn(async () => ({ raw: { profiles: { default: {} } }, path: undefined })),
  resolveZipPath: vi.fn(() => "/archive.zip"),
  resolveUnzipDir: vi.fn(() => "/out"),
  findProjectRoot: vi.fn(() => "/project"),
}));

import { unzipResources } from "@civ7/plugin-files";
import Unzip from "../../src/commands/data/unzip";

describe("unzip command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("delegates to plugin-files unzipResources", async () => {
    await Unzip.run(["default"]);
    expect(unzipResources).toHaveBeenCalledWith({
      projectRoot: "/project",
      profile: "default",
      zip: undefined,
      dest: undefined,
      configPath: undefined,
    });
  });
});
