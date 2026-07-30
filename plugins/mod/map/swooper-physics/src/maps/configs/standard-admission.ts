import type { MapConfigEnvelope } from "@civ7/studio-contract";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";

export type StandardMapConfigSnapshot = MapConfigEnvelope & Readonly<{ recipe: "standard" }>;

function escapeJsonPointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function formatStandardRecipeConfigErrors(value: unknown, recipeSchema: TSchema): string[] {
  return Value.Errors(recipeSchema, value).flatMap((error) => {
    if (error.keyword === "additionalProperties") {
      return error.params.additionalProperties.map(
        (key) => `/config${error.instancePath}/${escapeJsonPointerSegment(key)}: Unknown key`
      );
    }
    return [`/config${error.instancePath}: ${error.message}`];
  });
}

/** Applies Standard recipe semantics to an immutable envelope using its generated schema. */
export function validateStandardMapConfigSnapshotForSchema(
  envelope: MapConfigEnvelope,
  recipeSchema: TSchema
): StandardMapConfigSnapshot {
  if (envelope.recipe !== "standard") {
    throw new Error(
      `Map config must use the Standard recipe, got ${JSON.stringify(envelope.recipe)}.`
    );
  }
  if (!Value.Check(recipeSchema, envelope.config)) {
    const errors = formatStandardRecipeConfigErrors(envelope.config, recipeSchema);
    throw new Error(
      `Map config must carry a complete recipe config JSON:\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}`
    );
  }
  if (envelope.latitudeBounds.topLatitude <= envelope.latitudeBounds.bottomLatitude) {
    throw new Error("Map config latitudeBounds.topLatitude must exceed bottomLatitude.");
  }
  return envelope as StandardMapConfigSnapshot;
}
