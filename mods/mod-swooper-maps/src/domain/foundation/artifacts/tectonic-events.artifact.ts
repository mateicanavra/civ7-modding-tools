import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const EventSchema = Type.Object(
  {
    eventType: Type.Integer({ minimum: 0, maximum: 255 }),
    plateA: Type.Integer({ minimum: -1, maximum: 32767 }),
    plateB: Type.Integer({ minimum: -1, maximum: 32767 }),
    polarity: Type.Integer({ minimum: -127, maximum: 127 }),
    intensityUplift: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityRift: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityShear: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityVolcanism: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityFracture: Type.Integer({ minimum: 0, maximum: 255 }),
    driftU: Type.Integer({ minimum: -127, maximum: 127 }),
    driftV: Type.Integer({ minimum: -127, maximum: 127 }),
    seedCells: Type.Array(Type.Integer({ minimum: 0 })),
    originPlateId: Type.Integer({ minimum: -1, maximum: 32767 }),
  },
  { additionalProperties: false }
);

export const Schema = Type.Array(EventSchema);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonicEvents",
  id: "artifact:foundation.tectonicEvents",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );
  if (Array.isArray(value)) {
    value.forEach((event, index) => {
      if (!event || typeof event !== "object") return;
      const record = event as Record<string, unknown>;
      for (const [field, min, max] of [
        ["eventType", 0, 255],
        ["plateA", -1, 32767],
        ["plateB", -1, 32767],
        ["polarity", -127, 127],
        ["intensityUplift", 0, 255],
        ["intensityRift", 0, 255],
        ["intensityShear", 0, 255],
        ["intensityVolcanism", 0, 255],
        ["intensityFracture", 0, 255],
        ["driftU", -127, 127],
        ["driftV", -127, 127],
        ["originPlateId", -1, 32767],
      ] as const) {
        const value = record[field];
        if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
          issues.push(issue(`events[${index}].${field} must be an integer in ${min}..${max}`));
        }
      }
      if (
        !Array.isArray(record.seedCells) ||
        record.seedCells.some((cell) => !Number.isInteger(cell) || cell < 0)
      ) {
        issues.push(issue(`events[${index}].seedCells must be nonnegative integers`));
      }
    });
  }
  return Object.freeze(issues);
}
