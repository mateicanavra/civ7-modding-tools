import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

declare const admittedMapSetup: unique symbol;
const admittedMapSetups = new WeakSet<object>();
const MIN_INT32 = -2_147_483_648;
const MAX_INT32 = 2_147_483_647;

function readClosedDataObject(
  input: unknown,
  expectedKeys: readonly string[],
  label: string
): PropertyDescriptorMap {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.getPrototypeOf(input) !== Object.prototype
  ) {
    throw new TypeError(`${label} must be a plain data object.`);
  }

  const descriptors = Object.getOwnPropertyDescriptors(input);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string" || !expectedKeys.includes(key)) {
      throw new TypeError(`${label} contains an unknown property.`);
    }
  }
  for (const key of expectedKeys) {
    const descriptor = descriptors[key];
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      throw new TypeError(`${label}.${key} must be an own enumerable data property.`);
    }
  }
  return descriptors;
}

function snapshotMapSetupInput(input: MapSetupInput): MapSetupInput {
  const root = readClosedDataObject(
    input,
    ["mapSeed", "dimensions", "latitudeBounds"],
    "Map setup"
  );
  const dimensions = readClosedDataObject(
    root.dimensions?.value,
    ["width", "height"],
    "Map setup dimensions"
  );
  const latitudeBounds = readClosedDataObject(
    root.latitudeBounds?.value,
    ["topLatitude", "bottomLatitude"],
    "Map setup latitude bounds"
  );

  return {
    mapSeed: root.mapSeed?.value as number,
    dimensions: {
      width: dimensions.width?.value as number,
      height: dimensions.height?.value as number,
    },
    latitudeBounds: {
      topLatitude: latitudeBounds.topLatitude?.value as number,
      bottomLatitude: latitudeBounds.bottomLatitude?.value as number,
    },
  };
}

const MapDimensionsSchema = Type.Object(
  {
    width: Type.Integer({
      minimum: 1,
      maximum: MAX_INT32,
      description: "Positive signed-32-bit horizontal tile count of the map being generated.",
    }),
    height: Type.Integer({
      minimum: 1,
      maximum: MAX_INT32,
      description: "Positive signed-32-bit vertical tile count of the map being generated.",
    }),
  },
  {
    additionalProperties: false,
    description: "Physical tile-grid dimensions admitted once for one map-generation run.",
  }
);

const LatitudeBoundsSchema = Type.Object(
  {
    topLatitude: Type.Number({
      description: "Latitude represented by the northern edge of the generated tile grid.",
    }),
    bottomLatitude: Type.Number({
      description: "Latitude represented by the southern edge of the generated tile grid.",
    }),
  },
  {
    additionalProperties: false,
    description: "Geographic latitude bounds used to interpret north-to-south tile positions.",
  }
);

/**
 * Closed structural input accepted by the map-setup admission boundary.
 *
 * Cross-field invariants, immutability, and admitted identity belong to `admitMapSetup`; matching
 * this schema alone does not make a value an admitted `MapSetup`.
 */
export const MapSetupSchema = Type.Object(
  {
    mapSeed: Type.Integer({
      minimum: MIN_INT32,
      maximum: MAX_INT32,
      description:
        "Signed 32-bit deterministic seed from which every MapGen-authored random draw is derived.",
    }),
    dimensions: MapDimensionsSchema,
    latitudeBounds: LatitudeBoundsSchema,
  },
  {
    additionalProperties: false,
    description:
      "Structural physical setup submitted for admission: map seed, tile-grid dimensions, and geographic latitude bounds.",
  }
);

/** Structural input accepted at the single map-setup admission boundary. */
export type MapSetupInput = Readonly<
  Omit<Static<typeof MapSetupSchema>, "dimensions" | "latitudeBounds"> & {
    readonly dimensions: Readonly<Static<typeof MapDimensionsSchema>>;
    readonly latitudeBounds: Readonly<Static<typeof LatitudeBoundsSchema>>;
  }
>;

/** Admitted immutable setup whose identity is preserved through compilation and execution. */
export type MapSetup = MapSetupInput & Readonly<{ [admittedMapSetup]: true }>;

/** @internal Refuses setup-shaped values that did not cross `admitMapSetup`. */
export function assertMapSetupInternal(setup: MapSetup): void {
  if (!admittedMapSetups.has(setup)) {
    throw new Error("MapContext setup must be returned by admitMapSetup.");
  }
}

/**
 * Admits one closed, immutable physical setup for compilation and execution.
 *
 * Unknown properties are refused rather than entering a plan fingerprint, and mutable inputs are
 * snapshotted so later caller mutation cannot change the identity of an already-compiled run.
 * Passing an already-admitted setup preserves its identity for every downstream owner.
 */
export function admitMapSetup(input: MapSetup | MapSetupInput): MapSetup {
  if (typeof input === "object" && input !== null && admittedMapSetups.has(input)) {
    return input as MapSetup;
  }

  const parsed = Value.Parse(MapSetupSchema, snapshotMapSetupInput(input));
  if (parsed.dimensions.width > Math.floor(MAX_INT32 / parsed.dimensions.height)) {
    throw new RangeError("Map setup tile count must fit a signed 32-bit grid index.");
  }
  if (parsed.latitudeBounds.topLatitude <= parsed.latitudeBounds.bottomLatitude) {
    throw new RangeError("Map setup topLatitude must be greater than bottomLatitude.");
  }
  const admitted = {
    mapSeed: parsed.mapSeed,
    dimensions: Object.freeze({
      width: parsed.dimensions.width,
      height: parsed.dimensions.height,
    }),
    latitudeBounds: Object.freeze({
      topLatitude: parsed.latitudeBounds.topLatitude,
      bottomLatitude: parsed.latitudeBounds.bottomLatitude,
    }),
  };
  const frozen = Object.freeze(admitted) as MapSetup;
  admittedMapSetups.add(frozen);
  return frozen;
}
