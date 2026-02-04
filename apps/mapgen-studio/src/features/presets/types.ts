export type PresetKey = "none" | `builtin:${string}` | `local:${string}`;

export type PresetSource = "builtin" | "local";

export type ParsedPresetKey =
  | { kind: "none" }
  | { kind: "builtin"; id: string }
  | { kind: "local"; id: string };

export type ResolvedPreset = Readonly<{
  source: PresetSource;
  id: string;
  label: string;
  description?: string;
  config: unknown;
}>;

export function parsePresetKey(key: string): ParsedPresetKey {
  if (key === "none") return { kind: "none" };
  if (key.startsWith("builtin:")) return { kind: "builtin", id: key.slice("builtin:".length) };
  if (key.startsWith("local:")) return { kind: "local", id: key.slice("local:".length) };
  return { kind: "none" };
}
