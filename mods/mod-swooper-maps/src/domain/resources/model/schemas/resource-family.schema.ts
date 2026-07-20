import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const RESOURCE_FAMILIES = ["aquatic", "cultivated", "terrestrial", "geological"] as const;

export type ResourceFamily = (typeof RESOURCE_FAMILIES)[number];
export type ResourceSymbol = `RESOURCE_${string}`;

export const ResourceFamilySchema = Type.Union([
  Type.Literal("aquatic"),
  Type.Literal("cultivated"),
  Type.Literal("terrestrial"),
  Type.Literal("geological"),
]);

export const ResourceSymbolSchema = Type.Unsafe<ResourceSymbol>(
  Type.String({
    pattern: "^RESOURCE_[A-Z0-9_]+$",
    description: "Civ7 resource type key such as RESOURCE_IRON or RESOURCE_WHEAT.",
  })
);
