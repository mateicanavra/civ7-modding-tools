import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Type, type Static } from "typebox";

import type {
  Civ7CapabilityCatalogOptions,
  Civ7RootInspectionInput,
  Civ7RootInspectionResult,
} from "../index";

export const Civ7CapabilityCatalogEntrySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  role: Type.Union([Type.Literal("app-ui"), Type.Literal("tuner"), Type.Literal("shared")]),
  kind: Type.Union([
    Type.Literal("root"),
    Type.Literal("method"),
    Type.Literal("read-wrapper"),
    Type.Literal("action-wrapper"),
    Type.Literal("enum"),
    Type.Literal("gameinfo-table"),
  ]),
  owner: Type.String(),
  risk: Type.Union([Type.Literal("read"), Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")]),
  provenance: Type.Array(Type.String()),
  state: Type.Optional(Type.String()),
  root: Type.Optional(Type.String()),
  method: Type.Optional(Type.String()),
  wrapper: Type.Optional(Type.String()),
  confidence: Type.Union([Type.Literal("source"), Type.Literal("recorded-live-proof"), Type.Literal("runtime"), Type.Literal("inference")]),
  description: Type.Optional(Type.String()),
});

export type Civ7CapabilityCatalogEntry = Static<typeof Civ7CapabilityCatalogEntrySchema>;

export const Civ7CapabilityCatalogSchema = Type.Object({
  generatedAt: Type.String(),
  source: Type.Union([Type.Literal("runtime"), Type.Literal("static"), Type.Literal("merged")]),
  version: Type.String(),
  entries: Type.Array(Civ7CapabilityCatalogEntrySchema),
});

export type Civ7CapabilityCatalog = Static<typeof Civ7CapabilityCatalogSchema>;

export const DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS = [
  "Network",
  "Configuration",
  "GameSetup",
  "Autoplay",
  "Game",
  "UI",
  "GameContext",
  "PlayerIds",
  "Players",
  "GameplayMap",
  "GameInfo",
  "Database",
] as const;
export const DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS = [
  "Autoplay",
  "Game",
  "GameplayMap",
  "Players",
  "Units",
  "Cities",
  "MapUnits",
  "MapCities",
  "Visibility",
  "ResourceBuilder",
  "GameInfo",
  "Database",
  "UnitOperationTypes",
  "UnitCommandTypes",
  "CityOperationTypes",
  "CityCommandTypes",
  "PlayerOperationTypes",
] as const;

type CapabilityCatalogDependencies = Readonly<{
  appUiRoots: ReadonlyArray<string>;
  gameinfoTables: ReadonlyArray<string>;
  inspectRoot: (
    input: Civ7RootInspectionInput,
    options?: Civ7CapabilityCatalogOptions,
  ) => Promise<Civ7RootInspectionResult>;
  tunerRoots: ReadonlyArray<string>;
}>;

export function createStaticCiv7CapabilityCatalog(options: {
  gameinfoTables: ReadonlyArray<string>;
}): Civ7CapabilityCatalog {
  return {
    generatedAt: new Date().toISOString(),
    source: "static",
    version: "direct-control-v1",
    entries: [
      ...STATIC_CIV7_CAPABILITY_ENTRIES,
      ...options.gameinfoTables.map((table): Civ7CapabilityCatalogEntry => ({
        id: `gameinfo.${table}`,
        name: table,
        role: "tuner",
        kind: "gameinfo-table",
        owner: "@civ7/direct-control",
        risk: "read",
        provenance: ["DEFAULT_CIV7_GAMEINFO_TABLES", "capability-inventory"],
        confidence: "source",
        description: `Targeted GameInfo.${table} read surface.`,
      })),
    ],
  };
}

export async function generateCiv7CapabilityCatalog(
  options: Civ7CapabilityCatalogOptions = {},
  dependencies: CapabilityCatalogDependencies,
): Promise<Civ7CapabilityCatalog> {
  const includeStatic = options.includeStatic !== false;
  const includeRuntime = options.includeRuntime !== false;
  const entries: Civ7CapabilityCatalogEntry[] = includeStatic
    ? [...createStaticCiv7CapabilityCatalog({ gameinfoTables: dependencies.gameinfoTables }).entries]
    : [];
  if (includeRuntime) {
    const [appUi, tuner] = await Promise.all([
      dependencies.inspectRoot({
        state: { role: "app-ui" },
        roots: options.appUiRoots ?? dependencies.appUiRoots,
        maxRoots: 32,
        maxKeys: 128,
        maxMethods: 128,
        includeSignatures: false,
      }, options),
      dependencies.inspectRoot({
        state: { role: "tuner" },
        roots: options.tunerRoots ?? dependencies.tunerRoots,
        maxRoots: 32,
        maxKeys: 128,
        maxMethods: 128,
        includeSignatures: false,
      }, options),
    ]);
    entries.push(...capabilityEntriesFromInspection(appUi, "app-ui"));
    entries.push(...capabilityEntriesFromInspection(tuner, "tuner"));
  }
  return dedupeCapabilityCatalog({
    generatedAt: new Date().toISOString(),
    source: includeStatic && includeRuntime ? "merged" : includeRuntime ? "runtime" : "static",
    version: "direct-control-v1",
    entries,
  });
}

export async function loadCiv7OfficialResourceCapabilities(options: {
  resourcesRoot: string;
  maxFiles?: number;
}): Promise<ReadonlyArray<Civ7CapabilityCatalogEntry>> {
  const maxFiles = options.maxFiles ?? 2_000;
  const files = await listFiles(options.resourcesRoot, maxFiles);
  const patterns: ReadonlyArray<Readonly<{ id: string; label: string; pattern: RegExp; risk: Civ7CapabilityCatalogEntry["risk"] }>> = [
    { id: "official.Network.restartGame", label: "Network.restartGame", pattern: /Network\.restartGame/g, risk: "medium" },
    { id: "official.UI.notifyUIReady", label: "UI.notifyUIReady", pattern: /UI\.notifyUIReady/g, risk: "medium" },
    { id: "official.Autoplay", label: "Autoplay setters", pattern: /Autoplay\.set(?:Active|Turns|Pause|ObserveAsPlayer|ReturnAsPlayer)/g, risk: "medium" },
    { id: "official.GameContext.turn", label: "GameContext turn completion", pattern: /GameContext\.(?:sendTurnComplete|sendUnreadyTurn|hasSentTurnComplete)/g, risk: "medium" },
    { id: "official.Visibility.revealAllPlots", label: "Visibility.revealAllPlots", pattern: /Visibility\.revealAllPlots/g, risk: "high" },
    { id: "official.Game.UnitOperations", label: "Game.UnitOperations", pattern: /Game\.UnitOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
    { id: "official.Game.CityOperations", label: "Game.CityOperations", pattern: /Game\.CityOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
    { id: "official.Game.PlayerOperations", label: "Game.PlayerOperations", pattern: /Game\.PlayerOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
  ];
  const found = new Map<string, Civ7CapabilityCatalogEntry>();
  for (const file of files) {
    if (!/\.(js|ts|xml|sql)$/i.test(file)) continue;
    const text = await readFile(file, "utf8").catch(() => "");
    for (const pattern of patterns) {
      if (!pattern.pattern.test(text)) continue;
      pattern.pattern.lastIndex = 0;
      found.set(pattern.id, {
        id: pattern.id,
        name: pattern.label,
        role: pattern.id.includes("Network") || pattern.id.includes("UI.") || pattern.id.includes("GameContext")
          ? "app-ui"
          : "tuner",
        kind: "method",
        owner: "official-resources",
        risk: pattern.risk,
        provenance: [file],
        confidence: "source",
      });
    }
  }
  return Array.from(found.values());
}

const STATIC_CIV7_CAPABILITY_ENTRIES: ReadonlyArray<Civ7CapabilityCatalogEntry> = [
  {
    id: "wrapper.restart-begin",
    name: "Restart and Begin",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["restartCiv7GameAndBegin", "live-owner-proof"],
    wrapper: "restartCiv7GameAndBegin",
    confidence: "recorded-live-proof",
    description: "Runs Network.restartGame, follows native Begin Game readiness, and waits for Tuner readiness.",
  },
  {
    id: "wrapper.playable-status",
    name: "Playable Status",
    role: "shared",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["getCiv7AppUiSnapshot", "checkCiv7TunerHealth"],
    wrapper: "getCiv7PlayableStatus",
    confidence: "runtime",
  },
  {
    id: "wrapper.setup-snapshot",
    name: "Setup Snapshot",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Configuration", "GameSetup", "Database", "studio-run-in-game"],
    wrapper: "getCiv7SetupSnapshot|getCiv7SetupMapRows",
    confidence: "runtime",
    description: "Reads Civ7 setup phase, setup parameters, and frontend map-script row visibility.",
  },
  {
    id: "wrapper.setup-start",
    name: "Single-player Setup and Start",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "high",
    provenance: ["Configuration.editMap", "Network.hostGame", "studio-run-in-game"],
    wrapper: "prepareCiv7SinglePlayerSetup|startPreparedCiv7SinglePlayerGame|runCiv7SinglePlayerFromSetup",
    confidence: "source",
    description: "Applies map script, map size, and map seed through App UI setup APIs, then starts a prepared single-player game.",
  },
  {
    id: "wrapper.map-summary",
    name: "Map Summary",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["GameplayMap", "Game"],
    wrapper: "getCiv7MapSummary",
    confidence: "recorded-live-proof",
  },
  {
    id: "wrapper.plot-grid",
    name: "Plot and Grid Snapshots",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["GameplayMap", "Visibility", "MapUnits", "MapCities"],
    wrapper: "getCiv7PlotSnapshot|getCiv7MapGrid|getCiv7FullMapGrid",
    confidence: "recorded-live-proof",
  },
  {
    id: "wrapper.resource-placement-feasibility",
    name: "Resource Placement Feasibility",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: [
      "ResourceBuilder.canHaveResource",
      "ResourceBuilder.getBestMapResourceCuts",
      "ResourceBuilder.getResourceCounts",
      "GameInfo.Resources",
      "GameplayMap",
    ],
    wrapper: "getCiv7ResourcePlacementFeasibility|getCiv7ResourceBuilderDiagnostics",
    confidence: "source",
    description:
      "Reads bounded per-cell resource feasibility and ResourceBuilder cut/count diagnostics for parity/source-authority diagnostics without mutating the map.",
  },
  {
    id: "wrapper.feature-placement-feasibility",
    name: "Feature Placement Feasibility",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["TerrainBuilder.canHaveFeature", "GameplayMap"],
    wrapper: "getCiv7FeaturePlacementFeasibility",
    confidence: "source",
    description:
      "Reads bounded per-cell feature feasibility for parity/source-authority diagnostics without mutating the map.",
  },
  {
    id: "wrapper.autoplay",
    name: "Autoplay Control",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["Autoplay"],
    wrapper: "configureCiv7Autoplay|startCiv7Autoplay|stopCiv7Autoplay",
    confidence: "source",
  },
  {
    id: "wrapper.target-candidates",
    name: "Target Candidates",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameInfo"],
    wrapper: "getCiv7TargetCandidates",
    confidence: "runtime",
    description: "Ranks candidate other-owner contacts from runtime city/unit summaries and a supplied formation origin.",
  },
  {
    id: "wrapper.battlefield-scan",
    name: "Battlefield Scan",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameInfo"],
    wrapper: "getCiv7BattlefieldScan",
    confidence: "runtime",
    description: "Summarizes nearby units, cities, owner pressure, and tactical points of interest around supplied origins.",
  },
  {
    id: "wrapper.destination-analysis",
    name: "Destination Analysis",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameplayMap", "GameInfo"],
    wrapper: "getCiv7DestinationAnalysis",
    confidence: "runtime",
    description: "Summarizes pressure near an intended destination and along a cheap straight-line corridor without issuing movement.",
  },
  {
    id: "wrapper.operations",
    name: "Validator-backed gameplay operations",
    role: "tuner",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["Game.UnitOperations", "Game.UnitCommands", "Game.CityOperations", "Game.CityCommands", "Game.PlayerOperations"],
    wrapper: "canStart*/request*",
    confidence: "recorded-live-proof",
  },
];

function capabilityEntriesFromInspection(
  inspection: Civ7RootInspectionResult,
  role: "app-ui" | "tuner",
): Civ7CapabilityCatalogEntry[] {
  const entries: Civ7CapabilityCatalogEntry[] = [];
  for (const root of inspection.roots) {
    entries.push({
      id: `${role}.root.${root.name}`,
      name: root.name,
      role,
      kind: "root",
      owner: "runtime",
      risk: "read",
      provenance: [`${inspection.state.name}:${root.name}`],
      state: inspection.state.name,
      root: root.name,
      confidence: "runtime",
    });
    for (const method of root.methods) {
      entries.push({
        id: `${role}.method.${root.name}.${method.name}`,
        name: `${root.name}.${method.name}`,
        role,
        kind: "method",
        owner: "runtime",
        risk: method.name.startsWith("get") || method.name.startsWith("is") || method.name.startsWith("has") ? "read" : "medium",
        provenance: [`${inspection.state.name}:${root.name}.${method.name}`],
        state: inspection.state.name,
        root: root.name,
        method: method.name,
        confidence: "runtime",
      });
    }
  }
  return entries;
}

function dedupeCapabilityCatalog(catalog: Civ7CapabilityCatalog): Civ7CapabilityCatalog {
  const byId = new Map<string, Civ7CapabilityCatalogEntry>();
  for (const entry of catalog.entries) {
    const existing = byId.get(entry.id);
    byId.set(entry.id, existing ? { ...existing, provenance: Array.from(new Set([...existing.provenance, ...entry.provenance])) } : entry);
  }
  return { ...catalog, entries: Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id)) };
}

async function listFiles(root: string, maxFiles: number): Promise<string[]> {
  const out: string[] = [];
  async function visit(dir: string): Promise<void> {
    if (out.length >= maxFiles) return;
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (out.length >= maxFiles) return;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) out.push(path);
    }
  }
  await visit(root);
  return out;
}
