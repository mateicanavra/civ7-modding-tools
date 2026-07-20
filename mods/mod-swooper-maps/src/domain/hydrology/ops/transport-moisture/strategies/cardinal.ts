import { createStrategy } from "@swooper/mapgen-core/authoring";
import TransportMoistureContract from "../contract.js";
import { clamp01, upwindIndex, upwindOffset } from "../rules/index.js";

export const cardinalStrategy = createStrategy(TransportMoistureContract, "cardinal", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const latitudeByRow = input.latitudeByRow;

    const iterations = config.iterations | 0;
    const advection = config.advection;
    const retention = config.retention;

    let prev = new Float32Array(size);
    let next = new Float32Array(size);
    for (let i = 0; i < size; i++) prev[i] = clamp01(input.evaporation[i] ?? 0);

    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 0; y < height; y++) {
        const absLat = Math.abs(latitudeByRow[y] ?? 0);
        const row = y * width;
        for (let x = 0; x < width; x++) {
          const i = row + x;
          const dxdy = upwindOffset(input.windU[i] | 0, input.windV[i] | 0, absLat);
          const up = upwindIndex(x, y, width, height, dxdy.dx, dxdy.dy);
          const local = input.evaporation[i] ?? 0;
          const advected = prev[up] ?? 0;
          next[i] = clamp01((local + advected * advection) * retention);
        }
      }
      const swap = prev;
      prev = next;
      next = swap;
    }

    return { humidity: prev } as const;
  },
});
