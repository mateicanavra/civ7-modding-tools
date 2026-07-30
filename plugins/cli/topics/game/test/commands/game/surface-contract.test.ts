import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const packageRoot = dirname(fileURLToPath(new URL("../../../package.json", import.meta.url)));
const commandRoot = join(packageRoot, "src/commands");

const PUBLIC_COMMAND_IDS = [
  "game:ai:loaded-levers",
  "game:autoplay",
  "game:catalog",
  "game:exec",
  "game:gameinfo",
  "game:health",
  "game:inspect",
  "game:local-data:inspect",
  "game:map",
  "game:map:grid",
  "game:map:plot",
  "game:map:starts",
  "game:map:summary",
  "game:map:visibility",
  "game:operation",
  "game:play:advisor-warning",
  "game:play:assign-worker",
  "game:play:battlefield-scan",
  "game:play:build-production",
  "game:play:buy-attribute",
  "game:play:change-tradition",
  "game:play:choose-celebration",
  "game:play:choose-culture",
  "game:play:choose-government",
  "game:play:choose-narrative",
  "game:play:choose-tech",
  "game:play:civilian-route-triage",
  "game:play:consider-attributes",
  "game:play:consider-town-project",
  "game:play:consider-traditions",
  "game:play:destination-analysis",
  "game:play:dismiss-notification",
  "game:play:dismiss-notification-queue",
  "game:play:end-turn",
  "game:play:expand-city",
  "game:play:formation-snapshot",
  "game:play:front-summary",
  "game:play:notification-queue",
  "game:play:notifications",
  "game:play:priorities",
  "game:play:progress-dashboard",
  "game:play:promotion-readiness",
  "game:play:ready-city",
  "game:play:ready-unit",
  "game:play:rehydrate",
  "game:play:resettle-unit",
  "game:play:respond-diplomacy",
  "game:play:respond-first-meet",
  "game:play:screen:dismiss",
  "game:play:screen:show",
  "game:play:set-culture-target",
  "game:play:set-tech-target",
  "game:play:set-town-focus",
  "game:play:settlement-recommendations",
  "game:play:target-candidates",
  "game:play:topics",
  "game:play:traditions",
  "game:play:unit-move-preview",
  "game:play:unit-target",
  "game:play:upgrade-unit",
  "game:restart",
  "game:status",
  "game:view:appshot",
  "game:view:camera",
  "game:watch",
] as const;

const PUBLIC_TOPICS = {
  game: {
    description: "Operate a running Civilization VII session through local tooling",
  },
  "game:ai": {
    description: "Read loaded Civ7 AI policy levers from runtime GameInfo",
  },
  "game:local-data": {
    description: "Inspect local Civ7 SQLite, save, and log evidence",
  },
  "game:map": {
    description: "Read current world, plot, grid, start, and visibility map state",
  },
  "game:play": {
    description: "Turn-by-turn live-play shortcuts over direct-control",
  },
  "game:play:screen": {
    description: "Inspect and dismiss App UI display-queue screens (cinematic moments)",
  },
  "game:view": {
    description: "Capture a clean, window-scoped screenshot of the live Civ7 session",
  },
} as const;

type PackageManifest = Readonly<{
  oclif?: {
    topics?: Record<string, { description?: unknown }>;
  };
}>;

type OclifManifest = Readonly<{
  commands?: Record<string, { aliases?: unknown; id?: unknown }>;
}>;

describe("game command surface", () => {
  test("keeps source paths, generated manifest, aliases, and topic metadata exact", () => {
    const sourceIds = commandFiles(commandRoot).map(commandIdFromPath).sort();
    expect(sourceIds).toEqual(PUBLIC_COMMAND_IDS);

    const manifest = readJson<OclifManifest>(join(packageRoot, "oclif.manifest.json"));
    const commands = manifest.commands ?? {};
    expect(Object.keys(commands).sort()).toEqual(PUBLIC_COMMAND_IDS);
    for (const id of PUBLIC_COMMAND_IDS) {
      expect(commands[id]?.id).toBe(id);
      expect(commands[id]?.aliases).toEqual([]);
    }

    const packageManifest = readJson<PackageManifest>(join(packageRoot, "package.json"));
    const topics = packageManifest.oclif?.topics ?? {};
    expect(Object.keys(topics).sort()).toEqual(topicIds(PUBLIC_COMMAND_IDS));
    expect(topics).toEqual(PUBLIC_TOPICS);
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

function commandIdFromPath(path: string): string {
  const segments = relative(commandRoot, path).replace(/\.ts$/, "").split(sep);
  if (segments.at(-1) === "index") segments.pop();
  return segments.join(":");
}

function topicIds(commandIds: readonly string[]): string[] {
  const topics = new Set<string>();
  for (const commandId of commandIds) {
    const segments = commandId.split(":");
    for (let length = 1; length < segments.length; length += 1) {
      topics.add(segments.slice(0, length).join(":"));
    }
  }
  return [...topics].sort();
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
