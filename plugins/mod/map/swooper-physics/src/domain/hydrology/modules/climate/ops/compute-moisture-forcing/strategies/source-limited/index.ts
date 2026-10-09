import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeMoistureForcingContract from "../../contract.js";
import {
  integrateMoisture,
  prepareMoistureForcing,
  publishMoistureForcing,
} from "../../rules/index.js";
import SourceLimitedDefinition from "./config.js";

export default createStrategy(ComputeMoistureForcingContract, SourceLimitedDefinition, {
  run: (input, config) => {
    const forcing = prepareMoistureForcing(input, config);
    return publishMoistureForcing(integrateMoisture(forcing).precipitation);
  },
});
