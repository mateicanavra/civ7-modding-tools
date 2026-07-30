import { describe, expect, it } from "bun:test";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
  encodeBoundedJsonLogLines,
} from "@mapgen/lib/log/index.js";

describe("bounded JSON log transport", () => {
  it("round-trips a multi-part payload below the exact physical line ceiling", () => {
    const payload = {
      requestId: "run-noncontiguous-players",
      players: [7, 3, 19],
      description: "ocean/ice/forest ".repeat(240),
    };

    const lines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "[mapgen-evidence]",
      payload,
    });
    const decoded = decodeBoundedJsonLogSeries(lines, "[mapgen-evidence]");
    const envelopes = lines.map(
      (line) => JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>
    );

    expect(lines.length).toBeGreaterThan(1);
    expect(Math.max(...lines.map((line) => line.length))).toBeLessThanOrEqual(
      BOUNDED_JSON_LOG_MAX_LINE_LENGTH
    );
    expect(lines.every((line) => line.includes("[mapgen-evidence]"))).toBe(true);
    expect(envelopes.map(({ partIndex }) => partIndex)).toEqual(
      Array.from({ length: lines.length }, (_, index) => index)
    );
    expect(envelopes.every(({ partCount }) => partCount === lines.length)).toBe(true);
    expect(new Set(envelopes.map(({ seriesId }) => seriesId)).size).toBe(1);
    expect(new Set(envelopes.map(({ payloadLength }) => payloadLength))).toEqual(
      new Set([JSON.stringify(payload).length])
    );
    expect(decoded).toHaveLength(1);
    expect(decoded[0]?.payload).toEqual(payload);
    expect(decoded[0]?.partCount).toBe(lines.length);
  });

  it("rejects incomplete, mixed, corrupted, and duplicate-part series", () => {
    const lines = encodeBoundedJsonLogLines({
      marker: "FEATURE_APPLY_V1",
      payload: { values: Array.from({ length: 500 }, (_, index) => `feature-${index}`) },
    });
    expect(lines.length).toBeGreaterThan(2);

    const missing = lines.filter((_, index) => index !== 1);
    const corrupted = [...lines];
    corrupted[1] = corrupted[1]?.replace("feature-", "fracture-") ?? "";
    const duplicate = [...lines.slice(0, 2), lines[1]!, ...lines.slice(2)];
    const other = encodeBoundedJsonLogLines({
      marker: "FEATURE_APPLY_V1",
      payload: { values: Array.from({ length: 500 }, (_, index) => `other-${index}`) },
    });
    const mixed = [lines[0]!, other[1]!, ...lines.slice(2)];

    expect(decodeBoundedJsonLogSeries(missing, "FEATURE_APPLY_V1")).toEqual([]);
    expect(decodeBoundedJsonLogSeries(corrupted, "FEATURE_APPLY_V1")).toEqual([]);
    expect(decodeBoundedJsonLogSeries(duplicate, "FEATURE_APPLY_V1")).toEqual([]);
    expect(decodeBoundedJsonLogSeries(mixed, "FEATURE_APPLY_V1")).toEqual([]);
  });

  it("allows unrelated engine lines between parts without splicing repeated emissions", () => {
    const lines = encodeBoundedJsonLogLines({
      marker: "PLACEMENT_PARITY_V1",
      payload: { rows: Array.from({ length: 300 }, (_, index) => index) },
      maxLineLength: 300,
    });
    const firstHalf = lines.slice(0, Math.ceil(lines.length / 2));
    const interleaved = lines.flatMap((line, index) =>
      index === lines.length - 1 ? [line] : [line, `[engine] unrelated-${index}`]
    );
    const interruptedBySameMarker = [
      lines[0]!,
      "[SWOOPER_MOD] PLACEMENT_PARITY_V1 legacy-or-malformed",
      ...lines.slice(1),
    ];

    expect(decodeBoundedJsonLogSeries(interleaved, "PLACEMENT_PARITY_V1")[0]?.payload).toEqual({
      rows: Array.from({ length: 300 }, (_, index) => index),
    });
    expect(
      decodeBoundedJsonLogSeries(
        [...firstHalf, "[engine] unrelated", ...lines],
        "PLACEMENT_PARITY_V1"
      )
    ).toHaveLength(1);
    expect(decodeBoundedJsonLogSeries(interruptedBySameMarker, "PLACEMENT_PARITY_V1")).toEqual([]);
  });

  it("accounts for JSON escaping when enforcing the serialized line limit", () => {
    const lines = encodeBoundedJsonLogLines({
      marker: "ESCAPED_V1",
      payload: { escaped: '"\\\n'.repeat(500) },
      maxLineLength: 320,
    });

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line) => line.length <= 320)).toBe(true);
    expect(decodeBoundedJsonLogSeries(lines, "ESCAPED_V1")[0]?.payload).toEqual({
      escaped: '"\\\n'.repeat(500),
    });
  });

  it("refuses a caller-selected limit above the protocol ceiling", () => {
    expect(() =>
      encodeBoundedJsonLogLines({
        marker: "OVERSIZED_V1",
        payload: { value: true },
        maxLineLength: BOUNDED_JSON_LOG_MAX_LINE_LENGTH + 1,
      })
    ).toThrow(`no greater than ${BOUNDED_JSON_LOG_MAX_LINE_LENGTH}`);
  });

  it("keeps astral Unicode intact while converging on an exact part count", () => {
    const payload = { labels: "tectonics-🌍".repeat(1_000) };
    const lines = encodeBoundedJsonLogLines({
      marker: "UNICODE_V1",
      payload,
      maxLineLength: 407,
    });

    expect(lines.every((line) => line.length <= 407)).toBe(true);
    expect(decodeBoundedJsonLogSeries(lines, "UNICODE_V1")[0]?.payload).toEqual(payload);
  });
});
