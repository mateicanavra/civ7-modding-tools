import { stableRunInGameStringify, type RunInGameOperationStatus } from "./status";
import type { PipelineConfig, RecipeSettings, WorldSettings } from "../../ui/types";

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
  materializationMode: "durable" | "disposable";
}>;

export type RunInGameCurrentRelation = "current" | "stale" | "unknown";

export function buildRunInGameFingerprint(args: {
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  materializationMode: "durable" | "disposable";
}): string {
  return stableRunInGameStringify({
    recipe: args.recipeSettings.recipe,
    preset: args.recipeSettings.preset,
    seed: args.recipeSettings.seed,
    mapSize: args.worldSettings.mapSize,
    playerCount: args.worldSettings.playerCount,
    resources: args.worldSettings.resources,
    materializationMode: args.materializationMode,
    config: args.pipelineConfig,
  });
}

export function buildRunInGameClientSnapshot(args: {
  requestId: string;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
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
    materializationMode: args.materializationMode,
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
    return parsed as RunInGameClientSnapshot;
  } catch {
    return null;
  }
}
