import type { ArtifactReadValueOf } from "@mapgen/authoring/index.js";
import { defineArtifact, Type } from "@mapgen/authoring/index.js";

const artifact = defineArtifact({
  name: "artifactFoo",
  id: "artifact:test.foo",
  schema: Type.Object({ nested: Type.Object({ value: Type.Number() }) }),
});

declare const value: ArtifactReadValueOf<typeof artifact>;

// @ts-expect-error Artifact read values are deeply immutable.
value.nested.value = 1;
