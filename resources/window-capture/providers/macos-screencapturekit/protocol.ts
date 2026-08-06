import { crc32, inflateSync } from "node:zlib";

import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const HELPER_PROBE_PROTOCOL = "macos-screencapturekit-helper-v1";

const HelperProbeEnvelopeSchema = Type.Object(
  {
    ok: Type.Literal(true),
    protocol: Type.Literal(HELPER_PROBE_PROTOCOL),
  },
  { additionalProperties: false }
);

export type HelperProbeEnvelope = Readonly<Static<typeof HelperProbeEnvelopeSchema>>;

/** Strictly decodes the helper's no-permission readiness response. */
export function parseHelperProbeEnvelope(stdout: string): HelperProbeEnvelope {
  const parsed: unknown = JSON.parse(stdout.trim());
  return Value.Parse(HelperProbeEnvelopeSchema, parsed);
}

const HelperWindowSchema = Type.Object(
  {
    windowId: Type.Integer({ minimum: 0 }),
    applicationName: Type.String(),
    bundleIdentifier: Type.String(),
    title: Type.String(),
    width: Type.Integer({ minimum: 0 }),
    height: Type.Integer({ minimum: 0 }),
    onScreen: Type.Boolean(),
  },
  { additionalProperties: false }
);

const HelperFrameSourceSchema = Type.Union([Type.Literal("screenshot"), Type.Literal("stream")]);

const HelperCaptureSuccessSchema = Type.Object(
  {
    ok: Type.Literal(true),
    path: Type.String(),
    pixelWidth: Type.Integer({ minimum: 1 }),
    pixelHeight: Type.Integer({ minimum: 1 }),
    frameSource: HelperFrameSourceSchema,
    window: HelperWindowSchema,
  },
  { additionalProperties: false }
);

const HelperCaptureFailureSchema = Type.Object(
  {
    ok: Type.Literal(false),
    error: Type.Union([
      Type.Literal("usage"),
      Type.Literal("permission-required"),
      Type.Literal("window-not-found"),
      Type.Literal("unsupported-platform"),
      Type.Literal("capture-failed"),
    ]),
    message: Type.String(),
  },
  { additionalProperties: false }
);

const HelperCaptureEnvelopeSchema = Type.Union([
  HelperCaptureSuccessSchema,
  HelperCaptureFailureSchema,
]);

type HelperCaptureSuccess = Readonly<Static<typeof HelperCaptureSuccessSchema>>;
export type HelperCaptureFailure = Readonly<Static<typeof HelperCaptureFailureSchema>>;
export type HelperCaptureEnvelope = HelperCaptureSuccess | HelperCaptureFailure;

/** Strictly decodes the helper's complete stdout JSON object. */
export function parseHelperCaptureEnvelope(stdout: string): HelperCaptureEnvelope {
  const parsed: unknown = JSON.parse(stdout.trim());
  return Value.Parse(HelperCaptureEnvelopeSchema, parsed);
}

const PNG_SIGNATURE = Buffer.from("89504e470d0a1a0a", "hex");
const PNG_CRITICAL_CHUNKS = new Set(["IHDR", "PLTE", "IDAT", "IEND"]);
const PNG_BIT_DEPTHS: Readonly<Record<number, readonly number[]>> = {
  0: [1, 2, 4, 8, 16],
  2: [8, 16],
  3: [1, 2, 4, 8],
  4: [8, 16],
  6: [8, 16],
};
const PNG_SAMPLES_PER_PIXEL: Readonly<Record<number, number>> = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
};
const MAX_PNG_INFLATED_BYTES = 256 * 1024 * 1024;
const MAX_PNG_COMPRESSED_BYTES = 256 * 1024 * 1024;

/** Proves the complete PNG chunk stream and returns its admitted dimensions. */
export function parsePngDimensions(bytes: Buffer): Readonly<{ width: number; height: number }> {
  if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw invalidPng("signature is invalid");
  }

  let offset = PNG_SIGNATURE.length;
  let dimensions: Readonly<{ width: number; height: number }> | undefined;
  let bitDepth: number | undefined;
  let colorType: number | undefined;
  let seenPalette = false;
  let paletteEntries = 0;
  let seenImageData = false;
  let imageDataEnded = false;
  const imageDataChunks: Buffer[] = [];
  let imageDataBytes = 0;

  while (offset < bytes.length) {
    if (bytes.length - offset < 12) throw invalidPng("chunk header is truncated");
    const length = bytes.readUInt32BE(offset);
    if (length > bytes.length - offset - 12) throw invalidPng("chunk data is truncated");

    const typeOffset = offset + 4;
    const dataOffset = offset + 8;
    const dataEnd = dataOffset + length;
    const nextOffset = dataEnd + 4;
    const typeBytes = bytes.subarray(typeOffset, dataOffset);
    if (![...typeBytes].every(isAsciiLetter)) throw invalidPng("chunk type is invalid");
    if (((typeBytes[2] ?? 0) & 0x20) !== 0) throw invalidPng("chunk reserved bit is invalid");
    const type = typeBytes.toString("ascii");
    const expectedCrc = bytes.readUInt32BE(dataEnd);
    const actualCrc = crc32(bytes.subarray(typeOffset, dataEnd)) >>> 0;
    if (actualCrc !== expectedCrc) throw invalidPng(`${type} chunk CRC is invalid`);

    if (type === "IHDR") {
      if (offset !== PNG_SIGNATURE.length || dimensions !== undefined || length !== 13) {
        throw invalidPng("IHDR must be the first unique 13-byte chunk");
      }
      const width = bytes.readUInt32BE(dataOffset);
      const height = bytes.readUInt32BE(dataOffset + 4);
      const candidateBitDepth = bytes[dataOffset + 8];
      colorType = bytes[dataOffset + 9];
      const allowedBitDepths = colorType === undefined ? undefined : PNG_BIT_DEPTHS[colorType];
      if (
        width === 0 ||
        height === 0 ||
        width > 2_147_483_647 ||
        height > 2_147_483_647 ||
        candidateBitDepth === undefined ||
        allowedBitDepths === undefined ||
        !allowedBitDepths.includes(candidateBitDepth) ||
        bytes[dataOffset + 10] !== 0 ||
        bytes[dataOffset + 11] !== 0
      ) {
        throw invalidPng("IHDR fields are invalid");
      }
      if (bytes[dataOffset + 12] !== 0) {
        throw invalidPng("interlaced PNG is not supported");
      }
      bitDepth = candidateBitDepth;
      dimensions = { width, height };
    } else {
      if (dimensions === undefined) throw invalidPng("IHDR is missing before image data");
      if (type === "PLTE") {
        if (seenPalette || seenImageData || length === 0 || length % 3 !== 0 || length > 768) {
          throw invalidPng("PLTE placement or length is invalid");
        }
        seenPalette = true;
        paletteEntries = length / 3;
      } else if (type === "IDAT") {
        if (imageDataEnded) throw invalidPng("IDAT chunks must be contiguous");
        imageDataBytes += length;
        if (imageDataBytes > MAX_PNG_COMPRESSED_BYTES) {
          throw invalidPng("compressed image data exceeds the admission limit");
        }
        imageDataChunks.push(bytes.subarray(dataOffset, dataEnd));
        seenImageData = true;
      } else if (type === "IEND") {
        if (length !== 0 || !seenImageData || nextOffset !== bytes.length) {
          throw invalidPng("IEND must terminate a complete image-data stream");
        }
        if (colorType === 3 && !seenPalette) {
          throw invalidPng("indexed-color PNG is missing PLTE");
        }
        if ((colorType === 0 || colorType === 4) && seenPalette) {
          throw invalidPng("grayscale PNG cannot contain PLTE");
        }
        if (colorType === 3 && bitDepth !== undefined) {
          if (paletteEntries > 2 ** bitDepth) {
            throw invalidPng("indexed-color PLTE exceeds its bit-depth cardinality");
          }
        }
        if (bitDepth === undefined || colorType === undefined) {
          throw invalidPng("IHDR decoding facts are incomplete");
        }
        validatePngImageData(dimensions, bitDepth, colorType, imageDataChunks, imageDataBytes);
        return dimensions;
      } else {
        if (seenImageData) imageDataEnded = true;
        const isCritical = ((typeBytes[0] ?? 0) & 0x20) === 0;
        if (isCritical && !PNG_CRITICAL_CHUNKS.has(type)) {
          throw invalidPng(`unknown critical chunk ${type}`);
        }
      }
    }

    offset = nextOffset;
  }

  throw invalidPng("IEND is missing");
}

function validatePngImageData(
  dimensions: Readonly<{ width: number; height: number }>,
  bitDepth: number,
  colorType: number,
  imageDataChunks: readonly Buffer[],
  imageDataBytes: number
): void {
  const samplesPerPixel = PNG_SAMPLES_PER_PIXEL[colorType];
  if (samplesPerPixel === undefined) throw invalidPng("color type is not decodable");

  const scanlineBytes = Math.ceil((dimensions.width * samplesPerPixel * bitDepth) / 8);
  const encodedRowBytes = scanlineBytes + 1;
  if (
    encodedRowBytes > MAX_PNG_INFLATED_BYTES ||
    dimensions.height > Math.floor(MAX_PNG_INFLATED_BYTES / encodedRowBytes)
  ) {
    throw invalidPng("decompressed image data exceeds the admission limit");
  }
  const expectedBytes = encodedRowBytes * dimensions.height;
  const compressed = Buffer.concat(imageDataChunks, imageDataBytes);
  let inflated: Buffer;
  try {
    inflated = inflateSync(compressed, { maxOutputLength: expectedBytes });
  } catch {
    throw invalidPng("IDAT zlib stream is not decodable within the admitted scanline bounds");
  }
  if (inflated.byteLength !== expectedBytes) {
    throw invalidPng("decompressed image data has invalid scanline cardinality");
  }
  for (let offset = 0; offset < inflated.byteLength; offset += encodedRowBytes) {
    const filter = inflated[offset];
    if (filter === undefined || filter > 4) {
      throw invalidPng("decompressed image data contains an invalid scanline filter");
    }
  }
}

function isAsciiLetter(value: number): boolean {
  return (value >= 65 && value <= 90) || (value >= 97 && value <= 122);
}

function invalidPng(detail: string): Error {
  return new Error(`Capture helper output is not a structurally valid PNG: ${detail}.`);
}
