import type { Artifact as FoundationMesh } from "../../artifacts/mesh.artifact.js";
import type { Artifact as TectonicEvents } from "../../artifacts/tectonic-events.artifact.js";
import type { Artifact as FoundationTectonicSegments } from "../../artifacts/tectonic-segments.artifact.js";
import type { Crust as FoundationCrust } from "../../model/schemas/crust.schema.js";

type TectonicEventRecord = TectonicEvents[number];

export type SegmentEventsInput = Readonly<{
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}>;

export type SegmentEvent = TectonicEventRecord;
