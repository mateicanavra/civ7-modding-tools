import { describe, expect, it } from "bun:test";
import { estimateCurlZOddQ, estimateDivergenceOddQ } from "@mapgen/lib/grid/vector-field.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("grid/vector-field", () => {
  it("estimates near-zero divergence/curl for uniform flow", () => {
    const width = 9;
    const height = 7;
    const size = width * height;
    const vx = new Float32Array(size);
    const vy = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      vx[i] = 10;
      vy[i] = -3;
    }

    const div = estimateDivergenceOddQ(width, height, vx, vy);
    const curl = estimateCurlZOddQ(width, height, vx, vy);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        expect(Math.abs(div[i] ?? 0)).toBeLessThan(1e-6);
        expect(Math.abs(curl[i] ?? 0)).toBeLessThan(1e-6);
      }
    }
  });

  it("produces positive divergence for a simple outward field", () => {
    const width = 11;
    const height = 9;
    const size = width * height;
    const vx = new Float32Array(size);
    const vy = new Float32Array(size);
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        vx[i] = x - cx;
        vy[i] = y - cy;
      }
    }

    const div = estimateDivergenceOddQ(width, height, vx, vy);
    expect(div[idx(cx, cy, width)] ?? 0).toBeGreaterThan(0.1);
  });

  it("produces non-zero curl for a simple rotational field", () => {
    const width = 11;
    const height = 9;
    const size = width * height;
    const vx = new Float32Array(size);
    const vy = new Float32Array(size);
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        const dx = x - cx;
        const dy = y - cy;
        vx[i] = -dy;
        vy[i] = dx;
      }
    }

    const curl = estimateCurlZOddQ(width, height, vx, vy);
    expect(Math.abs(curl[idx(cx, cy, width)] ?? 0)).toBeGreaterThan(0.1);
  });
});
