import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Seasonal amplitude for Hydrology’s climate field outputs.
 *
 * This is the *public* seasonality output surface: Hydrology may internally simulate 2–4 seasonal modes, but it only
 * publishes the annual mean (via `artifact:hydrology.baselineClimateField`) and the corresponding amplitude fields here.
 */
const Schema = Type.Object(
  {
    /** Number of seasonal modes used internally when computing amplitudes (2 or 4). */
    modeCount: Type.Union([Type.Literal(2), Type.Literal(4)], {
      description: "Seasonal mode count used for internal sampling (2=solstices, 4=quarter-year).",
    }),
    /** Effective axial tilt (declination amplitude) in degrees used for seasonal forcing. */
    axialTiltDeg: Type.Number({
      minimum: 0,
      maximum: 45,
      description:
        "Axial tilt in degrees used to simulate seasonal declination forcing (0 disables seasonal amplitudes).",
    }),
    /** Seasonal rainfall amplitude per tile (0..255), computed from the spread across seasonal modes. */
    rainfallAmplitude: TypedArraySchemas.u8({
      description: "Seasonal rainfall amplitude per tile (0..255; derived from seasonal spread).",
    }),
    /** Seasonal humidity amplitude per tile (0..255), computed from the spread across seasonal modes. */
    humidityAmplitude: TypedArraySchemas.u8({
      description: "Seasonal humidity amplitude per tile (0..255; derived from seasonal spread).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate seasonality outputs: annual amplitude fields corresponding to the baseline climate mean.",
  }
);

/**
 * Registers seasonal temperature, rainfall, and humidity amplitudes together with the sampled
 * seasonal mode count. Consumers can reason about variability without rerunning the baseline
 * circulation pass.
 */
export const artifact = defineArtifact({
  name: "climateSeasonality",
  id: "artifact:hydrology.climateSeasonality",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Binds both seasonal amplitude fields to the admitted map dimensions.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const expectedLength = artifactCellCount(context);
  const errors: ArtifactValidationIssue[] = [];

  appendArtifactTypedArrayIssues(
    errors,
    "climateSeasonality.rainfallAmplitude",
    value.rainfallAmplitude,
    Uint8Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateSeasonality.humidityAmplitude",
    value.humidityAmplitude,
    Uint8Array,
    expectedLength
  );
  return errors;
}
