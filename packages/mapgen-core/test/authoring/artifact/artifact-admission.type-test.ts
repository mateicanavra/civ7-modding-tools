import { implementArtifacts } from "@mapgen/authoring/artifact/runtime.js";
import {
  type Artifact,
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  Type,
} from "@mapgen/authoring/index.js";

const firstArtifact = defineArtifact({
  name: "firstArtifact",
  id: "artifact:test.admission.first",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
  refine: (value) => {
    // @ts-expect-error Refinements must narrow unknown even after structural admission.
    void value.value;
    return [];
  },
});

defineArtifact({
  name: "asyncArtifact",
  id: "artifact:test.admission.async-type",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
  // @ts-expect-error Artifact refinement is synchronous.
  refine: async () => [],
});

const secondArtifact = defineArtifact({
  name: "secondArtifact",
  id: "artifact:test.admission.second",
  schema: Type.Object({ value: Type.String() }, { additionalProperties: false }),
});

const canonical: Artifact<"firstArtifact", "artifact:test.admission.first"> = firstArtifact;
void canonical;

// @ts-expect-error Artifact identity retains its literal semantic name.
const wrongName: Artifact<"otherArtifact"> = firstArtifact;
void wrongName;

defineArtifactCatalog({ firstArtifact, secondArtifact });
implementArtifacts([firstArtifact, secondArtifact] as const);

defineStep({
  id: "canonical-artifact-provider",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  artifacts: { requires: [firstArtifact], provides: [secondArtifact] },
});

const missingValidator = {
  name: firstArtifact.name,
  id: firstArtifact.id,
  schema: firstArtifact.schema,
};
// @ts-expect-error A complete artifact authority always carries admission behavior.
defineArtifactCatalog({ missingValidator });

// @ts-expect-error Runtime construction accepts canonical Artifact values, not legacy wrappers.
implementArtifacts([{ artifact: firstArtifact, validate: firstArtifact.validate }]);

defineStep({
  id: "legacy-wrapper-provider",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error Step providers accept the same Artifact authority used by requirements.
  artifacts: { provides: [{ artifact: firstArtifact, validate: firstArtifact.validate }] },
});
