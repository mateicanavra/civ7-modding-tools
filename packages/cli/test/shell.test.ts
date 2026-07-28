import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
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

describe("civ7 CLI shell", () => {
  test("registers the admitted plugins and exposes every topic from the production binary", () => {
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
    expect(registeredPlugins).toContain("@oclif/plugin-help");
    for (const topicPackageName of topicPackageNames) {
      expect(registeredPlugins.filter((plugin) => plugin === topicPackageName)).toHaveLength(1);
      expect(manifest.dependencies?.[topicPackageName]).toBe("workspace:*");
    }

    for (const topicManifest of topicManifests) {
      expect(topicManifest).not.toHaveProperty("bin");
      expect(topicManifest.oclif).not.toHaveProperty("hooks");
    }

    const result = spawnSync("node", [join(packageRoot, "bin/run.js"), "--help"], {
      cwd: packageRoot,
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    const topLevelTopics = new Set(
      topicManifests.flatMap((topicManifest) =>
        Object.keys(topicManifest.oclif?.topics ?? {}).map((topic) => topic.split(":", 1)[0])
      )
    );
    for (const topic of topLevelTopics) {
      expect(result.stdout).toMatch(new RegExp(`^  ${topic}\\s`, "m"));
    }
  });
});
