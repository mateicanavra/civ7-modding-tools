import type { StudioEvent, StudioOperationsCurrent } from "@civ7/studio-server";

export interface StudioDaemonIdentity {
  serverInstanceId: string;
  serverStartedAt: string;
}

export type StudioBusyGateSubject =
  | "Run in Game"
  | "Autoplay"
  | "Explore"
  | "Game controls"
  | "World controls";

export function formatStudioEventStreamError(error: unknown): string {
  return error instanceof Error ? error.message : "Studio event stream unavailable";
}

export function identityFromStudioEvent(event: StudioEvent): StudioDaemonIdentity | null {
  if (event.type !== "hello") return null;
  return {
    serverInstanceId: event.serverInstanceId,
    serverStartedAt: event.serverStartedAt,
  };
}

export function identityFromStudioOperationsCurrent(
  current: StudioOperationsCurrent
): StudioDaemonIdentity {
  return {
    serverInstanceId: current.serverInstanceId,
    serverStartedAt: current.serverStartedAt,
  };
}

export function sameStudioDaemonIdentity(
  left: StudioDaemonIdentity | null | undefined,
  right: StudioDaemonIdentity | null | undefined
): boolean {
  return Boolean(
    left &&
      right &&
      left.serverInstanceId === right.serverInstanceId &&
      left.serverStartedAt === right.serverStartedAt
  );
}

export function formatStudioDaemonIdentityMismatch(
  expected: StudioDaemonIdentity,
  observed: StudioDaemonIdentity
): string | null {
  if (sameStudioDaemonIdentity(expected, observed)) return null;
  return `Studio daemon restarted while recovering operations; adopted current daemon state (${observed.serverInstanceId}).`;
}

export function studioEventClearsStreamError(event: StudioEvent): boolean {
  return event.type === "hello" || event.type === "operation" || event.type === "live-game";
}

export function studioBusyGateMessage(args: {
  subject: StudioBusyGateSubject;
  browserRunning?: boolean;
  runInGameRunning?: boolean;
  saveDeployRunning?: boolean;
}): string | null {
  if (args.browserRunning) return `${args.subject} is paused while map generation is running.`;
  if (args.runInGameRunning) return `${args.subject} is paused while Run in Game is running.`;
  if (args.saveDeployRunning) return `${args.subject} is paused while Save & Deploy is running.`;
  return null;
}
