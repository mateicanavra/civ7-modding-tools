export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps:build:studio-deploy";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export type SwooperMapsStudioDeployOptions =
  | Readonly<{
      env?: NodeJS.ProcessEnv;
      launchConfigId?: never;
      launchEnvelopeDigest?: never;
      requestId?: never;
    }>
  | Readonly<{
      requestId: string;
      launchConfigId: string;
      launchEnvelopeDigest: string;
      env?: NodeJS.ProcessEnv;
    }>;

export function withoutStudioRunProofEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const {
    SWOOPER_INCLUDE_STUDIO_CURRENT: _includeStudioCurrent,
    SWOOPER_STUDIO_LAUNCH_CONFIG_ID: _launchConfigId,
    SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: _launchEnvelopeDigest,
    SWOOPER_STUDIO_RUN_ID: _requestId,
    ...cleanEnv
  } = env;
  return cleanEnv;
}

export function buildSwooperMapsStudioDeployPlan(
  options: SwooperMapsStudioDeployOptions = {}
): SwooperMapsStudioDeployPlan {
  const env =
    options.requestId !== undefined
      ? {
          ...(options.env ?? process.env),
          SWOOPER_STUDIO_RUN_ID: options.requestId,
          SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
          SWOOPER_STUDIO_LAUNCH_CONFIG_ID: options.launchConfigId,
          SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: options.launchEnvelopeDigest,
        }
      : withoutStudioRunProofEnv(options.env ?? process.env);
  return {
    buildTask: "mod-swooper-maps:build:studio-deploy",
    buildArgs: ["run", "nx", "run", "mod-swooper-maps:build:studio-deploy", "--outputStyle=static"],
    env,
  };
}
