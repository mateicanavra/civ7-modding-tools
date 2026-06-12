import {
  createStudioCiv7ControlOrpcClient,
  type StudioCiv7ControlOrpcClient,
} from "./civ7ControlOrpcClient";

export type LiveControlReadinessResult = Awaited<
  ReturnType<StudioCiv7ControlOrpcClient["readiness"]["current"]>
>;

export type LiveControlExploreRequestInput = Parameters<
  StudioCiv7ControlOrpcClient["display"]["explore"]["request"]
>[0];

export type LiveControlExploreRequestResult = Awaited<
  ReturnType<StudioCiv7ControlOrpcClient["display"]["explore"]["request"]>
>;

/**
 * The studio's typed seam onto the canonical Civ7 control-oRPC surface.
 *
 * Why a port instead of passing the raw client around: control procedures
 * are a pinned taxonomy (`display.*`, `view.*`, `readiness.*`) that must be
 * called through the canonical router client — never re-exposed as bespoke
 * studio routes. The port names exactly the procedures the shell consumes,
 * mirrors the router's path shape, and keeps test seams trivial (hand a
 * fake port, not a fake transport).
 */
export type LiveControlPort = Readonly<{
  readiness: Readonly<{
    current(): Promise<LiveControlReadinessResult>;
  }>;
  display: Readonly<{
    explore: Readonly<{
      /**
       * Reveal the map for a player via a tracked visibility grant
       * (`display.explore.request`): suspends the display queue with
       * readback verification so discovery popups don't storm the UI,
       * drains gameplay discovery, and reports before/after visibility
       * probes plus an explored/already-explored/unverified classification.
       */
      request(input: LiveControlExploreRequestInput): Promise<LiveControlExploreRequestResult>;
    }>;
  }>;
}>;

export function createBoundLiveControlPort(
  client: StudioCiv7ControlOrpcClient = createStudioCiv7ControlOrpcClient(),
): LiveControlPort {
  return {
    readiness: {
      current: () => client.readiness.current({}),
    },
    display: {
      explore: {
        request: (input) => client.display.explore.request(input),
      },
    },
  };
}

export const liveControlPort = createBoundLiveControlPort();
