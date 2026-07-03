import { defaultWorkspaceToolPolicies } from "@internal/habitat-harness/substrate/config/index";
import { repoRoot } from "@internal/habitat-harness/substrate/lib/paths";
import { materializeDefaultHabitatCommand } from "@internal/habitat-harness/substrate/providers/command/index";
import { describe, expect, test } from "vitest";

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
    expect(materializeDefaultHabitatCommand("nx", ["--version"])).toMatchObject({
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, "nx", "--version"],
      executionPlane: "workspace-bun-run",
    });
  });

  test("does not keep a legacy target-check alias for Nx", () => {
    expect(defaultWorkspaceToolPolicies.has("target-check")).toBe(false);
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
