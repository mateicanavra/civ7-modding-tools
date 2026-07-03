import { toStandardSchema } from "@habitat/cli/service/typebox-standard-schema";
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
  {},
  { additionalProperties: false, description: "Habitat workspace graph action request." }
);
export type GraphWorkspaceGraphInput = Static<typeof GraphWorkspaceGraphInputSchema>;

const GraphWorkspaceGraphOutputSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("completed"),
        graph: Type.Unknown(),
      },
      { additionalProperties: false, description: "Workspace graph payload." }
    ),
    Type.Object(
      {
        kind: Type.Literal("command-failed"),
        exitCode: Type.Integer(),
        stdout: Type.String(),
        stderr: Type.String(),
      },
      { additionalProperties: false, description: "Nx graph command failed." }
    ),
  ],
  { description: "Habitat workspace graph action result." }
);
export type GraphWorkspaceGraphOutput = Static<typeof GraphWorkspaceGraphOutputSchema>;

export const graphServiceContract = {
  workspaceGraph: eoc
    .errors(graphServiceErrorMap)
    .input(toStandardSchema(GraphWorkspaceGraphInputSchema))
    .output(toStandardSchema(GraphWorkspaceGraphOutputSchema)),
};
