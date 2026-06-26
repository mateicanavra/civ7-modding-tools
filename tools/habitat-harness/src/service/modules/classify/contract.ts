import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import { ClassifyResultSchema } from "@internal/habitat-harness/service/modules/classify/model/index";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const ClassifyTargetInputSchema = Type.Object(
  {
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false, description: "Habitat classify target request." }
);
export type ClassifyTargetInput = Static<typeof ClassifyTargetInputSchema>;

export const classifyServiceContract = {
  target: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(ClassifyTargetInputSchema))
    .output(toStandardSchema(ClassifyResultSchema)),
};
