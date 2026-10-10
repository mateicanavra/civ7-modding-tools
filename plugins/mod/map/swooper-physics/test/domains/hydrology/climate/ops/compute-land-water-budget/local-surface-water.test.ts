import { describe, expect, it } from "bun:test";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { noLocalWaterSources } from "../../../../../fixtures/local-water-sources.js";

const operation = hydrology.climate.ops.computeLandWaterBudget;
function fixture(width = 5, height = 3) {
  const size = width * height;
  const sources = noLocalWaterSources(width, height);
  sources.elevation.fill(10);
  return {
    width, height, ...sources,
    landMask: new Uint8Array(size).fill(1),
    rainfall: new Uint8Array(size).fill(20),
    humidity: new Uint8Array(size).fill(60),
    pet: Array<number>(size).fill(30.123456789),
  };
}
function body(input: ReturnType<typeof fixture>, cells: number[] = [7], supply = 70) {
  for (const cell of cells) input.landMask[cell] = 0;
  return {
    bodyId: Math.min(...cells) + 1, componentId: 1, poolId: 1,
    wetCells: cells, level: 10,
    flux: { incomingOverflow: supply - 10, wetPrecipitation: 10, wetDemand: supply, dryRunoff: 0, balance: 0 },
    outflow: 0, unresolvedResidual: 0,
  };
}
const run = (input: ReturnType<typeof fixture>) => operation.run(input, operation.defaultConfig);
// With zero atmospheric supply, the public plant-moisture field publishes L at Float32 precision.
const opportunity = (input: ReturnType<typeof fixture>) => run({
  ...input,
  rainfall: new Uint8Array(input.width * input.height),
  humidity: new Uint8Array(input.width * input.height),
}).plantEffectiveMoisture;

describe("local annual surface-water opportunity", () => {
  it("holds no-source atmospheric arithmetic exactly at Float32 and owns fresh readonly-input outputs", () => {
    const input = fixture();
    input.landMask[0] = 0;
    input.externalWaterMask[0] = 1;
    input.rainfall[2] = 0;
    input.humidity[2] = 255;
    const before = structuredClone(input);
    const observed = Object.freeze({ ...input, pet: Object.freeze(input.pet.slice()), bodies: Object.freeze(input.bodies.slice()) });
    const first = operation.run(observed, operation.defaultConfig);
    const second = operation.run(observed, operation.defaultConfig);
    expect(opportunity(input)).toEqual(new Float32Array(input.width * input.height));
    expect(first.plantEffectiveMoisture).toEqual(first.effectiveMoisture);
    expect(first.plantWaterStress).toEqual(first.aridityIndex);
    expect(first).toEqual(second);
    for (const key of ["pet", "effectiveMoisture", "aridityIndex", "plantEffectiveMoisture", "plantWaterStress"] as const) {
      expect(first[key]).not.toBe(second[key]);
      expect(first[key][0]).toBe(0);
    }
    expect(first.plantEffectiveMoisture).not.toBe(first.effectiveMoisture);
    expect(first.plantWaterStress).not.toBe(first.aridityIndex);
    expect(first.aridityIndex[2]).toBe(Math.fround(input.pet[2]! / (input.pet[2]! + 1)));
    expect(input).toEqual(before);
  });

  it("subtracts local runoff and retains volume sensitivity without a display-class gate", () => {
    const input = fixture();
    input.discharge[7] = 4;
    input.runoff[7] = 2;
    const small = opportunity(input);
    expect(small[7]).toBe(Math.fround(2 / 7));
    input.discharge[7] = 400;
    input.runoff[7] = 200;
    const large = opportunity(input);
    expect(large[7]).toBe(Math.fround(200 / 7));
    expect(large[7]).toBeGreaterThan(small[7]!);
    const labeled = { ...input, riverClass: new Uint8Array(15).fill(2) };
    expect(Object.hasOwn(operation.input.properties, "riverClass")).toBe(false);
    expect(() => operation.run(labeled, operation.defaultConfig)).toThrow(OperationInputAdmissionError);
    expect(opportunity(input)).toEqual(large);
    input.runoff[7] = 401;
    expect(opportunity(input)).toEqual(new Float32Array(15));
  });

  it("dilutes fixed ordinary supply by distinct eligible self and adjacent contact area", () => {
    const input = fixture();
    input.discharge[7] = 70;
    input.elevation.fill(11);
    input.elevation[7] = 10;
    expect(opportunity(input)[7]).toBe(70);
    input.elevation.fill(10);
    expect(opportunity(input)[7]).toBe(10);
    input.elevation[8] = 11;
    expect(opportunity(input)[8]).toBe(0);
    expect(opportunity(input)[7]).toBe(Math.fround(70 / 6));
  });

  it("offers the receiver maximum, never an additive edge amplification", () => {
    const input = fixture();
    input.discharge[7] = 70;
    input.discharge[8] = 140;
    const result = opportunity(input);
    expect(result[7]).toBe(20);
    expect(result[8]).toBe(20);
  });

  it("excludes marine and component dry-flux sentinels but admits a body contact on a dry component member", () => {
    const input = fixture();
    input.discharge[7] = 70;
    input.externalWaterMask[7] = 1;
    expect(opportunity(input)).toEqual(new Float32Array(15));
    input.externalWaterMask[7] = 0;
    input.componentId[7] = 1;
    expect(opportunity(input)).toEqual(new Float32Array(15));
    input.bodies.push(body(input, [8]));
    expect(opportunity(input)[7]).toBeGreaterThan(0);
    expect(opportunity(input)[8]).toBe(0);
  });

  it("uses complete gross body inputs and maintained footprint even for a standing zero-outlet body", () => {
    const input = fixture();
    const wetBody = body(input);
    input.bodies.push(wetBody);
    const before = structuredClone(input);
    const result = opportunity(input);
    expect(result[8]).toBe(70 / 7);
    expect(result[7]).toBe(0);
    expect(input).toEqual(before);
    const baseline = run(input);
    wetBody.flux.incomingOverflow += 70;
    const wetter = run(input);
    expect(wetter.plantEffectiveMoisture[8]).toBeGreaterThan(baseline.plantEffectiveMoisture[8]!);
    expect(wetter.plantWaterStress[8]).toBeLessThan(baseline.plantWaterStress[8]!);
    expect(wetter.pet).toEqual(baseline.pet);
    expect(wetter.effectiveMoisture).toEqual(baseline.effectiveMoisture);
    expect(wetter.aridityIndex).toEqual(baseline.aridityIndex);
  });

  it("deduplicates body identity, footprint and repeated shore edges with grid-bound cardinality", () => {
    const input = fixture();
    const wetBody = body(input, [7, 8]);
    input.bodies.push(wetBody);
    const contacts = new Set<number>();
    for (const wet of wetBody.wetCells) {
      for (const cell of getHexNeighborIndicesOddQ(wet % 5, Math.floor(wet / 5), 5, 3)) {
        if (input.landMask[cell] === 1) contacts.add(cell);
      }
    }
    const baseline = opportunity(input);
    expect(baseline[6]).toBe(Math.fround(70 / (2 + contacts.size)));
    wetBody.wetCells.push(7, 8, 8);
    input.bodies.push(structuredClone(wetBody));
    expect(opportunity(input)).toEqual(baseline);
    expect(run(input).plantEffectiveMoisture[6]).toBe(Math.fround(41 + 70 / (2 + contacts.size)));
    input.bodies[1]!.level++;
    expect(() => run(input)).toThrow("Conflicting finite-body");
  });

  it("dilutes body offer across wet footprint and at-or-below-head dry contacts without high-bank credit", () => {
    const input = fixture();
    input.bodies.push(body(input));
    input.elevation.fill(11);
    input.elevation[8] = 10;
    const few = opportunity(input);
    expect(few[8]).toBe(35);
    expect(few[6]).toBe(0);
    input.elevation.fill(10);
    const many = opportunity(input);
    expect(many[8]).toBe(10);
    input.elevation[8] = 9;
    expect(opportunity(input)).toEqual(many);
  });

  it("preserves common ground/head datum shifts and body-versus-ordinary maximum decomposition", () => {
    const input = fixture();
    input.discharge[5] = 70;
    input.bodies.push(body(input, [7], 140));
    const baseline = opportunity(input);
    const ordinary = opportunity({ ...input, bodies: [] });
    const finite = opportunity({ ...input, discharge: Array<number>(15).fill(0) });
    expect(baseline).toEqual(Float32Array.from(ordinary, (value, cell) => Math.max(value, finite[cell]!)));
    input.elevation = Int16Array.from(input.elevation, (value) => value + 1234);
    input.bodies[0]!.level += 1234;
    expect(opportunity(input)).toEqual(baseline);
  });

  it.each([[2, 1], [1, 1], [1, 3]])("deduplicates narrow wrapped-X contacts and bounds Y on %i x %i", (width, height) => {
    const input = fixture(width, height);
    input.discharge[0] = 20;
    const contacts = new Set([0, ...getHexNeighborIndicesOddQ(0, 0, width, height)]);
    const result = opportunity(input);
    for (const cell of contacts) expect(result[cell]).toBe(Math.fround(20 / contacts.size));
    if (height === 3) expect(result[2]).toBe(0);
  });

  it("raises moisture and lowers stress with supply while demand never creates moisture", () => {
    const input = fixture();
    const baseline = run(input);
    input.discharge[7] = 70;
    const supported = run(input);
    expect(supported.plantEffectiveMoisture[7]).toBe(Math.fround(51));
    expect(supported.plantWaterStress[7]).toBe(Math.fround(input.pet[7]! / (input.pet[7]! + 31)));
    expect(supported.plantEffectiveMoisture[7]).toBeGreaterThan(baseline.plantEffectiveMoisture[7]!);
    expect(supported.plantWaterStress[7]).toBeLessThan(baseline.plantWaterStress[7]!);
    input.pet.fill(60.246913578);
    const higherDemand = run(input);
    expect(higherDemand.plantEffectiveMoisture).toEqual(supported.plantEffectiveMoisture);
    expect(higherDemand.plantWaterStress[7]).toBeGreaterThan(supported.plantWaterStress[7]!);
  });

  it("refuses malformed grid arrays, numeric ledgers and out-of-grid or marine wet footprints", () => {
    for (const key of ["externalWaterMask", "elevation", "componentId"] as const) {
      const input = fixture();
      const malformed = { ...input, [key]: input[key].slice(1) };
      let refusal: unknown;
      try {
        operation.run(malformed, operation.defaultConfig);
      } catch (error) {
        refusal = error;
      }
      expect(refusal).toBeInstanceOf(OperationInputAdmissionError);
      if (!(refusal instanceof OperationInputAdmissionError)) throw new Error("Expected input admission refusal.");
      expect(refusal.issues).toHaveLength(1);
      expect(refusal.issues[0]).toMatchObject({
        code: "typed-array-cardinality", cardinalityPaths: ["width", "height"], expectedLength: 15, observedLength: 14,
      });
      expect(refusal.issues[0]?.path).toContain(key);
    }
    for (const key of ["discharge", "runoff", "pet"] as const) {
      const input = fixture();
      input[key].pop();
      expect(() => run(input)).toThrow();
    }
    const input = fixture();
    input.bodies.push(body(input));
    input.externalWaterMask[7] = 1;
    expect(() => run(input)).toThrow("resolved nonmarine water");
    input.externalWaterMask[7] = 0;
    input.bodies[0]!.wetCells.push(15);
    expect(() => run(input)).toThrow("in the grid");
    const infinite = fixture();
    infinite.discharge[7] = Infinity;
    expect(() => run(infinite)).toThrow();
  });
});
