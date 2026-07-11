export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps:build:studio-deploy";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export type SwooperMapsStudioDeployConfig = Readonly<{
  id: string;
  path: string;
}>;

export type SwooperMapsStudioDeployOptions = Readonly<{
  launchConfig?: SwooperMapsStudioDeployConfig;
  env?: NodeJS.ProcessEnv;
}>;

function withoutStudioDeployEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const {
    SWOOPER_STUDIO_DEPLOY_CONFIG_ID: _deployConfigId,
    SWOOPER_STUDIO_DEPLOY_CONFIG_PATH: _deployConfigPath,
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
    options.launchConfig === undefined
      ? cleanEnv
      : {
          ...cleanEnv,
          SWOOPER_STUDIO_DEPLOY_CONFIG_ID: options.launchConfig.id,
          SWOOPER_STUDIO_DEPLOY_CONFIG_PATH: options.launchConfig.path,
        };
  return {
    buildTask: "mod-swooper-maps:build:studio-deploy",
    buildArgs: ["run", "nx", "run", "mod-swooper-maps:build:studio-deploy", "--outputStyle=static"],
    env,
  };
}
