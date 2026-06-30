import { describe, expect, test } from "vitest";
import { repoRoot } from "../../src/lib/paths.js";
import { run } from "../../src/lib/spawn.js";
import { materializeHabitatCommand } from "../../src/lib/workspace-tools.js";

describe("workspace tool command materialization", () => {
  test("routes repo-local tools through Bun's workspace command plane", () => {
    expect(materializeHabitatCommand("grit", ["--version"])).toEqual({
      requestedExecutable: "grit",
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "grit", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeHabitatCommand("format-check", ["--version"])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "biome", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeHabitatCommand("target-check", ["--version"])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "nx", "--version"],
      executionPlane: "workspace-bun-run",
    });
    expect(materializeHabitatCommand("import-boundaries", ["."])).toMatchObject({
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
    expect(materializeHabitatCommand("git", ["status", "--short"])).toEqual({
      requestedExecutable: "git",
      executable: "git",
      argv: ["status", "--short"],
      executionPlane: "system",
    });
  });

  test("sync spawn helper executes workspace-owned Grit without node_modules PATH injection", () => {
    const result = run(["grit", "--version"], { cwd: repoRoot });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("grit");
  });

});
