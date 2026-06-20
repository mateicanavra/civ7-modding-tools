import { describe, expect, test } from "vitest";
import { repoRoot } from "../../src/lib/paths.js";
import {
  materializeDefaultHabitatCommand,
  runSyncSpawnCommand,
} from "../../src/providers/command/index.js";

describe("workspace tool command materialization", () => {
  test("routes repo-local tools through Bun's workspace command plane", () => {
    expect(materializeDefaultHabitatCommand("grit", ["--version"])).toEqual({
      requestedExecutable: "grit",
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "grit", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeDefaultHabitatCommand("format-check", ["--version"])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "biome", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeDefaultHabitatCommand("target-check", ["--version"])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "nx", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeDefaultHabitatCommand("import-boundaries", ["."])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: [
        "run",
        "--cwd",
        repoRoot,
        "eslint",
        "--quiet",
        "--config",
        "eslint.boundaries.config.mjs",
        "--no-config-lookup",
        ".",
      ],
      executionPlane: "workspace-bun-run",
    });
  });

  test("keeps system prerequisites direct", () => {
    expect(materializeDefaultHabitatCommand("git", ["status", "--short"])).toEqual({
      requestedExecutable: "git",
      executable: "git",
      argv: ["status", "--short"],
      executionPlane: "system",
    });
  });

  test("sync spawn helper executes workspace-owned Grit without node_modules PATH injection", () => {
    const result = runSyncSpawnCommand(["grit", "--version"], { cwd: repoRoot });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("grit");
  });
});
