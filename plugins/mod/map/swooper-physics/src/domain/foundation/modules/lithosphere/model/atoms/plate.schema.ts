import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** One stable plate identity and its seed position in Foundation mesh space. */
export const PlateSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable index of this tectonic plate." }),
    role: Type.Union(
      [Type.Literal("polarCap"), Type.Literal("polarMicroplate"), Type.Literal("tectonic")],
      { description: "Structural role the plate plays in the global partition." }
    ),
    kind: Type.Union([Type.Literal("major"), Type.Literal("minor")], {
      description: "Plate scale class used by partition weighting and downstream policy.",
    }),
    seedX: Type.Number({ description: "Wrapped mesh-space X coordinate of the plate seed." }),
    seedY: Type.Number({ description: "Mesh-space Y coordinate of the plate seed." }),
  },
  {
    additionalProperties: false,
    description: "Stable tectonic plate identity and the mesh seed from which it was partitioned.",
  }
);

/** Stable identity and seed geometry for one Foundation plate. */
export type Plate = Static<typeof PlateSchema>;
