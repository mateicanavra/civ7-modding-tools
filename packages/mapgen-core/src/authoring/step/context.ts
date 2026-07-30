import type { MapContext } from "@mapgen/core/map-context.js";
import {
  type InitialSetupDefinition,
  readInitialSetupValueInternal,
} from "../initial-setup/definition.js";
import type { StepContext } from "./types.js";

/**
 * @internal Proves that an authentic step facade carries the value admitted by one exact setup
 * authority. This checks identity only; initial setup was already parsed when the recipe compiled.
 */
export function assertStepInitialSetupContextInternal<Definition extends InitialSetupDefinition>(
  context: MapContext,
  definition: Definition
): asserts context is StepContext<Definition> {
  const admitted = readInitialSetupValueInternal(context.setup, definition);
  if (Reflect.get(context, "initialSetup") !== admitted) {
    throw new Error(
      `Step invocation context does not expose initial setup authority "${definition.id}".`
    );
  }
}
