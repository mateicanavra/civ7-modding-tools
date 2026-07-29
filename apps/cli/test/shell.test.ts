import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Config, type Interfaces, toStandardizedId } from "@oclif/core";
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

interface CommandIdentityClaim {
  canonicalId: string;
  id: string;
  kind: "alias" | "canonical" | "hiddenAlias";
  pluginName: string;
}

interface TopicPackage {
  manifest: PackageManifest;
  name: string;
  root: string;
}

interface RegisteredTopicPackage extends TopicPackage {
  commandManifest: Interfaces.Manifest;
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

const shellManifest = readManifest(join(packageRoot, "package.json"));
const shellTopics = readShellTopics(shellManifest);

describe("civ7 CLI shell", () => {
  test("keeps every registered topic's source, manifest, and shell identities exact", async () => {
    for (const topic of shellTopics.registered) {
      const commandRoot = join(topic.root, "src/commands");
      const sourceIds = commandFiles(commandRoot).map((path) =>
        commandIdFromPath(commandRoot, path)
      );
      expect(new Set(sourceIds).size, `${topic.name} source ids`).toBe(sourceIds.length);

      const commandRows = topic.commandManifest.commands;
      const manifestIds = Object.keys(commandRows);
      expect(manifestIds.sort(), `${topic.name} manifest ids`).toEqual(sourceIds.sort());
      for (const manifestId of manifestIds) {
        expect(commandRows[manifestId].id, `${topic.name} row ${manifestId}`).toBe(manifestId);
      }
    }

    const config = await Config.load({
      devPlugins: false,
      root: packageRoot,
      userPlugins: false,
    });
    const claims = shellTopics.registered.flatMap((topic) =>
      commandIdentityClaims(topic.name, topic.commandManifest, config)
    );
    const claimsById = new Map<string, CommandIdentityClaim[]>();
    for (const claim of claims) {
      const owners = claimsById.get(claim.id) ?? [];
      owners.push(claim);
      claimsById.set(claim.id, owners);
    }

    const collisions = [...claimsById.entries()]
      .filter(([, owners]) => owners.length > 1)
      .map(([id, owners]) => ({
        id,
        owners: owners
          .map((owner) => `${owner.pluginName}:${owner.canonicalId} (${owner.kind})`)
          .sort(),
      }))
      .sort((left, right) => left.id.localeCompare(right.id));
    expect(
      collisions,
      "oclif silently resolves shell-wide command collisions by plugin priority"
    ).toEqual([]);

    const assembledIds = new Set(config.commandIDs);
    for (const claim of claims) {
      expect(assembledIds.has(claim.id), `${claim.kind} ${claim.id} is exposed`).toBe(true);
      const resolved = config.findCommand(claim.id);
      expect(resolved, `${claim.kind} ${claim.id} resolves`).toBeDefined();
      expect(resolved?.id, `${claim.kind} ${claim.id} resolved id`).toBe(claim.id);
      expect(resolved?.pluginName, `${claim.kind} ${claim.id} owner`).toBe(claim.pluginName);

      if (claim.kind === "alias") {
        expect(
          resolved?.aliases.map((alias) => toStandardizedId(alias, config)),
          `${claim.id} public alias owner`
        ).toContain(claim.id);
      } else if (claim.kind === "hiddenAlias") {
        expect(
          resolved?.hiddenAliases.map((alias) => toStandardizedId(alias, config)),
          `${claim.id} hidden alias owner`
        ).toContain(claim.id);
      }
    }
  });

  test("registers each topic once and preserves development-production command parity", () => {
    const topicPackageNames = shellTopics.available.map((topic) => topic.name);

    expect(shellManifest.oclif).not.toHaveProperty("commands");
    const registeredPlugins = shellManifest.oclif?.plugins ?? [];
    expect([...registeredPlugins].sort()).toEqual(
      ["@oclif/plugin-help", ...topicPackageNames].sort()
    );
    for (const topicPackageName of topicPackageNames) {
      expect(shellManifest.dependencies?.[topicPackageName]).toBe("workspace:*");
    }

    for (const topic of shellTopics.available) {
      expect(topic.manifest).not.toHaveProperty("bin");
      expect(topic.manifest.oclif).not.toHaveProperty("hooks");
    }

    const home = mkdtempSync(join(tmpdir(), "civ7-cli-shell-"));
    const production = runShell(join(packageRoot, "bin/run.js"), ["--help"], home);
    const development = runShell("bun", [join(packageRoot, "civ7.ts"), "--help"], home);
    rmSync(home, { force: true, recursive: true });

    expect(production.status, production.stderr).toBe(0);
    expect(development.status, development.stderr).toBe(0);
    expect(development.stdout).toBe(production.stdout);
    const topLevelTopics = new Set(
      shellTopics.available.flatMap((topicPackage) =>
        Object.keys(topicPackage.manifest.oclif?.topics ?? {}).map(
          (topic) => topic.split(":", 1)[0]
        )
      )
    );
    for (const topic of topLevelTopics) {
      const topicRows = production.stdout.match(new RegExp(`^  ${topic}\\s`, "gm")) ?? [];
      expect(topicRows, `expected one ${topic} topic row`).toHaveLength(1);
    }
  });
});

function commandFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return commandFiles(path);
    if (!entry.isFile() || !entry.name.endsWith(".ts")) return [];
    return [path];
  });
}

function commandIdFromPath(commandRoot: string, path: string): string {
  const segments = relative(commandRoot, path).replace(/\.ts$/, "").split(sep);
  if (segments.at(-1) === "index") segments.pop();
  return segments.join(":");
}

function commandIdentityClaims(
  pluginName: string,
  manifest: Interfaces.Manifest,
  config: Config
): CommandIdentityClaim[] {
  return Object.entries(manifest.commands).flatMap(([canonicalId, command]) => [
    {
      canonicalId,
      id: toStandardizedId(canonicalId, config),
      kind: "canonical",
      pluginName,
    },
    ...command.aliases.map((alias) => ({
      canonicalId,
      id: toStandardizedId(alias, config),
      kind: "alias" as const,
      pluginName,
    })),
    ...command.hiddenAliases.map((alias) => ({
      canonicalId,
      id: toStandardizedId(alias, config),
      kind: "hiddenAlias" as const,
      pluginName,
    })),
  ]);
}

function readOclifManifest(path: string): Interfaces.Manifest {
  return JSON.parse(readFileSync(path, "utf8")) as Interfaces.Manifest;
}

function readShellTopics(manifest: PackageManifest): {
  available: TopicPackage[];
  registered: RegisteredTopicPackage[];
} {
  const available = readdirSync(topicRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const root = join(topicRoot, entry.name);
      const topicManifest = readManifest(join(root, "package.json"));
      if (typeof topicManifest.name !== "string") {
        throw new TypeError("CLI topic packages must declare a package name");
      }

      return {
        manifest: topicManifest,
        name: topicManifest.name,
        root,
      };
    });
  const topicsByName = new Map(available.map((topic) => [topic.name, topic]));
  const registered = (manifest.oclif?.plugins ?? [])
    .filter((pluginName) => pluginName !== "@oclif/plugin-help")
    .map((pluginName) => {
      const topic = topicsByName.get(pluginName);
      if (!topic) {
        throw new TypeError(`Registered CLI topic ${pluginName} has no topic package`);
      }

      return {
        ...topic,
        commandManifest: readOclifManifest(join(topic.root, "oclif.manifest.json")),
      };
    });

  return { available, registered };
}
