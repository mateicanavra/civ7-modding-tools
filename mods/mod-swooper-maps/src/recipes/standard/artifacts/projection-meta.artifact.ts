import {
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const ProjectionMetaArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    wrapX: Type.Literal(true, { description: "Civ7 topology lock: wrap X is always enabled." }),
    wrapY: Type.Literal(false, { description: "Civ7 topology lock: wrap Y is always disabled." }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned projection metadata for interpreting tile-indexed rasters under Phase 2 topology locks.",
  }
);

/** Runtime contract locking map dimensions to Civ7's wrapping-X, bounded-Y topology. */
export const Schema = ProjectionMetaArtifactSchema;

/** Registers map dimensions and Civ7's cylindrical topology for tile-raster consumers. */
export const artifact = defineArtifact({
  name: "projectionMeta",
  id: "artifact:map.projectionMeta",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validate hook for the projection metadata artifact (topology locks). */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("projectionMeta artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  if (!Number.isInteger(value.width) || (value.width as number) < 1) {
    issues.push(issue(`projectionMeta.width ${String(value.width)} must be a positive integer.`));
  }
  if (!Number.isInteger(value.height) || (value.height as number) < 1) {
    issues.push(issue(`projectionMeta.height ${String(value.height)} must be a positive integer.`));
  }
  if (value.wrapX !== true || value.wrapY !== false) {
    issues.push(
      issue("projectionMeta must carry the Civ7 topology locks (wrapX=true, wrapY=false).")
    );
  }
  return issues;
}

/** Requires positive dimensions with the topology lock `wrapX=true`, `wrapY=false`. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
