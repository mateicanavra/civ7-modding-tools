import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import {
  GraphServiceBadRequestError,
  GraphServiceInternalError,
} from "./model/errors/graph.errors.js";

const graphServiceErrorMap = {
  BAD_REQUEST: GraphServiceBadRequestError,
  INTERNAL_SERVER_ERROR: GraphServiceInternalError,
} as const;

const GraphServiceRunInputSchema = Type.Object(
  {
    json: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false, description: "Habitat graph service run request." }
);
export type GraphServiceRunInput = Static<typeof GraphServiceRunInputSchema>;

const GraphServiceRunOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat graph service execution result." }
);
export type GraphServiceRunOutput = Static<typeof GraphServiceRunOutputSchema>;

const GraphServiceRunInputStandardSchema = toStandardSchema(GraphServiceRunInputSchema);
const GraphServiceRunOutputStandardSchema = toStandardSchema(GraphServiceRunOutputSchema);

export const graphServiceRunContract = eoc
  .errors(graphServiceErrorMap)
  .input(GraphServiceRunInputStandardSchema)
  .output(GraphServiceRunOutputStandardSchema);

export const graphServiceContract = {
  run: graphServiceRunContract,
};
