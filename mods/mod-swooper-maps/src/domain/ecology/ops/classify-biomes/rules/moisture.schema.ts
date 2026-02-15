import { Type } from "@swooper/mapgen-core/authoring";

export const MoistureSchema = Type.Object(
  {
    /**
     * Moisture thresholds (arid -> semi-arid -> subhumid -> humid -> perhumid).
     * Units are Hydrology's "effective moisture" advisory index.
     */
    thresholds: Type.Tuple(
      [
        Type.Number({
          description: "Arid threshold (effective moisture units).",
          default: 45,
        }),
        Type.Number({
          description: "Semi-arid threshold (effective moisture units).",
          default: 90,
        }),
        Type.Number({
          description: "Subhumid threshold (effective moisture units).",
          default: 140,
        }),
        Type.Number({
          description: "Humid threshold (effective moisture units).",
          default: 190,
        }),
      ],
      {
        default: [45, 90, 140, 190],
        description:
          "Moisture thresholds in effective moisture units (Hydrology effectiveMoisture advisory index).",
      }
    ),
  },
  {
    description: "Effective moisture thresholds (Hydrology effectiveMoisture advisory index).",
  }
);
