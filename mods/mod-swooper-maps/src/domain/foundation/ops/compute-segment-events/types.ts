import type { Artifact as TectonicEvents } from "../../artifacts/tectonic-events.artifact.js";
import type { FoundationCrust } from "../compute-crust/contract.js";
import type { FoundationMesh } from "../compute-mesh/contract.js";
import type { FoundationTectonicSegments } from "../compute-tectonic-segments/contract.js";

type TectonicEventRecord = TectonicEvents[number];

export type SegmentEventsInput = Readonly<{
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}>;

export type SegmentEvent = TectonicEventRecord;
