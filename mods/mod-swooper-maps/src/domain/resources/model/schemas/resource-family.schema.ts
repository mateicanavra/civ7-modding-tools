import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

export type ResourceSymbol = `RESOURCE_${string}`;

/**
 * Closed runtime vocabulary for the four resource planning families. Plans and intents use
 * this schema so unknown family labels cannot cross operation boundaries.
 */
export const ResourceFamilySchema = Type.Union(
  [
    Type.Literal("aquatic"),
    Type.Literal("cultivated"),
    Type.Literal("terrestrial"),
    Type.Literal("geological"),
  ],
  {
    description:
      "Resource planning family used to route aquatic, cultivated, terrestrial, and geological demand through their owning habitat lane.",
  }
);

export type ResourceFamily = Static<typeof ResourceFamilySchema>;

/**
 * Runtime schema for canonical Civ7 resource keys in `RESOURCE_*` form. It preserves symbolic
 * identity across pure planning and defers numeric engine ID resolution to the projection
 * boundary.
 */
export const ResourceSymbolSchema = Type.Unsafe<ResourceSymbol>(
  Type.String({
    pattern: "^RESOURCE_[A-Z0-9_]+$",
    description: "Civ7 resource type key such as RESOURCE_IRON or RESOURCE_WHEAT.",
  })
);
