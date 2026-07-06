import type { Artifact as TectonicEvents } from "../../artifacts/tectonic-events.artifact.js";
import type { Artifact as FoundationCrust } from "../../artifacts/crust.artifact.js";
import type { Artifact as FoundationMesh } from "../../artifacts/mesh.artifact.js";
import type { Artifact as FoundationTectonicSegments } from "../../artifacts/tectonic-segments.artifact.js";

type TectonicEventRecord = TectonicEvents[number];

export type SegmentEventsInput = Readonly<{
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}>;

export type SegmentEvent = TectonicEventRecord;
