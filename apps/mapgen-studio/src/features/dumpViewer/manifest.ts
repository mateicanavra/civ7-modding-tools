import type { VizManifestV1 } from "../viz/model";
import type { DumpFileIndex } from "./fileIndex";

function assertIsVizManifestV1(value: unknown): asserts value is VizManifestV1 {
  if (!value || typeof value !== "object") throw new Error("Invalid manifest.json: expected an object.");
  const obj = value as any;
  if (obj.version !== 1) throw new Error(`Unsupported manifest.json version: ${String(obj.version)} (expected 1).`);
  if (typeof obj.runId !== "string" || !obj.runId) throw new Error("Invalid manifest.json: missing runId.");
  if (typeof obj.planFingerprint !== "string" || !obj.planFingerprint) throw new Error("Invalid manifest.json: missing planFingerprint.");
  if (!Array.isArray(obj.steps)) throw new Error("Invalid manifest.json: steps must be an array.");
  if (!Array.isArray(obj.layers)) throw new Error("Invalid manifest.json: layers must be an array.");
}

export async function loadDumpManifest(index: DumpFileIndex): Promise<VizManifestV1> {
  const manifestFile = index.get("manifest.json");
  if (!manifestFile) {
    throw new Error("manifest.json not found. Select the run folder that contains manifest.json.");
  }
  const text = await manifestFile.text();
  const parsed = JSON.parse(text) as unknown;
  assertIsVizManifestV1(parsed);
  return parsed;
}
