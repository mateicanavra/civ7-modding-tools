export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps#build";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export function buildSwooperMapsStudioDeployPlan(options: {
  requestId?: string;
  env?: NodeJS.ProcessEnv;
} = {}): SwooperMapsStudioDeployPlan {
  const env = options.requestId
    ? { ...(options.env ?? process.env), SWOOPER_STUDIO_RUN_ID: options.requestId }
    : (options.env ?? process.env);
  return {
    buildTask: "mod-swooper-maps#build",
    buildArgs: ["x", "turbo", "run", "build", "--filter=mod-swooper-maps"],
    env,
  };
}
