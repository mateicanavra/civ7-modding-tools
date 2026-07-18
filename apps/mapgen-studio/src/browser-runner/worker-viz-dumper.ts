import type { StepFacetSinks, VizDumper } from "@swooper/mapgen-core";
import {
  admitVizScalarSource,
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizInlineRef,
  type VizLayerEmissionV1,
  type VizProjection,
  type VizScalarSource,
} from "@swooper/mapgen-viz";
import { postWorkerVizLayer, type WorkerEventPost } from "./worker-trace-sink";
import { createWorkerVizLayerEvent } from "./worker-viz-event";

function cloneArrayBuffer(view: ArrayBufferView): ArrayBuffer {
  const copy = new Uint8Array(view.byteLength);
  copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return copy.buffer;
}

const materializeInline: VizBinaryMaterializer<VizInlineRef> = ({ source }) => ({
  kind: "inline",
  buffer: cloneArrayBuffer(source),
});

function materializeWorkerProjection(
  projection: VizProjection,
  identity: Readonly<{ stepId: string; phase?: string }>
): VizLayerEmissionV1<VizInlineRef> {
  return materializeVizProjection(projection, identity, materializeInline);
}

function optionalScalarSource(
  args: Readonly<{
    values?: ArrayBufferView;
    format?: Parameters<typeof admitVizScalarSource>[0]["format"];
    valueSpec?: Parameters<typeof admitVizScalarSource>[0]["valueSpec"];
  }>
): VizScalarSource | undefined {
  if (args.values === undefined && args.format === undefined) return undefined;
  if (args.values === undefined || args.format === undefined) {
    throw new TypeError(`Visualization values and scalar format must be provided together.`);
  }
  return admitVizScalarSource({
    format: args.format,
    values: args.values,
    valueSpec: args.valueSpec,
  });
}

/**
 * Creates the browser compatibility adapter that projects legacy `VizDumper` calls into inline
 * v1 layer evidence. Every binary source is copied before transfer, so Studio can detach the
 * emitted buffer without mutating the generation-owned typed array.
 */
export function createWorkerVizDumper(): VizDumper {
  const outputRoot = "browser://viz";

  const emit = (
    trace: Parameters<VizDumper["dumpGrid"]>[0],
    buildProjection: () => VizProjection
  ): void => {
    try {
      const layer = materializeWorkerProjection(buildProjection(), {
        stepId: trace.stepId,
        phase: trace.phase,
      });
      trace.event(() => createWorkerVizLayerEvent(layer));
    } catch {
      // Visualization is optional diagnostic evidence and must never abort generation.
    }
  };

  const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    emit(trace, () => ({
      kind: "grid",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      dims: layer.dims,
      field: admitVizScalarSource({
        format: layer.format,
        values: layer.values,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpPoints: VizDumper["dumpPoints"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    emit(trace, () => ({
      kind: "points",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      positions: layer.positions,
      values: optionalScalarSource({
        values: layer.values,
        format: layer.valueFormat,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpSegments: VizDumper["dumpSegments"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    emit(trace, () => ({
      kind: "segments",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      segments: layer.segments,
      values: optionalScalarSource({
        values: layer.values,
        format: layer.valueFormat,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpGridFields: VizDumper["dumpGridFields"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    emit(trace, () => {
      const fields: Record<string, VizScalarSource> = {};
      for (const [fieldKey, field] of Object.entries(layer.fields)) {
        fields[fieldKey] = admitVizScalarSource({
          format: field.format,
          values: field.values,
          valueSpec: field.valueSpec,
        });
      }
      return {
        kind: "gridFields",
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        spaceId: layer.spaceId,
        meta: layer.meta,
        dims: layer.dims,
        fields,
        vector: layer.vector,
      };
    });
  };

  return { outputRoot, dumpGrid, dumpPoints, dumpSegments, dumpGridFields };
}

/**
 * Creates the execution-owned browser sink for pure step visualization projections.
 * Every projection is materialized once into detached inline evidence and posted with the
 * Core-assigned run and step identity; aborted runs emit nothing.
 */
export function createWorkerVizFacetSink(options: {
  runToken: string;
  generation: number;
  post: WorkerEventPost;
  abortSignal?: { readonly aborted: boolean } | null;
}): NonNullable<StepFacetSinks["viz"]> {
  const { runToken, generation, post, abortSignal } = options;
  return (projections, context) => {
    if (abortSignal?.aborted) return;
    for (const projection of projections) {
      const emitted = materializeWorkerProjection(projection, {
        stepId: context.stepId,
        phase: context.phase,
      });
      postWorkerVizLayer({
        post,
        runToken,
        generation,
        layer: { ...emitted, stepIndex: context.stepIndex },
      });
    }
  };
}
