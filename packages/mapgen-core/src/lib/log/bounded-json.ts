import { fnv1a32StringHex } from "@mapgen/lib/hash/fnv1a.js";

/** Protocol identifier carried by every bounded JSON log part. */
export const BOUNDED_JSON_LOG_PROTOCOL = "mapgen-json-log" as const;

/** Current bounded JSON log wire version. */
export const BOUNDED_JSON_LOG_VERSION = 1 as const;

/**
 * Default physical-line ceiling used by the bounded JSON log transport.
 *
 * Civ7 has been observed truncating scripting-log lines at 1,022 characters. Keeping the complete
 * serialized line at or below 900 leaves room for host decorations that may be added after the
 * emitting runtime hands the line to the engine logger.
 */
export const BOUNDED_JSON_LOG_MAX_LINE_LENGTH = 900;

type BoundedJsonLogEnvelope = Readonly<{
  protocol: typeof BOUNDED_JSON_LOG_PROTOCOL;
  version: typeof BOUNDED_JSON_LOG_VERSION;
  seriesId: string;
  partIndex: number;
  partCount: number;
  payloadLength: number;
  payloadDigest: string;
  payload: string;
}>;

/** Input used to encode one JSON value as a bounded physical log-line series. */
export type BoundedJsonLogEncodeInput = Readonly<{
  prefix?: string;
  marker: string;
  payload: unknown;
  seriesId?: string;
  maxLineLength?: number;
}>;

/** One complete, internally consistent JSON value recovered from bounded physical log lines. */
export type DecodedBoundedJsonLogSeries = Readonly<{
  marker: string;
  seriesId: string;
  payload: unknown;
  startIndex: number;
  endIndex: number;
  partCount: number;
  payloadLength: number;
  payloadDigest: string;
}>;

const WIRE_TOKEN = `[${BOUNDED_JSON_LOG_PROTOCOL}/v${BOUNDED_JSON_LOG_VERSION}]`;
const HASH_PATTERN = /^[0-9a-f]{8}$/;

/**
 * Serializes one JSON value into independently parseable physical lines below the selected limit.
 *
 * The line prefix retains the caller's marker on every part so existing log pollers can continue
 * discovering activity without understanding the transport. The payload digest and series
 * metadata make partial, mixed, duplicated, or truncated evidence inadmissible at decode time.
 */
export function encodeBoundedJsonLogLines(input: BoundedJsonLogEncodeInput): readonly string[] {
  assertNonEmptyLineComponent(input.marker, "marker");
  if (input.prefix !== undefined) assertNonEmptyLineComponent(input.prefix, "prefix");

  const maxLineLength = input.maxLineLength ?? BOUNDED_JSON_LOG_MAX_LINE_LENGTH;
  if (
    !Number.isSafeInteger(maxLineLength) ||
    maxLineLength <= 0 ||
    maxLineLength > BOUNDED_JSON_LOG_MAX_LINE_LENGTH
  ) {
    throw new RangeError(
      `Bounded JSON log maxLineLength must be a positive safe integer no greater than ${BOUNDED_JSON_LOG_MAX_LINE_LENGTH}.`
    );
  }

  const serialized = JSON.stringify(input.payload);
  if (serialized === undefined) {
    throw new TypeError("Bounded JSON log payload must be JSON-serializable.");
  }
  const payloadDigest = fnv1a32StringHex(serialized);
  const seriesId = input.seriesId ?? `${payloadDigest}-${serialized.length.toString(36)}`;
  assertNonEmptyLineComponent(seriesId, "seriesId");
  const lineLead = `${input.prefix === undefined ? "" : `${input.prefix} `}${input.marker} ${WIRE_TOKEN} `;

  let declaredPartCount = 1;
  for (;;) {
    const chunks = splitPayload({
      serialized,
      lineLead,
      seriesId,
      payloadDigest,
      declaredPartCount,
      maxLineLength,
    });
    if (chunks.length === declaredPartCount) {
      return Object.freeze(
        chunks.map((payload, partIndex) =>
          encodeLine(lineLead, {
            protocol: BOUNDED_JSON_LOG_PROTOCOL,
            version: BOUNDED_JSON_LOG_VERSION,
            seriesId,
            partIndex,
            partCount: chunks.length,
            payloadLength: serialized.length,
            payloadDigest,
            payload,
          })
        )
      );
    }
    if (chunks.length < declaredPartCount) {
      throw new Error("Bounded JSON log part-count convergence moved backwards.");
    }
    declaredPartCount = chunks.length;
  }
}

/**
 * Reassembles complete bounded JSON series for one marker in their physical log order.
 *
 * Malformed parts, gaps, mixed metadata, length mismatches, digest mismatches, and invalid JSON are
 * discarded. Unrelated engine lines may interleave between parts, while another line carrying the
 * same marker interrupts the candidate. A new part zero replaces an incomplete candidate, which
 * prevents repeated emissions with the same deterministic identity from being spliced together.
 */
export function decodeBoundedJsonLogSeries(
  lines: readonly string[],
  marker: string
): readonly DecodedBoundedJsonLogSeries[] {
  assertNonEmptyLineComponent(marker, "marker");
  const decoded: DecodedBoundedJsonLogSeries[] = [];
  let candidate: CandidateSeries | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const parsed = parseEnvelope(lines[index] ?? "", marker);
    if (parsed.kind === "unrelated") {
      continue;
    }
    if (parsed.kind === "malformed") {
      candidate = null;
      continue;
    }

    const envelope = parsed.envelope;
    if (envelope.partIndex === 0) {
      candidate = {
        metadata: envelope,
        startIndex: index,
        nextPartIndex: 1,
        chunks: [envelope.payload],
      };
    } else if (
      candidate !== null &&
      envelope.partIndex === candidate.nextPartIndex &&
      sameSeries(candidate.metadata, envelope)
    ) {
      candidate.chunks.push(envelope.payload);
      candidate.nextPartIndex += 1;
    } else {
      candidate = null;
      continue;
    }

    if (candidate.nextPartIndex !== candidate.metadata.partCount) continue;
    const serialized = candidate.chunks.join("");
    const metadata = candidate.metadata;
    const startIndex = candidate.startIndex;
    candidate = null;
    if (serialized.length !== metadata.payloadLength) continue;
    if (fnv1a32StringHex(serialized) !== metadata.payloadDigest) continue;
    try {
      decoded.push({
        marker,
        seriesId: metadata.seriesId,
        payload: JSON.parse(serialized) as unknown,
        startIndex,
        endIndex: index,
        partCount: metadata.partCount,
        payloadLength: metadata.payloadLength,
        payloadDigest: metadata.payloadDigest,
      });
    } catch {
      // A digest-valid string can still be non-JSON when lines were produced by another protocol.
    }
  }

  return Object.freeze(decoded);
}

type CandidateSeries = {
  metadata: BoundedJsonLogEnvelope;
  startIndex: number;
  nextPartIndex: number;
  chunks: string[];
};

function assertNonEmptyLineComponent(value: string, label: string): void {
  if (value.length === 0 || value.includes("\n") || value.includes("\r")) {
    throw new TypeError(`Bounded JSON log ${label} must be a non-empty single-line string.`);
  }
}

function encodeLine(lineLead: string, envelope: BoundedJsonLogEnvelope): string {
  return `${lineLead}${JSON.stringify(envelope)}`;
}

function splitPayload(args: {
  serialized: string;
  lineLead: string;
  seriesId: string;
  payloadDigest: string;
  declaredPartCount: number;
  maxLineLength: number;
}): string[] {
  const boundaries = unicodeBoundaries(args.serialized);
  const chunks: string[] = [];
  let boundaryIndex = 0;
  while (boundaryIndex < boundaries.length - 1) {
    const partIndex = chunks.length;
    const endBoundaryIndex = maximumFittingBoundaryIndex(
      args,
      boundaries,
      boundaryIndex,
      partIndex
    );
    if (endBoundaryIndex === boundaryIndex) {
      throw new RangeError(
        `Bounded JSON log line metadata leaves no payload room within ${args.maxLineLength} characters.`
      );
    }
    chunks.push(args.serialized.slice(boundaries[boundaryIndex], boundaries[endBoundaryIndex]));
    boundaryIndex = endBoundaryIndex;
  }
  return chunks;
}

function maximumFittingBoundaryIndex(
  args: Parameters<typeof splitPayload>[0],
  boundaries: readonly number[],
  offsetBoundaryIndex: number,
  partIndex: number
): number {
  let low = offsetBoundaryIndex;
  let high = boundaries.length - 1;
  while (low < high) {
    const candidateBoundaryIndex = Math.ceil((low + high) / 2);
    const line = encodeLine(args.lineLead, {
      protocol: BOUNDED_JSON_LOG_PROTOCOL,
      version: BOUNDED_JSON_LOG_VERSION,
      seriesId: args.seriesId,
      partIndex,
      partCount: args.declaredPartCount,
      payloadLength: args.serialized.length,
      payloadDigest: args.payloadDigest,
      payload: args.serialized.slice(
        boundaries[offsetBoundaryIndex],
        boundaries[candidateBoundaryIndex]
      ),
    });
    if (line.length <= args.maxLineLength) low = candidateBoundaryIndex;
    else high = candidateBoundaryIndex - 1;
  }
  return low;
}

function unicodeBoundaries(value: string): readonly number[] {
  const boundaries = [0];
  let offset = 0;
  for (const codePoint of value) {
    offset += codePoint.length;
    boundaries.push(offset);
  }
  return boundaries;
}

function parseEnvelope(
  line: string,
  marker: string
):
  | Readonly<{ kind: "unrelated" }>
  | Readonly<{ kind: "malformed" }>
  | Readonly<{ kind: "envelope"; envelope: BoundedJsonLogEnvelope }> {
  const markerIndex = line.indexOf(marker);
  if (markerIndex < 0) return { kind: "unrelated" };
  const tokenIndex = line.indexOf(WIRE_TOKEN, markerIndex + marker.length);
  if (tokenIndex < 0) return { kind: "malformed" };
  const jsonStart = tokenIndex + WIRE_TOKEN.length;
  let value: unknown;
  try {
    value = JSON.parse(line.slice(jsonStart).trimStart()) as unknown;
  } catch {
    return { kind: "malformed" };
  }
  if (!isEnvelope(value)) return { kind: "malformed" };
  return { kind: "envelope", envelope: value };
}

function isEnvelope(value: unknown): value is BoundedJsonLogEnvelope {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const envelope = value as Record<string, unknown>;
  return (
    envelope.protocol === BOUNDED_JSON_LOG_PROTOCOL &&
    envelope.version === BOUNDED_JSON_LOG_VERSION &&
    typeof envelope.seriesId === "string" &&
    envelope.seriesId.length > 0 &&
    Number.isSafeInteger(envelope.partIndex) &&
    (envelope.partIndex as number) >= 0 &&
    Number.isSafeInteger(envelope.partCount) &&
    (envelope.partCount as number) > 0 &&
    (envelope.partIndex as number) < (envelope.partCount as number) &&
    Number.isSafeInteger(envelope.payloadLength) &&
    (envelope.payloadLength as number) >= 0 &&
    typeof envelope.payloadDigest === "string" &&
    HASH_PATTERN.test(envelope.payloadDigest) &&
    typeof envelope.payload === "string"
  );
}

function sameSeries(left: BoundedJsonLogEnvelope, right: BoundedJsonLogEnvelope): boolean {
  return (
    left.seriesId === right.seriesId &&
    left.partCount === right.partCount &&
    left.payloadLength === right.payloadLength &&
    left.payloadDigest === right.payloadDigest
  );
}
