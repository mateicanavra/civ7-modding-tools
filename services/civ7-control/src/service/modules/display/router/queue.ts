import { Effect } from "effect";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type {
  Civ7ControlOrpcCloseDisplaysResult,
  Civ7ControlOrpcDisplayQueueSnapshotResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DisplayQueueCloseResult, Civ7DisplayQueueCurrentResult } from "../contract";
import { module } from "../module";
export const queue = {
  displayQueueCurrentProcedure: module.queue.current.effect(function* ({ context, errors }) {
    return yield* Effect.tryPromise({
      try: async () =>
        displayQueueCurrentResult(
          await context.directControl.readCiv7DisplayQueue(context.endpointDefaults)
        ),
      catch: (cause) =>
        errors.DISPLAY_QUEUE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "display.queue.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
  displayQueueCloseProcedure: module.queue.close.effect(function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () =>
        displayQueueCloseResult(
          await context.directControl.closeCiv7Displays(
            input.categories == null ? {} : { categories: input.categories },
            context.endpointDefaults
          )
        ),
      catch: (cause) =>
        errors.DISPLAY_QUEUE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "display.queue.close",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
};
function displayQueueCurrentResult(
  snapshot: Civ7ControlOrpcDisplayQueueSnapshotResult
): Civ7DisplayQueueCurrentResult {
  return {
    active: snapshot.active.map(displayRequestRow),
    suspended: snapshot.suspended.map(displayRequestRow),
    isSuspended: snapshot.isSuspended,
    handlerCategories: [...snapshot.handlerCategories],
  };
}
function displayQueueCloseResult(
  result: Civ7ControlOrpcCloseDisplaysResult
): Civ7DisplayQueueCloseResult {
  return {
    closed: result.closed.map((row) => ({
      category: row.category,
      closed: row.closed,
    })),
    closedTotal: result.closedTotal,
    remainingActive: result.remainingActive.map(displayRequestRow),
    remainingSuspended: result.remainingSuspended.map(displayRequestRow),
  };
}
function displayRequestRow(
  request: Readonly<{
    category: string;
    id: number | null;
  }>
): {
  category: string;
  id: number | null;
} {
  return { category: request.category, id: request.id };
}
