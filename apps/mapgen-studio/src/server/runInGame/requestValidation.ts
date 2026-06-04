import {
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
  normalizeStudioSetupConfig,
  type Civ7StudioSetupConfig,
} from "../../features/civ7Setup/setupConfig";

export function assertNoRawControlFields(value: unknown): void {
  if (!value || typeof value !== "object") return;
  const stack: unknown[] = [value];
  while (stack.length) {
    const next = stack.pop();
    if (!next || typeof next !== "object") continue;
    const entries = Array.isArray(next)
      ? next.map((child, index) => [String(index), child] as const)
      : Object.entries(next);
    for (const [key, child] of entries) {
      if (/^(?:command|script|javascript|rawJs|rawCommand)$/i.test(key)) {
        throw new Error("Run in Game request must not include raw control commands");
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
}

export function parseRunInGameSetupRequest(body: {
  recipeId?: unknown;
  seed?: unknown;
  mapSize?: unknown;
  playerCount?: unknown;
  materialization?: { mode?: unknown };
  recovery?: { restartCivProcess?: unknown };
  selectedConfig?: { id?: unknown };
  setupConfig?: unknown;
  config?: unknown;
}): {
  requestedMode: "durable" | "disposable";
  id: string;
  seed: number;
  mapSize: string;
  playerCount?: number;
  restartCivProcess: boolean;
  setupConfig: Civ7StudioSetupConfig;
} {
  assertNoRawControlFields(body);
  if (body.recipeId !== "mod-swooper-maps/standard") {
    throw new Error("Run in Game currently supports only mod-swooper-maps/standard");
  }
  if (!body.config || typeof body.config !== "object" || Array.isArray(body.config)) {
    throw new Error("Run in Game requires a sanitized config object");
  }
  const requestedMode = body.materialization?.mode === "durable" ? "durable" : "disposable";
  const selected = body.selectedConfig ?? {};
  const id = requestedMode === "disposable"
    ? "studio-current"
    : typeof selected.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected.id)
      ? selected.id
      : "studio-current";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("Run in Game map config id must be kebab-case");
  const seed = Number(body.seed);
  if (!Number.isInteger(seed)) throw new Error("Run in Game seed must be an integer");
  const mapSize = typeof body.mapSize === "string" ? body.mapSize : "MAPSIZE_STANDARD";
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(mapSize)) throw new Error("Run in Game mapSize must be a Civ7 MAPSIZE_* value");
  const playerCount = body.playerCount === undefined ? undefined : Number(body.playerCount);
  if (playerCount !== undefined && (!Number.isInteger(playerCount) || playerCount < 1 || playerCount > 64)) {
    throw new Error("Run in Game playerCount must be an integer between 1 and 64");
  }
  const restartCivProcess = body.recovery?.restartCivProcess === true;
  const setupConfig = normalizeStudioSetupConfig(body.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG);
  if (setupConfig.mapScript !== undefined && (!setupConfig.mapScript.trim() || /[\0\r\n]/.test(setupConfig.mapScript))) {
    throw new Error("Run in Game setupConfig.mapScript must be a non-empty single-line string");
  }
  return {
    requestedMode,
    id,
    seed,
    mapSize,
    restartCivProcess,
    setupConfig,
    ...(playerCount === undefined ? {} : { playerCount }),
  };
}
