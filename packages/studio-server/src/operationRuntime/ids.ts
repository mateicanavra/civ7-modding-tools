export function createStudioOperationId(args: Readonly<{
  prefix: string;
  nowMs: number;
  sequence: number;
}>): string {
  return `${args.prefix}-${args.nowMs.toString(36)}-${process.pid.toString(36)}-${args.sequence.toString(36)}`;
}
