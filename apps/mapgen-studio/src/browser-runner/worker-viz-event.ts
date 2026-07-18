import type { VizInlineRef, VizLayerEmissionV1 } from "@swooper/mapgen-viz";

const WORKER_VIZ_EVENT = Symbol("mapgen-studio.worker-viz-event");

type WorkerVizLayerEvent = Readonly<{
  type: "viz.layer.emit.v1";
  layer: VizLayerEmissionV1<VizInlineRef>;
  [WORKER_VIZ_EVENT]: true;
}>;

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isInlineRef(value: unknown): value is VizInlineRef {
  return isRecord(value) && value.kind === "inline" && value.buffer instanceof ArrayBuffer;
}

function isScalarField(value: unknown): boolean {
  return isRecord(value) && isInlineRef(value.data);
}

function hasLayerIdentity(value: Record<PropertyKey, unknown>): boolean {
  return (
    typeof value.layerKey === "string" &&
    typeof value.dataTypeKey === "string" &&
    typeof value.stepId === "string" &&
    typeof value.spaceId === "string" &&
    Array.isArray(value.bounds) &&
    value.bounds.length === 4 &&
    value.bounds.every(Number.isFinite)
  );
}

function isInlineLayer(value: unknown): value is VizLayerEmissionV1<VizInlineRef> {
  if (!isRecord(value) || !hasLayerIdentity(value)) return false;
  if (value.kind === "grid") return isScalarField(value.field);
  if (value.kind === "points") {
    return (
      isInlineRef(value.positions) && (value.values === undefined || isScalarField(value.values))
    );
  }
  if (value.kind === "segments") {
    return (
      isInlineRef(value.segments) && (value.values === undefined || isScalarField(value.values))
    );
  }
  if (value.kind !== "gridFields" || !isRecord(value.fields)) return false;
  const fields = Object.values(value.fields);
  return fields.length > 0 && fields.every(isScalarField);
}

/**
 * Brands one kernel-produced inline layer for the paired worker trace sink.
 * The private symbol prevents arbitrary trace payloads from entering the live browser protocol.
 */
export function createWorkerVizLayerEvent(layer: VizLayerEmissionV1<VizInlineRef>): unknown {
  return Object.freeze({ type: "viz.layer.emit.v1", layer, [WORKER_VIZ_EVENT]: true });
}

/** Admits only intact inline events created by `createWorkerVizLayerEvent`. */
export function isWorkerVizLayerEvent(value: unknown): value is WorkerVizLayerEvent {
  return (
    isRecord(value) &&
    value[WORKER_VIZ_EVENT] === true &&
    value.type === "viz.layer.emit.v1" &&
    isInlineLayer(value.layer)
  );
}
