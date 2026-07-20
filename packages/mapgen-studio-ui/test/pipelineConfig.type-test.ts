import type { PipelineConfig } from "../src/types/index.js";

declare const admitted: PipelineConfig;

// @ts-expect-error Admitted configs are immutable at the root.
admitted.stage = {};

const stage = admitted.stage;
if (stage !== null && typeof stage === "object" && !Array.isArray(stage)) {
  // @ts-expect-error Admitted configs are immutable throughout the JSON tree.
  stage.value = 2;
}

type CompleteExampleConfig = PipelineConfig &
  Readonly<{
    stage: Readonly<{
      knobs: Readonly<{ strength: number }>;
    }>;
  }>;

// @ts-expect-error Concrete recipe config types retain their required fields.
const incomplete: CompleteExampleConfig = { stage: { knobs: {} } };

void incomplete;
