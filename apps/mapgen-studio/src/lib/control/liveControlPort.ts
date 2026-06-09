import {
  createStudioCiv7ControlOrpcClient,
  type StudioCiv7ControlOrpcClient,
} from "./civ7ControlOrpcClient";

export type LiveControlReadinessResult = Awaited<
  ReturnType<StudioCiv7ControlOrpcClient["readiness"]["current"]>
>;

export type LiveControlPort = Readonly<{
  readiness: Readonly<{
    current(): Promise<LiveControlReadinessResult>;
  }>;
}>;

export function createBoundLiveControlPort(
  client: StudioCiv7ControlOrpcClient = createStudioCiv7ControlOrpcClient(),
): LiveControlPort {
  return {
    readiness: {
      current: () => client.readiness.current({}),
    },
  };
}

export const liveControlPort = createBoundLiveControlPort();
