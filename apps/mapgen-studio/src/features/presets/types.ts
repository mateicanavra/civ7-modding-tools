import type { MapConfigEnvelope } from "@civ7/studio-contract";

export type PresetKey = "none" | `builtin:${string}`;

/**
 * The persisted authoring source owns configuration bytes. Catalog state keeps
 * only its immutable lookup path; an editor state owns one complete envelope.
 */
export type AuthoringConfigSource =
  | Readonly<{
      kind: "catalog";
      sourcePath: string;
    }>
  | Readonly<{
      kind: "editor";
      canonicalConfig: MapConfigEnvelope;
    }>
  | Readonly<{
      kind: "blocked";
      reason: "missing-catalog-source" | "invalid-persistence";
      sourcePath?: string;
    }>;

export type ParsedPresetKey = { kind: "none" } | { kind: "builtin"; id: string };

type ResolvedPresetIdentity = Readonly<{
  id: string;
  label: string;
  description?: string;
}>;

/**
 * A preset resolves to exactly one complete envelope. The selection key is UI
 * state; it never decides whether authoring owns catalog or editor bytes.
 */
export type ResolvedPreset = ResolvedPresetIdentity &
  Readonly<{
    source: "builtin";
    sourcePath: string;
    canonicalConfig: MapConfigEnvelope;
  }>;

export function parsePresetKey(key: string): ParsedPresetKey {
  if (key === "none") return { kind: "none" };
  if (key.startsWith("builtin:")) return { kind: "builtin", id: key.slice("builtin:".length) };
  return { kind: "none" };
}
