import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { inciseChannels } from "../../rules/index.js";
import definition from "./config.js";

export default createStrategy(contract, definition, { run: inciseChannels });
