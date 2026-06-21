import { describe, expect, test } from "vitest";
import { repoRoot } from "../../src/lib/paths.js";
import { materializeDefaultHabitatCommand } from "../../src/providers/command/index.js";

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
        "--cache",
        "--cache-strategy",
        "content",
        "--cache-location",
        ".nx/cache/eslint-boundaries",
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

  test("materializes native Grit fixture proof without executing the vendor in unit tests", () => {
    expect(materializeDefaultHabitatCommand("grit", ["patterns", "test"])).toEqual({
      requestedExecutable: "grit",
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "grit", "patterns", "test"],
      executionPlane: "workspace-bun-run",
    });
  });
});
