export type StudioDeployCommand = Readonly<{
  command: string;
  args: readonly string[];
  env: NodeJS.ProcessEnv;
}>;

export function buildSwooperMapsStudioDeployCommand(options: {
  requestId?: string;
  env?: NodeJS.ProcessEnv;
} = {}): StudioDeployCommand {
  const env = options.requestId
    ? { ...(options.env ?? process.env), SWOOPER_STUDIO_RUN_ID: options.requestId }
    : (options.env ?? process.env);
  return {
    command: options.requestId
      ? "SWOOPER_STUDIO_RUN_ID=<request> bunx turbo run deploy:studio --filter=mod-swooper-maps"
      : "bunx turbo run deploy:studio --filter=mod-swooper-maps",
    args: ["x", "turbo", "run", "deploy:studio", "--filter=mod-swooper-maps"],
    env,
  };
}
