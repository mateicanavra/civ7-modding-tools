import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import type { Crust as FoundationCrust } from "../../model/schemas/crust.schema.js";

type FoundationMesh = Static<typeof import("../../artifacts/mesh.artifact.js").artifact.schema>;
type TectonicEvents = Static<
  typeof import("../../artifacts/tectonic-events.artifact.js").artifact.schema
>;
type FoundationTectonicSegments = Static<
  typeof import("../../artifacts/tectonic-segments.artifact.js").artifact.schema
>;

type TectonicEventRecord = TectonicEvents[number];

export type SegmentEventsInput = Readonly<{
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}>;

export type SegmentEvent = TectonicEventRecord;
