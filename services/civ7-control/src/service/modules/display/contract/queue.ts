import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7DisplayRequestSchema = Type.Object(
  {
    category: Type.String({
      description: "Display queue category.",
    }),
    id: Type.Union([Type.Number(), Type.Null()], {
      description: "Runtime display identifier, or null when the queue did not expose one.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DisplayClosedRowSchema = Type.Object(
  {
    category: Type.String({
      description: "Display category that was closed.",
    }),
    closed: Type.Integer({
      minimum: 1,
      description: "Number of displays closed in the category.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DisplayQueueCurrentInputSchema = Type.Object({}, { additionalProperties: false });

const Civ7DisplayQueueCurrentResultSchema = Type.Object(
  {
    active: Type.Array(Civ7DisplayRequestSchema, {
      description: "Displays currently active in the queue.",
    }),
    suspended: Type.Array(Civ7DisplayRequestSchema, {
      description: "Displays retained while the queue is suspended.",
    }),
    isSuspended: Type.Boolean({
      description: "Whether display queue processing is suspended.",
    }),
    handlerCategories: Type.Array(Type.String(), {
      description: "Display categories with registered queue handlers.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DisplayQueueCloseInputSchema = Type.Object(
  {
    categories: Type.Optional(
      Type.Array(Type.String(), {
        description: "Display categories to close; omission selects all closeable categories.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7DisplayQueueCloseResultSchema = Type.Object(
  {
    closed: Type.Array(Civ7DisplayClosedRowSchema, {
      description: "Per-category counts of displays closed by the request.",
    }),
    closedTotal: Type.Integer({
      minimum: 0,
      description: "Total number of displays closed by the request.",
    }),
    remainingActive: Type.Array(Civ7DisplayRequestSchema, {
      description: "Active displays remaining after closeout.",
    }),
    remainingSuspended: Type.Array(Civ7DisplayRequestSchema, {
      description: "Suspended displays remaining after closeout.",
    }),
  },
  { additionalProperties: false }
);

export const queue = {
  current: base
    .input(standard(Civ7DisplayQueueCurrentInputSchema))
    .output(standard(Civ7DisplayQueueCurrentResultSchema))
    .meta({
      family: "display",
      procedureKey: "display.queue.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  close: base
    .input(standard(Civ7DisplayQueueCloseInputSchema))
    .output(standard(Civ7DisplayQueueCloseResultSchema))
    .meta({
      family: "display",
      procedureKey: "display.queue.close",
      proofBoundary: "local-package-test",
      risk: "runtime-support",
    }),
};
