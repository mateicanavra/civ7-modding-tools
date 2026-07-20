import type { VizScalarFormat } from "./model.js";

type VizGridBinaryLayout =
  | Readonly<{
      kind: "grid-values";
      format: VizScalarFormat;
      width: number;
      height: number;
    }>
  | Readonly<{
      kind: "grid-field-values";
      format: VizScalarFormat;
      width: number;
      height: number;
    }>;

type VizPointBinaryLayout =
  | Readonly<{ kind: "points-positions"; count: number }>
  | Readonly<{ kind: "points-values"; format: VizScalarFormat; count: number }>;

type VizSegmentBinaryLayout =
  | Readonly<{ kind: "segments-geometry"; count: number }>
  | Readonly<{ kind: "segments-values"; format: VizScalarFormat; count: number }>;

/** Serialized binary role whose declared cardinality determines one exact portable byte length. */
export type VizBinaryLayout = VizGridBinaryLayout | VizPointBinaryLayout | VizSegmentBinaryLayout;

/** Returns the fixed byte width for one renderer-neutral scalar format. */
export function vizScalarByteWidth(format: VizScalarFormat): 1 | 2 | 4 {
  if (format === "u8" || format === "i8") return 1;
  if (format === "u16" || format === "i16") return 2;
  return 4;
}

function assertCardinality(value: number, label: string, allowZero: boolean): number {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) {
    throw new RangeError(
      `${label} must be ${allowZero ? "a nonnegative" : "a positive"} safe integer.`
    );
  }
  return value;
}

function checkedProduct(left: number, right: number, label: string): number {
  const product = left * right;
  if (!Number.isSafeInteger(product)) {
    throw new RangeError(`${label} exceeds the safe integer range.`);
  }
  return product;
}

/** Computes the only byte length compatible with a serialized Viz binary role and cardinality. */
export function expectedVizBinaryByteLength(layout: VizBinaryLayout): number {
  if (layout.kind === "grid-values" || layout.kind === "grid-field-values") {
    const width = assertCardinality(layout.width, "Visualization grid width", false);
    const height = assertCardinality(layout.height, "Visualization grid height", false);
    const cells = checkedProduct(width, height, "Visualization grid cardinality");
    return checkedProduct(cells, vizScalarByteWidth(layout.format), "Visualization binary length");
  }

  const count = assertCardinality(layout.count, "Visualization element count", true);
  if (layout.kind === "points-positions") {
    return checkedProduct(count, Float32Array.BYTES_PER_ELEMENT * 2, "Point geometry length");
  }
  if (layout.kind === "segments-geometry") {
    return checkedProduct(count, Float32Array.BYTES_PER_ELEMENT * 4, "Segment geometry length");
  }
  return checkedProduct(count, vizScalarByteWidth(layout.format), "Visualization binary length");
}

/** Rejects truncated, padded, or format-incompatible bytes before any serialized Viz decode. */
export function assertVizBinaryByteLength(
  byteLength: number,
  layout: VizBinaryLayout,
  label = "Visualization binary"
): void {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    throw new RangeError(`${label} byte length must be a nonnegative safe integer.`);
  }
  const expected = expectedVizBinaryByteLength(layout);
  if (byteLength !== expected) {
    throw new RangeError(`${label} requires exactly ${expected} bytes; received ${byteLength}.`);
  }
}
