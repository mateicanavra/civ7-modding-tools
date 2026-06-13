import { BiomeEngineBindingsSchema } from "@mapgen/domain/ecology";
import { Type } from "@swooper/mapgen-core/authoring";

export const MapMorphologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology knobs. Terrain projection currently has no author-facing stage knobs.",
  }
);

export const MapMorphologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology projection controls. This stage materializes upstream landmass, coast, mountain, and volcano truth into Civ7 terrain fields without additional author-facing controls.",
  }
);

export const MapHydrologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Map hydrology knobs. Lake projection currently has no author-facing stage knobs.",
  }
);

export const MapHydrologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map hydrology projection controls. This stage stamps Hydrology lake intent into Civ7 water state and always records readback evidence.",
  }
);

export const MapElevationKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation knobs. Elevation materialization currently has no author-facing stage knobs.",
  }
);

export const MapElevationPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation projection controls. This stage asks Civ7 to rebuild elevation after static water projection and before river modeling.",
  }
);

export const MapRiversPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map river projection controls. Navigable-river materialization is driven by stage knobs and the Hydrology-backed selection profile, not by public selector thresholds.",
  }
);

export const MapEcologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map ecology knobs. Ecology projection currently has no author-facing stage knobs.",
  }
);

export const MapEcologyPublicSchema = Type.Object(
  {
    biomeBindings: Type.Optional(BiomeEngineBindingsSchema),
  },
  {
    additionalProperties: false,
    description:
      "Map ecology projection controls for binding Ecology biome symbols to Civ7 biome globals. Feature and plot-effect application use deterministic projection defaults.",
  }
);
