import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { VolcanoIntentSchema } from "../model/atoms/volcano-intent.schema.js";

/**
 * Registers complete immutable volcano intent for downstream product decisions and Civ7
 * projection. Admission keeps the sparse ordered list and map-sized membership mask exact.
 */
export const artifact = defineArtifact({
  name: "volcanoes",
  id: "artifact:morphology.volcanoes",
  schema: Type.Object(
    {
      volcanoMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): tiles containing a volcano vent.",
      }),
      volcanoes: Type.Immutable(
        Type.Array(VolcanoIntentSchema, {
          description: "Strictly tile-ordered volcano intents represented by volcanoMask.",
        })
      ),
    },
    {
      additionalProperties: false,
      description:
        "Complete Morphology volcano intent with an exact map membership mask and sparse ordered records.",
    }
  ),
  refine: (value, { cellCount, issues }) => {
    let maskCount = 0;
    for (let tileIndex = 0; tileIndex < value.volcanoMask.length; tileIndex += 1) {
      const membership = value.volcanoMask[tileIndex];
      if (membership !== 0 && membership !== 1) {
        issues.add(`volcanoMask[${tileIndex}] must be binary; received ${membership}.`);
      }
      if (membership === 1) maskCount += 1;
    }

    let previousTileIndex = -1;
    for (const [entryIndex, intent] of value.volcanoes.entries()) {
      if (intent.tileIndex >= cellCount) {
        issues.add(
          `volcanoes[${entryIndex}].tileIndex ${intent.tileIndex} is outside the ${cellCount}-tile map.`
        );
      } else if (value.volcanoMask[intent.tileIndex] !== 1) {
        issues.add(
          `volcanoes[${entryIndex}] claims tile ${intent.tileIndex} without matching volcanoMask membership.`
        );
      }

      if (intent.tileIndex <= previousTileIndex) {
        issues.add(
          `volcanoes must use strictly ascending unique tile indices; ${intent.tileIndex} follows ${previousTileIndex}.`
        );
      }
      previousTileIndex = intent.tileIndex;
    }

    if (maskCount !== value.volcanoes.length) {
      issues.add(
        `volcanoMask contains ${maskCount} planned tiles but volcanoes contains ${value.volcanoes.length} records.`
      );
    }
  },
});
