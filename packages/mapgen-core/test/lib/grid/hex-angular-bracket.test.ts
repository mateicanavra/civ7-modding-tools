import { describe, expect, it } from "bun:test";
import {
  bracketHexNeighborDirectionsOddQ,
  getHexNeighborDirectionVectorsOddQ,
} from "@mapgen/lib/grid/vector-field.js";

const TAU = 2 * Math.PI;
const RAY_SLOTS = {
  even: [1, 3, 5, 0, 4, 2],
  odd: [1, 5, 3, 0, 2, 4],
} as const;

function angularOracle(x: number, y: number, odd: boolean): number[] {
  const angle = (Math.atan2(y, x) + TAU) % TAU;
  const sector = Math.min(5, Math.floor(angle / (Math.PI / 3)));
  const offset = angle - sector * Math.PI / 3;
  const a = Math.sin(Math.PI / 3 - offset);
  const b = Math.sin(offset);
  const slots = odd ? RAY_SLOTS.odd : RAY_SLOTS.even;
  const weights = new Array<number>(6).fill(0);
  weights[slots[sector]!] = a / (a + b);
  weights[slots[(sector + 1) % 6]!] = b / (a + b);
  return weights;
}

describe("grid adjacent angular bracket", () => {
  it("agrees with an angular oracle for every signed-byte vector at both parities", () => {
    for (const odd of [false, true]) {
      for (let x = -128; x <= 127; x++) {
        for (let y = -128; y <= 127; y++) {
          const bracket = bracketHexNeighborDirectionsOddQ({ x, y }, odd);
          if (x === 0 && y === 0) {
            expect(bracket).toBeNull();
            continue;
          }
          if (!bracket) throw new Error(`Missing signed-byte bracket: ${x},${y},${odd}`);
          const expected = angularOracle(x, y, odd);
          const actual = new Array<number>(6).fill(0);
          actual[bracket.direction0] += bracket.weight0;
          actual[bracket.direction1] += bracket.weight1;
          expect(bracket.weight0).toBeGreaterThanOrEqual(0);
          expect(bracket.weight1).toBeGreaterThanOrEqual(0);
          expect(bracket.weight0 + bracket.weight1).toBeCloseTo(1, 14);
          for (let k = 0; k < 6; k++) expect(actual[k]).toBeCloseTo(expected[k]!, 13);
        }
      }
    }
  });

  it("retains the qualified ocean's raw signed-byte cross-product weights exactly", () => {
    for (const odd of [false, true]) {
      const slots = odd ? [2, 4, 1, 5, 3, 0] : [4, 2, 1, 3, 5, 0];
      // Preserve projected binary64 geometry, including row-parity rounding of X differences.
      const geometry = getHexNeighborDirectionVectorsOddQ(odd);
      const rays = slots.map((slot) => geometry[slot]!);
      for (let x = -128; x <= 127; x++) {
        for (let y = -128; y <= 127; y++) {
          if (x === 0 && y === 0) continue;
          const bracket = bracketHexNeighborDirectionsOddQ({ x, y }, odd)!;
          for (let k = 0; k < 6; k++) {
            const d0 = rays[k]!;
            const d1 = rays[(k + 1) % 6]!;
            const a = x * d1.y - y * d1.x;
            const b = d0.x * y - d0.y * x;
            if (a < 0 || b < 0) continue;
            expect(bracket).toEqual({
              direction0: slots[k]!, weight0: a / (a + b),
              direction1: slots[(k + 1) % 6]!, weight1: b / (a + b),
            });
            break;
          }
        }
      }
    }
  });

  it("reconstructs each ray without mixing and leaves input/cached geometry untouched", () => {
    for (const odd of [false, true]) {
      const directions = getHexNeighborDirectionVectorsOddQ(odd);
      const before = JSON.stringify(directions);
      for (let slot = 0; slot < directions.length; slot++) {
        const direction = Object.freeze({ ...directions[slot]! });
        const bracket = bracketHexNeighborDirectionsOddQ(direction, odd)!;
        const weights = new Array<number>(6).fill(0);
        weights[bracket.direction0] += bracket.weight0;
        weights[bracket.direction1] += bracket.weight1;
        expect(weights[slot]).toBe(1);
        expect(weights.filter((value) => value !== 0)).toHaveLength(1);
        const d0 = directions[bracket.direction0]!;
        const d1 = directions[bracket.direction1]!;
        expect(d0.x * bracket.weight0 + d1.x * bracket.weight1).toBe(direction.x);
        expect(d0.y * bracket.weight0 + d1.y * bracket.weight1).toBe(direction.y);
      }
      expect(JSON.stringify(directions)).toBe(before);
    }
  });

  it("handles finite extremes without an epsilon calm band or invalid weights", () => {
    for (const odd of [false, true]) {
      for (const scale of [Number.MIN_VALUE, 2 ** -501, 1e-18, 1, 2 ** 501, Number.MAX_VALUE]) {
        for (const [x, y] of [[1, 0], [0, -1], [1, 1], [-1, 1]]) {
          const bracket = bracketHexNeighborDirectionsOddQ({ x: x! * scale, y: y! * scale }, odd)!;
          const unit = bracketHexNeighborDirectionsOddQ({ x: x!, y: y! }, odd)!;
          expect(bracket).not.toBeNull();
          expect(bracket.direction0).toBe(unit.direction0);
          expect(bracket.direction1).toBe(unit.direction1);
          expect(bracket.weight0).toBeCloseTo(unit.weight0, 14);
          expect(bracket.weight1).toBeCloseTo(unit.weight1, 14);
          expect(Number.isFinite(bracket.weight0 + bracket.weight1)).toBe(true);
        }
      }
    }
  });

  it("returns no bracket for exact zero or nonfinite components", () => {
    for (const odd of [false, true]) {
      for (const direction of [
        { x: 0, y: 0 }, { x: -0, y: 0 }, { x: 0, y: -0 },
        { x: NaN, y: 1 }, { x: 1, y: NaN },
        { x: Infinity, y: 1 }, { x: 1, y: -Infinity },
      ]) {
        expect(bracketHexNeighborDirectionsOddQ(direction, odd)).toBeNull();
      }
    }
  });
});
