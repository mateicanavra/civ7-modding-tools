import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const packageRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const topicRoot = join(packageRoot, "../../plugins/cli/topics");

interface PackageManifest {
  bin?: unknown;
  dependencies?: Record<string, string>;
  name?: unknown;
  oclif?: {
    commands?: unknown;
    hooks?: unknown;
    plugins?: string[];
    topics?: Record<string, unknown>;
  };
}

function readManifest(path: string): PackageManifest {
  return JSON.parse(readFileSync(path, "utf8")) as PackageManifest;
}

function runShell(executable: string, args: readonly string[], home: string) {
  return spawnSync(executable, args, {
    cwd: packageRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: home,
      XDG_CACHE_HOME: join(home, ".cache"),
      XDG_CONFIG_HOME: join(home, ".config"),
      XDG_DATA_HOME: join(home, ".local/share"),
    },
  });
}

describe("civ7 CLI shell", () => {
  test("registers each topic once and preserves development-production command parity", () => {
    const manifest = readManifest(join(packageRoot, "package.json"));
    const topicManifests = readdirSync(topicRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => readManifest(join(topicRoot, entry.name, "package.json")));
    const topicPackageNames = topicManifests.map((topicManifest) => {
      if (typeof topicManifest.name !== "string") {
        throw new TypeError("CLI topic packages must declare a package name");
      }
      return topicManifest.name;
    });

    expect(manifest.oclif).not.toHaveProperty("commands");
    const registeredPlugins = manifest.oclif?.plugins ?? [];
    expect([...registeredPlugins].sort()).toEqual(
      ["@oclif/plugin-help", ...topicPackageNames].sort()
    );
    for (const topicPackageName of topicPackageNames) {
      expect(manifest.dependencies?.[topicPackageName]).toBe("workspace:*");
    }

    for (const topicManifest of topicManifests) {
      expect(topicManifest).not.toHaveProperty("bin");
      expect(topicManifest.oclif).not.toHaveProperty("hooks");
    }

    const home = mkdtempSync(join(tmpdir(), "civ7-cli-shell-"));
    const production = runShell(join(packageRoot, "bin/run.js"), ["--help"], home);
    const development = runShell("bun", [join(packageRoot, "civ7.ts"), "--help"], home);
    rmSync(home, { force: true, recursive: true });

    expect(production.status, production.stderr).toBe(0);
    expect(development.status, development.stderr).toBe(0);
    expect(development.stdout).toBe(production.stdout);
    const topLevelTopics = new Set(
      topicManifests.flatMap((topicManifest) =>
        Object.keys(topicManifest.oclif?.topics ?? {}).map((topic) => topic.split(":", 1)[0])
      )
    );
    for (const topic of topLevelTopics) {
      const topicRows = production.stdout.match(new RegExp(`^  ${topic}\\s`, "gm")) ?? [];
      expect(topicRows, `expected one ${topic} topic row`).toHaveLength(1);
    }
  });
});
