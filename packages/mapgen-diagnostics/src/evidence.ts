import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type TraceEvent, TraceEventSchema, type TraceJsonObject } from "@swooper/mapgen-core";
import { admitPathVizManifest, type PathVizManifest } from "@swooper/mapgen-viz";
import { Value } from "typebox/value";

export type { PathVizGridLayer, PathVizManifest } from "@swooper/mapgen-viz";

/** Step event whose diagnostic payload is a JSON-style data record. */
export type TraceDataRecordEvent = Extract<TraceEvent, { kind: "step.event" }> &
  Readonly<{ data: TraceJsonObject }>;

function loadJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseTraceEvent(value: unknown): TraceEvent | null {
  try {
    return Value.Parse(TraceEventSchema, value);
  } catch {
    return null;
  }
}

/**
 * Loads and admits the closed path-backed Viz v2 manifest for one diagnostic map run.
 * The boundary refuses legacy versions, malformed path references, and layers whose stage/step
 * execution identity is absent from the manifest's admitted step inventory.
 */
export function readPathVizManifest(runDirectory: string): PathVizManifest {
  return admitPathVizManifest(loadJsonFile(join(runDirectory, "manifest.json")));
}

/**
 * Reads a diagnostic JSONL trace as best-effort closed execution evidence.
 * Blank, malformed, legacy, or incomplete rows are dropped without weakening the returned union.
 */
export function readTraceEvents(runDirectory: string): TraceEvent[] {
  const text = readFileSync(join(runDirectory, "trace.jsonl"), "utf8");
  return text
    .split("\n")
    .filter(Boolean)
    .map((line): TraceEvent | null => {
      try {
        return parseTraceEvent(JSON.parse(line) as unknown);
      } catch {
        return null;
      }
    })
    .filter((event): event is TraceEvent => event !== null);
}

/** Narrows a closed trace event to authored step evidence with record-shaped diagnostic data. */
export function isTraceDataRecordEvent(event: TraceEvent): event is TraceDataRecordEvent {
  if (event.kind !== "step.event") return false;
  const data = event.data;
  if (data == null || typeof data !== "object" || Array.isArray(data)) return false;
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}
