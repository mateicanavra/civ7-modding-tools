import * as path from "node:path";
import * as Config from "@civ7/config";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resolveRootFromConfigOrFlag } from "../../src/adapters/resource-root";

vi.mock("@civ7/config", () => ({
  expandPath: vi.fn((value: string) => value),
  loadConfig: vi.fn(),
  resolveUnzipDir: vi.fn(),
}));

const mockedConfig = vi.mocked(Config);

describe("resolveRootFromConfigOrFlag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("resolves an explicit root relative to the project", async () => {
    const result = await resolveRootFromConfigOrFlag({
      projectRoot: "/project",
      profile: "default",
      flagsRoot: "resources",
    });

    expect(result).toBe(path.resolve("/project", "resources"));
    expect(mockedConfig.expandPath).toHaveBeenCalledWith("resources");
    expect(mockedConfig.loadConfig).not.toHaveBeenCalled();
  });

  test("resolves the configured unzip directory for the selected profile", async () => {
    const config = { outputs: { unzip: { dir: "resources" } } };
    mockedConfig.loadConfig.mockResolvedValue({ raw: config, path: "/project/civ.config.jsonc" });
    mockedConfig.resolveUnzipDir.mockReturnValue("/project/out/resources");

    const result = await resolveRootFromConfigOrFlag({
      projectRoot: "/project",
      profile: "full",
      flagsConfig: "custom.config.jsonc",
    });

    expect(mockedConfig.loadConfig).toHaveBeenCalledWith("/project", "custom.config.jsonc");
    expect(mockedConfig.resolveUnzipDir).toHaveBeenCalledWith(
      { projectRoot: "/project", profile: "full" },
      config
    );
    expect(result).toBe("/project/out/resources");
  });
});
