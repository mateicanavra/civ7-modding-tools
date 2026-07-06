type RecordLike = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RecordLike {
  return typeof value === "object" && value !== null;
}

export function requireEnvDimensions(
  ctx: Readonly<{ env: unknown }>,
  scope: string
): Readonly<{ width: number; height: number }> {
  if (!isRecord(ctx.env)) {
    throw new Error(`[Foundation] Missing env for ${scope}.`);
  }

  const dims = ctx.env["dimensions"];
  if (!isRecord(dims)) {
    throw new Error(`[Foundation] Missing env.dimensions for ${scope}.`);
  }

  const width = dims["width"];
  const height = dims["height"];
  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height)
  ) {
    throw new Error(`[Foundation] Invalid env.dimensions for ${scope}.`);
  }

  if (width <= 0 || height <= 0) {
    throw new Error(`[Foundation] Invalid env.dimensions for ${scope}.`);
  }

  return { width, height };
}

export function deriveFoundationReferenceArea(
  dimensions: Readonly<{ width: number; height: number }>
): number {
  const { width, height } = dimensions;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error("[Foundation] Cannot derive reference area from invalid map dimensions.");
  }
  const area = width * height;
  if (!Number.isSafeInteger(area) || area <= 0) {
    throw new Error("[Foundation] Cannot derive reference area from invalid map area.");
  }
  return area;
}
