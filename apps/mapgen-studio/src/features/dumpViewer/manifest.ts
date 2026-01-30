import type { VizManifestV0 } from "../viz/model";
import type { DumpFileIndex } from "./fileIndex";

export async function loadDumpManifest(index: DumpFileIndex): Promise<VizManifestV0> {
  const manifestFile = index.get("manifest.json");
  if (!manifestFile) {
    throw new Error("manifest.json not found. Select the run folder that contains manifest.json.");
  }
  const text = await manifestFile.text();
  return JSON.parse(text) as VizManifestV0;
}
