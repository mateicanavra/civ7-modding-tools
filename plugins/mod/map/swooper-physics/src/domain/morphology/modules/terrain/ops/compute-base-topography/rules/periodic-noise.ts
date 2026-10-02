import { HEX_WIDTH, projectOddqToHexSpace } from "@swooper/mapgen-core/lib/grid";
import { clamp } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

/**
 * Creates a stateless relief sampler in [-0.5, 0.5] at odd-row hex tile coordinates.
 * Grain is the rounded number of neighbor spacings per noise lattice unit. The cylinder
 * preserves that local scale across map sizes and joins the X seam without a discontinuity.
 * Perlin samples need not fill the half-amplitude envelope; clamping enforces that bound
 * without assuming the shared implementation's gradient normalization.
 */
export function createPeriodicReliefNoise(params: {
  width: number;
  grain: number;
  seed: number;
}): (x: number, y: number) => number {
  const { width, seed } = params;
  const grain = Math.max(1, Math.round(params.grain));
  const noise = PerlinNoise.fromFullSeed(seed);
  const circumference = 2 * Math.PI;
  const radius = width / (circumference * grain);

  return (x, y) => {
    // Wrap before projection/trigonometry so repeated periodic tile coordinates are identical.
    const wrappedX = ((x % width) + width) % width;
    const point = projectOddqToHexSpace(wrappedX, y);
    const angle = (point.x / HEX_WIDTH / width) * circumference;
    const value = noise.noise3D(
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      point.y / (HEX_WIDTH * grain)
    );
    return clamp(value, -1, 1) * 0.5;
  };
}
