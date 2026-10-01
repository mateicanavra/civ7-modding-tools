import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import { estimateDivergenceOddQ } from "@swooper/mapgen-core/lib/grid";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeOceanGeometry, computeOceanSurfaceCurrents } = hydrologyOpsPublic.ocean.ops;
const { width: WIDTH, height: HEIGHT } = TEST_MAP_SIZE.dimensions;
const ISOLATED_FORCING = {
  maxSpeed: 127,
  windStrength: 0,
  ekmanStrength: 0,
  gyreStrength: 0,
  coastStrength: 0,
  smoothIters: 0,
  projectionIters: 0,
} as const;
const CARDINAL_DIRECTIONS = [
  { name: "east", u: 127, north: 0, rightU: 0, rightNorth: -127 },
  { name: "west", u: -127, north: 0, rightU: 0, rightNorth: 127 },
  { name: "north", u: 0, north: 127, rightU: 127, rightNorth: 0 },
  { name: "south", u: 0, north: -127, rightU: -127, rightNorth: 0 },
] as const;
type WindGyreProjectionSelection = Extract<
  Parameters<typeof computeOceanSurfaceCurrents.run>[1],
  { strategy: "wind-gyre-projection" }
>;

function latitudeRamp(top: number, bottom: number): Float32Array {
  return Float32Array.from({ length: HEIGHT }, (_, y) =>
    top + ((bottom - top) * y) / Math.max(1, HEIGHT - 1)
  );
}

function oceanInput(latitudeByRow: Float32Array, u = 0, v = 0) {
  const size = WIDTH * HEIGHT;
  return {
    width: WIDTH,
    height: HEIGHT,
    latitudeByRow,
    isWaterMask: new Uint8Array(size).fill(1),
    windU: new Int8Array(size).fill(u),
    windV: new Int8Array(size).fill(v),
  };
}

function rms(values: Float32Array, mask: Uint8Array): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if ((mask[i] ?? 0) !== 1) continue;
    const v = values[i] ?? 0;
    sum += v * v;
    n += 1;
  }
  return Math.sqrt(sum / Math.max(1, n));
}

function runOceanSurfaceCurrents(
  input: Parameters<typeof computeOceanSurfaceCurrents.run>[0],
  config: WindGyreProjectionSelection["config"]
) {
  return computeOceanSurfaceCurrents.run(input, {
    strategy: "wind-gyre-projection",
    config,
  } satisfies WindGyreProjectionSelection);
}

describe("hydrology/compute-ocean-surface-currents (wind-gyre-projection)", () => {
  for (const hemisphere of [1, -1]) {
    for (const rampSign of [1, -1]) {
      const label = `${hemisphere > 0 ? "NH" : "SH"}, ${rampSign > 0 ? "ascending" : "descending"} latitude`;
      const latitudes = latitudeRamp(
        hemisphere * 40 - rampSign * 10,
        hemisphere * 40 + rampSign * 10
      );

      it(`deflects every cardinal wind geographically right in NH / left in SH (${label})`, () => {
        for (const direction of CARDINAL_DIRECTIONS) {
          const input = oceanInput(latitudes, direction.u, direction.north * rampSign);
          input.isWaterMask[0] = 0;
          const field = runOceanSurfaceCurrents(input, { ...ISOLATED_FORCING, ekmanStrength: 1 });
          const expectedU = direction.rightU * hemisphere || 0;
          const expectedV = direction.rightNorth * hemisphere * rampSign || 0;
          for (let i = 0; i < WIDTH * HEIGHT; i++) {
            expect(field.currentU[i]).toBe(i === 0 ? 0 : expectedU);
            expect(field.currentV[i]).toBe(i === 0 ? 0 : expectedV);
          }
        }
      });

      it(`rotates basin radials clockwise in NH / counterclockwise in SH, including X-wrap (${label})`, () => {
        const centerY = Math.floor(HEIGHT / 2);
        const centerX = Math.floor(WIDTH / 2);
        const fields = [centerX, 0].map((cx) => {
          const input = oceanInput(latitudes);
          input.isWaterMask.fill(0);
          const basinId = new Int32Array(WIDTH * HEIGHT);
          for (let y = centerY - 1; y <= centerY + 1; y++) {
            for (let dx = -1; dx <= 1; dx++) {
              const x = (cx + dx + WIDTH) % WIDTH;
              input.isWaterMask[y * WIDTH + x] = 1;
              basinId[y * WIDTH + x] = 1;
            }
          }
          const field = runOceanSurfaceCurrents(
            { ...input, basinId },
            { ...ISOLATED_FORCING, gyreStrength: 127 }
          );
          for (const direction of CARDINAL_DIRECTIONS) {
            const x = (cx + direction.u / 127 + WIDTH) % WIDTH;
            const y = centerY + (direction.north / 127) * rampSign;
            expect(field.currentU[y * WIDTH + x]).toBe(direction.rightU * hemisphere || 0);
            expect(field.currentV[y * WIDTH + x]).toBe(
              direction.rightNorth * hemisphere * rampSign || 0
            );
          }
          expect(field.currentU[centerY * WIDTH + cx]).toBe(0);
          expect(field.currentV[centerY * WIDTH + cx]).toBe(0);
          for (let i = 0; i < WIDTH * HEIGHT; i++) {
            if (input.isWaterMask[i] === 1) continue;
            expect(field.currentU[i]).toBe(0);
            expect(field.currentV[i]).toBe(0);
          }
          return field;
        });
        for (let y = 0; y < HEIGHT; y++) {
          for (let x = 0; x < WIDTH; x++) {
            const shifted = y * WIDTH + ((x - centerX + WIDTH) % WIDTH);
            expect(fields[1]!.currentU[shifted]).toBe(fields[0]!.currentU[y * WIDTH + x]);
            expect(fields[1]!.currentV[shifted]).toBe(fields[0]!.currentV[y * WIDTH + x]);
          }
        }
      });

      it(`aligns geometry-produced western/eastern coast flow with basin handedness (${label})`, () => {
        const input = oceanInput(latitudes);
        input.isWaterMask.fill(0);
        const coastalWaterMask = new Uint8Array(WIDTH * HEIGHT);
        const west = Math.floor(WIDTH / 2) - 2;
        const east = west + 4;
        for (let y = 0; y < HEIGHT; y++) {
          for (let x = west; x <= east; x++) {
            input.isWaterMask[y * WIDTH + x] = 1;
            if (x === west || x === east) coastalWaterMask[y * WIDTH + x] = 1;
          }
        }
        const geometry = computeOceanGeometry.run(
          {
            width: WIDTH,
            height: HEIGHT,
            isWaterMask: input.isWaterMask,
            coastalWaterMask,
            distanceToCoast: new Uint16Array(WIDTH * HEIGHT),
            shelfMask: new Uint8Array(WIDTH * HEIGHT),
          },
          {
            strategy: "connected-basins",
            config: { maxCoastDistance: 64, maxCoastVectorDistance: 10 },
          }
        );
        const field = runOceanSurfaceCurrents(
          {
            ...input,
            coastDistance: geometry.coastDistance,
            coastTangentU: geometry.coastTangentU,
            coastTangentV: geometry.coastTangentV,
          },
          { ...ISOLATED_FORCING, coastStrength: 127 }
        );
        const y = Math.floor(HEIGHT / 2);
        for (const [x, normalU, tangentV, northward] of [
          [west, 127, 127, 127],
          [east, -127, -127, -127],
        ]) {
          const i = y * WIDTH + x!;
          expect(geometry.coastNormalU[i]).toBe(normalU!);
          expect(geometry.coastNormalV[i]).toBe(0);
          expect(geometry.coastTangentU[i]).toBe(0);
          expect(geometry.coastTangentV[i]).toBe(tangentV!);
          expect(field.currentU[i]).toBe(0);
          expect(field.currentV[i]).toBe(northward! * hemisphere * rampSign);
        }
      });
    }
  }

  for (const rampSign of [1, -1]) {
    it(`retains the equator-as-NH policy while changing sense across the equator (ramp ${rampSign})`, () => {
      const latitudes = latitudeRamp(-80 * rampSign, 80 * rampSign);
      const equatorY = Math.floor(HEIGHT / 2);
      latitudes[equatorY] = 0;
      const field = runOceanSurfaceCurrents(oceanInput(latitudes, 127), {
        ...ISOLATED_FORCING,
        ekmanStrength: 1,
      });
      for (let y = 0; y < HEIGHT; y++) {
        const expectedV = (latitudes[y]! >= 0 ? -127 : 127) * rampSign;
        expect(field.currentU[y * WIDTH]).toBe(0);
        expect(field.currentV[y * WIDTH]).toBe(expectedV);
      }
      expect(field.currentV[equatorY * WIDTH]).toBe(-127 * rampSign);
    });

    it(`is deterministic and does not mutate inputs through smoothing/projection (ramp ${rampSign})`, () => {
      const input = {
        ...oceanInput(latitudeRamp(-80 * rampSign, 80 * rampSign), 90, 30),
        basinId: new Int32Array(WIDTH * HEIGHT).fill(1),
        coastDistance: new Uint16Array(WIDTH * HEIGHT).fill(3),
        coastTangentU: new Int8Array(WIDTH * HEIGHT).fill(90),
        coastTangentV: new Int8Array(WIDTH * HEIGHT).fill(-90),
      };
      input.isWaterMask[Math.floor(HEIGHT / 2) * WIDTH + Math.floor(WIDTH / 2)] = 0;
      const before = structuredClone(input);
      const config = {
        maxSpeed: 80,
        windStrength: 0.55,
        ekmanStrength: 0.35,
        gyreStrength: 26,
        coastStrength: 32,
        smoothIters: 3,
        projectionIters: 8,
      };
      const a = runOceanSurfaceCurrents(input, config);
      const b = runOceanSurfaceCurrents(input, config);
      expect(a).toEqual(b);
      expect(input).toEqual(before);
      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        expect(Math.abs(a.currentU[i]!)).toBeLessThanOrEqual(127);
        expect(Math.abs(a.currentV[i]!)).toBeLessThanOrEqual(127);
        if (input.isWaterMask[i] === 1) continue;
        expect(a.currentU[i]).toBe(0);
        expect(a.currentV[i]).toBe(0);
      }
    });
  }

  it("uses the atmospheric descending-ramp fallback for flat NH, SH and equatorial latitude", () => {
    for (const latitude of [35, -35, 0]) {
      const field = runOceanSurfaceCurrents(oceanInput(new Float32Array(HEIGHT).fill(latitude), 127), {
        ...ISOLATED_FORCING,
        ekmanStrength: 1,
      });
      expect(field.currentU[0]).toBe(0);
      expect(field.currentV[0]).toBe(latitude >= 0 ? 127 : -127);
    }
  });

  it("keeps zero wind and disabled forcing exactly zero", () => {
    for (const latitudes of [latitudeRamp(80, -80), latitudeRamp(-80, 80)]) {
      const calm = runOceanSurfaceCurrents(oceanInput(latitudes), {
        ...ISOLATED_FORCING,
        ekmanStrength: 1,
      });
      const disabled = runOceanSurfaceCurrents(
        {
          ...oceanInput(latitudes, 127, 127),
          basinId: new Int32Array(WIDTH * HEIGHT).fill(1),
          coastTangentU: new Int8Array(WIDTH * HEIGHT).fill(127),
          coastTangentV: new Int8Array(WIDTH * HEIGHT).fill(127),
        },
        ISOLATED_FORCING
      );
      expect(calm.currentU).toEqual(new Int8Array(WIDTH * HEIGHT));
      expect(calm.currentV).toEqual(new Int8Array(WIDTH * HEIGHT));
      expect(disabled).toEqual(calm);
    }
  });

  it.each([[60, 20], [20, 60]])("zeros land and reduces divergence with projection (latitude %d to %d)", (top, bottom) => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;

    const latitudeByRow = latitudeRamp(top, bottom);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);
    // A small land island centered inside the selected Civ7 map size.
    const islandLeft = Math.floor(width / 2) - 2;
    const islandTop = Math.floor(height / 2) - 2;
    for (let y = islandTop; y < islandTop + 4; y++) {
      for (let x = islandLeft; x < islandLeft + 4; x++) {
        isWaterMask[y * width + x] = 0;
      }
    }

    const windU = new Int8Array(size);
    const windV = new Int8Array(size);
    windU.fill(90);
    windV.fill(0);

    const input = { width, height, latitudeByRow, isWaterMask, windU, windV };
    const raw = runOceanSurfaceCurrents(input, {
      maxSpeed: 80,
      windStrength: 0.55,
      ekmanStrength: 0.35,
      gyreStrength: 0,
      coastStrength: 0,
      smoothIters: 0,
      projectionIters: 0,
    });
    const projected = runOceanSurfaceCurrents(input, {
      maxSpeed: 80,
      windStrength: 0.55,
      ekmanStrength: 0.35,
      gyreStrength: 0,
      coastStrength: 0,
      smoothIters: 0,
      projectionIters: 12,
    });

    // Land must be zero.
    for (let i = 0; i < size; i++) {
      if (isWaterMask[i] === 1) continue;
      expect(projected.currentU[i]).toBe(0);
      expect(projected.currentV[i]).toBe(0);
    }

    const rawX = new Float32Array(size);
    const rawY = new Float32Array(size);
    const projX = new Float32Array(size);
    const projY = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      rawX[i] = raw.currentU[i] ?? 0;
      rawY[i] = raw.currentV[i] ?? 0;
      projX[i] = projected.currentU[i] ?? 0;
      projY[i] = projected.currentV[i] ?? 0;
    }

    const divRaw = estimateDivergenceOddQ(width, height, rawX, rawY);
    const divProj = estimateDivergenceOddQ(width, height, projX, projY);

    expect(rms(divProj, isWaterMask)).toBeLessThan(rms(divRaw, isWaterMask));
  });
});
