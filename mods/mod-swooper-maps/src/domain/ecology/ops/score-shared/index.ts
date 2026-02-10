import { clamp01, normalizeRange } from "@swooper/mapgen-core";

export function validateGridSize(args: Readonly<{
  width: number;
  height: number;
  fields: ReadonlyArray<Readonly<{ label: string; arr: { length: number } }>>;
}>): number {
  const width = args.width | 0;
  const height = args.height | 0;
  if (!Number.isFinite(width) || width <= 0) throw new Error("invalid width");
  if (!Number.isFinite(height) || height <= 0) throw new Error("invalid height");
  const size = width * height;

  for (const field of args.fields) {
    if (field.arr.length !== size) {
      throw new Error(`${field.label} length ${field.arr.length} != ${size}`);
    }
  }

  return size;
}

export function rampUp01(value: number, start: number, end: number): number {
  return normalizeRange(value, start, end);
}

export function rampDown01(value: number, start: number, end: number): number {
  return clamp01(1 - normalizeRange(value, start, end));
}

export function window01(value: number, min: number, peak: number, max: number): number {
  const up = rampUp01(value, min, peak);
  const down = rampDown01(value, peak, max);
  return clamp01(up * down);
}

