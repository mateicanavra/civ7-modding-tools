export type PresetKey = "none" | `builtin:${string}` | `local:${string}` | `live:${string}`;

export type PresetSource = "builtin" | "local" | "live";

export type ParsedPresetKey =
  | { kind: "none" }
  | { kind: "builtin"; id: string }
  | { kind: "local"; id: string }
  | { kind: "live"; id: string };

export type ResolvedPreset = Readonly<{
  source: PresetSource;
  id: string;
  label: string;
  description?: string;
  sourcePath?: string;
  sortIndex?: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  config: unknown;
}>;

export function parsePresetKey(key: string): ParsedPresetKey {
  if (key === "none") return { kind: "none" };
  if (key.startsWith("builtin:")) return { kind: "builtin", id: key.slice("builtin:".length) };
  if (key.startsWith("local:")) return { kind: "local", id: key.slice("local:".length) };
  if (key.startsWith("live:")) return { kind: "live", id: key.slice("live:".length) };
  return { kind: "none" };
}
