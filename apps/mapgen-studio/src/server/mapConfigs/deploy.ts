export type SwooperMapsStudioDeployPlan = Readonly<{
  buildTask: "mod-swooper-maps:build:studio-deploy";
  buildArgs: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export type SwooperMapsStudioDeployConfig = Readonly<{
  id: string;
  path: string;
}>;

export type SwooperMapsStudioDeployOptions =
  | Readonly<{
      env?: NodeJS.ProcessEnv;
      launchConfig?: never;
      launchConfigId?: never;
      launchEnvelopeDigest?: never;
      requestId?: never;
    }>
  | Readonly<{
      launchConfig: SwooperMapsStudioDeployConfig;
      env?: NodeJS.ProcessEnv;
      launchConfigId?: never;
      launchEnvelopeDigest?: never;
      requestId?: never;
    }>
  | Readonly<{
      launchConfig: SwooperMapsStudioDeployConfig;
      requestId: string;
      launchEnvelopeDigest: string;
      env?: NodeJS.ProcessEnv;
    }>;

export function withoutStudioRunEvidenceEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
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
  const env =
    options.requestId !== undefined
      ? {
          ...withoutStudioRunEvidenceEnv(options.env ?? process.env),
          SWOOPER_STUDIO_DEPLOY_CONFIG_ID: options.launchConfig.id,
          SWOOPER_STUDIO_DEPLOY_CONFIG_PATH: options.launchConfig.path,
          SWOOPER_STUDIO_RUN_ID: options.requestId,
          SWOOPER_STUDIO_LAUNCH_CONFIG_ID: options.launchConfig.id,
          SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: options.launchEnvelopeDigest,
        }
      : options.launchConfig !== undefined
        ? {
            ...withoutStudioRunEvidenceEnv(options.env ?? process.env),
            SWOOPER_STUDIO_DEPLOY_CONFIG_ID: options.launchConfig.id,
            SWOOPER_STUDIO_DEPLOY_CONFIG_PATH: options.launchConfig.path,
          }
        : withoutStudioRunEvidenceEnv(options.env ?? process.env);
  return {
    buildTask: "mod-swooper-maps:build:studio-deploy",
    buildArgs: ["run", "nx", "run", "mod-swooper-maps:build:studio-deploy", "--outputStyle=static"],
    env,
  };
}
