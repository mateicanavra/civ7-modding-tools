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

const GraphWorkspaceGraphInputSchema = Type.Object(
  {
    json: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false, description: "Habitat workspace graph request." }
);
export type GraphWorkspaceGraphInput = Static<typeof GraphWorkspaceGraphInputSchema>;

const GraphWorkspaceGraphOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat workspace graph result." }
);
export type GraphWorkspaceGraphOutput = Static<typeof GraphWorkspaceGraphOutputSchema>;

const GraphWorkspaceGraphInputStandardSchema = toStandardSchema(GraphWorkspaceGraphInputSchema);
const GraphWorkspaceGraphOutputStandardSchema = toStandardSchema(GraphWorkspaceGraphOutputSchema);

export const graphWorkspaceGraphContract = eoc
  .errors(graphServiceErrorMap)
  .input(GraphWorkspaceGraphInputStandardSchema)
  .output(GraphWorkspaceGraphOutputStandardSchema);

export const graphServiceContract = {
  workspaceGraph: graphWorkspaceGraphContract,
};
