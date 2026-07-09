import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import type { RunInGameRelation } from "@swooper/mapgen-studio-ui";
import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import {
  type Civ7StudioSetupConfig,
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
  normalizeStudioSetupConfig,
} from "../civ7Setup/setupConfig";
import { migratePipelineConfig } from "../configMigrations/pipelineConfig";

export type RunInGameClientSnapshot = Readonly<{
  requestId: string;
  createdAt: string;
  fingerprint: string;
  seed: string;
  mapSize: string;
  playerCount: number;
  resources: string;
  recipe: string;
  preset: string;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
}>;

export type RunInGameSourceSnapshot = Readonly<{
  requestId: string;
  createdAt: string;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
  selectedConfig?: {
    id?: string;
    label?: string;
    description?: string;
    sourcePath?: string;
  };
}>;

// Alias of the package's re-homed relation union (adjudication 7 — never a
// third copy); kept so app call sites keep their vocabulary.
export type RunInGameCurrentRelation = RunInGameRelation;

export function buildRunInGameFingerprint(args: {
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
}): string {
  const pipelineConfig = migratePipelineConfig(args.pipelineConfig);
  return stableRunInGameStringify({
    recipe: args.recipeSettings.recipe,
    preset: args.recipeSettings.preset,
    seed: args.recipeSettings.seed,
    mapSize: args.worldSettings.mapSize,
    playerCount: args.worldSettings.playerCount,
    resources: args.worldSettings.resources,
    materializationMode: args.materializationMode,
    setupConfig: normalizeStudioSetupConfig(args.setupConfig),
    config: pipelineConfig,
  });
}

function stableRunInGameStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)])
    );
  }
  return value;
}

export function buildRunInGameClientSnapshot(args: {
  requestId: string;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
  now?: () => Date;
}): RunInGameClientSnapshot {
  return {
    requestId: args.requestId,
    createdAt: (args.now ?? (() => new Date()))().toISOString(),
    fingerprint: buildRunInGameFingerprint(args),
    seed: args.recipeSettings.seed,
    mapSize: args.worldSettings.mapSize,
    playerCount: args.worldSettings.playerCount,
    resources: args.worldSettings.resources,
    recipe: args.recipeSettings.recipe,
    preset: args.recipeSettings.preset,
    setupConfig: normalizeStudioSetupConfig(args.setupConfig),
    materializationMode: args.materializationMode,
  };
}

export function buildRunInGameSourceSnapshot(args: {
  requestId: string;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
  selectedConfig?: RunInGameSourceSnapshot["selectedConfig"];
  now?: () => Date;
}): RunInGameSourceSnapshot {
  const pipelineConfig = migratePipelineConfig(args.pipelineConfig);
  return {
    requestId: args.requestId,
    createdAt: (args.now ?? (() => new Date()))().toISOString(),
    recipeSettings: args.recipeSettings,
    worldSettings: args.worldSettings,
    pipelineConfig,
    setupConfig: normalizeStudioSetupConfig(args.setupConfig),
    materializationMode: args.materializationMode,
    ...(args.selectedConfig === undefined ? {} : { selectedConfig: args.selectedConfig }),
  };
}

export function relationForRunInGameOperation(args: {
  status?: RunInGameOperationStatus | null;
  snapshot?: RunInGameClientSnapshot | null;
  currentFingerprint: string;
}): RunInGameCurrentRelation {
  if (!args.status) return "unknown";
  if (!args.snapshot || args.snapshot.requestId !== args.status.requestId) return "unknown";
  return args.snapshot.fingerprint === args.currentFingerprint ? "current" : "stale";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseRecipeSettings(value: unknown): RecipeSettings | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.recipe !== "string" ||
    typeof value.preset !== "string" ||
    typeof value.seed !== "string"
  ) {
    return null;
  }
  return {
    recipe: value.recipe,
    preset: value.preset,
    seed: value.seed,
  };
}

function parseWorldSettings(value: unknown): WorldSettings | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.mapSize !== "string" ||
    typeof value.playerCount !== "number" ||
    typeof value.resources !== "string"
  ) {
    return null;
  }
  return {
    mapSize: value.mapSize as WorldSettings["mapSize"],
    playerCount: value.playerCount,
    resources: value.resources as WorldSettings["resources"],
  };
}

function parseSelectedConfig(
  value: unknown
): RunInGameSourceSnapshot["selectedConfig"] | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return undefined;
  return {
    ...(typeof value.id === "string" ? { id: value.id } : {}),
    ...(typeof value.label === "string" ? { label: value.label } : {}),
    ...(typeof value.description === "string" ? { description: value.description } : {}),
    ...(typeof value.sourcePath === "string" ? { sourcePath: value.sourcePath } : {}),
  };
}

export function parseRunInGameClientSnapshot(value: string | null): RunInGameClientSnapshot | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<RunInGameClientSnapshot>;
    if (
      typeof parsed.requestId !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.fingerprint !== "string" ||
      typeof parsed.seed !== "string" ||
      typeof parsed.mapSize !== "string" ||
      typeof parsed.playerCount !== "number" ||
      typeof parsed.resources !== "string" ||
      typeof parsed.recipe !== "string" ||
      typeof parsed.preset !== "string" ||
      (parsed.materializationMode !== "durable" && parsed.materializationMode !== "disposable")
    ) {
      return null;
    }
    return {
      ...parsed,
      setupConfig: normalizeStudioSetupConfig(
        parsed.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG
      ),
    } as RunInGameClientSnapshot;
  } catch {
    return null;
  }
}

export function parseRunInGameSourceSnapshot(value: string | null): RunInGameSourceSnapshot | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return null;
    const recipeSettings = parseRecipeSettings(parsed.recipeSettings);
    const worldSettings = parseWorldSettings(parsed.worldSettings);
    if (
      typeof parsed.requestId !== "string" ||
      typeof parsed.createdAt !== "string" ||
      !recipeSettings ||
      !worldSettings ||
      !isRecord(parsed.pipelineConfig) ||
      (parsed.materializationMode !== "durable" && parsed.materializationMode !== "disposable")
    ) {
      return null;
    }
    return {
      requestId: parsed.requestId,
      createdAt: parsed.createdAt,
      recipeSettings,
      worldSettings,
      pipelineConfig: migratePipelineConfig(parsed.pipelineConfig as PipelineConfig),
      setupConfig: normalizeStudioSetupConfig(
        parsed.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG
      ),
      materializationMode: parsed.materializationMode,
      ...(parsed.selectedConfig === undefined
        ? {}
        : { selectedConfig: parseSelectedConfig(parsed.selectedConfig) }),
    };
  } catch {
    return null;
  }
}
