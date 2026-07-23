import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../../contract.js";
import { classifyPedology } from "../../rules/index.js";
import StrategyContract from "./contract.js";

/** Increases relief influence and caps fertility for uplift-dominated terrain. */
const orogenyBoostedStrategy = createStrategy(PedologyClassifyContract, StrategyContract, {
  run: (input, config) => {
    // Uplifted terrain: relief has more influence, fertility ceiling lower.
    const boosted = {
      ...config,
      reliefWeight: config.reliefWeight * 1.4,
      fertilityCeiling: Math.min(config.fertilityCeiling, 0.9),
    };
    return classifyPedology(input, boosted);
  },
});

export default orogenyBoostedStrategy;
