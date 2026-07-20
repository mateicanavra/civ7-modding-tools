import { type MapConfigEnvelope, serializeMapConfigEnvelope } from "@civ7/studio-contract";
import { admitCanonicalConfig } from "./canonicalConfig";

export type MapConfigParseResult =
  | Readonly<{ ok: true; value: MapConfigEnvelope }>
  | Readonly<{ ok: false; message: string }>;

export function serializeMapConfigFile(canonicalConfig: MapConfigEnvelope): Readonly<{
  filename: string;
  json: string;
}> {
  return {
    filename: `${canonicalConfig.id}.config.json`,
    json: JSON.stringify(serializeMapConfigEnvelope(canonicalConfig), null, 2),
  };
}

export function parseMapConfigFile(text: string): MapConfigParseResult {
  try {
    const canonicalConfig = admitCanonicalConfig(JSON.parse(text));
    return canonicalConfig === undefined
      ? { ok: false, message: "Config file must contain one complete map config envelope." }
      : { ok: true, value: canonicalConfig };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Config file is not valid JSON.",
    };
  }
}

export function downloadMapConfigFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
