import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureContract } from "../../procedure-contract.js";
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

export const graphServiceRunContract: HabitatServiceProcedureContract<
  typeof GraphServiceRunInputStandardSchema,
  typeof GraphServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(GraphServiceRunInputStandardSchema)
  .output(GraphServiceRunOutputStandardSchema);

export const graphServiceContract = {
  run: graphServiceRunContract,
};
