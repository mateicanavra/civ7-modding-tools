import type { FoundationCrust } from "../compute-crust/contract.js";
import type { FoundationMesh } from "../compute-mesh/contract.js";
import type { FoundationTectonicSegments } from "../compute-tectonic-segments/contract.js";
import type { TectonicEventRecord } from "../../lib/tectonics/internal-contract.js";

export type SegmentEventsInput = Readonly<{
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}>;

export type SegmentEvent = TectonicEventRecord;
