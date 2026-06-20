import type { PipelineConfig } from "../../ui/types";

export class PipelineConfigMigrationError extends Error {
  readonly details: readonly string[];

  constructor(message: string, details: readonly string[]) {
    super(message);
    this.name = "PipelineConfigMigrationError";
    this.details = details;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneConfigValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneConfigValue);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = cloneConfigValue(child);
  }
  return out;
}

function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function migrateMapRiversKnobs(root: unknown): void {
  if (!isPlainObject(root)) return;
  const mapRivers = root["map-rivers"];
  if (!isPlainObject(mapRivers)) return;
  const knobs = mapRivers.knobs;
  if (!isPlainObject(knobs)) return;
  if (!hasOwn(knobs, "riverDensity")) return;

  const retired = knobs.riverDensity;
  if (hasOwn(knobs, "navigableRiverDensity") && knobs.navigableRiverDensity !== retired) {
    throw new PipelineConfigMigrationError("Conflicting map-rivers river density knobs.", [
      "/map-rivers/knobs/riverDensity is retired; use /map-rivers/knobs/navigableRiverDensity.",
      `Received riverDensity=${JSON.stringify(retired)} and navigableRiverDensity=${JSON.stringify(
        knobs.navigableRiverDensity
      )}.`,
    ]);
  }

  if (!hasOwn(knobs, "navigableRiverDensity")) {
    knobs.navigableRiverDensity = retired;
  }
  delete knobs.riverDensity;
}

function migratePlacementDiscoveries(root: unknown): void {
  if (!isPlainObject(root)) return;
  const placement = root.placement;
  if (!isPlainObject(placement)) return;
  if (!hasOwn(placement, "discoveries")) return;

  // `placement.discoveries` was retired: discoveries are placed by Civ7's official
  // discovery generator (run through the adapter at the place-discoveries step), which
  // owns density/spacing/type — there is no authored knob anymore. Old presets and
  // persisted authoring state still carry the block, and because the recipe placement
  // schema is `additionalProperties: false`, it surfaces as an unknown-key validation
  // failure (the preset silently fails to apply). Drop it so legacy configs heal to the
  // current shape instead of falling back to a disconnected config. There is no
  // replacement key, so this is a straight removal (unlike the map-rivers density alias).
  delete placement.discoveries;
}

export function migratePipelineConfig(value: PipelineConfig): PipelineConfig {
  return migratePipelineConfigUnknown(value) as PipelineConfig;
}

export function migratePipelineConfigUnknown(value: unknown): unknown {
  const next = cloneConfigValue(value);
  migrateMapRiversKnobs(next);
  migratePlacementDiscoveries(next);
  return next;
}
