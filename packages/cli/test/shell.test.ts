import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const packageRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

describe("civ7 CLI shell", () => {
  test("registers the admitted plugins and exposes every topic from the production binary", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
      oclif?: { plugins?: unknown };
    };
    expect(manifest.oclif?.plugins).toEqual([
      "@oclif/plugin-help",
      "@civ7/cli-data",
      "@civ7/cli-docs",
      "@civ7/cli-game",
      "@civ7/cli-git-mod",
    ]);

    const result = spawnSync("node", [join(packageRoot, "bin/run.js"), "--help"], {
      cwd: packageRoot,
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    for (const topic of ["data", "docs", "game", "git", "mod"]) {
      expect(result.stdout).toMatch(new RegExp(`^  ${topic}\\s`, "m"));
    }
  });
});
