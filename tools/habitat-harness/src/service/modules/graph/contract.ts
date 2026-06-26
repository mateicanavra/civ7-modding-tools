import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

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
  { additionalProperties: false, description: "Raw graph command streams for CLI handoff." }
);
export type GraphServiceRunOutput = Static<typeof GraphServiceRunOutputSchema>;

const GraphServiceRunInputStandardSchema = toStandardSchema(GraphServiceRunInputSchema);
const GraphServiceRunOutputStandardSchema = toStandardSchema(GraphServiceRunOutputSchema);

export type GraphServiceRunContract = ContractProcedure<
  typeof GraphServiceRunInputStandardSchema,
  typeof GraphServiceRunOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const graphServiceRunContract: GraphServiceRunContract = eoc
  .errors(habitatServiceErrorMap)
  .input(GraphServiceRunInputStandardSchema)
  .output(GraphServiceRunOutputStandardSchema);

export type GraphServiceContract = Readonly<{
  run: GraphServiceRunContract;
}>;

export const graphServiceContract: GraphServiceContract = {
  run: graphServiceRunContract,
};
