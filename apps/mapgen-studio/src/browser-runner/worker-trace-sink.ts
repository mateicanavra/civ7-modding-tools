import type { TraceEvent, TraceSink, VizLayerMeta } from "@swooper/mapgen-core";
import type { BrowserRunEvent, BrowserVizLayerPayload, BrowserVizLayerUpsertEvent } from "./protocol";

type Post = (event: BrowserRunEvent, transfer?: Transferable[]) => void;

type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function boundsFromPositions(positions: Float32Array): Bounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let i = 0; i + 1 < positions.length; i += 2) {
    const x = positions[i]!;
    const y = positions[i + 1]!;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [0, 0, 1, 1];
  }

  return [minX, minY, maxX, maxY];
}

function boundsFromSegments(segments: Float32Array): Bounds {
  // segments is [x0,y0,x1,y1,...] - treat as positions list
  const positions = new Float32Array((segments.length / 2) | 0);
  for (let i = 0; i < positions.length; i++) {
    positions[i] = segments[i]!;
  }
  return boundsFromPositions(positions);
}

function cloneArrayBuffer(view: ArrayBufferView): ArrayBuffer {
  const u8 = new Uint8Array(view.byteLength);
  u8.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return u8.buffer;
}

type LayerStreamPayloadV0 =
  | ({
      type: "layer.stream";
      kind: "grid" | "points" | "segments";
      layerId: string;
      meta?: VizLayerMeta;
    } & (
      | { kind: "grid"; format: "u8" | "i8" | "u16" | "i16" | "i32" | "f32"; dims: { width: number; height: number }; values: ArrayBufferView }
      | {
          kind: "points";
          positions: Float32Array;
          values?: ArrayBufferView;
          valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        }
      | {
          kind: "segments";
          segments: Float32Array;
          values?: ArrayBufferView;
          valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        }
    ));

export function createWorkerTraceSink(options: {
  runToken: string;
  post: Post;
}): TraceSink {
  const { runToken, post } = options;

  const stepIndexById = new Map<string, number>();
  let nextStepIndex = 0;

  const emit = (event: TraceEvent): void => {
    if (event.kind === "step.start" && event.stepId) {
      let stepIndex = stepIndexById.get(event.stepId);
      if (stepIndex === undefined) {
        stepIndex = nextStepIndex++;
        stepIndexById.set(event.stepId, stepIndex);
      }
      post({
        type: "run.progress",
        runToken,
        kind: "step.start",
        stepId: event.stepId,
        phase: event.phase,
        stepIndex,
      });
      return;
    }

    if (event.kind === "step.finish" && event.stepId) {
      const stepIndex = stepIndexById.get(event.stepId) ?? -1;
      post({
        type: "run.progress",
        runToken,
        kind: "step.finish",
        stepId: event.stepId,
        phase: event.phase,
        stepIndex,
        durationMs: event.durationMs,
      });
      return;
    }

    if (event.kind === "run.finish") {
      post({ type: "run.finished", runToken });
      return;
    }

    if (event.kind !== "step.event" || !event.stepId) return;
    const data = event.data;
    if (!isPlainObject(data)) return;
    if (data.type !== "layer.stream") return;

    const payload = data as unknown as LayerStreamPayloadV0;
    const stepIndex = stepIndexById.get(event.stepId) ?? -1;
    const base = {
      layerId: payload.layerId,
      stepId: event.stepId,
      phase: event.phase,
      stepIndex,
      key: `${event.stepId}::${payload.layerId}::${payload.kind}`,
      meta: payload.meta,
    } as const;

    let layerEvent: BrowserVizLayerUpsertEvent | null = null;
    let transfer: Transferable[] = [];

    if (payload.kind === "grid") {
      const values = cloneArrayBuffer(payload.values);
      const gridPayload: BrowserVizLayerPayload = {
        kind: "grid",
        values,
        valuesByteLength: values.byteLength,
        format: payload.format,
      };
      layerEvent = {
        type: "viz.layer.upsert",
        runToken,
        layer: {
          ...base,
          kind: "grid",
          format: payload.format,
          dims: payload.dims,
          bounds: [0, 0, payload.dims.width, payload.dims.height],
          meta: payload.meta,
        },
        payload: gridPayload,
      };
      transfer = [values];
    } else if (payload.kind === "points") {
      const positions = cloneArrayBuffer(payload.positions);
      const values = payload.values ? cloneArrayBuffer(payload.values) : undefined;
      const pointsBounds = boundsFromPositions(payload.positions);
      layerEvent = {
        type: "viz.layer.upsert",
        runToken,
        layer: {
          ...base,
          kind: "points",
          count: (payload.positions.length / 2) | 0,
          valueFormat: payload.valueFormat,
          bounds: pointsBounds,
          meta: payload.meta,
        },
        payload: {
          kind: "points",
          positions,
          values,
          valueFormat: payload.valueFormat,
        },
      };
      transfer = values ? [positions, values] : [positions];
    } else if (payload.kind === "segments") {
      const segments = cloneArrayBuffer(payload.segments);
      const values = payload.values ? cloneArrayBuffer(payload.values) : undefined;
      const bounds = boundsFromSegments(payload.segments);
      layerEvent = {
        type: "viz.layer.upsert",
        runToken,
        layer: {
          ...base,
          kind: "segments",
          count: (payload.segments.length / 4) | 0,
          valueFormat: payload.valueFormat,
          bounds,
          meta: payload.meta,
        },
        payload: {
          kind: "segments",
          segments,
          values,
          valueFormat: payload.valueFormat,
        },
      };
      transfer = values ? [segments, values] : [segments];
    }

    if (layerEvent) post(layerEvent, transfer);
  };

  return { emit };
}
