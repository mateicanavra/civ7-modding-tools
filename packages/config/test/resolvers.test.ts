import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:os", async () => {
  const actual = await vi.importActual<typeof import("node:os")>("node:os");
  return { ...actual, platform: vi.fn(actual.platform) };
});

import {
  DEFAULT_INSTALL_DIR_DARWIN,
  expandPath,
  resolveGraphOutDir,
  resolveInstallDir,
  resolveUnzipDir,
  resolveZipPath,
} from "../src/index.js";

afterEach(() => vi.restoreAllMocks());

describe("@civ7/config path helpers", () => {
  it("expands ~ to home directory", () => {
    expect(expandPath("~/mods")).toBe(path.join(os.homedir(), "mods"));
  });

  it("returns original path when not starting with ~", () => {
    expect(expandPath("/absolute")).toBe("/absolute");
  });

  it("resolves zip path with defaults", () => {
    const projectRoot = "/tmp/project";
    const cfg = {};
    const result = resolveZipPath({ projectRoot }, cfg);
    expect(result).toBe(
      path.resolve(projectRoot, ".civ7/outputs/archives/civ7-official-resources.zip")
    );
  });

  it("resolves zip path with profile overrides", () => {
    const projectRoot = "/tmp/project";
    const cfg = {
      outputs: { baseDir: "out", zip: { dir: "base", name: "base.zip" } },
      profiles: {
        dev: {
          outputs: { zip: { dir: "dev", name: "dev.zip" } },
        },
      },
    };
    const result = resolveZipPath({ projectRoot, profile: "dev" }, cfg);
    expect(result).toBe(path.resolve(projectRoot, "out/dev/dev.zip"));
  });

  it("resolves unzip directory with defaults", () => {
    const projectRoot = "/tmp/project";
    const cfg = {};
    const result = resolveUnzipDir({ projectRoot }, cfg);
    expect(result).toBe(path.resolve(projectRoot, ".civ7/outputs/resources"));
  });

  it("resolves graph output directory with sanitized seed", () => {
    const projectRoot = "/tmp/project";
    const cfg = {};
    const result = resolveGraphOutDir({ projectRoot }, cfg, "Seed With Spaces!%");
    expect(result).toBe(path.resolve(projectRoot, ".civ7/outputs/graph/Seed_With_Spaces__"));
  });

  it("uses install flag when provided", () => {
    const result = resolveInstallDir({}, "~/game");
    expect(result).toBe(path.join(os.homedir(), "game"));
  });

  it("uses the admitted config install directory before legacy and platform defaults", () => {
    expect(resolveInstallDir({ inputs: { installDir: "~/configured-game" } })).toBe(
      path.join(os.homedir(), "configured-game")
    );
  });

  it("preserves the legacy source-path fallback", () => {
    expect(resolveInstallDir({ src_path: "~/legacy-game" })).toBe(
      path.join(os.homedir(), "legacy-game")
    );
  });

  it("uses the host platform default when no authored install path exists", () => {
    vi.mocked(os.platform).mockReturnValue("darwin");
    expect(resolveInstallDir({})).toBe(expandPath(DEFAULT_INSTALL_DIR_DARWIN));
  });

  it("gives explicit output paths precedence over profile and global configuration", () => {
    const projectRoot = "/tmp/project";
    const cfg = { outputs: { baseDir: "configured" } };

    expect(resolveZipPath({ projectRoot }, cfg, "explicit.zip")).toBe(
      path.resolve(projectRoot, "explicit.zip")
    );
    expect(resolveUnzipDir({ projectRoot }, cfg, "explicit-unzip")).toBe(
      path.resolve(projectRoot, "explicit-unzip")
    );
    expect(resolveGraphOutDir({ projectRoot }, cfg, "seed", "explicit-graph")).toBe(
      path.resolve(projectRoot, "explicit-graph")
    );
  });

  it("falls back to global output configuration when a requested profile is absent", () => {
    const projectRoot = "/tmp/project";
    const cfg = {
      outputs: {
        baseDir: "global",
        zip: { dir: "archives", name: "global.zip" },
      },
    };

    expect(resolveZipPath({ projectRoot, profile: "missing" }, cfg)).toBe(
      path.resolve(projectRoot, "global/archives/global.zip")
    );
  });

  it("uses profile-owned base and unzip directories together", () => {
    const projectRoot = "/tmp/project";
    const cfg = {
      profiles: {
        docs: { outputs: { baseDir: "docs", unzip: { dir: "assets" } } },
      },
    };

    expect(resolveUnzipDir({ projectRoot, profile: "docs" }, cfg)).toBe(
      path.resolve(projectRoot, "docs/assets")
    );
  });

  it("uses the globally configured graph output path", () => {
    const projectRoot = "/tmp/project";
    const cfg = { outputs: { baseDir: "global", graph: { dir: "graphs" } } };

    expect(resolveGraphOutDir({ projectRoot }, cfg, "SEED")).toBe(
      path.resolve(projectRoot, "global/graphs/SEED")
    );
  });

  it("lets partial profiles override one field while inheriting the remaining global path", () => {
    const projectRoot = "/tmp/project";
    const cfg = {
      outputs: {
        baseDir: "global",
        zip: { dir: "archives", name: "global.zip" },
        unzip: { dir: "resources" },
      },
      profiles: {
        partial: { outputs: { zip: { name: "partial.zip" } } },
      },
    };

    expect(resolveZipPath({ projectRoot, profile: "partial" }, cfg)).toBe(
      path.resolve(projectRoot, "global/archives/partial.zip")
    );
    expect(resolveUnzipDir({ projectRoot, profile: "partial" }, cfg)).toBe(
      path.resolve(projectRoot, "global/resources")
    );
  });
});
