import {
  type Artifact,
  type ArtifactValueOf,
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  Type,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import type { MapSetup } from "@mapgen/core/map-setup.js";

declare const admittedSetup: MapSetup;

const firstArtifact = defineArtifact({
  name: "firstArtifact",
  id: "artifact:test.admission.first",
  schema: Type.Object(
    {
      nested: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      values: TypedArraySchemas.u8({ cardinality: "map-grid" }),
    },
    { additionalProperties: false }
  ),
  refine: (value, facilities) => {
    const inferredNumber: number = value.nested.value;
    const inferredValue: number = value.values[0]!;
    const inferredValues: number[] = [...value.values];
    const copiedValues: Uint8Array = value.values.slice();
    const readonlyAlias = value.values.subarray(1);
    const inferredAliasValue: number | undefined = readonlyAlias.at(0);
    const inferredWidth: number = facilities.dimensions.width;
    const inferredCellCount: number = facilities.cellCount;
    facilities.issues.add("contextually inferred");
    facilities.issues.addGridCoordinates("coordinates", [{ x: 0, y: 0 }]);

    // @ts-expect-error Refinement values are deeply immutable.
    value.nested.value = 2;
    // @ts-expect-error Refinement typed-array elements are immutable.
    value.values[0] = 1;
    // @ts-expect-error Refinement typed arrays do not expose in-place setters.
    value.values.set([1]);
    // @ts-expect-error Refinement typed arrays do not expose in-place filling.
    value.values.fill(1);
    // @ts-expect-error Refinement typed arrays do not expose in-place reversal.
    value.values.reverse();
    // @ts-expect-error Refinement typed arrays do not expose in-place sorting.
    value.values.sort();
    // @ts-expect-error Refinement typed arrays do not expose in-place copying.
    value.values.copyWithin(0, 1);
    // @ts-expect-error Refinement typed arrays do not expose their mutable backing buffer.
    value.values.buffer;
    // @ts-expect-error Aliasing subarrays retain the same observation-only surface.
    readonlyAlias.set([1]);
    // @ts-expect-error Admitted dimensions are immutable.
    facilities.dimensions.width = 4;
    // @ts-expect-error Refinement facilities are immutable.
    facilities.cellCount = 4;
    // @ts-expect-error The issue sink cannot be replaced.
    facilities.issues.add = () => undefined;

    void inferredNumber;
    void inferredValue;
    void inferredValues;
    void copiedValues;
    void inferredAliasValue;
    void inferredWidth;
    void inferredCellCount;
    return undefined;
  },
});

const firstValue: ArtifactValueOf<typeof firstArtifact> = {
  nested: { value: 1 },
  values: new Uint8Array(4),
};
firstArtifact.validate(firstValue, { dimensions: admittedSetup.dimensions });

// @ts-expect-error Artifact validation context is mandatory.
firstArtifact.validate(firstValue);
// @ts-expect-error Artifact validation context must own dimensions.
firstArtifact.validate(firstValue, {});

const noInferArtifact = defineArtifact({
  name: "noInferArtifact",
  id: "artifact:test.admission.no-infer",
  schema: Type.Object({ actual: Type.Number() }, { additionalProperties: false }),
  // @ts-expect-error Refinement annotations cannot influence or replace schema authority.
  refine: (_value: Readonly<{ actual: string }>) => undefined,
});
declare const noInferValue: ArtifactValueOf<typeof noInferArtifact>;
const schemaOwnedNumber: number = noInferValue.actual;
// @ts-expect-error The rejected callback annotation did not change the schema-derived value.
const callbackOwnedString: string = noInferValue.actual;
void schemaOwnedNumber;
void callbackOwnedString;

defineArtifact({
  name: "arrayReturningArtifact",
  id: "artifact:test.admission.array-return",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
  // @ts-expect-error Artifact refinements return exactly undefined, not issue arrays.
  refine: () => [],
});

defineArtifact({
  name: "asyncArtifact",
  id: "artifact:test.admission.async-type",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
  // @ts-expect-error Artifact refinement is synchronous and returns exactly undefined.
  refine: async () => undefined,
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

// @ts-expect-error Catalog and step dependency property identity is singular.
defineArtifactCatalog({ alias: firstArtifact });

defineStep({
  id: "canonical-artifact-provider",
  requires: [firstArtifact],
  provides: [secondArtifact],
});

const missingValidator = {
  name: firstArtifact.name,
  id: firstArtifact.id,
  schema: firstArtifact.schema,
};
// @ts-expect-error A complete artifact authority always carries admission behavior.
defineArtifactCatalog({ missingValidator });

defineStep({
  id: "legacy-wrapper-provider",
  requires: [],
  // @ts-expect-error Step providers accept the same Artifact authority used by requirements.
  provides: [{ artifact: firstArtifact, validate: firstArtifact.validate }],
});
