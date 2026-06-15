import { orpcClient } from "../orpc";

export type LiveControlExploreRequestInput = Parameters<
  typeof orpcClient.civ7.display.explore.request
>[0];

export type LiveControlExploreRequestResult = Awaited<
  ReturnType<typeof orpcClient.civ7.display.explore.request>
>;

/**
 * The studio's typed seam onto the canonical Civ7 control surface — now the
 * `civ7.*` namespaces of the ONE unified `/rpc` contract (runtime-one-mount
 * slice; formerly a satellite client at `/api/civ7/rpc`).
 *
 * Why a port instead of passing the raw client around: control procedures
 * are a pinned taxonomy (`display.*`, `view.*`, `readiness.*`) that must be
 * called through the canonical contract client — never re-exposed as bespoke
 * studio routes. The port names exactly the procedures the shell consumes,
 * mirrors the contract's path shape, and keeps test seams trivial (hand a
 * fake port, not a fake transport).
 */
export type LiveControlPort = Readonly<{
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
  client: Pick<typeof orpcClient, "civ7"> = orpcClient
): LiveControlPort {
  return {
    display: {
      explore: {
        request: (input) => client.civ7.display.explore.request(input),
      },
    },
  };
}

export const liveControlPort = createBoundLiveControlPort();
