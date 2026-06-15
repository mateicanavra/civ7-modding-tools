export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps:build:studio-deploy";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export function buildSwooperMapsStudioDeployPlan(
  options: { requestId?: string; env?: NodeJS.ProcessEnv } = {}
): SwooperMapsStudioDeployPlan {
  const env = options.requestId
    ? { ...(options.env ?? process.env), SWOOPER_STUDIO_RUN_ID: options.requestId }
    : (options.env ?? process.env);
  return {
    buildTask: "mod-swooper-maps:build:studio-deploy",
    buildArgs: ["x", "nx", "run", "mod-swooper-maps:build:studio-deploy"],
    env,
  };
}
