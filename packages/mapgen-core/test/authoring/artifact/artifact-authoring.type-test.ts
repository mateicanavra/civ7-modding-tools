import { createStep, defineArtifact, defineStep, Type } from "@mapgen/authoring/index.js";

const inputArtifact = defineArtifact({
  name: "inputArtifact",
  id: "artifact:test.type.input",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});
const outputArtifact = defineArtifact({
  name: "outputArtifact",
  id: "artifact:test.type.output",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});

const providerContract = defineStep({
  id: "artifact-provider",
  requires: [],
  provides: [],
  artifacts: { provides: [outputArtifact] },
});
const consumerContract = defineStep({
  id: "artifact-consumer",
  requires: [],
  provides: [],
  artifacts: { requires: [inputArtifact] },
});

const provider = createStep(providerContract, {
  run: (_context, _config, _ops, deps) => {
    const output = deps.artifacts.outputArtifact;
    // @ts-expect-error Declared artifact capabilities are immutable.
    deps.artifacts.outputArtifact = output;
    // @ts-expect-error Providers publish their own artifact; they do not read it.
    output.read;
    // @ts-expect-error Authored dependencies expose publication, not postcondition checks.
    output.satisfies;
    // @ts-expect-error Artifact identity remains on the contract declaration.
    output.artifact;
  },
});
// @ts-expect-error Provider storage is not part of the public step module.
provider.artifacts;

createStep(consumerContract, {
  run: (_context, _config, _ops, deps) => {
    const input = deps.artifacts.inputArtifact;
    // @ts-expect-error Consumers read their artifact; they do not publish it.
    input.publish;
  },
});

// @ts-expect-error Step implementation cannot redeclare artifact storage.
createStep(providerContract, { artifacts: [outputArtifact], run: () => undefined });
