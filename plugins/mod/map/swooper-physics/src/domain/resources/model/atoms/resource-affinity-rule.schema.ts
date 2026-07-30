import { Type } from "@swooper/mapgen-core/authoring/schema";

import { ResourceSymbolSchema } from "./resource-family.schema.js";

/** Pairwise affinity or exclusion applied while selecting and adjusting resource sites. */
export const ResourceAffinityRuleSchema = Type.Object(
  {
    resourceA: ResourceSymbolSchema,
    resourceB: ResourceSymbolSchema,
    relation: Type.Union([Type.Literal("affinity"), Type.Literal("exclusion")], {
      description:
        "Affinity biases nearby placement while exclusion forbids the pair within the radius.",
    }),
    radiusTiles: Type.Integer({
      minimum: 1,
      maximum: 8,
      default: 3,
      description: "Hex radius within which the pair relation applies.",
    }),
  },
  {
    additionalProperties: false,
    description: "One stable resource-resource affinity or exclusion rule.",
  }
);
