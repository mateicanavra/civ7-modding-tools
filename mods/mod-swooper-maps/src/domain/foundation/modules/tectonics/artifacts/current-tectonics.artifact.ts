import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type CurrentTectonics = Readonly<
  Record<
    | "boundaryType"
    | "upliftPotential"
    | "riftPotential"
    | "shearStress"
    | "volcanism"
    | "fracture"
    | "cumulativeUplift",
    Uint8Array
  >
>;

/** Registers Foundation's current-tectonics artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonics",
  id: "artifact:foundation.tectonics",
  schema: Type.Object(
    {
      boundaryType: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      upliftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      riftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      shearStress: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      cumulativeUplift: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Present-day tectonic fields and cumulative uplift by mesh cell.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const tectonics = value as CurrentTectonics;
    const arrays = Object.values(tectonics).filter(
      (candidate): candidate is Uint8Array => candidate instanceof Uint8Array
    );
    const length = arrays[0]?.length ?? 0;
    const issues: ArtifactValidationIssue[] = [];
    if (length <= 0) issues.push({ message: "current tectonics arrays must be nonempty" });
    for (const key of [
      "boundaryType",
      "upliftPotential",
      "riftPotential",
      "shearStress",
      "volcanism",
      "fracture",
      "cumulativeUplift",
    ] as const) {
      appendArtifactTypedArrayIssues(issues, key, tectonics[key], Uint8Array, length);
    }
    return issues;
  },
});
