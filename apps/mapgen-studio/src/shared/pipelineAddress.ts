export type PipelineAddress = Readonly<{
  fullStepId: string;
  namespace: string | null;
  recipeId: string;
  recipeKey: string;
  stageId: string;
  stepId: string;
}>;

export function parsePipelineAddress(fullStepId: string): PipelineAddress | null {
  const parts = fullStepId.split(".");
  if (parts.length < 3) return null;

  const stepId = parts[parts.length - 1];
  const stageId = parts[parts.length - 2];
  const prefix = parts.slice(0, -2);
  const recipeId = prefix[prefix.length - 1];
  const namespace = prefix.length > 1 ? prefix.slice(0, -1).join(".") : null;

  if (!recipeId || !stageId || !stepId) return null;

  const recipeKey = namespace ? `${namespace}/${recipeId}` : recipeId;
  return { fullStepId, namespace, recipeId, recipeKey, stageId, stepId };
}

export function assertPipelineAddress(fullStepId: string): PipelineAddress {
  const parsed = parsePipelineAddress(fullStepId);
  if (!parsed) throw new Error(`Invalid pipeline step id: ${fullStepId}`);
  return parsed;
}

