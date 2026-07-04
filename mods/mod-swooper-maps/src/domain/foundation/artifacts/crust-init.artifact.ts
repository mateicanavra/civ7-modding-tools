import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

import { Schema } from "./crust.artifact.js";

export { Schema, type Artifact, validate } from "./crust.artifact.js";

export const artifact = defineArtifact({
  name: "foundationCrustInit",
  id: "artifact:foundation.crustInit",
  schema: Schema,
});
