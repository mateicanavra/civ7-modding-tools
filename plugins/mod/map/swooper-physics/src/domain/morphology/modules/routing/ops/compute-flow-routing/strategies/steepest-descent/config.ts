import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Fixes surface routing to each land tile's steepest descending hex receiver and derives flow
 * accumulation from those links. The policy is intentionally parameter-free; water and terminal
 * sinks retain no receiver, and basin attribution remains unresolved for this strategy.
 */
export default defineStrategy({
  id: "steepest-descent",
  config: Type.Object(
    {},
    {
      description:
        "Deterministic steepest-descent receivers and accumulated upstream flow for land tiles; receiver selection and unresolved basin IDs are not author-tunable.",
    }
  ),
});
