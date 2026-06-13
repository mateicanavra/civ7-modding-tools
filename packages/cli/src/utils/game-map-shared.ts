import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";

// Shared service-call helper for the `game map` noun topic. The topic index
// (`game map` flag multiplex) and the focused subcommands (`game map
// summary|plot|grid`) all delegate to readCiv7World so the control-oRPC
// world.* service calls stay identical regardless of which surface invoked
// them (D2 in docs/projects/cli-command-taxonomy/workstream-record.md).

type Civ7WorldClient = ReturnType<typeof createCiv7ControlOrpcServerClient>;

type Civ7WorldGridInput = Parameters<Civ7WorldClient["world"]["grid"]>[0];

export type Civ7WorldPlotField = NonNullable<Civ7WorldGridInput["fields"]>[number];

export type Civ7WorldReadEndpointOptions = Readonly<{
  host?: string;
  port?: number;
  timeoutMs?: number;
}>;

export type Civ7WorldReadRequest =
  | Readonly<{ mode: "summary" }>
  | Readonly<{
      mode: "plot";
      location: { x: number; y: number };
      fields: ReadonlyArray<Civ7WorldPlotField>;
      playerId?: number;
      includeHidden: boolean;
    }>
  | Readonly<{
      mode: "grid";
      bounds: { x: number; y: number; width: number; height: number };
      fields: ReadonlyArray<Civ7WorldPlotField>;
      playerId?: number;
      includeHidden: boolean;
      maxPlots?: number;
    }>;

export async function readCiv7World(
  request: Civ7WorldReadRequest,
  endpointOptions: Civ7WorldReadEndpointOptions
): Promise<unknown> {
  const client = createCiv7ControlOrpcServerClient({
    directControl: liveCiv7ControlOrpcDirectControlFacade,
    endpointDefaults: endpointOptions,
  });
  if (request.mode === "grid") {
    return client.world.grid({
      bounds: request.bounds,
      fields: [...request.fields],
      playerId: request.playerId,
      includeHidden: request.includeHidden,
      maxPlots: request.maxPlots,
    });
  }
  if (request.mode === "plot") {
    return client.world.plot({
      location: request.location,
      fields: [...request.fields],
      playerId: request.playerId,
      includeHidden: request.includeHidden,
    });
  }
  return client.world.current({});
}

export const DEFAULT_CIV7_WORLD_PLOT_FIELDS: ReadonlyArray<Civ7WorldPlotField> = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "owner",
  "visibility",
  "areaRegion",
];

export function parseWorldPlotFields(value: string | undefined): ReadonlyArray<Civ7WorldPlotField> {
  return (
    (value
      ?.split(",")
      .map((field) => field.trim())
      .filter(Boolean) as Civ7WorldPlotField[] | undefined) ?? DEFAULT_CIV7_WORLD_PLOT_FIELDS
  );
}

export function parseWorldLocation(value: string): { x: number; y: number } {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error(`Invalid location: ${value}`);
  return { x, y };
}

export function parseWorldBounds(value: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const [x, y, width, height] = value.split(",").map((part) => Number(part.trim()));
  if (![x, y, width, height].every(Number.isInteger)) throw new Error(`Invalid bounds: ${value}`);
  return { x, y, width, height };
}
