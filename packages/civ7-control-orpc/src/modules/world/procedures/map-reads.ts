import type { Civ7RuntimeProbe } from "@civ7/direct-control";
import { Effect } from "effect";

import type {
  Civ7ControlOrpcMapGridResult,
  Civ7ControlOrpcPlotSnapshotResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7WorldGridReadResult,
  Civ7WorldPlotReadResult,
  Civ7WorldPlotSnapshot,
} from "../contract";

export const worldPlotReadProcedure =
  civ7ControlOrpcImplementer.world.plot.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () =>
        worldPlotReadResult(
          await context.directControl.getCiv7PlotSnapshot(
            {
              x: input.location.x,
              y: input.location.y,
              fields: input.fields,
              playerId: input.playerId,
              includeHidden: input.includeHidden,
            },
            context.endpointDefaults,
          ),
        ),
      catch: () =>
        errors.WORLD_READ_UNAVAILABLE({
          data: {
            procedureKey: "world.plot.read",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const worldGridReadProcedure =
  civ7ControlOrpcImplementer.world.grid.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () =>
        worldGridReadResult(
          await context.directControl.getCiv7MapGrid(
            {
              bounds: input.bounds,
              fields: input.fields,
              playerId: input.playerId,
              includeHidden: input.includeHidden,
              maxPlots: input.maxPlots,
            },
            context.endpointDefaults,
          ),
        ),
      catch: () =>
        errors.WORLD_READ_UNAVAILABLE({
          data: {
            procedureKey: "world.grid.read",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function worldPlotReadResult(
  result: Civ7ControlOrpcPlotSnapshotResult,
): Civ7WorldPlotReadResult {
  const plot = worldPlotSnapshot(result);
  const probeErrorCount = plot.summary.probeErrorCount;
  const invalidLocation = plot.location.index == null && plot.summary.factCount === 0;
  return {
    sourceStatus: {
      plot: invalidLocation
        ? "invalid-location"
        : probeErrorCount > 0
        ? "read-with-probe-errors"
        : "read",
    },
    plot,
  };
}

function worldGridReadResult(
  result: Civ7ControlOrpcMapGridResult,
): Civ7WorldGridReadResult {
  const plots = result.plots.map(worldPlotSnapshot);
  const probeErrorCount = plots.reduce(
    (total, plot) => total + plot.summary.probeErrorCount,
    0,
  ) + probeErrorCountForRecord(result.map ?? {});
  return {
    sourceStatus: {
      grid: result.omitted > 0
        ? "read-with-omissions"
        : probeErrorCount > 0
        ? "read-with-probe-errors"
        : "read",
      map: probeValue(result.map?.width) != null || probeValue(result.map?.height) != null
        ? "read"
        : "skipped-unavailable",
    },
    bounds: result.bounds ?? boundsFromPlots(plots),
    fields: Array.from(result.fields),
    plotCount: result.plotCount,
    omitted: result.omitted,
    hiddenInfoPolicy: result.hiddenInfoPolicy,
    map: {
      width: probeValue(result.map?.width),
      height: probeValue(result.map?.height),
    },
    plots,
    summary: {
      returnedPlotCount: plots.length,
      probeErrorCount,
    },
  };
}

function worldPlotSnapshot(
  plot: Omit<Civ7ControlOrpcPlotSnapshotResult, "host" | "port" | "state">,
): Civ7WorldPlotSnapshot {
  const facts = probeRecord(plot.facts);
  const visibility = {
    ...(plot.revealedState ? { revealedState: publicProbe(plot.revealedState) } : {}),
    ...(plot.visible ? { visible: publicProbe(plot.visible) } : {}),
  };
  return {
    location: {
      x: plot.location.x,
      y: plot.location.y,
      index: probeValue(plot.location.index),
    },
    visibility,
    hiddenInfoPolicy: plot.hiddenInfoPolicy,
    facts,
    summary: {
      factCount: Object.keys(facts).length,
      probeErrorCount: probeErrorCountForRecord(facts)
        + probeErrorCountForRecord(visibility)
        + (plot.location.index.ok ? 0 : 1),
    },
  };
}

function publicProbe<T>(probe: Civ7RuntimeProbe<T>): {
  ok: true;
  value: T;
} | {
  ok: false;
  error: string;
} {
  return probe.ok ? { ok: true, value: probe.value } : {
    ok: false,
    error: probe.error,
  };
}

function probeRecord(
  facts: Readonly<Record<string, Civ7RuntimeProbe<unknown>>>,
): Record<string, ReturnType<typeof publicProbe<unknown>>> {
  return Object.fromEntries(
    Object.entries(facts).map(([key, value]) => [key, publicProbe(value)]),
  );
}

function probeValue<T>(probe: Civ7RuntimeProbe<T> | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function probeErrorCountForRecord(record: Readonly<Record<string, unknown>>): number {
  return Object.values(record).filter((value) =>
    value != null && typeof value === "object"
      && "ok" in value && (value as { ok?: unknown }).ok === false
  ).length;
}

function boundsFromPlots(
  plots: ReadonlyArray<Civ7WorldPlotSnapshot>,
): Civ7WorldGridReadResult["bounds"] {
  if (plots.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const xs = plots.map((plot) => plot.location.x);
  const ys = plots.map((plot) => plot.location.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX + 1,
    height: Math.max(...ys) - minY + 1,
  };
}
