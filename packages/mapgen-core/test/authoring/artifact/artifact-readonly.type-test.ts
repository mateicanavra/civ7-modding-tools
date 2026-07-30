import type { ArtifactReadValueOf } from "@mapgen/authoring/index.js";
import { defineArtifact, Type, TypedArraySchemas } from "@mapgen/authoring/index.js";

const artifact = defineArtifact({
  name: "artifactFoo",
  id: "artifact:test.foo",
  schema: Type.Object({
    nested: Type.Object({ value: Type.Number() }),
    values: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
  }),
});

declare const value: ArtifactReadValueOf<typeof artifact>;

// @ts-expect-error Artifact read values are deeply immutable.
value.nested.value = 1;
// @ts-expect-error Published artifact typed-array indexes are observation-only.
value.values[0] = 1;
// @ts-expect-error Published artifact typed arrays do not expose in-place setters.
value.values.set([1]);
// @ts-expect-error Published artifact typed arrays do not expose mutable storage.
value.values.buffer;
// @ts-expect-error Published artifact subarray aliases remain observation-only.
value.values.subarray().set([1]);
// @ts-expect-error Published artifact valueOf aliases remain observation-only.
value.values.valueOf().set([1]);
