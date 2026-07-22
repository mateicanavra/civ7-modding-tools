import type { ArtifactModule, ArtifactValidator } from "@mapgen/authoring/index.js";
import {
  defineArtifact,
  defineArtifactCatalog,
  defineArtifactValidator,
  defineStep,
  implementArtifactModules,
  Type,
} from "@mapgen/authoring/index.js";

const firstArtifact = defineArtifact({
  name: "firstArtifact",
  id: "artifact:test.validator.first",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});
const secondArtifact = defineArtifact({
  name: "secondArtifact",
  id: "artifact:test.validator.second",
  schema: firstArtifact.schema,
});

const firstValidator: ArtifactValidator<typeof firstArtifact> =
  defineArtifactValidator(firstArtifact);
const secondValidator = defineArtifactValidator(secondArtifact);

defineArtifactValidator(firstArtifact, (value) => {
  // @ts-expect-error Local checks must narrow unknown even after structural schema admission.
  void value.value;
  return [];
});

const firstModule: ArtifactModule<typeof firstArtifact> = {
  artifact: firstArtifact,
  validate: firstValidator,
};
void firstModule;

const crossArtifactModule = {
  Schema: firstArtifact.schema,
  artifact: firstArtifact,
  validate: secondValidator,
};
// @ts-expect-error Catalog modules require a validator bound to their own artifact contract.
defineArtifactCatalog({ crossArtifactModule });
void crossArtifactModule;

// @ts-expect-error Runtime module construction preserves exact artifact-validator pairing.
implementArtifactModules([crossArtifactModule]);

defineStep({
  id: "cross-artifact-provider",
  requires: [],
  provides: [],
  schema: Type.Object({}, { additionalProperties: false }),
  // @ts-expect-error Step providers require validators bound to their own artifact contract.
  artifacts: { provides: [crossArtifactModule] },
});

const plainValidator = (_value: unknown) => [] as const;
const plainValidatorModule = {
  Schema: firstArtifact.schema,
  artifact: firstArtifact,
  validate: plainValidator,
};
// @ts-expect-error Catalog modules require validators created by defineArtifactValidator.
defineArtifactCatalog({ plainValidatorModule });
void plainValidatorModule;

const missingSchemaModule = {
  artifact: firstArtifact,
  validate: firstValidator,
};
// @ts-expect-error Catalog source modules require their canonical exported Schema.
defineArtifactCatalog({ missingSchemaModule });
void missingSchemaModule;

const extraRuntimeExportModule = {
  Schema: firstArtifact.schema,
  artifact: firstArtifact,
  validate: firstValidator,
  runMutation: () => undefined,
};
// @ts-expect-error Artifact source modules expose no runtime authority beyond Schema/artifact/validate.
defineArtifactCatalog({ extraRuntimeExportModule });
void extraRuntimeExportModule;
