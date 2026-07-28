export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps:build:studio-deploy";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export type SwooperMapsStudioDeployOptions = Readonly<{
  launchConfigId?: string;
  env?: NodeJS.ProcessEnv;
}>;

function withoutStudioDeployEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const {
    SWOOPER_STUDIO_DEPLOY_CONFIG_ID: _deployConfigId,
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
  const cleanEnv = withoutStudioDeployEnv(options.env ?? process.env);
  const env =
    options.launchConfigId === undefined
      ? cleanEnv
      : {
          ...cleanEnv,
          SWOOPER_STUDIO_DEPLOY_CONFIG_ID: options.launchConfigId,
        };
  return {
    buildTask: "mod-swooper-maps:build:studio-deploy",
    buildArgs: ["run", "nx", "run", "mod-swooper-maps:build:studio-deploy", "--outputStyle=static"],
    env,
  };
}
