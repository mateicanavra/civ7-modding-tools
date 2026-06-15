import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, relative } from "node:path";

export const DEFAULT_CIV7_APP_RESOURCES_ROOT = join(
  homedir(),
  "Library",
  "Application Support",
  "Steam",
  "steamapps",
  "common",
  "Sid Meier's Civilization VII",
  "CivilizationVII.app",
  "Contents",
  "Resources"
);

export type Civ7SetupCatalogOption = Readonly<{
  value: string;
  label: string;
  source: "official-resource-mirror" | "app-resources";
  sourcePath: string;
}>;

export type Civ7SetupCatalog = Readonly<{
  observedAt: string;
  roots: ReadonlyArray<{
    source: Civ7SetupCatalogOption["source"];
    path: string;
    exists: boolean;
  }>;
  sourceFileCount: number;
  leaders: ReadonlyArray<Civ7SetupCatalogOption>;
  civilizations: ReadonlyArray<Civ7SetupCatalogOption>;
  difficulties: ReadonlyArray<Civ7SetupCatalogOption>;
  gameSpeeds: ReadonlyArray<Civ7SetupCatalogOption>;
}>;

type CatalogInput = Readonly<{
  repoRoot: string;
  appResourcesRoot?: string;
}>;

type CatalogMaps = {
  leaders: Map<string, Civ7SetupCatalogOption>;
  civilizations: Map<string, Civ7SetupCatalogOption>;
  difficulties: Map<string, Civ7SetupCatalogOption>;
  gameSpeeds: Map<string, Civ7SetupCatalogOption>;
};

type RowRecord = Readonly<Record<string, string>>;

const DIFFICULTY_ORDER = [
  "DIFFICULTY_SETTLER",
  "DIFFICULTY_PRINCE",
  "DIFFICULTY_KING",
  "DIFFICULTY_EMPEROR",
  "DIFFICULTY_IMMORTAL",
  "DIFFICULTY_DEITY",
  "DIFFICULTY_CUSTOM",
] as const;

const GAME_SPEED_ORDER = [
  "GAMESPEED_MARATHON",
  "GAMESPEED_EPIC",
  "GAMESPEED_STANDARD",
  "GAMESPEED_QUICK",
  "GAMESPEED_ONLINE",
] as const;

export async function loadCiv7SetupCatalog(input: CatalogInput): Promise<Civ7SetupCatalog> {
  const roots = [
    {
      source: "official-resource-mirror" as const,
      path: join(input.repoRoot, ".civ7", "outputs", "resources"),
    },
    {
      source: "app-resources" as const,
      path: input.appResourcesRoot ?? DEFAULT_CIV7_APP_RESOURCES_ROOT,
    },
  ];
  const maps: CatalogMaps = {
    leaders: new Map(),
    civilizations: new Map(),
    difficulties: new Map(),
    gameSpeeds: new Map(),
  };
  const observedRoots: Array<Civ7SetupCatalog["roots"][number]> = [];
  let sourceFileCount = 0;

  for (const root of roots) {
    const exists = await pathExists(root.path);
    observedRoots.push({ ...root, exists });
    if (!exists) continue;
    const files = await listSetupXmlFiles(root.path);
    sourceFileCount += files.length;
    for (const file of files) {
      const text = await readFile(file, "utf8");
      ingestSetupXml(text, {
        maps,
        source: root.source,
        sourcePath: relative(root.path, file) || basename(file),
      });
    }
  }

  return {
    observedAt: new Date().toISOString(),
    roots: observedRoots,
    sourceFileCount,
    leaders: sortByLabel(Array.from(maps.leaders.values())),
    civilizations: sortByLabel(Array.from(maps.civilizations.values())),
    difficulties: sortByKnownOrder(Array.from(maps.difficulties.values()), DIFFICULTY_ORDER),
    gameSpeeds: sortByKnownOrder(Array.from(maps.gameSpeeds.values()), GAME_SPEED_ORDER),
  };
}

async function pathExists(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false
  );
}

async function listSetupXmlFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  await collectSetupXmlFiles(root, files);
  return files;
}

async function collectSetupXmlFiles(directory: string, files: string[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectSetupXmlFiles(path, files);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".xml")) continue;
    if (!/(?:civilization|leader|difficult|game-speeds|gamespeed)/i.test(entry.name)) continue;
    files.push(path);
  }
}

function ingestSetupXml(
  text: string,
  context: Readonly<{
    maps: CatalogMaps;
    source: Civ7SetupCatalogOption["source"];
    sourcePath: string;
  }>
): void {
  for (const row of readXmlRows(text)) {
    const leader = row.LeaderType;
    if (leader && isMajorLeaderValue(leader) && isPlayableLeaderRow(row)) {
      addOption(context.maps.leaders, leader, row.Name, context);
    }

    const civilization = row.CivilizationType;
    if (
      civilization &&
      isPlayableCivilizationValue(civilization) &&
      isPlayableCivilizationRow(row)
    ) {
      addOption(context.maps.civilizations, civilization, row.Name, context);
    }

    const difficulty = row.DifficultyType;
    if (difficulty && /^DIFFICULTY_[A-Z0-9_]+$/.test(difficulty) && row.Name) {
      addOption(context.maps.difficulties, difficulty, row.Name, context);
    }

    const gameSpeed = row.GameSpeedType;
    if (gameSpeed && /^GAMESPEED_[A-Z0-9_]+$/.test(gameSpeed) && row.Name) {
      addOption(context.maps.gameSpeeds, gameSpeed, row.Name, context);
    }
  }
}

function readXmlRows(text: string): RowRecord[] {
  const rows: RowRecord[] = [];
  const rowPattern = /<Row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Row>)/g;
  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(text)) !== null) {
    rows.push({
      ...readXmlAttributes(match[1] ?? ""),
      ...readXmlChildren(match[2] ?? ""),
    });
  }
  return rows;
}

function readXmlAttributes(text: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /([A-Za-z0-9_:-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(text)) !== null) {
    attrs[match[1]!] = decodeXml(match[2] ?? "");
  }
  return attrs;
}

function readXmlChildren(text: string): Record<string, string> {
  const children: Record<string, string> = {};
  const childPattern = /<([A-Za-z0-9_:-]+)>([^<]*)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = childPattern.exec(text)) !== null) {
    children[match[1]!] = decodeXml(match[2]?.trim() ?? "");
  }
  return children;
}

function addOption(
  map: Map<string, Civ7SetupCatalogOption>,
  value: string,
  name: string | undefined,
  context: Readonly<{
    source: Civ7SetupCatalogOption["source"];
    sourcePath: string;
  }>
): void {
  const next = {
    value,
    label: labelForCiv7Value(value, name),
    source: context.source,
    sourcePath: context.sourcePath,
  };
  const current = map.get(value);
  if (!current || context.source === "app-resources") {
    map.set(value, next);
  }
}

function isMajorLeaderValue(value: string): boolean {
  return (
    /^LEADER_[A-Z0-9_]+$/.test(value) &&
    value !== "LEADER_DEFAULT" &&
    value !== "LEADER_INDEPENDENT" &&
    !value.startsWith("LEADER_MINOR_CIV_")
  );
}

function isPlayableLeaderRow(row: RowRecord): boolean {
  if (!row.Name) return false;
  if (row.IsIndependentLeader === "true") return false;
  if (row.IsMajorLeader !== undefined) return row.IsMajorLeader === "true";
  return true;
}

function isPlayableCivilizationValue(value: string): boolean {
  return (
    /^CIVILIZATION_[A-Z0-9_]+$/.test(value) &&
    value !== "CIVILIZATION_NONE" &&
    value !== "CIVILIZATION_INDEPENDENT" &&
    !value.startsWith("CIVILIZATION_PLACEHOLDER")
  );
}

function isPlayableCivilizationRow(row: RowRecord): boolean {
  if (!row.Name) return false;
  if (row.StartingCivilizationLevelType !== undefined) {
    return row.StartingCivilizationLevelType === "CIVILIZATION_LEVEL_FULL_CIV";
  }
  return true;
}

function labelForCiv7Value(value: string, name: string | undefined): string {
  if (name && !name.startsWith("LOC_")) return name;
  const source = name && name.startsWith("LOC_") ? name : value;
  return source
    .replace(/^LOC_/, "")
    .replace(/_NAME$/, "")
    .replace(/^(?:LEADER_|CIVILIZATION_|DIFFICULTY_|GAMESPEED_)/, "")
    .replace(/^(?:LEADER_|CIVILIZATION_|DIFFICULTY_|GAMESPEED_)/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function sortByLabel(options: Civ7SetupCatalogOption[]): Civ7SetupCatalogOption[] {
  return options.sort((a, b) => a.label.localeCompare(b.label) || a.value.localeCompare(b.value));
}

function sortByKnownOrder(
  options: Civ7SetupCatalogOption[],
  order: ReadonlyArray<string>
): Civ7SetupCatalogOption[] {
  const positions = new Map(order.map((value, index) => [value, index]));
  return options.sort((a, b) => {
    const aPosition = positions.get(a.value) ?? Number.MAX_SAFE_INTEGER;
    const bPosition = positions.get(b.value) ?? Number.MAX_SAFE_INTEGER;
    return (
      aPosition - bPosition || a.label.localeCompare(b.label) || a.value.localeCompare(b.value)
    );
  });
}
