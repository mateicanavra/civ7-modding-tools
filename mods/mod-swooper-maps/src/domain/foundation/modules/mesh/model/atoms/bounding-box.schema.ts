import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Axis-aligned bounds occupied by the wrapped Foundation neighborhood mesh. */
export const MeshBoundingBoxSchema = Type.Object(
  {
    xl: Type.Number({ description: "Wrapped mesh-space left boundary." }),
    xr: Type.Number({ description: "Wrapped mesh-space right boundary." }),
    yt: Type.Number({ description: "Mesh-space upper boundary." }),
    yb: Type.Number({ description: "Mesh-space lower boundary." }),
  },
  {
    additionalProperties: false,
    description: "Axis-aligned bounds occupied by the Foundation neighborhood mesh.",
  }
);

/** Coordinates delimiting one Foundation mesh extent. */
export type MeshBoundingBox = Static<typeof MeshBoundingBoxSchema>;
